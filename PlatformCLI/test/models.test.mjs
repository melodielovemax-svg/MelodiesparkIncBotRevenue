import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModelRegistry, searchModels, findModel } from '../src/models/registry.ts';
import { parseFamily, inferCapabilities } from '../src/models/sync.ts';

test('model registry loads canonical models and enforces schema', () => {
  const reg = loadModelRegistry();
  assert.ok(reg.models.length >= 10, 'Expected at least 10 canonical models');
  assert.ok(reg.model_count >= 10);

  for (const m of reg.models) {
    assert.ok(m.id, 'Model must have an id');
    assert.ok(m.provider, `Model ${m.id} must have a provider`);
    assert.ok(m.family, `Model ${m.id} must have a family`);
    assert.ok(Array.isArray(m.capabilities), `Model ${m.id} capabilities must be array`);
    assert.ok(m.context_window > 0, `Model ${m.id} context window must be > 0`);
    assert.ok(['OPERATIONAL', 'UNVERIFIED', 'SCAFFOLD', 'BLOCKED', 'PLANNED'].includes(m.status));
  }
});

test('model search filters by provider, name, and capability', () => {
  const gptModels = searchModels('gpt');
  assert.ok(gptModels.length >= 2, 'Should find multiple GPT models');
  assert.ok(gptModels.every((m) => m.id.includes('gpt') || m.family === 'GPT'));

  const visionModels = searchModels('vision');
  assert.ok(visionModels.length >= 1, 'Should find vision models');
  assert.ok(visionModels.some((m) => m.capabilities.includes('vision')));
});

test('model inspect finds exact model by ID', () => {
  const model = findModel('openai/gpt-4o');
  assert.ok(model, 'Should find openai/gpt-4o');
  assert.equal(model.provider, 'openai');
  assert.equal(model.family, 'GPT');
  assert.equal(model.credential_required, true);
});

test('OpenRouter family parser and capability inference correctly classify models', () => {
  assert.equal(parseFamily('anthropic/claude-3-5-sonnet'), 'Claude');
  assert.equal(parseFamily('openai/gpt-4-turbo'), 'GPT');
  assert.equal(parseFamily('google/gemini-2.0-flash'), 'Gemini');
  assert.equal(parseFamily('meta-llama/llama-3.3-70b'), 'Llama');

  const caps = inferCapabilities({
    id: 'test/coder-vision-agent',
    description: 'A tool-using coding model with image understanding',
  });
  assert.ok(caps.includes('code'));
  assert.ok(caps.includes('vision'));
  assert.ok(caps.includes('tools'));
});
