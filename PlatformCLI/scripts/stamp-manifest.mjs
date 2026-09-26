#!/usr/bin/env node
/**
 * Stamp the package with a build manifest.
 *
 * Records what is actually inside the tarball: the asset inventory, the
 * catalog summary, and the template list. This is provenance for the release
 * artifact, so that a published package can be audited after the fact.
 *
 * Runs from `prepack`, after `tsc`, so `dist/` is already present.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..');

const pkg = JSON.parse(fs.readFileSync(path.join(PACKAGE_ROOT, 'package.json'), 'utf-8'));

function walk(dir, acc = []) {
  if (!fs.existsSync(dir)) return acc;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(abs, acc);
    else if (entry.isFile()) acc.push(abs);
  }
  return acc;
}

const INVENTORY_DIRS = ['assets', 'dist', 'bin'];

const files = [];
for (const dir of INVENTORY_DIRS) {
  for (const abs of walk(path.join(PACKAGE_ROOT, dir))) {
    const rel = path.relative(PACKAGE_ROOT, abs).split(path.sep).join('/');
    const stat = fs.statSync(abs);
    files.push({
      path: rel,
      bytes: stat.size,
      sha256: crypto.createHash('sha256').update(fs.readFileSync(abs)).digest('hex'),
    });
  }
}
files.sort((a, b) => (a.path < b.path ? -1 : 1));

let catalog = null;
const catalogPath = path.join(PACKAGE_ROOT, 'assets', 'catalog', 'content-catalog.json');
if (fs.existsSync(catalogPath)) {
  const parsed = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  catalog = {
    contract_version: parsed.contract_version,
    generated_at: parsed.generated_at,
    file_count: parsed.summary?.file_count ?? null,
    total_bytes: parsed.summary?.total_bytes ?? null,
    excluded_count: parsed.summary?.excluded_count ?? null,
    secret_count: parsed.summary?.secret_count ?? null,
  };
}

let templates = [];
const templatesDir = path.join(PACKAGE_ROOT, 'assets', 'templates');
if (fs.existsSync(templatesDir)) {
  templates = fs
    .readdirSync(templatesDir, { withFileTypes: true })
    .filter((d) => d.isDirectory() && fs.existsSync(path.join(templatesDir, d.name, 'template.json')))
    .map((d) => {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(templatesDir, d.name, 'template.json'), 'utf-8')
      );
      return {
        name: manifest.name,
        version: manifest.version,
        kind: manifest.kind,
        targets: manifest.targets,
        web3: manifest.web3 ?? null,
        consent_gated_files: manifest.consent_gated_files ?? [],
      };
    })
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

const manifest = {
  package: pkg.name,
  version: pkg.version,
  built_at: new Date().toISOString(),
  node: process.versions.node,
  platform: `${process.platform}-${process.arch}`,
  catalog,
  templates,
  file_count: files.length,
  total_bytes: files.reduce((sum, f) => sum + f.bytes, 0),
  files,
  guarantees: {
    secrets_included: false,
    source_tree_included: false,
    extraction_is_deny_by_default: true,
    web3_signing_disabled_by_default: true,
    note: 'This manifest describes packaging only. It is not evidence that any described capability is operational.',
  },
};

const out = path.join(PACKAGE_ROOT, 'BUILD_MANIFEST.json');
fs.writeFileSync(out, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8');
process.stdout.write(
  `stamped BUILD_MANIFEST.json (${files.length} files, ${manifest.total_bytes} bytes, ${templates.length} templates)\n`
);
