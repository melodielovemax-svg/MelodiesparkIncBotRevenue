import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Sandbox, SandboxError, PolicyViolationError } from '../src/sandbox/sandbox.ts';

test('sandbox path confinement strictly blocks path escapes', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'melodie-sandbox-test-'));
  const sandbox = new Sandbox(tmpDir);

  try {
    // 1. Directory traversal with ..
    assert.throws(
      () => sandbox.resolvePath('../escaped.txt'),
      SandboxError,
      'Should block ../ traversal'
    );

    // 2. Deep traversal
    assert.throws(
      () => sandbox.resolvePath('sub/../../outside.txt'),
      SandboxError,
      'Should block deep traversal'
    );

    // 3. Null bytes injection
    assert.throws(
      () => sandbox.resolvePath('safe\0attack.txt'),
      SandboxError,
      'Should block null byte injection'
    );

    // 4. Absolute path escaping root
    const outside = path.resolve(os.tmpdir(), 'arbitrary-outside-file.txt');
    assert.throws(
      () => sandbox.resolvePath(outside),
      SandboxError,
      'Should block absolute escape'
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('sandbox prevents writing to credential files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'melodie-sandbox-test-'));
  const sandbox = new Sandbox(tmpDir);

  try {
    assert.throws(
      () => sandbox.writeFile('.env', 'STRIPE_SECRET=sk_live_123'),
      PolicyViolationError
    );
    assert.throws(
      () => sandbox.writeFile('config/apikeys.json', '{}'),
      PolicyViolationError
    );
    assert.throws(
      () => sandbox.writeFile('keys/server.pem', 'KEY'),
      PolicyViolationError
    );
    assert.throws(
      () => sandbox.writeFile('ssh/id_rsa', 'KEY'),
      PolicyViolationError
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('sandbox blocks dangerous shell metacharacters and unallowlisted commands', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'melodie-sandbox-test-'));
  const sandbox = new Sandbox(tmpDir);

  try {
    // 1. Unallowlisted executable
    assert.throws(
      () => sandbox.executeCommand('curl', ['https://example.com']),
      PolicyViolationError
    );

    // 2. Command chaining with semicolon
    assert.throws(
      () => sandbox.executeCommand('node', ['-e', '1; rmdir /s']),
      PolicyViolationError
    );

    // 3. Pipe character injection
    assert.throws(
      () => sandbox.executeCommand('node', ['index.js | cat']),
      PolicyViolationError
    );

    // 4. Background execution operator &
    assert.throws(
      () => sandbox.executeCommand('node', ['app.js & echo pwned']),
      PolicyViolationError
    );
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
