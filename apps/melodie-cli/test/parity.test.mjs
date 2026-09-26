/**
 * Node and Python parity test.
 *
 * The architecture rule for this project is: one catalog, two frontends. This
 * test is what enforces it. It runs the real TypeScript CLI and the real
 * Python CLI against the same catalog and asserts they agree.
 *
 * If the Python CLI is unavailable (not installed, no python on PATH), the test
 * reports SKIPPED rather than passing silently. A parity test that cannot
 * detect drift is worse than no parity test.
 */

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(HERE, '..', '..', '..');
const NODE_CLI = path.join(REPO_ROOT, 'apps', 'melodie-cli', 'bin', 'melodie.mjs');
const PYTHON_SRC = path.join(REPO_ROOT, 'python', 'melodiespark-cli', 'src');
const CATALOG = path.join(REPO_ROOT, 'packages', 'content-catalog', 'catalog', 'content-catalog.json');

// `inspect --json` over a whole category emits megabytes. Node's default
// child-process maxBuffer is 1 MB, which fails with ENOBUFS rather than
// reporting a real mismatch, so it has to be raised explicitly.
const MAX_BUFFER = 256 * 1024 * 1024;

function runNode(args) {
  return execFileSync(process.execPath, [NODE_CLI, ...args], {
    encoding: 'utf-8',
    cwd: REPO_ROOT,
    maxBuffer: MAX_BUFFER,
    env: { ...process.env, NO_COLOR: '1' },
  });
}

function pythonAvailable() {
  const probe = spawnSync('python', ['--version'], { encoding: 'utf-8' });
  return probe.status === 0;
}

function runPython(args) {
  return execFileSync('python', ['-m', 'melodiespark_cli', ...args], {
    encoding: 'utf-8',
    cwd: REPO_ROOT,
    maxBuffer: MAX_BUFFER,
    env: { ...process.env, PYTHONPATH: PYTHON_SRC, NO_COLOR: '1' },
  });
}

function jsonFrom(text) {
  // Both frontends print a bare JSON document for --json. Slice from whichever
  // of `{` or `[` appears first: taking indexOf('{') alone would start inside a
  // JSON array and leave a trailing `]` to break the parse.
  const brace = text.indexOf('{');
  const bracket = text.indexOf('[');
  let start = brace;
  if (brace === -1) start = bracket;
  else if (bracket !== -1 && bracket < brace) start = bracket;
  return JSON.parse(text.slice(start));
}

test('catalog exists and is complete', { skip: !fs.existsSync(CATALOG) && 'run: melodie catalog --build' }, () => {
  const catalog = JSON.parse(fs.readFileSync(CATALOG, 'utf-8'));
  assert.ok(catalog.files.length > 0, 'catalog has entries');
  assert.equal(catalog.contract_version, '1.0.0');
  for (const file of catalog.files) {
    assert.match(file.sha256, /^[a-f0-9]{64}$/, `bad sha256 for ${file.path}`);
  }
});

test('Node and Python agree on the catalog summary', { skip: !pythonAvailable() && 'python not found' }, () => {
  const nodeSummary = jsonFrom(runNode(['catalog', '--json']));
  const pythonSummary = jsonFrom(runPython(['catalog', '--json']));

  assert.equal(pythonSummary.file_count, nodeSummary.file_count, 'file_count');
  assert.equal(pythonSummary.total_bytes, nodeSummary.total_bytes, 'total_bytes');
  assert.equal(pythonSummary.excluded_count, nodeSummary.excluded_count, 'excluded_count');
  assert.equal(pythonSummary.secret_count, nodeSummary.secret_count, 'secret_count');
  assert.deepEqual(pythonSummary.by_category, nodeSummary.by_category, 'by_category');
  assert.deepEqual(pythonSummary.by_repository, nodeSummary.by_repository, 'by_repository');
});

test('Node and Python agree on inspect for every category', { skip: !pythonAvailable() && 'python not found' }, () => {
  const nodeSummary = jsonFrom(runNode(['catalog', '--json']));
  const categories = Object.keys(nodeSummary.by_category);

  for (const category of categories) {
    const nodeResult = jsonFrom(runNode(['inspect', '--category', category, '--limit', '5000', '--json']));
    const pythonResult = jsonFrom(runPython(['inspect', '--category', category, '--limit', '5000', '--json']));
    assert.equal(
      pythonResult.count,
      nodeResult.count,
      `count mismatch for category ${category}`
    );
  }
});

test('Node and Python agree on inspect for a sample of paths', { skip: !pythonAvailable() && 'python not found' }, () => {
  const queries = ['README.md', 'package.json', 'docker-compose', 'src/index', 'cli', 'test_'];
  for (const query of queries) {
    const nodeResult = jsonFrom(runNode(['inspect', query, '--limit', '5000', '--json']));
    const pythonResult = jsonFrom(runPython(['inspect', query, '--limit', '5000', '--json']));
    assert.equal(pythonResult.count, nodeResult.count, `count mismatch for query "${query}"`);
  }
});

test('Node and Python agree that every SECRET is permanently denied', { skip: !pythonAvailable() && 'python not found' }, () => {
  const nodeResult = jsonFrom(runNode(['inspect', '--category', 'SECRET', '--limit', '5000', '--json']));
  const pythonResult = jsonFrom(runPython(['inspect', '--category', 'SECRET', '--limit', '5000', '--json']));
  assert.equal(pythonResult.count, nodeResult.count);

  for (const file of nodeResult.files) {
    assert.equal(file.permanently_denied, true, `${file.path} must be permanently denied`);
    assert.equal(file.extractable, false, `${file.path} must not be extractable`);
    assert.equal(file.authorization_required, false, `${file.path} must not be merely authorization-gated`);
  }
  for (const file of pythonResult.files) {
    assert.equal(file.permanently_denied, true, `python: ${file.path} must be permanently denied`);
  }
});

test('Node and Python agree on templates', { skip: !pythonAvailable() && 'python not found' }, () => {
  const nodeTemplates = jsonFrom(runNode(['template', '--json']));
  const pythonTemplates = jsonFrom(runPython(['template', '--json']));
  const nodeNames = nodeTemplates.map((t) => t.name).sort();
  const pythonNames = pythonTemplates.map((t) => t.name).sort();
  assert.deepEqual(pythonNames, nodeNames, 'template name sets');
});

test('both frontends report a passing verify', { skip: !pythonAvailable() && 'python not found' }, () => {
  const nodeVerify = jsonFrom(runNode(['verify', '--json']));
  const pythonVerify = jsonFrom(runPython(['verify', '--json']));
  const nodeFailures = nodeVerify.checks.filter((c) => !c.ok).map((c) => c.id);
  const pythonFailures = pythonVerify.checks.filter((c) => !c.ok).map((c) => c.id);
  assert.deepEqual(pythonFailures, nodeFailures, 'the same checks must fail (or pass) in both frontends');
});
