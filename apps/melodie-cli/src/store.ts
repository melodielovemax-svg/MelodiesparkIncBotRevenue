/** Catalog loading and shared query helpers. */

import fs from 'node:fs';
import type { CatalogFileEntry, ContentCatalog, RulesFile } from './contracts.ts';
import { resolvePaths, type ResolvedPaths } from './paths.ts';

export class CatalogError extends Error {}

export interface LoadedCatalog {
  catalog: ContentCatalog;
  paths: ResolvedPaths;
  byPath: Map<string, CatalogFileEntry>;
}

export function loadCatalog(explicitPath?: string): LoadedCatalog {
  const paths = resolvePaths({ catalog: explicitPath });
  if (!fs.existsSync(paths.catalogPath)) {
    throw new CatalogError(
      `Catalog not found at ${paths.catalogPath}.\n` +
        `Build it with:  melodie catalog --build\n` +
        `Or point at one with --catalog <file> or MELODIESPARK_CATALOG.`
    );
  }
  let catalog: ContentCatalog;
  try {
    catalog = JSON.parse(fs.readFileSync(paths.catalogPath, 'utf-8')) as ContentCatalog;
  } catch (error) {
    throw new CatalogError(`Catalog at ${paths.catalogPath} is not valid JSON: ${(error as Error).message}`);
  }
  if (!catalog || !Array.isArray(catalog.files) || !catalog.summary) {
    throw new CatalogError(`Catalog at ${paths.catalogPath} does not match contract ${catalog?.contract_version ?? '?'}.`);
  }
  const byPath = new Map<string, CatalogFileEntry>();
  for (const file of catalog.files) byPath.set(file.path, file);
  return { catalog, paths, byPath };
}

export function loadRulesFile(explicitPath?: string): RulesFile {
  const paths = resolvePaths();
  const rulesPath = explicitPath ?? paths.rulesPath;
  if (!fs.existsSync(rulesPath)) {
    throw new CatalogError(`Classification rules not found at ${rulesPath}.`);
  }
  return JSON.parse(fs.readFileSync(rulesPath, 'utf-8')) as RulesFile;
}

/** Case-insensitive suffix/substring match used by `inspect` and `extract`. */
export function matchesQuery(entry: CatalogFileEntry, query: string): boolean {
  const q = query.toLowerCase();
  const p = entry.path.toLowerCase();
  if (p === q) return true;
  if (p.endsWith(q)) return true;
  return p.includes(q);
}
