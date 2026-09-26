/** `melodie inspect` - query catalog metadata. Never prints file contents. */

import { flag, opt, type ParsedArgs } from '../args.ts';
import type { CatalogFileEntry } from '../contracts.ts';
import { matchesQuery, loadCatalog } from '../store.ts';
import { bytesHuman, heading, line, style, table } from '../output.ts';

function printEntry(entry: CatalogFileEntry, index: number, total: number): void {
  heading(`[${index}/${total}] ${entry.path}`);
  const rows: string[][] = [
    ['category', `${entry.category} ${entry.extractable ? style.green('[extractable]') : style.red('[excluded]')}`],
    ['size', `${entry.bytes} B (${bytesHuman(entry.bytes)})`],
    ['sha256', entry.sha256],
    ['extension', entry.extension || '(none)'],
    ['repository', entry.repository],
    ['module', entry.module ?? '-'],
    ['rule', `${entry.rule_id} - ${entry.reason}`],
    ['flags', entry.flags.length ? entry.flags.join(', ') : '-'],
    [
      'denial',
      entry.extractable
        ? style.green('none')
        : entry.permanently_denied
          ? style.red('PERMANENTLY DENIED - no flag unlocks this')
          : entry.authorization_required
            ? style.yellow('authorization required')
            : style.yellow('denied by default'),
    ],
    ['sensitive', entry.sensitive ? style.red('yes') : 'no'],
    ['generated', entry.generated ? 'yes' : 'no'],
    ['binary', entry.binary ? 'yes' : 'no'],
    ['archive', entry.archive ? 'yes' : 'no'],
    ['vcs metadata', entry.vcs_metadata ? 'yes (provenance only)' : 'no'],
    ['modified', entry.modified_utc ?? '-'],
  ];
  table(rows);
}

export function runInspect(args: ParsedArgs): void {
  const loaded = loadCatalog(opt(args, 'catalog'));
  const queries = args.positionals;
  const repo = opt(args, 'repo');
  const category = opt(args, 'category')?.toUpperCase();
  const flagFilter = opt(args, 'flag');
  const limit = Number(opt(args, 'limit') ?? '50');
  const json = flag(args, 'json');

  let results: CatalogFileEntry[];

  if (queries.length > 0) {
    results = [];
    const seen = new Set<string>();
    for (const query of queries) {
      for (const entry of loaded.catalog.files) {
        if (matchesQuery(entry, query) && !seen.has(entry.path)) {
          seen.add(entry.path);
          results.push(entry);
        }
      }
    }
  } else {
    results = [...loaded.catalog.files];
  }

  if (repo) results = results.filter((f) => f.repository.toLowerCase() === repo.toLowerCase());
  if (category) results = results.filter((f) => f.category === category);
  if (flagFilter) results = results.filter((f) => f.flags.includes(flagFilter));

  if (json) {
    line(JSON.stringify({ count: results.length, files: results }, null, 2));
    return;
  }

  if (results.length === 0) {
    line(style.yellow('No catalog entries matched.'));
    line(style.dim('Try: melodie catalog --category SOURCE   or   melodie inspect wallet'));
    return;
  }

  const shown = results.slice(0, Math.max(1, limit));
  if (queries.length === 0 && !repo && !category && !flagFilter) {
    // Bare `inspect` lists the inventory rather than one-by-one detail.
    heading(`Catalog entries (${results.length})`);
    table(
      shown.map((f) => [f.path, f.category, bytesHuman(f.bytes), f.extractable ? 'yes' : 'no']),
      ['PATH', 'CATEGORY', 'SIZE', 'EXTRACTABLE']
    );
  } else {
    for (let i = 0; i < shown.length; i += 1) printEntry(shown[i], i + 1, shown.length);
  }

  if (results.length > shown.length) {
    line();
    line(style.dim(`${results.length - shown.length} more entries. Raise --limit or use --json.`));
  }
}
