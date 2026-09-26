import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Repository } from '../src/db.mjs';
import { ExecutionService } from '../src/orchestration/execution-service.mjs';
import { hashPassword } from '../src/security.mjs';
import { createApplication } from '../src/server.mjs';
import { loadConfig } from '../src/config.mjs';
import { validateProductionConfig } from '../src/config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function fixture({ runner, autoStart = false, timeoutMs = 1000 } = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'melodiespark-execution-'));
  const passwordHash = await hashPassword('execution test password', { cost: 1024 });
  const config = {
    root,
    schemaPath: path.join(root, 'db', 'schema.sql'),
    databasePath: path.join(directory, 'execution.db'),
    appMode: 'test',
    adminEmail: 'admin@example.invalid',
    adminPasswordHash: passwordHash
  };
  const db = new Repository({ databasePath: config.databasePath, schemaPath: config.schemaPath, config });
  const user = db.findUserByEmail(config.adminEmail);
  const bindingId = crypto.randomUUID();
  db.bindWallet({ id: bindingId, userId: user.id, address: '0x1111111111111111111111111111111111111111', chainId: 1 });
  const intentId = crypto.randomUUID();
  db.createWithdrawalIntent({
    id: intentId, userId: user.id, walletBindingId: bindingId, chainId: 1, asset: 'ETH',
    amountAtomic: '1000000', amountDisplay: '0.01', destination: '0x1111111111111111111111111111111111111111',
    message: 'signed authorization intent', nonce: 'nonce', expiresAt: new Date(Date.now() + 60_000).toISOString(),
    status: 'awaiting_signature'
  });
  db.attachWithdrawalSignature({ id: intentId, userId: user.id, signature: 'synthetic-signature' });
  const workflows = { runCycle: runner || (async () => ({ status: 'succeeded', tasksSucceeded: 5 })) };
  const executions = new ExecutionService({ db, workflows, autoStart, timeoutMs, logger: () => {} });
  return { db, user, intentId, executions, cleanup: () => { db.close(); fs.rmSync(directory, { recursive: true, force: true }); } };
}

test('execution is durable, idempotent, and awards Karma through the ledger API', async () => {
  const fixtureState = await fixture();
  try {
    const first = fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId });
    const second = fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId });
    assert.equal(first.id, second.id);
    const completed = await fixtureState.executions.execute(first.id, fixtureState.user.id, fixtureState.user.id);
    assert.equal(completed.status, 'succeeded');
    assert.equal(fixtureState.db.getKarmaBalance(fixtureState.user.id), 1);
    assert.equal(fixtureState.db.getExecution(first.id, fixtureState.user.id).transitions.at(-1).toStatus, 'succeeded');
  } finally { fixtureState.cleanup(); }
});

test('rejects expired authorization and supports cancellation before execution', async () => {
  const fixtureState = await fixture();
  try {
    const expiredId = crypto.randomUUID();
    fixtureState.db.createWithdrawalIntent({
      id: expiredId, userId: fixtureState.user.id, walletBindingId: fixtureState.db.listWalletBindings(fixtureState.user.id)[0].id,
      chainId: 1, asset: 'ETH', amountAtomic: '1', amountDisplay: '0.000001', destination: '0x1111111111111111111111111111111111111111',
      message: 'expired', nonce: 'expired', expiresAt: new Date(Date.now() - 1000).toISOString(),
      status: 'signature_verified_pending_review'
    });
    assert.throws(() => fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: expiredId }), (error) => error.code === 'INTENT_NOT_AUTHORIZED');
    const execution = fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId });
    const cancelled = fixtureState.executions.cancel({ id: execution.id, userId: fixtureState.user.id, actorUserId: fixtureState.user.id });
    assert.equal(cancelled.status, 'cancelled');
    assert.throws(() => fixtureState.executions.cancel({ id: execution.id, userId: fixtureState.user.id, actorUserId: fixtureState.user.id }), (error) => error.code === 'EXECUTION_NOT_CANCELLABLE');
  } finally { fixtureState.cleanup(); }
});

test('propagates runner failure and timeout without leaking runner errors', async () => {
  const failed = await fixture({ runner: async () => { throw new Error('secret integration credential'); } });
  try {
    const execution = failed.executions.create({ userId: failed.user.id, actorUserId: failed.user.id, authorizationIntentId: failed.intentId });
    const result = await failed.executions.execute(execution.id, failed.user.id, failed.user.id);
    assert.equal(result.status, 'failed');
    assert.equal(result.error_code, 'RUNNER_FAILED');
    assert.equal(result.error_message, 'Bounded runner failed.');
    assert.equal(JSON.stringify(result).includes('secret integration credential'), false);
  } finally { failed.cleanup(); }

  const timed = await fixture({ runner: () => new Promise(() => {}), timeoutMs: 10 });
  try {
    const execution = timed.executions.create({ userId: timed.user.id, actorUserId: timed.user.id, authorizationIntentId: timed.intentId });
    const result = await timed.executions.execute(execution.id, timed.user.id, timed.user.id);
    assert.equal(result.error_code, 'RUNNER_TIMEOUT');
  } finally { timed.cleanup(); }
});

test('execution API enforces session, CSRF, ownership, and pagination', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'melodiespark-execution-api-'));
  const passwordHash = await hashPassword('execution api password', { cost: 1024 });
  const config = loadConfig({
    ROOT_DIR: root, DATABASE_PATH: path.join(directory, 'api.db'), SCHEMA_PATH: path.join(root, 'db', 'schema.sql'),
    NODE_ENV: 'test', APP_MODE: 'test', REQUIRE_AUTH: 'false', HOST: '127.0.0.1', PORT: '0',
    SESSION_SECRET: 's'.repeat(64), PORTAL_SECRET: 'p'.repeat(64),
    ADMIN_EMAIL: 'admin@example.invalid', ADMIN_PASSWORD_HASH: passwordHash
  });
  const app = createApplication({ config });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  try {
    const user = app.db.findUserByEmail(config.adminEmail);
    const bindingId = crypto.randomUUID();
    app.db.bindWallet({ id: bindingId, userId: user.id, address: '0x2222222222222222222222222222222222222222', chainId: 1 });
    const intentId = crypto.randomUUID();
    app.db.createWithdrawalIntent({
      id: intentId, userId: user.id, walletBindingId: bindingId, chainId: 1, asset: 'ETH', amountAtomic: '1',
      amountDisplay: '0.000001', destination: '0x2222222222222222222222222222222222222222', message: 'signed',
      nonce: 'api', expiresAt: new Date(Date.now() + 60_000).toISOString(), status: 'awaiting_signature'
    });
    app.db.attachWithdrawalSignature({ id: intentId, userId: user.id, signature: 'synthetic' });
    const address = app.server.address();
    const base = `http://127.0.0.1:${address.port}`;
    const login = await fetch(`${base}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: config.adminEmail, password: 'execution api password' })
    });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const auth = await (await fetch(`${base}/api/auth/status`, { headers: { Cookie: cookie } })).json();
    const created = await fetch(`${base}/api/v1/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': auth.csrfToken },
      body: JSON.stringify({ authorizationIntentId: intentId })
    });
    assert.equal(created.status, 202);
    const payload = await created.json();
    assert.match(payload.executionId, /^[0-9a-f-]{36}$/);
    const list = await fetch(`${base}/api/v1/executions?limit=1`, { headers: { Cookie: cookie } });
    assert.equal(list.status, 200);
    assert.equal((await list.json()).items.length, 1);
    const noCsrf = await fetch(`${base}/api/v1/executions`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ authorizationIntentId: intentId })
    });
    assert.equal(noCsrf.status, 403);
    const malformed = await fetch(`${base}/api/v1/executions?limit=not-a-number`, { headers: { Cookie: cookie } });
    assert.equal(malformed.status, 400);
    assert.equal((await malformed.json()).error.code, 'INVALID_PARAMETER');
    const invalidCreate = await fetch(`${base}/api/v1/executions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': auth.csrfToken },
      body: JSON.stringify({ authorizationIntentId: 'not-a-uuid' })
    });
    assert.equal(invalidCreate.status, 400);
    assert.equal((await invalidCreate.json()).error.code, 'INVALID_AUTHORIZATION_INTENT');
  } finally {
    await app.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('concurrent submissions and runner claims execute one intent once', async () => {
  let runs = 0;
  const fixtureState = await fixture({
    runner: async () => {
      runs += 1;
      await new Promise((resolve) => setTimeout(resolve, 15));
      return { status: 'succeeded' };
    }
  });
  try {
    const [first, second] = await Promise.all([
      Promise.resolve(fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId })),
      Promise.resolve(fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId }))
    ]);
    assert.equal(first.id, second.id);
    const [left, right] = await Promise.all([
      fixtureState.executions.execute(first.id, fixtureState.user.id, fixtureState.user.id),
      fixtureState.executions.execute(first.id, fixtureState.user.id, fixtureState.user.id)
    ]);
    assert.equal(runs, 1);
    assert.equal(left.status, 'succeeded');
    assert.equal(right.status, 'succeeded');
  } finally { fixtureState.cleanup(); }
});

test('recovery fails interrupted running executions and resumes queued work deterministically', async () => {
  const fixtureState = await fixture({ autoStart: false });
  try {
    const interrupted = fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId });
    assert.equal(fixtureState.db.claimExecution({ id: interrupted.id, actorUserId: fixtureState.user.id }), true);
    const recovered = new ExecutionService({ db: fixtureState.db, workflows: fixtureState.executions.workflows, autoStart: false, logger: () => {} });
    recovered.recover();
    assert.equal(fixtureState.db.getExecution(interrupted.id, fixtureState.user.id).status, 'failed');
    assert.equal(fixtureState.db.getExecution(interrupted.id, fixtureState.user.id).error_code, 'RUNNER_INTERRUPTED');
    assert.equal(fixtureState.db.schemaVersion, '0.2.0');
    assert.equal(fixtureState.db.listExecutionMetrics().some((metric) => metric.metric === 'recovery'), true);
  } finally { fixtureState.cleanup(); }
});

test('cancellation racing with the runner prevents terminal success', async () => {
  let release;
  const started = new Promise((resolve) => { release = resolve; });
  const fixtureState = await fixture({
    runner: async () => {
      release();
      await new Promise((resolve) => setTimeout(resolve, 20));
      return { status: 'succeeded' };
    }
  });
  try {
    const execution = fixtureState.executions.create({ userId: fixtureState.user.id, actorUserId: fixtureState.user.id, authorizationIntentId: fixtureState.intentId });
    const running = fixtureState.executions.execute(execution.id, fixtureState.user.id, fixtureState.user.id);
    await started;
    const cancelled = fixtureState.executions.cancel({ id: execution.id, userId: fixtureState.user.id, actorUserId: fixtureState.user.id });
    const result = await running;
    assert.equal(cancelled.status, 'cancelled');
    assert.equal(result.status, 'cancelled');
    assert.equal(fixtureState.db.getKarmaBalance(fixtureState.user.id), 0);
  } finally { fixtureState.cleanup(); }
});

test('production configuration fails closed and readiness exposes only operational state', async () => {
  const invalid = loadConfig({ NODE_ENV: 'production', SESSION_SECRET: 's'.repeat(64), PORTAL_SECRET: 'p'.repeat(64), APP_MODE: 'demo', PUBLIC_BASE_URL: 'http://localhost' });
  assert.ok(validateProductionConfig(invalid).length >= 2);
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'melodiespark-readiness-'));
  const passwordHash = await hashPassword('readiness password', { cost: 1024 });
  const config = loadConfig({
    ROOT_DIR: root, DATABASE_PATH: path.join(directory, 'readiness.db'), NODE_ENV: 'test',
    APP_MODE: 'test', SESSION_SECRET: 's'.repeat(64), PORTAL_SECRET: 'p'.repeat(64),
    ADMIN_EMAIL: 'admin@example.invalid', ADMIN_PASSWORD_HASH: passwordHash
  });
  const app = createApplication({ config });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  try {
    const response = await fetch(`http://127.0.0.1:${app.server.address().port}/api/readiness`);
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(body, { status: 'ready', process: 'alive', database: 'available', migration: 'current', execution: 'ready' });
    assert.equal(JSON.stringify(body).includes('password'), false);
  } finally {
    await app.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('database state survives close, backup, restore, and migration initialization', async () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'melodiespark-backup-'));
  const databasePath = path.join(directory, 'source.db');
  const backupPath = path.join(directory, 'backup.db');
  const passwordHash = await hashPassword('backup password', { cost: 1024 });
  const config = { root, schemaPath: path.join(root, 'db', 'schema.sql'), databasePath, appMode: 'test', adminEmail: 'admin@example.invalid', adminPasswordHash: passwordHash };
  const source = new Repository({ ...config, config });
  const user = source.findUserByEmail(config.adminEmail);
  assert.equal(source.schemaVersion, '0.2.0');
  source.db.exec('PRAGMA wal_checkpoint(FULL)');
  source.close();
  fs.copyFileSync(databasePath, backupPath);
  const restoredConfig = { ...config, databasePath: backupPath };
  const restored = new Repository({ ...restoredConfig, config: restoredConfig });
  try {
    assert.equal(restored.schemaVersion, '0.2.0');
    assert.equal(restored.findUserByEmail(config.adminEmail).id, user.id);
    assert.equal(restored.healthy(), true);
  } finally {
    restored.close();
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

test('shutdown closes execution admission before draining active work', async () => {
  const fixtureState = await fixture();
  try {
    fixtureState.executions.beginShutdown();
    assert.throws(() => fixtureState.executions.create({
      userId: fixtureState.user.id,
      actorUserId: fixtureState.user.id,
      authorizationIntentId: fixtureState.intentId
    }), (error) => error.code === 'SHUTTING_DOWN' && error.status === 503);
    assert.equal(await fixtureState.executions.waitForIdle(10), true);
  } finally { fixtureState.cleanup(); }
});
