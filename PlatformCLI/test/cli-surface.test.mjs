import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..');
const NODE_CLI = path.join(PACKAGE_ROOT, 'bin', 'melodie.mjs');

function runMelodie(args) {
  return spawnSync(process.execPath, [NODE_CLI, ...args], {
    encoding: 'utf-8',
    cwd: PACKAGE_ROOT,
    env: { ...process.env, NO_COLOR: '1' },
  });
}

test('CLI doctor reports PASS across runtime, sandbox, and task manifest', () => {
  const proc = runMelodie(['doctor']);
  assert.equal(proc.status, 0);
  assert.match(proc.stdout, /Melodie CLI Platform Doctor/);
  assert.match(proc.stdout, /Node\.js Version/);
  assert.match(proc.stdout, /1,010-Task Manifest/);
  assert.match(proc.stdout, /Platform doctor checks passed cleanly/);
});

test('CLI models command lists models with metadata', () => {
  const proc = runMelodie(['models']);
  assert.equal(proc.status, 0);
  assert.match(proc.stdout, /Model Registry/);
  assert.match(proc.stdout, /openai\/gpt-4o/);
  assert.match(proc.stdout, /anthropic\/claude-3-5-sonnet/);
});

test('CLI provider list shows registered adapters with credential status', () => {
  const proc = runMelodie(['provider', 'list']);
  assert.equal(proc.status, 0);
  assert.match(proc.stdout, /AI Providers/);
  assert.match(proc.stdout, /openrouter/);
  assert.match(proc.stdout, /local/);
});

test('CLI agent plan generates decomposed architecture steps', () => {
  const proc = runMelodie(['agent', 'plan', 'Verify sandbox path traversal']);
  assert.equal(proc.status, 0);
  assert.match(proc.stdout, /Agent Planning Engine/);
  assert.match(proc.stdout, /TASK-/);
  assert.match(proc.stdout, /Decomposed Execution Steps/);
});

test('CLI sandbox inspect reports operational security status', () => {
  const proc = runMelodie(['sandbox', 'inspect']);
  assert.equal(proc.status, 0);
  assert.match(proc.stdout, /Melodie Sandbox Inspection/);
  assert.match(proc.stdout, /OPERATIONAL/);
});

test('CLI deployment release is rejected by default', () => {
  const proc = runMelodie(['deployment', 'release']);
  assert.notEqual(proc.status, 0, 'Release without verified provider must fail non-zero');
  assert.match(proc.stderr || proc.stdout, /RELEASE REJECTED/);
});
