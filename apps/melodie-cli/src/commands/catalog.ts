/** `melodie catalog` - build, refresh, and summarize the content catalog. */

import fs from 'node:fs';
import path from 'node:path';
import { flag, opt, type ParsedArgs } from '../args.ts';
import { buildCatalog } from '../catalog.ts';
import { Classifier, loadRules } from '../classifier.ts';
import { emitCatalog, syncPackagedAssets } from '../emit.ts';
import { resolvePaths } from '../paths.ts';
import { loadCatalog, type LoadedCatalog } from '../store.ts';
import { bytesHuman, heading, line, style, table } from '../output.ts';

export const VERSION = '0.1.0';
export const NAME = '@melodiespark/cli';

function printSummary(loaded: LoadedCatalog): void {
  const { catalog } = loaded;
  heading('Content catalog');
  line(`  source        ${catalog.source_root}`);
  line(`  generated     ${catalog.generated_at}`);
  line(`  generator     ${catalog.generator.name} ${catalog.generator.version} (node ${catalog.generator.node}, ${catalog.generator.platform})`);
  line(`  build time    ${(catalog.generator.elapsed_ms / 1000).toFixed(1)}s`);
  line(`  files         ${catalog.summary.file_count}`);
  line(`  total size    ${bytesHuman(catalog.summary.total_bytes)}`);
  line(`  extractable   ${catalog.summary.file_count - catalog.summary.excluded_count}`);
  line(`  excluded      ${style.yellow(String(catalog.summary.excluded_count))}`);
  line(`  secrets found ${style.red(String(catalog.summary.secret_count))} ${style.dim('(metadata only, never copied)')}`);

  heading('By category');
  const rows = Object.entries(catalog.summary.by_category)
    .sort((a, b) => b[1].count - a[1].count)
    .map(([category, tally]) => [category, String(tally.count), bytesHuman(tally.bytes)]);
  table(rows, ['CATEGORY', 'FILES', 'SIZE']);
}

function printRepositories(loaded: LoadedCatalog): void {
  heading('Repositories');
  const rows = loaded.catalog.repositories.map((repo) => [
    repo.name,
    String(repo.catalogued_count),
    repo.declared_file_count === null ? '-' : String(repo.declared_file_count),
    repo.branch ?? '-',
    (repo.commit ?? '-').slice(0, 8),
    bytesHuman(repo.bytes),
  ]);
  table(rows, ['REPOSITORY', 'CATALOGUED', 'DECLARED', 'BRANCH', 'COMMIT', 'SIZE']);
  line();
  line(style.dim('Declared counts come from SOURCE_INVENTORY.json and may predate later local additions.'));
}

function printCategory(loaded: LoadedCatalog, category: string): void {
  const upper = category.toUpperCase();
  const files = loaded.catalog.files.filter((f) => f.category === upper);
  heading(`Category ${upper} (${files.length} files)`);
  const rows = files
    .slice(0, 200)
    .map((f) => [f.path, bytesHuman(f.bytes), f.extractable ? style.green('yes') : style.red('no'), f.rule_id]);
  table(rows, ['PATH', 'SIZE', 'EXTRACTABLE', 'RULE']);
  if (files.length > rows.length) {
    line(style.dim(`... ${files.length - rows.length} more. Use --json for the full list.`));
  }
}

function doBuild(args: ParsedArgs): void {
  const paths = resolvePaths({ sourceRoot: opt(args, 'source') });
  const rules = loadRules(paths.rulesPath);
  const classifier = new Classifier(rules);

  if (!fs.existsSync(paths.sourceRoot)) {
    line(style.red(`Source root does not exist: ${paths.sourceRoot}`));
    line(style.dim('Pass --source <dir> to catalog a different tree.'));
    process.exitCode = 1;
    return;
  }

  heading('Cataloging source tree');
  line(`  root   ${paths.sourceRoot}`);
  line(`  rules  ${paths.rulesPath}`);
  line(style.dim('  hashing every file; this can take a minute on a large tree...'));

  const catalog = buildCatalog(classifier, {
    sourceRoot: paths.sourceRoot,
    generatorName: NAME,
    generatorVersion: VERSION,
  });

  const canonicalDir = opt(args, 'out')
    ? path.resolve(opt(args, 'out') as string)
    : paths.catalogDir;

  const packagedAssetsDir = opt(args, 'assets')
    ? path.resolve(opt(args, 'assets') as string)
    : paths.packagedAssetsDir;

  const result = emitCatalog(catalog, { canonicalDir, packagedAssetsDir });

  // Mirror rules + templates so a global install is self-contained.
  if (paths.monorepoRoot) {
    syncPackagedAssets({
      rulesSource: paths.rulesPath,
      templatesSource: path.join(paths.monorepoRoot, 'templates'),
      packagedAssetsDir,
    });
  }

  heading('Emitted');
  for (const w of result.written) {
    line(`  ${bytesHuman(w.bytes).padStart(9)}  ${w.file}`);
  }
  line();
  printSummary(loadCatalog(path.join(canonicalDir, 'content-catalog.json')));
}

export function runCatalog(args: ParsedArgs): void {
  if (flag(args, 'build') || flag(args, 'rebuild')) {
    doBuild(args);
    return;
  }

  const loaded = loadCatalog(opt(args, 'catalog'));

  if (flag(args, 'repos')) {
    printRepositories(loaded);
    return;
  }
  const category = opt(args, 'category');
  if (category) {
    printCategory(loaded, category);
    return;
  }
  if (flag(args, 'json')) {
    line(JSON.stringify(loaded.catalog.summary, null, 2));
    return;
  }
  printSummary(loaded);
}
