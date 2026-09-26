/**
 * Behavioural tests for the extraction and classification policy.
 *
 * These are the tests that matter most: the policy is the security boundary.
 * A test that only checks that a command runs proves nothing.
 */

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { Classifier, loadRules } from '../src/classifier.ts';
import { parseArgs, shiftCommand } from '../src/args.ts';
import { scanContent } from '../src/content-guard.ts';
import { CANONICAL_RULES } from '../src/paths.ts';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const NODE_CLI = path.join(REPO_ROOT, 'apps', 'melodie-cli', 'bin', 'melodie.mjs');

function runNode(args) {
  return execFileSync(process.execPath, [NODE_CLI, ...args], {
    encoding: 'utf-8',
    cwd: REPO_ROOT,
    env: { ...process.env, NO_COLOR: '1' },
  });
}
const RULES_PATH = fs.existsSync(CANONICAL_RULES)
  ? CANONICAL_RULES
  : path.join(HERE, '..', 'assets', 'rules', 'classification-rules.json');

const rules = loadRules(RULES_PATH);
const classifier = new Classifier(rules);
const ROOT = path.resolve('C:/melodie/Melodiespark_Source');

function verdict(relPath) {
  return classifier.classify(path.join(ROOT, relPath.replace(/\//g, path.sep)), ROOT);
}

test('argv parsing separates flags, options, and positionals', () => {
  const args = parseArgs(['extract', 'a.ts', '--out', 'dest', '--dry-run', '--k=v']);
  assert.deepEqual(args.positionals, ['extract', 'a.ts']);
  assert.equal(args.options.get('out'), 'dest');
  assert.equal(args.options.get('k'), 'v');
  assert.ok(args.flags.has('dry-run'));

  const shifted = shiftCommand(args);
  assert.deepEqual(shifted.positionals, ['a.ts']);
  assert.equal(shifted.options.get('out'), 'dest', 'options survive the shift');
});

test('credential files are permanently denied, not merely gated', () => {
  const cases = [
    'MelodieCLI/.env.enc',
    'MelodieCLI/.env.production',
    'MelodieCLI/CREDENTIALS_QUICK_REFERENCE.txt',
    'MelodieCLI/config/APIKeys.json',
    // A copy in a directory nobody enumerated when the rules were written.
    'MelodieCLI/migration-backup/whatever/BotRevenue-Ultimate/config/APIKeys.json',
    'some/deep/nested/apikeys.json',
    'anything/credentials.txt',
    'x/id_rsa',
    'x/server.pem',
  ];
  for (const rel of cases) {
    const v = verdict(rel);
    assert.equal(v.category, 'SECRET', `${rel} should be SECRET`);
    assert.equal(v.permanently_denied, true, `${rel} should be permanently denied`);
    assert.equal(v.extractable, false, `${rel} must not be extractable`);
    assert.equal(v.authorization_required, false, `${rel} must not be authorization-gated`);
  }
});

test('example and sample env files stay copyable', () => {
  for (const rel of ['pkg/.env.example', 'pkg/.env.sample', 'pkg/.env.example.full', 'pkg/config.yaml']) {
    const v = verdict(rel);
    assert.notEqual(v.category, 'SECRET', `${rel} must not be treated as a secret`);
    assert.equal(v.extractable, true, `${rel} should be extractable`);
  }
});

test('git metadata, archives, binaries, and generated dumps are excluded', () => {
  const cases = [
    ['MelodieCLI/.git/config', 'VCS'],
    ['MelodieCLI/bundle.zip', 'ARCHIVE'],
    ['MelodieCLI/phoenix.exe', 'BINARY'],
    ['MelodieCLI/query_engine.dll.node', 'BINARY'],
    ['MelodieCLI/MelodieCLI_FILES.csv', 'GENERATED'],
    ['MelodieCLI/MELODIECLI-TREE.txt', 'GENERATED'],
    ['MelodieCLI/CODE-MAP.txt', 'GENERATED'],
  ];
  for (const [rel, expected] of cases) {
    assert.equal(verdict(rel).category, expected, `${rel} should classify as ${expected}`);
    assert.equal(verdict(rel).extractable, false, `${rel} must not be extractable`);
  }
});

test('ordinary source, tests, and docs are extractable', () => {
  for (const rel of ['pkg/src/index.ts', 'pkg/tests/test_x.py', 'pkg/README.md', 'pkg/package.json', 'pkg/app/main.go']) {
    const v = verdict(rel);
    assert.equal(v.extractable, true, `${rel} should be extractable (got ${v.category})`);
    assert.equal(v.permanently_denied, false);
  }
});

test('tests are classified as TEST even with a source extension', () => {
  assert.equal(verdict('pkg/tests/helper.ts').category, 'TEST');
  assert.equal(verdict('pkg/src/util.test.ts').category, 'TEST');
});

test('flags are unique and include the hard-deny marker', () => {
  const v = verdict('MelodieCLI/.env.enc');
  assert.equal(new Set(v.flags).size, v.flags.length, `duplicate flags: ${v.flags.join(',')}`);
  assert.ok(v.flags.includes('permanently_denied'));
  assert.ok(v.flags.includes('hard_deny_pattern'));
});

// SYNTHETIC FIXTURE. Not a real credential. It matches the shape the guard
// looks for, so the guard test stays valid, while the "SYNTHETIC" marker means
// a secret scanner reading this repository does not have to guess whether it
// found a leak. Never put a real key here.
const SYNTHETIC_LIVE_KEY = 'sk_live_SYNTHETICfixture0000000000000000000000';

test('content guard detects a live key in an otherwise ordinary doc', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-guard-'));
  try {
    const file = path.join(dir, 'notes.md');
    fs.writeFileSync(
      file,
      ['# Notes', '', `Set STRIPE_API_KEY_SECRET=${SYNTHETIC_LIVE_KEY}`, ''].join('\n'),
      'utf-8'
    );
    const findings = scanContent(file, rules.extraction_policy);
    assert.ok(findings.length > 0, 'expected at least one content finding');
    assert.ok(findings.some((f) => f.id === 'CS001_STRIPE_LIVE_SECRET'));
    assert.ok(findings.every((f) => f.line >= 1));
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('content guard does not fire on clean prose or on a binary', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ms-guard-'));
  try {
    const clean = path.join(dir, 'clean.md');
    fs.writeFileSync(clean, '# Title\n\nNothing sensitive here.\n', 'utf-8');
    assert.deepEqual(scanContent(clean, rules.extraction_policy), []);

    const binary = path.join(dir, 'blob.bin');
    fs.writeFileSync(binary, Buffer.from([0x00, 0x01, 0x02, 0x00, 0xff]));
    assert.deepEqual(scanContent(binary, rules.extraction_policy), []);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('every rule is reachable and the fallback is used for unknown files', () => {
  assert.equal(verdict('weird/thing.qqq').category, 'OTHER');
  assert.equal(verdict('weird/thing.qqq').rule_id, 'R999_FALLBACK');
});

test('template subcommand words are not mistaken for template names', () => {
  // `melodie template show <name>` is the documented form, but `show` arrives
  // as the first positional. Treating it as a name made the command fail with
  // "Template not found: show". `list` and a bare `show` must list instead.
  const list = runNode(['template', 'list']);
  assert.match(list, /Templates \(5\)/);

  const bare = runNode(['template']);
  assert.match(bare, /Templates \(5\)/);

  const showAlone = runNode(['template', 'show']);
  assert.match(showAlone, /Templates \(5\)/);

  const described = runNode(['template', 'show', 'web3']);
  assert.match(described, /Template web3 v1\.0\.0/);

  const bareName = runNode(['template', 'web3']);
  assert.match(bareName, /Template web3 v1\.0\.0/);

  const files = runNode(['template', 'show', 'web3', '--files']);
  assert.match(files, /Files in template web3/);
});

test('an unknown template fails cleanly with a non-zero exit code', () => {
  // A plain Error here surfaced as "Unexpected error" and exited 0, which
  // reads as success to any wrapper script.
  const result = spawnSync(process.execPath, [NODE_CLI, 'template', 'show', 'definitely-not-a-template'], {
    encoding: 'utf-8',
    cwd: REPO_ROOT,
  });
  assert.notEqual(result.status, 0, 'expected a non-zero exit code');
  assert.match(result.stderr, /Template not found/);
  assert.doesNotMatch(result.stderr, /Unexpected error/);
});
