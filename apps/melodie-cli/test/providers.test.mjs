import assert from 'node:assert/strict';
import test from 'node:test';
import { providerManager } from '../src/providers/manager.ts';
import { LocalAdapter } from '../src/providers/local.ts';

test('provider manager coordinates registered adapters', () => {
  const configs = providerManager.listConfigs();
  assert.ok(configs.length >= 6, 'Expected at least 6 providers');

  const names = configs.map((c) => c.name);
  assert.ok(names.includes('openrouter'));
  assert.ok(names.includes('openai'));
  assert.ok(names.includes('anthropic'));
  assert.ok(names.includes('google'));
  assert.ok(names.includes('ollama'));
  assert.ok(names.includes('local'));
});

test('local deterministic adapter is operational and requires zero credentials', async () => {
  const local = new LocalAdapter();
  assert.equal(local.isConfigured(), true);

  const health = await local.healthCheck();
  assert.equal(health.ok, true);
  assert.equal(health.status, 'OPERATIONAL');

  const chatRes = await local.chat({
    model: 'local/mock-coder',
    messages: [{ role: 'user', content: 'Generate plan' }],
  });
  assert.ok(chatRes.content.length > 0);
  assert.equal(chatRes.model, 'local/mock-coder');
});

test('unconfigured cloud providers report UNVERIFIED rather than claiming live status', async () => {
  // Clear any temporary env vars for this test
  const oldKey = process.env.OPENROUTER_API_KEY;
  delete process.env.OPENROUTER_API_KEY;

  try {
    const res = await providerManager.verifyProvider('openrouter');
    assert.equal(res.ok, false);
    assert.equal(res.status, 'UNVERIFIED');
    assert.equal(res.configured, false);
    assert.match(res.message, /OPENROUTER_API_KEY not configured/);
  } finally {
    if (oldKey) process.env.OPENROUTER_API_KEY = oldKey;
  }
});
