/**
 * `melodie verify` - prove catalog integrity and check for secret leakage.
 *
 * Checks performed:
 *   1. catalog loads and matches the expected contract version
 *   2. CATALOG/files.sha256 agrees with the catalog entries
 *   3. the packaged catalog copy is byte-identical to the canonical one
 *   4. the packaged rules copy is byte-identical to the shared rules
 *   5. no SECRET-classified file exists inside the shipped assets
 *   6. no private-key material is embedded in the shipped assets
 *   7. (--deep) every catalogued source file still hashes to its recorded value
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { flag, opt, type ParsedArgs } from '../args.ts';
import { sha256File } from '../catalog.ts';
import { Classifier, loadRules } from '../classifier.ts';
import { PACKAGED_CATALOG, PACKAGED_RULES, PACKAGE_ROOT, resolvePaths } from '../paths.ts';
import { loadCatalog } from '../store.ts';
import { bytesHuman, heading, line, style, table } from '../output.ts';

interface Check {
  id: string;
  description: string;
  ok: boolean;
  detail: string;
}

const PRIVATE_KEY_PATTERN = /-----BEGIN [A-Z ]*PRIVATE KEY-----/;
const MAX_SCAN_BYTES = 4 * 1024 * 1024;

function hashText(text: string): string {
  return crypto.createHash('sha256').update(text, 'utf-8').digest('hex');
}

function walkFiles(root: string, acc: string[] = []): string[] {
  if (!fs.existsSync(root)) return acc;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const abs = path.join(root, entry.name);
    if (entry.isDirectory()) walkFiles(abs, acc);
    else if (entry.isFile()) acc.push(abs);
  }
  return acc;
}

export function runVerify(args: ParsedArgs): void {
  const paths = resolvePaths({ catalog: opt(args, 'catalog') });
  const deep = flag(args, 'deep');
  const json = flag(args, 'json');
  const checks: Check[] = [];

  let loaded;
  try {
    loaded = loadCatalog(opt(args, 'catalog'));
  } catch (error) {
    checks.push({ id: 'CATALOG_LOADS', description: 'Catalog loads', ok: false, detail: (error as Error).message });
    report(checks, json);
    return;
  }
  const { catalog } = loaded;

  checks.push({
    id: 'CATALOG_LOADS',
    description: 'Catalog loads',
    ok: true,
    detail: `${catalog.summary.file_count} entries from ${catalog.source_root}`,
  });

  checks.push({
    id: 'CONTRACT_VERSION',
    description: 'Contract version',
    ok: catalog.contract_version === '1.0.0',
    detail: catalog.contract_version,
  });

  // 2. checksum list agreement
  const shaFile = path.join(path.dirname(paths.catalogPath), 'files.sha256');
  if (fs.existsSync(shaFile)) {
    const body = fs.readFileSync(shaFile, 'utf-8');
    const listed = new Map<string, string>();
    for (const line of body.split('\n')) {
      if (!line.trim()) continue;
      const match = line.match(/^([a-f0-9]{64})\s+(.*)$/);
      if (match) listed.set(match[2], match[1]);
    }
    const mismatches: string[] = [];
    for (const file of catalog.files) {
      const recorded = listed.get(file.path);
      if (recorded !== file.sha256) mismatches.push(file.path);
    }
    checks.push({
      id: 'CHECKSUM_LIST',
      description: 'files.sha256 agrees with catalog',
      ok: mismatches.length === 0 && listed.size === catalog.files.length,
      detail:
        mismatches.length === 0
          ? `${listed.size} checksums verified`
          : `${mismatches.length} mismatch(es), listed ${listed.size} vs catalog ${catalog.files.length}`,
    });
  } else {
    checks.push({
      id: 'CHECKSUM_LIST',
      description: 'files.sha256 agrees with catalog',
      ok: false,
      detail: `missing ${shaFile}`,
    });
  }

  // 3. packaged catalog copy
  if (fs.existsSync(PACKAGED_CATALOG)) {
    const same =
      hashText(fs.readFileSync(PACKAGED_CATALOG, 'utf-8')) ===
      hashText(fs.readFileSync(paths.catalogPath, 'utf-8'));
    checks.push({
      id: 'PACKAGED_CATALOG',
      description: 'Packaged catalog matches canonical',
      ok: same,
      detail: same ? path.relative(PACKAGE_ROOT, PACKAGED_CATALOG) : `differs: ${PACKAGED_CATALOG}`,
    });
  } else {
    checks.push({
      id: 'PACKAGED_CATALOG',
      description: 'Packaged catalog matches canonical',
      ok: false,
      detail: `missing ${PACKAGED_CATALOG} (run: melodie catalog --build)`,
    });
  }

  // 4. packaged rules copy
  const rules = loadRules(paths.rulesPath);
  if (fs.existsSync(PACKAGED_RULES)) {
    const same =
      hashText(fs.readFileSync(PACKAGED_RULES, 'utf-8')) ===
      hashText(fs.readFileSync(paths.rulesPath, 'utf-8'));
    checks.push({
      id: 'PACKAGED_RULES',
      description: 'Packaged rules match shared rules',
      ok: same,
      detail: same ? path.relative(PACKAGE_ROOT, PACKAGED_RULES) : `differs: ${PACKAGED_RULES}`,
    });
  } else {
    checks.push({
      id: 'PACKAGED_RULES',
      description: 'Packaged rules match shared rules',
      ok: false,
      detail: `missing ${PACKAGED_RULES} (run: melodie catalog --build)`,
    });
  }

  // 5 + 6. secret leakage scan of everything we would ship
  const classifier = new Classifier(rules);
  const scanRoots = [paths.packagedAssetsDir, paths.templatesDir].filter(
    (p) => fs.existsSync(p) && fs.statSync(p).isDirectory()
  );

  const secretHits: string[] = [];
  const keyHits: string[] = [];
  let scanned = 0;
  for (const root of scanRoots) {
    for (const abs of walkFiles(root)) {
      scanned += 1;
      const stat = fs.statSync(abs);
      if (stat.size > MAX_SCAN_BYTES) continue;
      const verdict = classifier.classify(abs, abs);
      const isSecretName =
        verdict.category === 'SECRET' ||
        path.basename(abs).toLowerCase().includes('credentials') ||
        path.basename(abs).toLowerCase() === 'apikeys.json';
      if (isSecretName) secretHits.push(path.relative(root, abs));
      // The rules file defines the private-key pattern, so it necessarily
      // contains that pattern as a literal. Scanning it would report the
      // detector as a leak, forever.
      if (path.basename(abs) === path.basename(PACKAGED_RULES)) continue;
      let text = '';
      try {
        text = fs.readFileSync(abs, 'utf-8');
      } catch {
        continue;
      }
      if (PRIVATE_KEY_PATTERN.test(text)) keyHits.push(path.relative(root, abs));
    }
  }

  checks.push({
    id: 'NO_SECRET_FILENAMES',
    description: 'No secret filenames in shipped assets',
    ok: secretHits.length === 0,
    detail: secretHits.length === 0 ? `${scanned} files scanned across ${scanRoots.length} roots` : secretHits.join(', '),
  });
  checks.push({
    id: 'NO_PRIVATE_KEY_MATERIAL',
    description: 'No embedded private key material',
    ok: keyHits.length === 0,
    detail: keyHits.length === 0 ? 'no PEM private key blocks found' : keyHits.join(', '),
  });

  // 7. deep re-hash
  if (deep) {
    if (!catalog.source_root_exists) {
      checks.push({ id: 'DEEP_HASH', description: 'Source files match recorded hashes', ok: false, detail: `source root absent: ${catalog.source_root}` });
    } else {
      let mismatched = 0;
      let missing = 0;
      for (const file of catalog.files) {
        if (file.vcs_metadata) continue;
        const abs = path.join(catalog.source_root, file.path.split('/').join(path.sep));
        if (!fs.existsSync(abs)) {
          missing += 1;
          continue;
        }
        let digest = '';
        try {
          digest = sha256File(abs);
        } catch {
          mismatched += 1;
          continue;
        }
        if (digest !== file.sha256) mismatched += 1;
      }
      checks.push({
        id: 'DEEP_HASH',
        description: 'Source files match recorded hashes',
        ok: mismatched === 0 && missing === 0,
        detail: `re-hashed ${catalog.files.length} entries, ${mismatched} changed, ${missing} missing`,
      });
    }
  }

  report(checks, json);
}

function report(checks: Check[], json: boolean): void {
  const failed = checks.filter((c) => !c.ok);
  if (json) {
    line(JSON.stringify({ ok: failed.length === 0, total: checks.length, failed: failed.length, checks }, null, 2));
  } else {
    heading(`Verification (${checks.length} checks)`);
    table(
      checks.map((c) => [c.ok ? style.green('PASS') : style.red('FAIL'), c.id, c.description, c.detail]),
      ['', 'CHECK', 'DESCRIPTION', 'DETAIL']
    );
    line();
    line(
      failed.length === 0
        ? style.green(`All ${checks.length} checks passed.`)
        : style.red(`${failed.length} of ${checks.length} checks failed.`)
    );
  }
  if (failed.length > 0) process.exitCode = 1;
}
