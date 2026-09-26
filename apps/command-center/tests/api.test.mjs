import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApplication } from '../src/server.mjs';
import { hashPassword } from '../src/security.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function withServer(callback) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'melodiespark-test-'));
  const passwordHash = await hashPassword('test administrator password', { cost: 1024 });
  const app = createApplication({
    ROOT_DIR: projectRoot,
    DATABASE_PATH: path.join(temp, 'test.db'),
    NODE_ENV: 'test',
    APP_MODE: 'demo',
    REQUIRE_AUTH: 'false',
    HOST: '127.0.0.1',
    PORT: '0',
    SESSION_SECRET: 's'.repeat(64),
    PORTAL_SECRET: 'p'.repeat(64),
    ADMIN_EMAIL: 'admin@example.invalid',
    ADMIN_PASSWORD_HASH: passwordHash
  });
  await new Promise((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const address = app.server.address();
  const base = `http://127.0.0.1:${address.port}`;
  try {
    await callback({ app, base });
  } finally {
    await app.close();
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

test('health, configuration, and demo dashboard are operational', async () => {
  await withServer(async ({ base }) => {
    const healthResponse = await fetch(`${base}/api/health`);
    assert.equal(healthResponse.status, 200);
    assert.equal(healthResponse.headers.get('x-content-type-options'), 'nosniff');
    const health = await healthResponse.json();
    assert.equal(health.status, 'ok');

    const config = await (await fetch(`${base}/api/config`)).json();
    assert.equal(config.financialActionsEnabled, false);
    assert.deepEqual(config.supportedChains, [1, 11155111]);

    const dashboardResponse = await fetch(`${base}/api/dashboard`);
    assert.equal(dashboardResponse.status, 200);
    const dashboard = await dashboardResponse.json();
    assert.equal(dashboard.revenue.totalRecords, 3);
    assert.equal(dashboard.guardians.sub_guardian, 588);
  });
});

test('admin authentication, CSRF, safe workflow, and draft creation work end to end', async () => {
  await withServer(async ({ base }) => {
    const login = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.invalid', password: 'test administrator password' })
    });
    assert.equal(login.status, 200);
    const loginPayload = await login.json();
    const cookie = login.headers.get('set-cookie').split(';')[0];
    assert.match(cookie, /^ms_session=/);

    const auth = await (await fetch(`${base}/api/auth/status`, { headers: { Cookie: cookie } })).json();
    assert.equal(auth.authenticated, true);
    assert.ok(auth.csrfToken);

    const workflow = await fetch(`${base}/api/workflows/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': auth.csrfToken },
      body: '{}'
    });
    assert.equal(workflow.status, 200);
    const workflowPayload = await workflow.json();
    assert.equal(workflowPayload.tasksFailed, 0);
    assert.equal(workflowPayload.tasksSucceeded, 5);

    const product = await fetch(`${base}/api/products/drafts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, 'X-CSRF-Token': auth.csrfToken },
      body: JSON.stringify({ title: 'Security Readiness Review', sku: 'SVC-SECURITY-REVIEW', type: 'service', priceMinor: 12500, description: 'Scoped review.' })
    });
    assert.equal(product.status, 201);
    assert.equal((await product.json()).status, 'draft');
  });
});

test('state-changing endpoints reject missing CSRF tokens', async () => {
  await withServer(async ({ base }) => {
    const login = await fetch(`${base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.invalid', password: 'test administrator password' })
    });
    const cookie = login.headers.get('set-cookie').split(';')[0];
    const response = await fetch(`${base}/api/workflows/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: '{}'
    });
    assert.equal(response.status, 403);
    assert.equal((await response.json()).error.code, 'CSRF_INVALID');
  });
});

test('game telemetry ingestion and karma rewards function properly', async () => {
  await withServer(async ({ base }) => {
    // Post telemetry event from Path of Melodie client
    const telemetryRes = await fetch(`${base}/api/game/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientVersion: '1.0.0',
        sessionId: 'session_test_42',
        playerId: 'guardian_phoenix_1',
        eventType: 'boss_slain',
        actNumber: 1,
        bossDefeated: 'The Cinder Warden',
        damageDealt: 12500,
        shattersTriggered: 14,
        reactionsTriggered: 8,
        phoenixAscensions: 2,
        karmaEarned: 50,
        payload: { weapon: 'Phoenix Strike', tier: 'Awakened' }
      })
    });
    assert.equal(telemetryRes.status, 201);
    const telemetryJson = await telemetryRes.json();
    assert.equal(telemetryJson.ok, true);
    assert.ok(telemetryJson.eventId);

    // Read telemetry list & statistics
    const listRes = await fetch(`${base}/api/game/telemetry`);
    assert.equal(listRes.status, 200);
    const listJson = await listRes.json();
    assert.equal(listJson.items.length, 1);
    assert.equal(listJson.items[0].boss_defeated, 'The Cinder Warden');
    assert.equal(listJson.stats.totalEvents, 1);
    assert.equal(listJson.stats.totalDamage, 12500);
    assert.equal(listJson.stats.totalShatters, 14);
    assert.equal(listJson.stats.totalReactions, 8);
    assert.equal(listJson.stats.totalAscensions, 2);

    // Read karma ledger
    const karmaRes = await fetch(`${base}/api/karma`);
    assert.equal(karmaRes.status, 200);
    const karmaJson = await karmaRes.json();
    assert.equal(karmaJson.transferable, false);
  });
});

