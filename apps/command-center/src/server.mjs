import http from 'node:http';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { loadConfig, publicConfig, validateProductionConfig } from './config.mjs';
import { Repository } from './db.mjs';
import { IntegrationManager } from './integrations.mjs';
import { SafeWorkflowEngine } from './workflows.mjs';
import { FIAT_CURRENCIES, SUPPORTED_CHAINS, SYSTEM_ARCHITECTURE, TOKEN_CATALOG } from './catalog.mjs';
import { HttpError, readBody, readJson, sendError, sendJson, sendText, serveStatic } from './http.mjs';
import {
  RateLimiter,
  clientIp,
  hmacHex,
  isValidEmail,
  maskEmail,
  pseudonymize,
  randomToken,
  redact,
  safeEqualText,
  securityHeaders,
  serializeCookie,
  sha256,
  verifyPassword,
  canonicalWithdrawalIntent
} from './security.mjs';
import { assertSupportedChain, atomicEthAmount, normalizeAddress, toHexMessage, verifyWalletSignature } from './wallet.mjs';
import { ExecutionService } from './orchestration/execution-service.mjs';

const SESSION_COOKIE = 'ms_session';
const APP_VERSION = '0.1.0';

function jsonParam(url, key, fallback, min, max) {
  const raw = url.searchParams.get(key);
  if (raw === null) return fallback;
  const value = Number.parseInt(raw, 10);
  if (!Number.isFinite(value)) throw new HttpError(400, 'INVALID_PARAMETER', `${key} must be an integer.`);
  return Math.min(max, Math.max(min, value));
}

function strictJsonParam(url, key, fallback, min, max) {
  const raw = url.searchParams.get(key);
  if (raw === null) return fallback;
  if (!/^\d+$/.test(raw)) throw new HttpError(400, 'INVALID_PARAMETER', `${key} must be a non-negative integer.`);
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < min || value > max) {
    throw new HttpError(400, 'INVALID_PARAMETER', `${key} must be between ${min} and ${max}.`);
  }
  return value;
}

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function csvCell(value) {
  let text = String(value ?? '');
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function assertOrigin(req, config) {
  const origin = req.headers.origin;
  if (!origin) return;
  try {
    if (new URL(origin).host !== req.headers.host) throw new Error('origin mismatch');
  } catch {
    throw new HttpError(403, 'ORIGIN_BLOCKED', 'Cross-origin state changes are blocked.');
  }
  if (config.isProduction && !origin.startsWith('https://')) throw new HttpError(403, 'HTTPS_REQUIRED', 'HTTPS is required in production.');
}

function assertJson(req) {
  if (!String(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'JSON_REQUIRED', 'Content-Type must be application/json.');
  }
}

function securityFindings(config) {
  const findings = [];
  if (!config.adminPasswordHash) findings.push({ severity: 'high', id: 'admin-password', message: 'Admin password is not configured.' });
  if (config.isProduction && !config.adminPasswordHash) findings.push({ severity: 'critical', id: 'production-auth', message: 'Production cannot start without an admin password.' });
  if (config.isProduction && config.appMode === 'demo') findings.push({ severity: 'medium', id: 'demo-mode', message: 'Production is still configured in demo mode.' });
  if (config.allowRemoteWebhooks && !config.publicBaseUrl.startsWith('https://')) findings.push({ severity: 'high', id: 'webhook-https', message: 'Remote webhooks require an HTTPS public URL.' });
  if (config.trustProxy && !config.publicBaseUrl.startsWith('https://')) findings.push({ severity: 'high', id: 'proxy-https', message: 'Trusted proxy mode requires an HTTPS public URL.' });
  if (config.shopify.accessToken && !/^[a-fA-F0-9]{32,}$/.test(config.shopify.accessToken)) findings.push({ severity: 'low', id: 'shopify-token-format', message: 'Shopify token format should be verified; no request was made.' });
  if (config.stripe.secretKey && !/^sk_(live|test)_[A-Za-z0-9_-]+$/.test(config.stripe.secretKey)) findings.push({ severity: 'high', id: 'stripe-key-format', message: 'Stripe secret key format is invalid.' });
  return findings;
}

function publicExecution(execution) {
  let runnerResult = execution.runnerResult || null;
  if (runnerResult) {
    try { runnerResult = JSON.parse(redact(JSON.stringify(runnerResult))); } catch { runnerResult = null; }
  }
  return {
    id: execution.id,
    executionId: execution.id,
    userId: execution.user_id || execution.userId,
    authorizationIntentId: execution.authorization_intent_id || execution.authorizationIntentId,
    status: execution.status,
    runnerResult,
    errorCode: execution.error_code || execution.errorCode || null,
    errorMessage: execution.error_message || execution.errorMessage || null,
    createdAt: execution.created_at || execution.createdAt,
    authorizedAt: execution.authorized_at || execution.authorizedAt,
    queuedAt: execution.queued_at || execution.queuedAt,
    startedAt: execution.started_at || execution.startedAt,
    completedAt: execution.completed_at || execution.completedAt,
    updatedAt: execution.updated_at || execution.updatedAt,
    transitions: execution.transitions || []
  };
}

export function createApplication(overrides = {}) {
  const config = overrides.config || loadConfig(overrides);
  const productionFindings = validateProductionConfig(config);
  if (productionFindings.length) throw new Error(`Production configuration invalid: ${productionFindings.join(' ')}`);
  const db = overrides.db || new Repository({ databasePath: config.databasePath, schemaPath: config.schemaPath, config });
  const integrations = overrides.integrations || new IntegrationManager({ db, config });
  const workflows = overrides.workflows || new SafeWorkflowEngine({ db, config, integrations, root: config.root });
  const executions = overrides.executions || new ExecutionService({
    db,
    workflows,
    timeoutMs: config.executionTimeoutMs,
    enableMetrics: config.enableExecutionMetrics,
    logLevel: config.logLevel
  });
  const loginLimiter = new RateLimiter({ windowMs: 15 * 60_000, max: 8 });
  const writeLimiter = new RateLimiter({ windowMs: 60_000, max: 30 });
  const publicLimiter = new RateLimiter({ windowMs: 60_000, max: 90 });
  const startedAt = Date.now();
  let schedulerBusy = false;
  let shuttingDown = false;

  function context(req) {
    const requestId = crypto.randomUUID();
    const ip = clientIp(req, config.trustProxy);
    const cookies = parseSessionCookie(req);
    const tokenHash = cookies[SESSION_COOKIE] ? sha256(cookies[SESSION_COOKIE]) : null;
    const session = tokenHash ? db.getSession(tokenHash) : null;
    return { requestId, ip, ipHash: pseudonymize(ip, config.portalSecret), tokenHash, session };
  }

  function parseSessionCookie(req) {
    const output = {};
    for (const part of String(req.headers.cookie || '').split(';')) {
      const separator = part.indexOf('=');
      if (separator < 1) continue;
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      try { output[key] = decodeURIComponent(value); } catch { output[key] = value; }
    }
    return output;
  }

  function requireAuth(ctx) {
    if (!ctx.session) throw new HttpError(401, 'AUTH_REQUIRED', 'Sign in with the administrator account to perform this action.');
  }

  function requireAdmin(ctx) {
    requireAuth(ctx);
    if (!['admin', 'operator'].includes(ctx.session.role)) throw new HttpError(403, 'ROLE_REQUIRED', 'This role cannot perform the requested action.');
  }

  function requireCsrf(req, ctx) {
    const token = String(req.headers['x-csrf-token'] || '');
    const expected = hmacHex(config.portalSecret, `csrf:${ctx.tokenHash}`);
    if (!token || !safeEqualText(token, expected)) throw new HttpError(403, 'CSRF_INVALID', 'The security token is missing or invalid. Refresh and sign in again.');
  }

  function requireRead(ctx) {
    if (config.requireAuth && !ctx.session) throw new HttpError(401, 'AUTH_REQUIRED', 'Authentication is required for dashboard data.');
  }

  function consume(ctx, limiter, bucket) {
    const result = limiter.consume(`${bucket}:${ctx.ipHash}`);
    if (!result.allowed) throw new HttpError(429, 'RATE_LIMITED', 'Too many requests. Try again later.', { retryAfterSeconds: Math.ceil((result.resetAt - Date.now()) / 1000) });
  }

  async function route(req, res, url, ctx) {
    const { pathname } = url;
    if (req.method === 'GET' && pathname === '/api/health') {
      return sendJson(res, 200, { status: db.healthy() ? 'ok' : 'degraded', version: APP_VERSION, mode: config.appMode, uptimeSeconds: Math.floor((Date.now() - startedAt) / 1000), timestamp: new Date().toISOString() });
    }
    if (req.method === 'GET' && pathname === '/api/readiness') {
      const database = db.healthy();
      const migration = db.schemaVersion === '0.2.0';
      const execution = !shuttingDown && Boolean(executions);
      const ready = database && migration && execution;
      return sendJson(res, ready ? 200 : 503, {
        status: ready ? 'ready' : 'not_ready',
        process: 'alive',
        database: database ? 'available' : 'unavailable',
        migration: migration ? 'current' : 'outdated',
        execution: execution ? 'ready' : 'draining'
      });
    }
    if (req.method === 'GET' && pathname === '/api/config') return sendJson(res, 200, publicConfig(config));

    if (req.method === 'GET' && pathname === '/api/auth/status') {
      let csrfToken = null;
      if (ctx.session) csrfToken = hmacHex(config.portalSecret, `csrf:${ctx.tokenHash}`);
      return sendJson(res, 200, {
        setupRequired: !config.adminPasswordHash,
        authenticated: Boolean(ctx.session),
        user: ctx.session ? { id: ctx.session.user_id, email: maskEmail(ctx.session.email), role: ctx.session.role } : null,
        csrfToken
      });
    }

    if (req.method === 'POST' && pathname === '/api/auth/login') {
      assertJson(req); assertOrigin(req, config); consume(ctx, loginLimiter, 'login');
      const body = await readJson(req, 8_192);
      const email = String(body.email || '').toLowerCase().trim();
      const password = String(body.password || '');
      if (!isValidEmail(email) || password.length > 256) throw new HttpError(400, 'INVALID_CREDENTIALS', 'Email or password is invalid.');
      const user = db.findUserByEmail(email);
      const valid = user && config.adminPasswordHash ? await verifyPassword(password, user.password_hash) : false;
      if (!valid) {
        db.audit({ requestId: ctx.requestId, actorType: 'anonymous', action: 'auth.login', outcome: 'denied', ipHash: ctx.ipHash, details: { email: maskEmail(email) } });
        throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is invalid.');
      }
      const token = randomToken(32);
      const csrf = hmacHex(config.portalSecret, `csrf:${sha256(token)}`);
      const maxAge = 8 * 60 * 60;
      db.createSession({ tokenHash: sha256(token), csrfHash: sha256(csrf), userId: user.id, ipHash: ctx.ipHash, userAgentHash: pseudonymize(req.headers['user-agent'] || '', config.portalSecret), expiresAt: new Date(Date.now() + maxAge * 1000).toISOString() });
      db.audit({ requestId: ctx.requestId, actorUserId: user.id, actorType: 'user', action: 'auth.login', resourceType: 'user', resourceId: user.id, outcome: 'success', ipHash: ctx.ipHash });
      return sendJson(res, 200, { user: { id: user.id, email: maskEmail(user.email), role: user.role }, csrfToken: csrf }, { 'Set-Cookie': serializeCookie(SESSION_COOKIE, token, { maxAge, secure: config.isProduction, sameSite: 'Strict' }) });
    }

    if (req.method === 'POST' && pathname === '/api/auth/logout') {
      assertJson(req); assertOrigin(req, config);
      if (ctx.session) {
        requireCsrf(req, ctx);
        db.deleteSession(ctx.tokenHash);
        db.audit({ requestId: ctx.requestId, actorUserId: ctx.session.user_id, actorType: 'user', action: 'auth.logout', outcome: 'success', ipHash: ctx.ipHash });
      }
      return sendJson(res, 200, { ok: true }, { 'Set-Cookie': serializeCookie(SESSION_COOKIE, '', { maxAge: 0, secure: config.isProduction, sameSite: 'Strict' }) });
    }

    if (req.method === 'GET' && pathname === '/api/dashboard') {
      requireRead(ctx); consume(ctx, publicLimiter, 'read');
      return sendJson(res, 200, { ...db.dashboard(), integrations: integrations.getStatus() });
    }

    if (req.method === 'GET' && pathname === '/api/revenue') {
      requireRead(ctx); consume(ctx, publicLimiter, 'read');
      const limit = jsonParam(url, 'limit', 50, 1, 250);
      const offset = jsonParam(url, 'offset', 0, 0, 100_000);
      return sendJson(res, 200, { items: db.listRevenue({ limit, offset }), summary: db.revenueSummary() });
    }

    if (req.method === 'GET' && pathname === '/api/revenue/export.csv') {
      requireAdmin(ctx);
      const rows = db.listRevenue({ limit: 250, offset: 0 });
      const header = ['id', 'source', 'external_id', 'amount_minor', 'currency', 'status', 'occurred_at', 'is_demo'];
      const csv = [header.join(','), ...rows.map((row) => header.map((key) => csvCell(row[key])).join(','))].join('\n');
      db.audit({ requestId: ctx.requestId, actorUserId: ctx.session.user_id, actorType: 'user', action: 'revenue.export', outcome: 'success', ipHash: ctx.ipHash, details: { rows: rows.length } });
      return sendText(res, 200, `\uFEFF${csv}`, 'text/csv; charset=utf-8', { 'Content-Disposition': `attachment; filename="melodiespark-revenue-${new Date().toISOString().slice(0, 10)}.csv"` });
    }

    if (req.method === 'GET' && pathname === '/api/guardians') {
      requireRead(ctx);
      return sendJson(res, 200, { items: db.listGuardians({ limit: jsonParam(url, 'limit', 100, 1, 600), offset: jsonParam(url, 'offset', 0, 0, 100_000), tier: url.searchParams.get('tier'), domain: url.searchParams.get('domain') }), counts: db.guardianCounts() });
    }

    if (req.method === 'GET' && pathname === '/api/leaderboard') {
      requireRead(ctx);
      return sendJson(res, 200, { basis: 'Measured successful workflow runs and latency. Configured entities without runs are not ranked.', items: db.guardianLeaderboard(jsonParam(url, 'limit', 20, 1, 100)) });
    }

    if (req.method === 'GET' && pathname === '/api/workflows') {
      requireRead(ctx);
      return sendJson(res, 200, { items: db.listWorkflowRuns(jsonParam(url, 'limit', 20, 1, 100)) });
    }

    if (req.method === 'POST' && pathname === '/api/v1/executions') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'execution-create');
      const body = await readJson(req, 8_192);
      const execution = executions.create({
        userId: ctx.session.user_id,
        actorUserId: ctx.session.user_id,
        authorizationIntentId: body.authorizationIntentId || body.intentId
      });
      return sendJson(res, 202, { executionId: execution.id, status: execution.status, execution: publicExecution(execution) });
    }

    const executionMatch = pathname.match(/^\/api\/v1\/executions\/([A-Za-z0-9-]+)$/);
    if (req.method === 'GET' && executionMatch) {
      requireAdmin(ctx);
      if (!UUID_PATTERN.test(executionMatch[1])) throw new HttpError(400, 'INVALID_EXECUTION_ID', 'Execution id must be a UUID.');
      const execution = executions.get(executionMatch[1], ctx.session.user_id);
      if (!execution) throw new HttpError(404, 'EXECUTION_NOT_FOUND', 'Execution was not found.');
      return sendJson(res, 200, publicExecution(execution));
    }

    const cancelMatch = pathname.match(/^\/api\/v1\/executions\/([A-Za-z0-9-]+)\/cancel$/);
    if (req.method === 'POST' && cancelMatch) {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'execution-cancel');
      if (!UUID_PATTERN.test(cancelMatch[1])) throw new HttpError(400, 'INVALID_EXECUTION_ID', 'Execution id must be a UUID.');
      const execution = executions.cancel({ id: cancelMatch[1], userId: ctx.session.user_id, actorUserId: ctx.session.user_id });
      return sendJson(res, 200, publicExecution(execution));
    }

    if (req.method === 'GET' && pathname === '/api/v1/executions') {
      requireAdmin(ctx);
      const status = url.searchParams.get('status') || null;
      const limit = strictJsonParam(url, 'limit', 50, 1, 100);
      const offset = strictJsonParam(url, 'offset', 0, 0, 100_000);
      return sendJson(res, 200, { items: executions.list({ userId: ctx.session.user_id, status, limit, offset }), limit, offset });
    }

    if (req.method === 'GET' && pathname === '/api/v1/execution-metrics') {
      requireAdmin(ctx);
      return sendJson(res, 200, { items: db.listExecutionMetrics() });
    }

    if (req.method === 'POST' && pathname === '/api/workflows/run') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'workflow');
      const result = await workflows.runCycle({ trigger: `user:${ctx.session.user_id}` });
      return sendJson(res, 200, result);
    }

    if (req.method === 'GET' && pathname === '/api/products') {
      requireRead(ctx);
      return sendJson(res, 200, { items: db.listProducts(jsonParam(url, 'limit', 100, 1, 500)), notice: 'Drafts require human review before publication.' });
    }

    if (req.method === 'POST' && pathname === '/api/products/drafts') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'product');
      const body = await readJson(req, 16_384);
      const title = String(body.title || '').trim();
      const sku = String(body.sku || '').trim().toUpperCase();
      const type = ['digital', 'service', 'template'].includes(body.type) ? body.type : 'digital';
      const priceMinor = Math.round(Number(body.priceMinor));
      if (title.length < 3 || title.length > 140) throw new HttpError(400, 'INVALID_PRODUCT', 'Title must contain 3 to 140 characters.');
      if (!/^[A-Z0-9][A-Z0-9-]{2,39}$/.test(sku)) throw new HttpError(400, 'INVALID_SKU', 'SKU must use 3 to 40 uppercase letters, numbers, or hyphens.');
      if (!Number.isSafeInteger(priceMinor) || priceMinor < 0 || priceMinor > 100_000_000) throw new HttpError(400, 'INVALID_PRICE', 'Price must be a non-negative integer in minor currency units.');
      let id;
      try { id = db.createProductDraft({ sku, title, description: String(body.description || '').slice(0, 4_000), type, priceMinor, currency: 'CAD', source: 'admin_draft' }); }
      catch (error) { if (String(error.message).includes('UNIQUE')) throw new HttpError(409, 'DUPLICATE_SKU', 'SKU already exists.'); throw error; }
      db.audit({ requestId: ctx.requestId, actorUserId: ctx.session.user_id, actorType: 'user', action: 'product.draft.created', resourceType: 'product', resourceId: id, outcome: 'success', ipHash: ctx.ipHash, details: { sku, type, priceMinor } });
      return sendJson(res, 201, { id, status: 'draft' });
    }

    if (req.method === 'GET' && pathname === '/api/karma') {
      requireRead(ctx);
      const userId = ctx.session?.user_id || 'demo_user';
      const balance = db.getKarmaBalance(userId);
      const ledger = db.listKarmaEvents(userId, jsonParam(url, 'limit', 50, 1, 200));
      return sendJson(res, 200, {
        balance,
        transferable: false,
        ledger,
        notice: 'Karma is an internal engagement and community progression metric in v0.1. It is not crypto and has no cash value.'
      });
    }

    if (req.method === 'POST' && pathname === '/api/karma/award') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'karma');
      const body = await readJson(req, 8_192);
      const points = Number(body.points);
      const reason = String(body.reason || 'manual_award').slice(0, 200);
      const targetUserId = body.userId || ctx.session.user_id;
      const eventKey = String(body.eventKey || `manual_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`);
      if (!Number.isFinite(points) || points <= 0 || points > 100_000) throw new HttpError(400, 'INVALID_POINTS', 'Points must be a positive integer <= 100000.');
      const id = db.awardKarma({ userId: targetUserId, eventKey, points, reason });
      db.audit({ requestId: ctx.requestId, actorUserId: ctx.session.user_id, actorType: 'user', action: 'karma.awarded', resourceType: 'karma', resourceId: id, outcome: 'success', ipHash: ctx.ipHash, details: { targetUserId, points, reason } });
      return sendJson(res, 201, { id, points, balance: db.getKarmaBalance(targetUserId) });
    }

    if (req.method === 'POST' && pathname === '/api/game/telemetry') {
      assertJson(req); consume(ctx, publicLimiter, 'telemetry');
      const body = await readJson(req, 32_768);
      const eventId = db.recordGameTelemetry(body);
      if (body.karmaEarned && body.karmaEarned > 0 && ctx.session?.user_id) {
        db.awardKarma({
          userId: ctx.session.user_id,
          eventKey: `game_${eventId}`,
          points: Math.min(1000, Number(body.karmaEarned)),
          reason: `Path of Melodie: ${body.eventType || 'combat_milestone'}`
        });
      }
      return sendJson(res, 201, { ok: true, eventId, receivedAt: new Date().toISOString() });
    }

    if (req.method === 'GET' && pathname === '/api/game/telemetry') {
      requireRead(ctx); consume(ctx, publicLimiter, 'telemetry-read');
      const items = db.listGameTelemetry(jsonParam(url, 'limit', 50, 1, 200));
      const stats = db.getGameTelemetryStats();
      return sendJson(res, 200, { items, stats });
    }

    if (req.method === 'GET' && pathname === '/api/catalog') {
      return sendJson(res, 200, { fiat: FIAT_CURRENCIES, tokens: TOKEN_CATALOG, chains: SUPPORTED_CHAINS });
    }

    if (req.method === 'GET' && pathname === '/api/architecture') {
      return sendJson(res, 200, { layers: SYSTEM_ARCHITECTURE, boundaries: ['No guaranteed returns', 'No shared withdrawal password', 'No custodial private keys', 'No automatic trades', 'No automatic token conversion', 'No legal or regulatory status inferred from software'] });
    }

    if (req.method === 'GET' && pathname === '/api/integrations/status') {
      requireRead(ctx);
      return sendJson(res, 200, integrations.getStatus());
    }

    if (req.method === 'POST' && pathname === '/api/integrations/sync') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'sync');
      const result = await integrations.syncAll();
      return sendJson(res, 200, result);
    }

    if (req.method === 'GET' && pathname === '/api/market/prices') {
      consume(ctx, publicLimiter, 'prices');
      const prices = await integrations.marketPrices();
      return sendJson(res, 200, { source: 'CoinGecko', currency: 'USD', fetchedAt: new Date().toISOString(), prices });
    }

    if (req.method === 'GET' && pathname === '/api/security/scan') {
      requireAdmin(ctx);
      const findings = securityFindings(config);
      const workflowSecurity = await workflows.tasks()[3].execute();
      return sendJson(res, 200, { checkedAt: new Date().toISOString(), scope: 'Local configuration and safe workflow checks only', findings, workflowSecurity });
    }

    if (req.method === 'GET' && pathname === '/api/audit') {
      requireAdmin(ctx);
      return sendJson(res, 200, { items: db.listAudit(jsonParam(url, 'limit', 100, 1, 500)) });
    }

    if (req.method === 'GET' && pathname === '/api/wallet/challenge') {
      consume(ctx, publicLimiter, 'wallet-challenge');
      const address = normalizeAddress(url.searchParams.get('address'));
      const chainId = assertSupportedChain(url.searchParams.get('chainId'));
      const id = crypto.randomUUID();
      const nonce = randomToken(18);
      const expiresAt = new Date(Date.now() + 5 * 60_000).toISOString();
      const message = `Melodiespark wallet verification\n\nAddress: ${address}\nChain ID: ${chainId}\nNonce: ${nonce}\nExpires: ${expiresAt}\n\nThis signature proves wallet control. It does not authorize a transaction.`;
      db.createWalletChallenge({ id, address, chainId, nonce, message, expiresAt });
      return sendJson(res, 200, { id, address, chainId, message, hexMessage: toHexMessage(message), expiresAt });
    }

    if (req.method === 'POST' && pathname === '/api/wallet/verify') {
      assertJson(req); assertOrigin(req, config); consume(ctx, publicLimiter, 'wallet-verify');
      const body = await readJson(req, 16_384);
      const challenge = db.getWalletChallenge(String(body.challengeId || ''));
      if (!challenge || challenge.used_at || challenge.expires_at <= new Date().toISOString()) throw new HttpError(410, 'CHALLENGE_EXPIRED', 'Wallet challenge is invalid or expired.');
      const address = await verifyWalletSignature({ address: challenge.address, message: challenge.message, signature: body.signature });
      const consumed = db.consumeWalletChallenge(challenge.id);
      if (!consumed) throw new HttpError(409, 'CHALLENGE_USED', 'Wallet challenge was already used.');
      let binding = null;
      if (ctx.session) binding = db.bindWallet({ userId: ctx.session.user_id, address, chainId: challenge.chain_id });
      db.audit({ requestId: ctx.requestId, actorUserId: ctx.session?.user_id || null, actorType: ctx.session ? 'user' : 'wallet', action: 'wallet.verified', resourceType: 'wallet', resourceId: address, outcome: 'success', ipHash: ctx.ipHash, details: { chainId: challenge.chain_id, bound: Boolean(binding) } });
      return sendJson(res, 200, { verified: true, address, chainId: challenge.chain_id, binding });
    }

    if (req.method === 'GET' && pathname === '/api/wallet') {
      requireRead(ctx);
      const bindings = ctx.session ? db.listWalletBindings(ctx.session.user_id) : [];
      return sendJson(res, 200, { bindings, financialActionsEnabled: false });
    }

    if (req.method === 'POST' && pathname === '/api/wallet/balance') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'rpc');
      const body = await readJson(req, 8_192);
      const address = normalizeAddress(body.address);
      const chainId = assertSupportedChain(body.chainId);
      if (ctx.session && !db.listWalletBindings(ctx.session.user_id).some((binding) => binding.address === address && Number(binding.chain_id) === chainId)) throw new HttpError(403, 'WALLET_NOT_VERIFIED', 'Connect and verify this wallet first.');
      const balance = await integrations.ethereumBalance(address, chainId);
      return sendJson(res, 200, balance);
    }

    if (req.method === 'POST' && pathname === '/api/withdrawal-intents') {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'withdrawal');
      const body = await readJson(req, 16_384);
      const chainId = assertSupportedChain(body.chainId);
      const destination = normalizeAddress(body.destination);
      const amountDisplay = String(body.amountEth || '').trim();
      const amountAtomic = atomicEthAmount(amountDisplay);
      const binding = db.listWalletBindings(ctx.session.user_id).find((item) => item.address === destination && Number(item.chain_id) === chainId);
      if (!binding) throw new HttpError(403, 'WALLET_NOT_VERIFIED', 'The destination wallet must be connected and signature-verified in this account.');
      const id = crypto.randomUUID();
      const nonce = randomToken(18);
      const expiresAt = new Date(Date.now() + 15 * 60_000).toISOString();
      const intent = { id, walletBindingId: binding.id, chainId, asset: 'ETH', amountAtomic, amountDisplay, destination, nonce, expiresAt };
      const message = canonicalWithdrawalIntent(intent);
      db.createWithdrawalIntent({ id, userId: ctx.session.user_id, walletBindingId: binding.id, chainId, asset: 'ETH', amountAtomic, amountDisplay, destination, message, nonce, expiresAt });
      db.audit({ requestId: ctx.requestId, actorUserId: ctx.session.user_id, actorType: 'user', action: 'withdrawal.intent.created', resourceType: 'withdrawal_intent', resourceId: id, outcome: 'success', ipHash: ctx.ipHash, details: { chainId, asset: 'ETH', amountAtomic, destination } });
      return sendJson(res, 201, { id, message, hexMessage: toHexMessage(message), expiresAt, notice: 'Signing records authorization intent only. This application does not hold or transfer ETH.' });
    }

    if (req.method === 'POST' && pathname.match(/^\/api\/withdrawal-intents\/[A-Za-z0-9-]+\/sign$/)) {
      assertJson(req); assertOrigin(req, config); requireAdmin(ctx); requireCsrf(req, ctx); consume(ctx, writeLimiter, 'withdrawal-sign');
      const id = pathname.split('/')[3];
      const body = await readJson(req, 16_384);
      const intent = db.getWithdrawalIntent(id, ctx.session.user_id);
      if (!intent) throw new HttpError(404, 'INTENT_NOT_FOUND', 'Withdrawal intent was not found.');
      if (intent.status !== 'awaiting_signature' || intent.expires_at <= new Date().toISOString()) throw new HttpError(409, 'INTENT_NOT_SIGNABLE', 'Withdrawal intent is no longer awaiting a valid signature.');
      const address = await verifyWalletSignature({ address: intent.destination, message: intent.message, signature: body.signature });
      if (address !== intent.destination) throw new HttpError(400, 'SIGNATURE_ADDRESS_MISMATCH', 'Signature address does not match the destination.');
      if (!db.attachWithdrawalSignature({ id, userId: ctx.session.user_id, signature: String(body.signature || '') })) throw new HttpError(409, 'INTENT_UPDATED', 'Intent was updated before the signature could be stored.');
      db.audit({ requestId: ctx.requestId, actorUserId: ctx.session.user_id, actorType: 'user', action: 'withdrawal.intent.signed', resourceType: 'withdrawal_intent', resourceId: id, outcome: 'success', ipHash: ctx.ipHash, details: { chainId: intent.chain_id, asset: intent.asset, amountAtomic: intent.amount_atomic } });
      return sendJson(res, 200, { id, status: 'signature_verified_pending_review', fundsMoved: false });
    }

    if (req.method === 'GET' && pathname === '/api/withdrawals') {
      requireAdmin(ctx);
      return sendJson(res, 200, { items: db.listWithdrawalIntents(null, jsonParam(url, 'limit', 100, 1, 500)), notice: 'No automated payout provider is enabled.' });
    }

    if (req.method === 'POST' && pathname === '/api/webhooks/shopify') {
      if (!config.allowRemoteWebhooks) throw new HttpError(404, 'WEBHOOK_DISABLED', 'Remote webhooks are disabled.');
      consume(ctx, publicLimiter, 'shopify-webhook');
      const raw = await readBody(req, 1_048_576);
      integrations.verifyShopifyWebhook(raw, req.headers['x-shopify-hmac-sha256']);
      const event = JSON.parse(raw.toString('utf8'));
      if (['orders/create', 'orders/paid', 'orders/updated'].includes(String(req.headers['x-shopify-topic'] || ''))) integrations.ingestShopifyOrder(event);
      db.audit({ requestId: ctx.requestId, actorType: 'webhook', action: 'webhook.shopify.received', resourceType: 'webhook_event', resourceId: String(req.headers['x-shopify-webhook-id'] || ''), outcome: 'success', ipHash: ctx.ipHash, details: { topic: req.headers['x-shopify-topic'] } });
      return sendJson(res, 200, { received: true });
    }

    if (req.method === 'POST' && pathname === '/api/webhooks/stripe') {
      if (!config.allowRemoteWebhooks) throw new HttpError(404, 'WEBHOOK_DISABLED', 'Remote webhooks are disabled.');
      consume(ctx, publicLimiter, 'stripe-webhook');
      const raw = await readBody(req, 1_048_576);
      const event = await integrations.verifyStripeWebhook(raw, req.headers['stripe-signature']);
      integrations.ingestStripeEvent(event);
      db.audit({ requestId: ctx.requestId, actorType: 'webhook', action: 'webhook.stripe.received', resourceType: 'webhook_event', resourceId: String(event.id || ''), outcome: 'success', ipHash: ctx.ipHash, details: { type: event.type } });
      return sendJson(res, 200, { received: true });
    }

    if (pathname.startsWith('/api/')) throw new HttpError(404, 'NOT_FOUND', 'API endpoint not found.');
    return null;
  }

  const server = http.createServer(async (req, res) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('X-Request-Id', requestId);
    for (const [name, value] of Object.entries(securityHeaders(config))) res.setHeader(name, value);
    let ctx;
    try {
      const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
      ctx = context(req);
      if (req.method === 'OPTIONS') {
        res.writeHead(204, { Allow: 'GET, HEAD, POST, OPTIONS' });
        return res.end();
      }
      const apiResponse = await route(req, res, url, ctx);
      if (apiResponse !== null || res.writableEnded) return;
      if (req.method === 'GET' || req.method === 'HEAD') {
        if (serveStatic(config.publicDir, url.pathname, res)) return;
        if (!url.pathname.includes('.') && serveStatic(config.publicDir, '/index.html', res)) return;
      }
      throw new HttpError(404, 'NOT_FOUND', 'Resource not found.');
    } catch (error) {
      const safeError = new HttpError(error.status, error.code, redact(error.message), error.details);
      if ((!error.status || error.status >= 500) && ctx) {
        try { db.audit({ requestId, actorUserId: ctx.session?.user_id || null, actorType: ctx.session ? 'user' : 'anonymous', action: 'request.failed', outcome: 'error', ipHash: ctx.ipHash, details: { code: safeError.code, message: safeError.message } }); } catch { /* response still needs to be sent */ }
      }
      if (!res.headersSent) sendError(res, safeError, requestId);
      else res.end();
      if (!error.status || error.status >= 500) console.error(JSON.stringify({ level: 'error', requestId, code: safeError.code, message: safeError.message }));
    }
  });

  const cleanupTimer = setInterval(() => {
    try { db.purgeExpired(); loginLimiter.sweep(); writeLimiter.sweep(); publicLimiter.sweep(); } catch { /* cleanup is non-critical */ }
  }, 15 * 60_000);
  cleanupTimer.unref();

  const scheduler = config.enableSafeScheduler ? setInterval(async () => {
    if (schedulerBusy) return;
    schedulerBusy = true;
    try { await workflows.runCycle({ trigger: 'safe_scheduler' }); } catch (error) { console.error(JSON.stringify({ level: 'error', action: 'safe_scheduler', message: error.message })); }
    finally { schedulerBusy = false; }
  }, config.safeCycleIntervalSeconds * 1000) : null;
  scheduler?.unref();
  executions.recover();

  return {
    server,
    config,
    db,
    integrations,
    workflows,
    executions,
    async close() {
      shuttingDown = true;
      executions.beginShutdown();
      clearInterval(cleanupTimer);
      if (scheduler) clearInterval(scheduler);
      await executions.waitForIdle();
      await new Promise((resolve) => server.close(resolve));
      db.close();
    }
  };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const app = createApplication();
  app.server.listen(app.config.port, app.config.host, () => {
    console.log(`Melodiespark Command Center ${APP_VERSION} listening at http://${app.config.host}:${app.config.port}`);
    console.log(`Mode: ${app.config.appMode}. Financial transfer automation: disabled.`);
  });
  const shutdown = async () => {
    await app.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
