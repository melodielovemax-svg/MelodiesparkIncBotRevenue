import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const moduleDir = path.dirname(fileURLToPath(import.meta.url));
export const ROOT_DIR = path.resolve(moduleDir, '..');

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const output = {};
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    output[key] = value;
  }
  return output;
}

function bool(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

function int(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeRoot(root) {
  return path.resolve(root || ROOT_DIR);
}

export function loadConfig(overrides = {}) {
  const root = normalizeRoot(overrides.ROOT_DIR || process.env.MELODIESPARK_ROOT || ROOT_DIR);
  const fileEnv = parseEnvFile(path.join(root, '.env'));
  const env = { ...fileEnv, ...process.env, ...overrides };
  const nodeEnv = env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';
  const sessionSecret = env.SESSION_SECRET || (isProduction ? '' : crypto.randomBytes(32).toString('hex'));
  const portalSecret = env.PORTAL_SECRET || sessionSecret;

  if (isProduction && sessionSecret.length < 32) {
    throw new Error('SESSION_SECRET must contain at least 32 characters in production.');
  }
  if (isProduction && portalSecret.length < 32) {
    throw new Error('PORTAL_SECRET must contain at least 32 characters in production.');
  }

  const config = {
    root,
    nodeEnv,
    isProduction,
    host: env.HOST || '127.0.0.1',
    port: int(env.PORT, 4173),
    appMode: env.APP_MODE || 'demo',
    requireAuth: isProduction ? true : bool(env.REQUIRE_AUTH, false),
    trustProxy: bool(env.TRUST_PROXY, false),
    sessionSecret,
    portalSecret,
    adminEmail: (env.ADMIN_EMAIL || 'admin@example.invalid').toLowerCase(),
    adminPasswordHash: env.ADMIN_PASSWORD_HASH || '',
    databasePath: env.DATABASE_PATH || path.join(root, 'data', 'melodiespark.db'),
    publicDir: path.join(root, 'public'),
    schemaPath: path.join(root, 'db', 'schema.sql'),
    publicBaseUrl: env.PUBLIC_BASE_URL || 'http://localhost:4173',
    allowRemoteWebhooks: bool(env.ALLOW_REMOTE_WEBHOOKS, false),
    enableSafeScheduler: bool(env.ENABLE_SAFE_SCHEDULER, false),
    safeCycleIntervalSeconds: Math.max(300, int(env.SAFE_CYCLE_INTERVAL_SECONDS, 300)),
    executionTimeoutMs: Math.max(1_000, Math.min(300_000, int(env.EXECUTION_TIMEOUT_MS, 30_000))),
    logLevel: ['silent', 'error', 'warn', 'info'].includes(String(env.LOG_LEVEL || 'info').toLowerCase()) ? String(env.LOG_LEVEL || 'info').toLowerCase() : 'info',
    enableExecutionMetrics: bool(env.ENABLE_EXECUTION_METRICS, true),
    shopify: {
      storeDomain: env.SHOPIFY_STORE_DOMAIN || '',
      accessToken: env.SHOPIFY_ADMIN_ACCESS_TOKEN || '',
      apiVersion: env.SHOPIFY_API_VERSION || '2026-07',
      webhookSecret: env.SHOPIFY_WEBHOOK_SECRET || ''
    },
    stripe: {
      secretKey: env.STRIPE_SECRET_KEY || '',
      webhookSecret: env.STRIPE_WEBHOOK_SECRET || ''
    },
    paypal: {
      clientId: env.PAYPAL_CLIENT_ID || '',
      environment: env.PAYPAL_ENVIRONMENT || 'sandbox'
    },
    ethereum: {
      rpcUrl: env.ETHEREUM_RPC_URL || '',
      chainId: int(env.ETH_CHAIN_ID, 1)
    }
  };

  return Object.freeze(config);
}

export function validateProductionConfig(config) {
  const findings = [];
  if (!config.isProduction) return findings;
  if (!config.adminPasswordHash) findings.push('ADMIN_PASSWORD_HASH is required in production.');
  if (config.appMode === 'demo') findings.push('APP_MODE=demo is not allowed in production.');
  if (!config.publicBaseUrl.startsWith('https://')) findings.push('PUBLIC_BASE_URL must use HTTPS in production.');
  if (config.trustProxy && !config.publicBaseUrl.startsWith('https://')) findings.push('TRUST_PROXY requires an HTTPS PUBLIC_BASE_URL.');
  if (config.allowRemoteWebhooks && !config.publicBaseUrl.startsWith('https://')) findings.push('Remote webhooks require an HTTPS PUBLIC_BASE_URL.');
  if (!Number.isInteger(config.executionTimeoutMs) || config.executionTimeoutMs < 1_000 || config.executionTimeoutMs > 300_000) {
    findings.push('EXECUTION_TIMEOUT_MS must be between 1000 and 300000.');
  }
  return findings;
}

export function publicConfig(config) {
  return {
    appName: 'Melodiespark Command Center',
    version: '0.1.0',
    mode: config.appMode,
    authenticationRequired: config.requireAuth,
    production: config.isProduction,
    supportedChains: [1, 11155111],
    financialActionsEnabled: false,
    remoteWebhooksEnabled: config.allowRemoteWebhooks,
    notice: 'Demo values are labeled. Wallet messages record authorization intent only; they do not transfer funds.'
  };
}
