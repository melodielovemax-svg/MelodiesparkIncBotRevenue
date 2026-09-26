/**
 * Catalog builder.
 *
 * Walks a source tree and records complete metadata for every file.
 * It never writes file contents into the catalog, and it never copies
 * anything: extraction is a separate, deny-by-default command.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { Classifier } from './classifier.ts';
import type {
  CatalogFileEntry,
  CatalogRepository,
  CatalogTally,
  ContentCatalog,
} from './contracts.ts';

const CONTRACT_VERSION = '1.0.0';

function toPosix(value: string): string {
  return value.split(path.sep).join('/').replace(/\\/g, '/');
}

function extensionOf(posixPath: string): string {
  const base = posixPath.slice(posixPath.lastIndexOf('/') + 1);
  const dot = base.lastIndexOf('.');
  if (dot <= 0) return '';
  return base.slice(dot).toLowerCase();
}

export function sha256File(absPath: string): string {
  const hash = crypto.createHash('sha256');
  const fd = fs.openSync(absPath, 'r');
  try {
    const buffer = Buffer.allocUnsafe(1024 * 1024);
    let bytesRead = 0;
    do {
      bytesRead = fs.readSync(fd, buffer, 0, buffer.length, null);
      if (bytesRead > 0) hash.update(buffer.subarray(0, bytesRead));
    } while (bytesRead > 0);
  } finally {
    fs.closeSync(fd);
  }
  return hash.digest('hex');
}

export interface BuildOptions {
  sourceRoot: string;
  generatorName: string;
  generatorVersion: string;
  onProgress?: (done: number, total: number, current: string) => void;
}

function readRepositoryInventory(sourceRoot: string): Map<string, CatalogRepository> {
  const map = new Map<string, CatalogRepository>();
  const inventoryPath = path.join(sourceRoot, 'SOURCE_INVENTORY.json');
  if (!fs.existsSync(inventoryPath)) return map;
  try {
    const parsed = JSON.parse(fs.readFileSync(inventoryPath, 'utf-8')) as Array<Record<string, unknown>>;
    for (const entry of parsed) {
      const name = String(entry.Name ?? '');
      if (!name) continue;
      map.set(name, {
        name,
        remote: (entry.Remote as string | undefined) ?? null,
        branch: (entry.Branch as string | undefined) ?? null,
        commit: (entry.Commit as string | undefined) ?? null,
        commit_date: (entry.CommitDate as string | undefined) ?? null,
        declared_file_count: (entry.FileCount as number | undefined) ?? null,
        catalogued_count: 0,
        bytes: 0,
      });
    }
  } catch {
    // A malformed inventory must not stop cataloguing; repositories are then
    // reported without provenance metadata.
  }
  return map;
}

export function buildCatalog(classifier: Classifier, opts: BuildOptions): ContentCatalog {
  const started = Date.now();
  const { sourceRoot } = opts;
  const sourceRootExists = fs.existsSync(sourceRoot);

  const files: CatalogFileEntry[] = [];
  const byCategory: Record<string, CatalogTally> = {};
  const byRepository: Record<string, CatalogTally> = {};
  const repositoryMeta = readRepositoryInventory(sourceRoot);

  let totalBytes = 0;
  let excludedCount = 0;
  let secretCount = 0;
  let sensitiveBytes = 0;

  const bump = (bucket: Record<string, CatalogTally>, key: string, bytes: number): void => {
    const current = bucket[key] ?? { count: 0, bytes: 0 };
    current.count += 1;
    current.bytes += bytes;
    bucket[key] = current;
  };

  if (sourceRootExists) {
    const stack: string[] = [sourceRoot];
    let processed = 0;

    while (stack.length > 0) {
      const dir = stack.pop() as string;
      let dirents: fs.Dirent[];
      try {
        dirents = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const dirent of dirents) {
        const abs = path.join(dir, dirent.name);
        if (dirent.isDirectory()) {
          stack.push(abs);
          continue;
        }
        if (!dirent.isFile() && !dirent.isSymbolicLink()) continue;

        const relPosix = toPosix(path.relative(sourceRoot, abs));
        let stat: fs.Stats;
        try {
          stat = fs.statSync(abs);
        } catch {
          continue;
        }

        let digest: string;
        try {
          digest = sha256File(abs);
        } catch {
          digest = '0'.repeat(64);
        }

        const verdict = classifier.classify(abs, sourceRoot);
        const segments = relPosix.split('/');
        const repository = segments.length > 1 ? segments[0] : '(root)';
        const module = segments.length > 2 ? segments.slice(0, Math.min(3, segments.length - 1)).join('/') : null;

        const entry: CatalogFileEntry = {
          path: relPosix,
          bytes: stat.size,
          sha256: digest,
          extension: extensionOf(relPosix),
          repository,
          module,
          category: verdict.category,
          rule_id: verdict.rule_id,
          reason: verdict.reason,
          flags: verdict.flags,
          sensitive: verdict.sensitive,
          generated: verdict.generated,
          binary: verdict.binary,
          archive: verdict.archive,
          vcs_metadata: verdict.vcs_metadata,
          permanently_denied: verdict.permanently_denied,
          extractable: verdict.extractable,
          authorization_required: verdict.authorization_required,
          modified_utc: stat.mtime ? stat.mtime.toISOString() : null,
        };

        files.push(entry);
        totalBytes += entry.bytes;
        if (entry.sensitive) sensitiveBytes += entry.bytes;
        if (!entry.extractable) excludedCount += 1;
        if (entry.category === 'SECRET') secretCount += 1;

        bump(byCategory, entry.category, entry.bytes);
        bump(byRepository, repository, entry.bytes);

        const known = repositoryMeta.get(repository);
        if (known) {
          known.catalogued_count += 1;
          known.bytes += entry.bytes;
        }

        processed += 1;
        if (opts.onProgress && processed % 250 === 0) opts.onProgress(processed, -1, relPosix);
      }
    }

    files.sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0));
  }

  const repositories: CatalogRepository[] = [...repositoryMeta.values()].sort((a, b) =>
    a.name < b.name ? -1 : a.name > b.name ? 1 : 0
  );

  for (const key of Object.keys(byRepository)) {
    if (!repositoryMeta.has(key)) {
      repositories.push({
        name: key,
        remote: null,
        branch: null,
        commit: null,
        commit_date: null,
        declared_file_count: null,
        catalogued_count: byRepository[key].count,
        bytes: byRepository[key].bytes,
      });
    }
  }
  repositories.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));

  return {
    contract_version: CONTRACT_VERSION,
    generated_at: new Date().toISOString(),
    generator: {
      name: opts.generatorName,
      version: opts.generatorVersion,
      node: process.versions.node,
      platform: `${process.platform}-${process.arch}`,
      elapsed_ms: Date.now() - started,
    },
    source_root: sourceRoot,
    source_root_exists: sourceRootExists,
    summary: {
      file_count: files.length,
      total_bytes: totalBytes,
      excluded_count: excludedCount,
      secret_count: secretCount,
      sensitive_bytes: sensitiveBytes,
      by_category: byCategory,
      by_repository: byRepository,
    },
    repositories,
    files,
  };
}
