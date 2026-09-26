import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import { generateGuardianProfiles, STARTER_PRODUCTS } from './catalog.mjs';
import { applyMigrations } from './migrations.mjs';

function json(value) {
  return value === undefined ? null : JSON.stringify(value);
}

function parseJson(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  try { return JSON.parse(value); } catch { return fallback; }
}

function isoOrNow(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) throw new Error('Invalid timestamp.');
  return date.toISOString();
}

export class Repository {
  constructor({ databasePath, schemaPath, config }) {
    this.path = databasePath;
    this.config = config;
    fs.mkdirSync(path.dirname(databasePath), { recursive: true });
    this.db = new DatabaseSync(databasePath);
    this.db.exec(fs.readFileSync(schemaPath, 'utf8'));
    this.db.prepare(`INSERT INTO schema_metadata(key, value) VALUES ('version', '0.1.0')
      ON CONFLICT(key) DO NOTHING`).run();
    this.schemaVersion = applyMigrations(this.db);
    this.ensureAdmin();
    this.seedGuardians(600);
    this.seedProducts();
    if (config.appMode === 'demo') this.seedDemoRevenue();
  }

  transaction(operation) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const result = operation();
      this.db.exec('COMMIT');
      return result;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  healthy() {
    return this.db.prepare('SELECT 1 AS ok').get().ok === 1;
  }

  close() {
    this.db.close();
  }

  ensureAdmin() {
    if (!this.config.adminPasswordHash) return;
    const existing = this.db.prepare('SELECT id, password_hash FROM users WHERE email = ?').get(this.config.adminEmail);
    if (!existing) {
      this.db.prepare(`INSERT INTO users(id, email, password_hash, role, status)
        VALUES (?, ?, ?, 'admin', 'active')`).run(crypto.randomUUID(), this.config.adminEmail, this.config.adminPasswordHash);
    } else if (existing.password_hash !== this.config.adminPasswordHash) {
      this.db.prepare('UPDATE users SET password_hash = ?, status = \'active\' WHERE id = ?').run(this.config.adminPasswordHash, existing.id);
      this.db.prepare('DELETE FROM sessions WHERE user_id = ?').run(existing.id);
      this.audit({ actorType: 'system', action: 'auth.password.rotated', resourceType: 'user', resourceId: existing.id, outcome: 'success' });
    }
  }

  findUserByEmail(email) {
    return this.db.prepare('SELECT * FROM users WHERE email = ? AND status = \'active\'').get(String(email).toLowerCase());
  }

  createSession({ tokenHash, csrfHash, userId, ipHash, userAgentHash, expiresAt }) {
    this.db.prepare(`INSERT INTO sessions(id_hash, user_id, csrf_hash, ip_hash, user_agent_hash, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)`).run(tokenHash, userId, csrfHash, ipHash, userAgentHash, expiresAt);
    this.db.prepare('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?').run(userId);
  }

  getSession(tokenHash) {
    const row = this.db.prepare(`SELECT s.id_hash, s.csrf_hash, s.expires_at, u.id AS user_id, u.email, u.role
      FROM sessions s JOIN users u ON u.id = s.user_id
      WHERE s.id_hash = ? AND s.expires_at > ? AND u.status = 'active'`).get(tokenHash, new Date().toISOString());
    if (!row) return null;
    this.db.prepare('UPDATE sessions SET last_seen_at = CURRENT_TIMESTAMP WHERE id_hash = ?').run(tokenHash);
    return row;
  }

  rotateCsrf(sessionIdHash, csrfHash) {
    this.db.prepare('UPDATE sessions SET csrf_hash = ?, last_seen_at = CURRENT_TIMESTAMP WHERE id_hash = ?').run(csrfHash, sessionIdHash);
  }

  deleteSession(tokenHash) {
    this.db.prepare('DELETE FROM sessions WHERE id_hash = ?').run(tokenHash);
  }

  purgeExpired() {
    return this.db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(new Date().toISOString()).changes;
  }

  audit({ requestId = null, actorUserId = null, actorType = 'anonymous', action, resourceType = null, resourceId = null, outcome, ipHash = null, details = null }) {
    this.db.prepare(`INSERT INTO audit_logs(id, request_id, actor_user_id, actor_type, action, resource_type, resource_id, outcome, ip_hash, details_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      crypto.randomUUID(), requestId, actorUserId, actorType, action, resourceType, resourceId, outcome, ipHash, json(details)
    );
  }

  listAudit(limit = 100) {
    return this.db.prepare(`SELECT id, actor_type, action, resource_type, resource_id, outcome, details_json, created_at
      FROM audit_logs ORDER BY created_at DESC LIMIT ?`).all(Math.min(500, Math.max(1, limit)))
      .map((row) => ({ ...row, details: parseJson(row.details_json) }));
  }

  insertRevenueEvent({ id = crypto.randomUUID(), source, externalId, amountMinor, currency, grossMinor = amountMinor, discountMinor = 0, taxMinor = 0, status, occurredAt, isDemo = false, raw = null }) {
    const normalizedCurrency = String(currency || '').toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalizedCurrency)) throw new Error('Revenue currency must be a three-letter code.');
    if (!Number.isSafeInteger(amountMinor) || amountMinor < 0) throw new Error('Revenue amount must be a non-negative integer in minor units.');
    this.db.prepare(`INSERT INTO revenue_events(id, source, external_id, amount_minor, currency, gross_minor, discount_minor, tax_minor, status, occurred_at, is_demo, raw_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(source, external_id) DO UPDATE SET
        amount_minor=excluded.amount_minor, currency=excluded.currency, gross_minor=excluded.gross_minor,
        discount_minor=excluded.discount_minor, tax_minor=excluded.tax_minor, status=excluded.status,
        occurred_at=excluded.occurred_at, raw_json=excluded.raw_json`).run(
      id, source, externalId, amountMinor, normalizedCurrency, grossMinor, discountMinor, taxMinor, status,
      isoOrNow(occurredAt), isDemo ? 1 : 0, json(raw)
    );
  }

  revenueSummary({ includeDemo = true } = {}) {
    const demoClause = includeDemo ? '' : ' AND is_demo = 0';
    const rows = this.db.prepare(`SELECT currency,
        COUNT(*) AS records,
        SUM(CASE WHEN status IN ('paid', 'settled', 'succeeded') THEN amount_minor ELSE 0 END) AS settled_minor,
        SUM(CASE WHEN status IN ('paid', 'settled', 'succeeded') THEN gross_minor ELSE 0 END) AS gross_minor,
        SUM(CASE WHEN status IN ('paid', 'settled', 'succeeded') THEN tax_minor ELSE 0 END) AS tax_minor
      FROM revenue_events WHERE 1=1 ${demoClause}
      GROUP BY currency ORDER BY currency`).all();
    const totalRecords = rows.reduce((sum, row) => sum + Number(row.records), 0);
    return { totalRecords, byCurrency: rows.map((row) => ({ currency: row.currency, records: Number(row.records), settledMinor: Number(row.settled_minor || 0), grossMinor: Number(row.gross_minor || 0), taxMinor: Number(row.tax_minor || 0) })) };
  }

  listRevenue({ limit = 50, offset = 0, includeDemo = true } = {}) {
    const demoClause = includeDemo ? '' : ' AND is_demo = 0';
    return this.db.prepare(`SELECT id, source, external_id, amount_minor, currency, gross_minor, discount_minor,
        tax_minor, status, occurred_at, is_demo
      FROM revenue_events WHERE 1=1 ${demoClause}
      ORDER BY occurred_at DESC LIMIT ? OFFSET ?`).all(Math.min(250, Math.max(1, limit)), Math.max(0, offset));
  }

  recordIntegrationRun({ id = crypto.randomUUID(), provider, operation, status, recordsProcessed = 0, errorCode = null, details = null, completedAt = null }) {
    this.db.prepare(`INSERT INTO integration_runs(id, provider, operation, status, records_processed, error_code, details_json, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, provider, operation, status, recordsProcessed, errorCode, json(details), completedAt);
  }

  latestIntegrationRun(provider) {
    return this.db.prepare(`SELECT id, provider, operation, status, records_processed, error_code, details_json, started_at, completed_at
      FROM integration_runs WHERE provider = ? ORDER BY started_at DESC LIMIT 1`).get(provider);
  }

  seedGuardians(count) {
    const existing = this.db.prepare('SELECT COUNT(*) AS count FROM guardians').get().count;
    if (Number(existing) >= count) return;
    const profiles = generateGuardianProfiles(count);
    this.transaction(() => {
      const statement = this.db.prepare(`INSERT INTO guardians(id, name, tier, domain, soul_core, role, enabled, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET name=excluded.name, tier=excluded.tier, domain=excluded.domain,
          soul_core=excluded.soul_core, role=excluded.role, status=excluded.status`);
      for (const profile of profiles) statement.run(profile.id, profile.name, profile.tier, profile.domain, profile.soulCore, profile.role, profile.enabled ? 1 : 0, profile.status);
    });
  }

  listGuardians({ limit = 100, offset = 0, tier = null, domain = null } = {}) {
    const clauses = [];
    const params = [];
    if (tier) { clauses.push('tier = ?'); params.push(tier); }
    if (domain) { clauses.push('domain = ?'); params.push(domain); }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    return this.db.prepare(`SELECT id, name, tier, domain, soul_core, role, enabled, status, created_at
      FROM guardians ${where}
      ORDER BY CASE tier WHEN 'arc_angel' THEN 0 WHEN 'guardian' THEN 1 ELSE 2 END, name
      LIMIT ? OFFSET ?`).all(...params, Math.min(600, Math.max(1, limit)), Math.max(0, offset));
  }

  guardianCounts() {
    const rows = this.db.prepare(`SELECT tier, COUNT(*) AS count FROM guardians GROUP BY tier`).all();
    return Object.fromEntries(rows.map((row) => [row.tier, Number(row.count)]));
  }

  controllerForTask(taskId) {
    const map = {
      health: 'AA-006',
      'data-integrity': 'AA-003',
      'integration-status': 'AA-009',
      'security-config': 'AA-007',
      'catalog-integrity': 'AA-002'
    };
    const id = map[taskId];
    return id ? this.db.prepare('SELECT id, name, tier FROM guardians WHERE id = ?').get(id) : null;
  }

  insertWorkflowRun({ id, cycleId, status, total, succeeded, failed, details, completedAt }) {
    this.db.prepare(`INSERT INTO workflow_runs(id, cycle_id, status, tasks_total, tasks_succeeded, tasks_failed, details_json, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(id, cycleId, status, total, succeeded, failed, json(details), completedAt);
  }

  insertGuardianRun({ id, cycleId, guardianId, status, latencyMs, details, completedAt }) {
    this.db.prepare(`INSERT INTO guardian_runs(id, cycle_id, guardian_id, status, latency_ms, details_json, completed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, cycleId, guardianId, status, latencyMs, json(details), completedAt);
  }

  listWorkflowRuns(limit = 20) {
    return this.db.prepare(`SELECT id, cycle_id, status, tasks_total, tasks_succeeded, tasks_failed, details_json, started_at, completed_at
      FROM workflow_runs ORDER BY started_at DESC LIMIT ?`).all(Math.min(100, Math.max(1, limit)))
      .map((row) => ({ ...row, details: parseJson(row.details_json) }));
  }

  guardianLeaderboard(limit = 20) {
    return this.db.prepare(`SELECT g.id, g.name, g.tier, g.domain,
        COUNT(r.id) AS runs,
        SUM(CASE WHEN r.status = 'succeeded' THEN 1 ELSE 0 END) AS successful_runs,
        CAST(AVG(r.latency_ms) AS INTEGER) AS average_latency_ms,
        MAX(r.completed_at) AS last_run_at
      FROM guardians g JOIN guardian_runs r ON r.guardian_id = g.id
      GROUP BY g.id ORDER BY successful_runs DESC, average_latency_ms ASC, g.name LIMIT ?`)
      .all(Math.min(100, Math.max(1, limit)));
  }

  createWalletChallenge({ id, address, chainId, nonce, message, expiresAt }) {
    this.db.prepare(`INSERT INTO wallet_challenges(id, address, chain_id, nonce, message, expires_at)
      VALUES (?, ?, ?, ?, ?, ?)`).run(id, address, chainId, nonce, message, expiresAt);
  }

  getWalletChallenge(id) {
    return this.db.prepare('SELECT * FROM wallet_challenges WHERE id = ?').get(id);
  }

  consumeWalletChallenge(id) {
    return this.transaction(() => {
      const row = this.db.prepare('SELECT * FROM wallet_challenges WHERE id = ?').get(id);
      if (!row || row.used_at || row.expires_at <= new Date().toISOString()) return null;
      this.db.prepare('UPDATE wallet_challenges SET used_at = CURRENT_TIMESTAMP WHERE id = ?').run(id);
      return row;
    });
  }

  bindWallet({ id = crypto.randomUUID(), userId, address, chainId }) {
    this.db.prepare(`INSERT INTO wallet_bindings(id, user_id, address, chain_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, address, chain_id) DO UPDATE SET last_seen_at=CURRENT_TIMESTAMP`).run(id, userId, address, chainId);
    return this.db.prepare('SELECT id, address, chain_id, verified_at, last_seen_at FROM wallet_bindings WHERE user_id = ? AND address = ? AND chain_id = ?').get(userId, address, chainId);
  }

  listWalletBindings(userId) {
    return this.db.prepare('SELECT id, address, chain_id, verified_at, last_seen_at FROM wallet_bindings WHERE user_id = ? ORDER BY last_seen_at DESC').all(userId);
  }

  createWithdrawalIntent(intent) {
    this.db.prepare(`INSERT INTO withdrawal_intents(id, user_id, wallet_binding_id, chain_id, asset, amount_atomic,
        amount_display, destination, message, nonce, expires_at, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      intent.id, intent.userId, intent.walletBindingId, intent.chainId, intent.asset, intent.amountAtomic,
      intent.amountDisplay, intent.destination, intent.message, intent.nonce, intent.expiresAt, intent.status || 'awaiting_signature'
    );
  }

  getWithdrawalIntent(id, userId) {
    return this.db.prepare(`SELECT wi.*, wb.address AS bound_address
      FROM withdrawal_intents wi JOIN wallet_bindings wb ON wb.id = wi.wallet_binding_id
      WHERE wi.id = ? AND wi.user_id = ?`).get(id, userId);
  }

  attachWithdrawalSignature({ id, userId, signature }) {
    const changed = this.db.prepare(`UPDATE withdrawal_intents SET signature = ?, status = 'signature_verified_pending_review',
      signed_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ? AND status = 'awaiting_signature' AND expires_at > ?`)
      .run(signature, id, userId, new Date().toISOString()).changes;
    return changed === 1;
  }

  listWithdrawalIntents(userId = null, limit = 100) {
    const where = userId ? 'WHERE wi.user_id = ?' : '';
    const params = userId ? [userId, limit] : [limit];
    return this.db.prepare(`SELECT wi.id, wi.chain_id, wi.asset, wi.amount_atomic, wi.amount_display, wi.destination,
        wi.status, wi.provider, wi.created_at, wi.signed_at, wi.updated_at, u.email
      FROM withdrawal_intents wi JOIN users u ON u.id = wi.user_id
      ${where} ORDER BY wi.created_at DESC LIMIT ?`).all(...params);
  }

  createExecution({ id, userId, authorizationIntentId, actorUserId }) {
    return this.transaction(() => {
      const intent = this.db.prepare(`SELECT id, user_id, status, expires_at, signature
        FROM withdrawal_intents WHERE id = ? AND user_id = ?`).get(authorizationIntentId, userId);
      if (!intent) throw new Error('EXECUTION_INTENT_NOT_FOUND');
      if (intent.status !== 'signature_verified_pending_review' || !intent.signature || intent.expires_at <= new Date().toISOString()) {
        throw new Error('EXECUTION_INTENT_INVALID');
      }
      const existing = this.db.prepare('SELECT * FROM executions WHERE user_id = ? AND authorization_intent_id = ?').get(userId, authorizationIntentId);
      if (existing) return { execution: this.getExecution(existing.id, userId), created: false };
      this.db.prepare(`INSERT INTO executions(id, user_id, authorization_intent_id, status, actor_user_id, authorized_at, queued_at, updated_at)
        VALUES (?, ?, ?, 'queued', ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
        .run(id, userId, authorizationIntentId, actorUserId);
      this.db.prepare(`INSERT INTO execution_transitions(id, execution_id, from_status, to_status, actor_user_id, reason)
        VALUES (?, ?, NULL, 'proposed', ?, 'execution.created')`).run(crypto.randomUUID(), id, actorUserId);
      this.db.prepare(`INSERT INTO execution_transitions(id, execution_id, from_status, to_status, actor_user_id, reason)
        VALUES (?, ?, 'proposed', 'authorized', ?, 'authorization.validated')`).run(crypto.randomUUID(), id, actorUserId);
      this.db.prepare(`INSERT INTO execution_transitions(id, execution_id, from_status, to_status, actor_user_id, reason)
        VALUES (?, ?, 'authorized', 'queued', ?, 'execution.queued')`).run(crypto.randomUUID(), id, actorUserId);
      return { execution: this.getExecution(id, userId), created: true };
    });
  }

  getExecution(id, userId = null) {
    const row = userId
      ? this.db.prepare('SELECT * FROM executions WHERE id = ? AND user_id = ?').get(id, userId)
      : this.db.prepare('SELECT * FROM executions WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      runnerResult: parseJson(row.runner_result_json),
      transitions: this.db.prepare(`SELECT id, from_status AS fromStatus, to_status AS toStatus,
        actor_user_id AS actorUserId, reason, details_json AS detailsJson, created_at AS createdAt
        FROM execution_transitions WHERE execution_id = ? ORDER BY rowid ASC`).all(id)
        .map((transition) => ({ ...transition, details: parseJson(transition.detailsJson) }))
    };
  }

  getExecutionByIntent({ userId, authorizationIntentId }) {
    const row = this.db.prepare('SELECT id FROM executions WHERE user_id = ? AND authorization_intent_id = ?').get(userId, authorizationIntentId);
    return row ? this.getExecution(row.id, userId) : null;
  }

  listExecutions({ userId, status = null, limit = 50, offset = 0 }) {
    const clauses = ['user_id = ?'];
    const params = [userId];
    if (status) { clauses.push('status = ?'); params.push(status); }
    params.push(Math.min(100, Math.max(1, limit)), Math.max(0, offset));
    return this.db.prepare(`SELECT id, user_id AS userId, authorization_intent_id AS authorizationIntentId,
      status, actor_user_id AS actorUserId, error_code AS errorCode, error_message AS errorMessage,
      created_at AS createdAt, authorized_at AS authorizedAt, queued_at AS queuedAt,
      started_at AS startedAt, completed_at AS completedAt, updated_at AS updatedAt
      FROM executions WHERE ${clauses.join(' AND ')} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...params);
  }

  transitionExecution({ id, fromStatus, toStatus, actorUserId, reason, details = null, result = null, errorCode = null, errorMessage = null }) {
    return this.transaction(() => {
      const now = new Date().toISOString();
      const updates = ['status = ?', 'updated_at = ?'];
      const params = [toStatus, now];
      if (toStatus === 'running') updates.push('started_at = ?'), params.push(now);
      if (['succeeded', 'failed', 'cancelled'].includes(toStatus)) updates.push('completed_at = ?'), params.push(now);
      if (result !== null) updates.push('runner_result_json = ?'), params.push(json(result));
      if (errorCode !== null) updates.push('error_code = ?'), params.push(errorCode);
      if (errorMessage !== null) updates.push('error_message = ?'), params.push(errorMessage);
      params.push(id, fromStatus);
      const changed = this.db.prepare(`UPDATE executions SET ${updates.join(', ')} WHERE id = ? AND status = ?`).run(...params).changes;
      if (changed !== 1) throw new Error('EXECUTION_INVALID_TRANSITION');
      this.db.prepare(`INSERT INTO execution_transitions(id, execution_id, from_status, to_status, actor_user_id, reason, details_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)`).run(crypto.randomUUID(), id, fromStatus, toStatus, actorUserId, reason, json(details));
      return this.getExecution(id);
    });
  }

  claimExecution({ id, actorUserId }) {
    return this.transaction(() => {
      const now = new Date().toISOString();
      const changed = this.db.prepare(`UPDATE executions SET status = 'running', started_at = ?,
        updated_at = ? WHERE id = ? AND status = 'queued'`).run(now, now, id).changes;
      if (changed !== 1) return false;
      this.db.prepare(`INSERT INTO execution_transitions(id, execution_id, from_status, to_status, actor_user_id, reason)
        VALUES (?, ?, 'queued', 'running', ?, 'runner.started')`)
        .run(crypto.randomUUID(), id, actorUserId);
      return true;
    });
  }

  recordExecutionMetric(metric) {
    this.db.prepare(`INSERT INTO execution_metrics(metric, count) VALUES (?, 1)
      ON CONFLICT(metric) DO UPDATE SET count = count + 1, updated_at = CURRENT_TIMESTAMP`).run(metric);
  }

  listExecutionMetrics() {
    return this.db.prepare('SELECT metric, count, updated_at AS updatedAt FROM execution_metrics ORDER BY metric').all();
  }

  recoverExecutions() {
    const rows = this.db.prepare(`SELECT id, user_id AS userId FROM executions
      WHERE status IN ('queued', 'running') ORDER BY updated_at ASC, id ASC`).all();
    return rows;
  }

  seedProducts() {
    const count = Number(this.db.prepare('SELECT COUNT(*) AS count FROM products').get().count);
    if (count > 0) return;
    this.transaction(() => {
      const statement = this.db.prepare(`INSERT INTO products(id, sku, title, description, product_type, price_minor, currency, status, source)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);
      for (const product of STARTER_PRODUCTS) {
        statement.run(crypto.randomUUID(), product.sku, product.title, `${product.title} deliverable. Scope, acceptance criteria, taxes, refunds, and delivery must be approved before publication.`, product.type, product.priceCad, 'CAD', 'draft', 'starter_template');
      }
    });
  }

  listProducts(limit = 100) {
    return this.db.prepare(`SELECT id, sku, title, description, product_type, price_minor, currency, status, source, created_at, updated_at
      FROM products ORDER BY updated_at DESC LIMIT ?`).all(Math.min(500, Math.max(1, limit)));
  }

  createProductDraft(product) {
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO products(id, sku, title, description, product_type, price_minor, currency, status, source)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft', ?)`).run(id, product.sku, product.title, product.description, product.type, product.priceMinor, product.currency, product.source);
    return id;
  }

  seedDemoRevenue() {
    const count = Number(this.db.prepare('SELECT COUNT(*) AS count FROM revenue_events').get().count);
    if (count > 0) return;
    const now = Date.now();
    const samples = [
      ['demo-shopify-usd', 'shopify', 129900, 'USD', 'paid', now - 86_400_000],
      ['demo-stripe-cad', 'stripe', 79900, 'CAD', 'settled', now - 43_200_000],
      ['demo-shopify-eur', 'shopify', 45900, 'EUR', 'refunded', now - 21_600_000]
    ];
    for (const [externalId, source, amountMinor, currency, status, occurredAt] of samples) {
      this.insertRevenueEvent({ source, externalId, amountMinor, currency, status, occurredAt: new Date(occurredAt).toISOString(), isDemo: true, raw: { notice: 'Demonstration data only' } });
    }
  }

  dashboard() {
    const revenue = this.revenueSummary();
    const workflows = this.listWorkflowRuns(20);
    const workflowStats = this.db.prepare(`SELECT COUNT(*) AS total,
        SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END) AS succeeded,
        SUM(CASE WHEN status='partial' THEN 1 ELSE 0 END) AS partial,
        SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed
      FROM workflow_runs WHERE started_at >= datetime('now', '-7 days')`).get();
    const guardian = this.guardianCounts();
    const wallets = this.db.prepare('SELECT COUNT(*) AS count FROM wallet_bindings').get().count;
    const pendingWithdrawals = this.db.prepare(`SELECT COUNT(*) AS count FROM withdrawal_intents
      WHERE status IN ('awaiting_signature', 'signature_verified_pending_review')`).get().count;
    return {
      generatedAt: new Date().toISOString(),
      mode: this.config.appMode,
      revenue,
      workflows: {
        recent: workflows.slice(0, 10),
        sevenDay: { total: Number(workflowStats.total || 0), succeeded: Number(workflowStats.succeeded || 0), partial: Number(workflowStats.partial || 0), failed: Number(workflowStats.failed || 0) }
      },
      guardians: guardian,
      wallets: Number(wallets),
      pendingWithdrawals: Number(pendingWithdrawals)
    };
  }

  awardKarma({ userId, eventKey, points, reason, transferable = 0 }) {
    const id = crypto.randomUUID();
    this.db.prepare(`INSERT INTO karma_ledger(id, user_id, event_key, points, reason, transferable)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, event_key) DO UPDATE SET points = excluded.points, reason = excluded.reason`).run(
      id, userId, eventKey, Math.round(Number(points) || 0), String(reason || 'community_action'), transferable ? 1 : 0
    );
    return id;
  }

  getKarmaBalance(userId) {
    if (!userId) return 0;
    const row = this.db.prepare('SELECT COALESCE(SUM(points), 0) AS total FROM karma_ledger WHERE user_id = ?').get(userId);
    return Number(row?.total || 0);
  }

  listKarmaEvents(userId, limit = 50) {
    if (!userId) return [];
    return this.db.prepare(`SELECT id, event_key, points, reason, transferable, created_at
      FROM karma_ledger WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`).all(userId, Math.min(250, Math.max(1, limit)));
  }

  recordGameTelemetry(event) {
    const id = event.id || crypto.randomUUID();
    this.db.prepare(`INSERT INTO game_telemetry_events(
      id, client_version, session_id, player_id, event_type,
      act_number, boss_defeated, damage_dealt, shatters_triggered,
      reactions_triggered, phoenix_ascensions, karma_earned, payload_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id,
      String(event.clientVersion || '1.0.0'),
      String(event.sessionId || crypto.randomUUID()),
      String(event.playerId || 'anonymous_guardian'),
      String(event.eventType || 'telemetry_heartbeat'),
      event.actNumber !== undefined ? Number(event.actNumber) : null,
      event.bossDefeated ? String(event.bossDefeated) : null,
      Number(event.damageDealt || 0),
      Number(event.shattersTriggered || 0),
      Number(event.reactionsTriggered || 0),
      Number(event.phoenixAscensions || 0),
      Number(event.karmaEarned || 0),
      json(event.payload || {})
    );
    return id;
  }

  listGameTelemetry(limit = 50) {
    const rows = this.db.prepare(`SELECT * FROM game_telemetry_events ORDER BY created_at DESC LIMIT ?`).all(Math.min(200, Math.max(1, limit)));
    return rows.map((r) => ({ ...r, payload: parseJson(r.payload_json, {}) }));
  }

  getGameTelemetryStats() {
    const stats = this.db.prepare(`SELECT
      COUNT(*) AS total_events,
      COALESCE(SUM(damage_dealt), 0) AS total_damage,
      COALESCE(SUM(shatters_triggered), 0) AS total_shatters,
      COALESCE(SUM(reactions_triggered), 0) AS total_reactions,
      COALESCE(SUM(phoenix_ascensions), 0) AS total_ascensions,
      COALESCE(SUM(karma_earned), 0) AS total_karma
      FROM game_telemetry_events`).get();
    return {
      totalEvents: Number(stats?.total_events || 0),
      totalDamage: Number(stats?.total_damage || 0),
      totalShatters: Number(stats?.total_shatters || 0),
      totalReactions: Number(stats?.total_reactions || 0),
      totalAscensions: Number(stats?.total_ascensions || 0),
      totalKarma: Number(stats?.total_karma || 0)
    };
  }
}
