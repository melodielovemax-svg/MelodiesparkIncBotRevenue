/**
 * Filesystem layout resolution.
 *
 * The CLI must work in three situations:
 *   1. from the monorepo (development),
 *   2. from a global npm/pnpm install or an `npx` cache (packaged assets),
 *   3. from a test harness pointing at explicit paths.
 *
 * Resolution order for every asset is: explicit flag > env var > monorepo
 * (discovered by walking up) > packaged asset inside this package.
 *
 * Monorepo layout being targeted:
 *
 *   <root>/packages/content-catalog/{rules,catalog}
 *   <root>/apps/melodie-cli/{src,dist,bin,assets}
 *   <root>/templates
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));

/** Root of this package. Works from both `src/` and `dist/`. */
export const PACKAGE_ROOT = path.resolve(HERE, '..');

/** Monorepo root, or null when running from a standalone install. */
export const MONOREPO_ROOT: string | null = (() => {
  let dir = HERE;
  for (let i = 0; i < 12; i += 1) {
    if (fs.existsSync(path.join(dir, 'packages', 'content-catalog', 'catalog.schema.json'))) return dir;
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
})();

export const DEFAULT_SOURCE_ROOT =
  MONOREPO_ROOT && fs.existsSync(path.join(MONOREPO_ROOT, 'Melodiespark_Source'))
    ? path.join(MONOREPO_ROOT, 'Melodiespark_Source')
    : 'C:\\melodie\\Melodiespark_Source';

// --- Canonical (monorepo) locations -----------------------------------------

export const CANONICAL_CATALOG_DIR = MONOREPO_ROOT
  ? path.join(MONOREPO_ROOT, 'packages', 'content-catalog', 'catalog')
  : path.join(PACKAGE_ROOT, 'catalog');

export const CANONICAL_CATALOG = path.join(CANONICAL_CATALOG_DIR, 'content-catalog.json');

export const CANONICAL_RULES = MONOREPO_ROOT
  ? path.join(MONOREPO_ROOT, 'packages', 'content-catalog', 'rules', 'classification-rules.json')
  : path.join(PACKAGE_ROOT, 'rules', 'classification-rules.json');

export const CANONICAL_TEMPLATES = MONOREPO_ROOT
  ? path.join(MONOREPO_ROOT, 'templates')
  : path.join(PACKAGE_ROOT, 'templates');

// --- Packaged (shipped) locations -------------------------------------------

export const PACKAGED_ASSETS = path.join(PACKAGE_ROOT, 'assets');
export const PACKAGED_CATALOG = path.join(PACKAGED_ASSETS, 'catalog', 'content-catalog.json');
export const PACKAGED_RULES = path.join(PACKAGED_ASSETS, 'rules', 'classification-rules.json');
export const PACKAGED_TEMPLATES = path.join(PACKAGED_ASSETS, 'templates');

// --- Resolution -------------------------------------------------------------

function pick(candidates: Array<string | null | undefined>, envVar?: string): string | null {
  if (envVar) {
    const fromEnv = process.env[envVar];
    if (fromEnv && fs.existsSync(fromEnv)) return fromEnv;
  }
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export interface ResolvedPaths {
  catalogPath: string;
  catalogDir: string;
  rulesPath: string;
  templatesDir: string;
  packagedAssetsDir: string;
  sourceRoot: string;
  monorepoRoot: string | null;
  /** True when the catalog being used is the copy shipped inside the package. */
  catalogIsPackaged: boolean;
}

export function resolvePaths(opts: { catalog?: string; sourceRoot?: string } = {}): ResolvedPaths {
  const catalogPath = pick(
    [opts.catalog, CANONICAL_CATALOG, PACKAGED_CATALOG],
    'MELODIESPARK_CATALOG'
  );
  const rulesPath = pick([CANONICAL_RULES, PACKAGED_RULES], 'MELODIESPARK_RULES');
  const templatesDir = pick([CANONICAL_TEMPLATES, PACKAGED_TEMPLATES], 'MELODIESPARK_TEMPLATES');
  const sourceRoot = opts.sourceRoot ?? process.env.MELODIESPARK_SOURCE ?? DEFAULT_SOURCE_ROOT;

  return {
    catalogPath: catalogPath ?? CANONICAL_CATALOG,
    catalogDir: catalogPath ? path.dirname(catalogPath) : CANONICAL_CATALOG_DIR,
    rulesPath: rulesPath ?? CANONICAL_RULES,
    templatesDir: templatesDir ?? PACKAGED_TEMPLATES,
    packagedAssetsDir: PACKAGED_ASSETS,
    sourceRoot,
    monorepoRoot: MONOREPO_ROOT,
    catalogIsPackaged: !!catalogPath && path.resolve(catalogPath) === path.resolve(PACKAGED_CATALOG),
  };
}

/** Audit log location for extract operations, relative to a destination. */
export function auditLogPath(baseDir: string): string {
  return path.join(baseDir, 'extract-audit.jsonl');
}
