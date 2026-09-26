/**
 * Catalog emitters.
 *
 * Writes the canonical catalog plus the human- and machine-readable
 * projections requested by the template layout:
 *
 *   CATALOG/files.json
 *   CATALOG/files.sha256
 *   CATALOG/repositories.json
 *   CATALOG/classifications.json
 *   CATALOG/exclusions.json
 *
 * It also mirrors the catalog and the rules into `assets/` so that a global
 * npm install or an `npx` run has everything it needs without the monorepo.
 */

import fs from 'node:fs';
import path from 'node:path';
import type { ContentCatalog } from './contracts.ts';

export interface EmitTargets {
  canonicalDir: string;
  packagedAssetsDir: string;
}

function writeJson(file: string, value: unknown): number {
  const text = `${JSON.stringify(value, null, 2)}\n`;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf-8');
  return Buffer.byteLength(text);
}

function writeText(file: string, text: string): number {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text, 'utf-8');
  return Buffer.byteLength(text);
}

function copyDir(from: string, to: string): void {
  if (!fs.existsSync(from)) return;
  fs.cpSync(from, to, { recursive: true });
}

export interface EmitResult {
  written: Array<{ file: string; bytes: number }>;
  totalBytes: number;
}

export function emitCatalog(catalog: ContentCatalog, targets: EmitTargets): EmitResult {
  const written: Array<{ file: string; bytes: number }> = [];
  const catalogDir = targets.canonicalDir;
  const packagedCatalogDir = path.join(targets.packagedAssetsDir, 'catalog');

  const record = (file: string, bytes: number): void => {
    written.push({ file, bytes });
  };

  // files.json - the complete inventory, one record per file.
  record(path.join(catalogDir, 'files.json'), writeJson(path.join(catalogDir, 'files.json'), catalog.files));

  // files.sha256 - standard `sha256sum`-compatible checksum list.
  const checksumBody = catalog.files.map((f) => `${f.sha256}  ${f.path}`).join('\n');
  record(
    path.join(catalogDir, 'files.sha256'),
    writeText(path.join(catalogDir, 'files.sha256'), `${checksumBody}\n${checksumBody ? '' : ''}`)
  );

  // repositories.json - provenance per imported repository.
  record(
    path.join(catalogDir, 'repositories.json'),
    writeJson(path.join(catalogDir, 'repositories.json'), {
      contract_version: catalog.contract_version,
      generated_at: catalog.generated_at,
      source_root: catalog.source_root,
      repositories: catalog.repositories,
    })
  );

  // classifications.json - rule-by-rule accounting.
  const ruleTally = new Map<string, { rule_id: string; category: string; count: number; bytes: number; reason: string }>();
  for (const file of catalog.files) {
    const current = ruleTally.get(file.rule_id) ?? {
      rule_id: file.rule_id,
      category: file.category,
      count: 0,
      bytes: 0,
      reason: file.reason,
    };
    current.count += 1;
    current.bytes += file.bytes;
    ruleTally.set(file.rule_id, current);
  }
  record(
    path.join(catalogDir, 'classifications.json'),
    writeJson(path.join(catalogDir, 'classifications.json'), {
      contract_version: catalog.contract_version,
      generated_at: catalog.generated_at,
      by_category: catalog.summary.by_category,
      by_rule: [...ruleTally.values()].sort((a, b) => (a.rule_id < b.rule_id ? -1 : 1)),
    })
  );

  // exclusions.json - everything deny-by-default, with reasons.
  const excluded = catalog.files.filter((f) => !f.extractable);
  record(
    path.join(catalogDir, 'exclusions.json'),
    writeJson(path.join(catalogDir, 'exclusions.json'), {
      contract_version: catalog.contract_version,
      generated_at: catalog.generated_at,
      policy: {
        default: 'DENY',
        permanently_denied_category: 'SECRET',
        permanently_denied_paths: [
          '.env.enc',
          '.env.login',
          '.env.quickstart',
          '.env.txt',
          'CREDENTIALS_QUICK_REFERENCE.txt',
          'config/APIKeys.json',
          'config/EncryptedAPIKey.txt',
          '.env.production (BotRevenue-Ultimate variants)',
        ],
        authorization_flag: '--i-have-authorization',
      },
      excluded_count: excluded.length,
      excluded_bytes: excluded.reduce((sum, f) => sum + f.bytes, 0),
      by_reason: excluded.reduce<Record<string, { count: number; bytes: number }>>((acc, f) => {
        const current = acc[f.category] ?? { count: 0, bytes: 0 };
        current.count += 1;
        current.bytes += f.bytes;
        acc[f.category] = current;
        return acc;
      }, {}),
      files: excluded.map((f) => ({
        path: f.path,
        bytes: f.bytes,
        sha256: f.sha256,
        category: f.category,
        rule_id: f.rule_id,
        sensitive: f.sensitive,
        permanently_denied: f.permanently_denied,
        authorization_required: f.authorization_required,
        reason: f.reason,
      })),
    })
  );

  // The catalog itself, in both locations.
  record(
    path.join(catalogDir, 'content-catalog.json'),
    writeJson(path.join(catalogDir, 'content-catalog.json'), catalog)
  );
  record(
    path.join(packagedCatalogDir, 'content-catalog.json'),
    writeJson(path.join(packagedCatalogDir, 'content-catalog.json'), catalog)
  );

  // Mirror the security-relevant projections into the packaged copy. Without
  // files.sha256 a global install cannot run `melodie verify` at all, and
  // without exclusions.json a reviewer of the published tarball has no way to
  // see what was denied. files.json is deliberately NOT mirrored: it is the
  // same 6,799 records already inside content-catalog.json, and duplicating
  // 4 MB in every tarball buys nothing.
  record(
    path.join(packagedCatalogDir, 'files.sha256'),
    writeText(path.join(packagedCatalogDir, 'files.sha256'), `${checksumBody}\n`)
  );
  record(
    path.join(packagedCatalogDir, 'exclusions.json'),
    writeJson(path.join(packagedCatalogDir, 'exclusions.json'), {
      contract_version: catalog.contract_version,
      generated_at: catalog.generated_at,
      policy: {
        default: 'DENY',
        permanently_denied_category: 'SECRET',
        authorization_flag: '--i-have-authorization',
      },
      excluded_count: excluded.length,
      excluded_bytes: excluded.reduce((sum, f) => sum + f.bytes, 0),
      by_category: excluded.reduce<Record<string, { count: number; bytes: number }>>((acc, f) => {
        const current = acc[f.category] ?? { count: 0, bytes: 0 };
        current.count += 1;
        current.bytes += f.bytes;
        acc[f.category] = current;
        return acc;
      }, {}),
      files: excluded.map((f) => ({
        path: f.path,
        bytes: f.bytes,
        sha256: f.sha256,
        category: f.category,
        rule_id: f.rule_id,
        sensitive: f.sensitive,
        permanently_denied: f.permanently_denied,
        authorization_required: f.authorization_required,
        reason: f.reason,
      })),
    })
  );
  record(
    path.join(packagedCatalogDir, 'repositories.json'),
    writeJson(path.join(packagedCatalogDir, 'repositories.json'), {
      contract_version: catalog.contract_version,
      generated_at: catalog.generated_at,
      source_root: catalog.source_root,
      repositories: catalog.repositories,
    })
  );

  return { written, totalBytes: written.reduce((sum, w) => sum + w.bytes, 0) };
}

export interface SyncAssetsOptions {
  rulesSource: string;
  templatesSource: string;
  packagedAssetsDir: string;
}

export function syncPackagedAssets(opts: SyncAssetsOptions): string[] {
  const copied: string[] = [];
  const rulesTarget = path.join(opts.packagedAssetsDir, 'rules', path.basename(opts.rulesSource));
  if (fs.existsSync(opts.rulesSource)) {
    fs.mkdirSync(path.dirname(rulesTarget), { recursive: true });
    fs.copyFileSync(opts.rulesSource, rulesTarget);
    copied.push(rulesTarget);
  }
  const templatesTarget = path.join(opts.packagedAssetsDir, 'templates');
  if (fs.existsSync(opts.templatesSource)) {
    fs.rmSync(templatesTarget, { recursive: true, force: true });
    copyDir(opts.templatesSource, templatesTarget);
    copied.push(templatesTarget);
  }
  return copied;
}
