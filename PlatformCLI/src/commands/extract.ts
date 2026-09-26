/**
 * `melodie extract` - copy catalogued content to disk.
 *
 * Policy, enforced here and identical in the Python CLI:
 *   - default is DENY;
 *   - SECRET is permanently denied, even with the authorization flag;
 *   - other non-extractable categories (VCS, ARCHIVE, BINARY, GENERATED,
 *     SENSITIVE) require --i-have-authorization;
 *   - every decision is written to the audit log.
 */

import fs from 'node:fs';
import path from 'node:path';
import { appendAudit, auditActor } from '../audit.ts';
import { flag, opt, type ParsedArgs } from '../args.ts';
import { scanContent } from '../content-guard.ts';
import type { CatalogFileEntry } from '../contracts.ts';
import { auditLogPath } from '../paths.ts';
import { loadRulesFile, matchesQuery, loadCatalog } from '../store.ts';
import { bytesHuman, fail, heading, line, style, table, warn } from '../output.ts';

interface Decision {
  entry: CatalogFileEntry;
  allowed: boolean;
  reason: string;
  contentFindings: Array<{ id: string; severity: string; line: number }>;
}

export function runExtract(args: ParsedArgs): void {
  const loaded = loadCatalog(opt(args, 'catalog'));
  const rules = loadRulesFile();
  const policy = rules.extraction_policy;
  const authorized = flag(args, 'i-have-authorization');
  const dryRun = flag(args, 'dry-run');
  const outDir = path.resolve(opt(args, 'out') ?? path.join(process.cwd(), 'SOURCE'));

  const queries = args.positionals;
  if (queries.length === 0) {
    fail('Specify at least one path, or use --repo/--category to select entries.');
    line(style.dim('Example: melodie extract "src/index.ts" --repo melodiespark-platform --out ./SOURCE'));
    process.exitCode = 1;
    return;
  }

  const selected: CatalogFileEntry[] = [];
  const seen = new Set<string>();
  for (const query of queries) {
    for (const entry of loaded.catalog.files) {
      if (matchesQuery(entry, query) && !seen.has(entry.path)) {
        seen.add(entry.path);
        selected.push(entry);
      }
    }
  }
  if (opt(args, 'repo')) selected.push(...loaded.catalog.files.filter((f) => f.repository.toLowerCase() === (opt(args, 'repo') as string).toLowerCase()));
  if (opt(args, 'category')) selected.push(...loaded.catalog.files.filter((f) => f.category === (opt(args, 'category') as string).toUpperCase()));

  if (selected.length === 0) {
    warn(`No catalog entries matched ${queries.join(', ')}.`);
    return;
  }

  heading('Extraction policy');
  line(`  default            ${policy.default}`);
  line(`  authorization flag ${policy.flag}`);
  line(`  supplied           ${authorized ? style.yellow('yes') : style.green('no')}`);
  line(`  mode               ${dryRun ? style.cyan('DRY RUN - nothing will be written') : 'COPY'}`);
  line(`  destination        ${outDir}`);
  line(`  actor              ${auditActor()}`);

  const decisions: Decision[] = selected.map((entry) => {
    // Checked first and unconditionally: no flag, including
    // --i-have-authorization, may unlock permanently denied content.
    if (entry.permanently_denied || entry.category === 'SECRET') {
      return {
        entry,
        allowed: false,
        reason: 'Permanently denied (SECRET). It is catalogued for provenance and never copied.',
        contentFindings: [],
      };
    }

    // Content scan happens before the category decision, because a credential
    // pasted into a normal source or doc file must be caught regardless of how
    // benign the path looks.
    const sourceAbs = path.join(loaded.paths.sourceRoot, entry.path.split('/').join(path.sep));
    const contentFindings = fs.existsSync(sourceAbs) ? scanContent(sourceAbs, policy) : [];
    if (contentFindings.length > 0) {
      const ids = contentFindings.map((f) => `${f.id}(${f.severity})@L${f.line}`).join(', ');
      if (!authorized) {
        return {
          entry,
          allowed: false,
          reason: `Content scan found likely credential material [${ids}]. Copying requires ${policy.flag}.`,
          contentFindings,
        };
      }
      return {
        entry,
        allowed: true,
        reason: `Authorized despite content findings [${ids}]. Operator accepts the risk.`,
        contentFindings,
      };
    }

    if (entry.sensitive && !authorized) {
      return { entry, allowed: false, reason: `SENSITIVE material requires ${policy.flag}.`, contentFindings };
    }
    if (!entry.extractable && !authorized) {
      return {
        entry,
        allowed: false,
        reason: `Category ${entry.category} is not copyable by default. Requires ${policy.flag}.`,
        contentFindings,
      };
    }
    if (!entry.extractable && authorized) {
      return {
        entry,
        allowed: true,
        reason: `Authorized extraction of ${entry.category} material under operator responsibility.`,
        contentFindings,
      };
    }
    return { entry, allowed: true, reason: 'Category is copyable.', contentFindings };
  });

  const allowed = decisions.filter((d) => d.allowed);
  const denied = decisions.filter((d) => !d.allowed);

  heading('Plan');
  table(
    decisions.slice(0, 60).map((d) => [
      d.entry.path,
      d.entry.category,
      bytesHuman(d.entry.bytes),
      d.allowed ? style.green('COPY') : style.red('DENY'),
    ]),
    ['PATH', 'CATEGORY', 'SIZE', 'DECISION']
  );
  if (decisions.length > 60) line(style.dim(`... ${decisions.length - 60} more rows.`));

  line();
  line(`  copy  ${style.green(String(allowed.length))}`);
  line(`  deny  ${style.red(String(denied.length))}`);

  const logPath = auditLogPath(outDir);
  let written = 0;
  let writtenBytes = 0;

  for (const decision of decisions) {
    const sourceAbs = path.join(loaded.paths.sourceRoot, decision.entry.path.split('/').join(path.sep));
    let copied = false;
    if (decision.allowed && !dryRun && fs.existsSync(sourceAbs)) {
      const targetAbs = path.join(outDir, decision.entry.path.split('/').join(path.sep));
      fs.mkdirSync(path.dirname(targetAbs), { recursive: true });
      fs.copyFileSync(sourceAbs, targetAbs);
      written += 1;
      writtenBytes += decision.entry.bytes;
      copied = true;
    } else if (decision.allowed && !dryRun) {
      decision.reason = `${decision.reason} (source file not present on disk)`;
    }

    appendAudit(logPath, {
      action: decision.allowed ? 'EXTRACT' : 'EXTRACT_DENIED',
      target: decision.entry.path,
      outcome: decision.allowed ? 'ALLOWED' : 'DENIED',
      bytes: copied ? decision.entry.bytes : 0,
      authorization: authorized,
      reason: decision.reason,
      content_signals: decision.contentFindings.map((f) => `${f.id}@L${f.line}`),
      catalog: loaded.paths.catalogPath,
    });
  }

  heading(dryRun ? 'Dry run complete' : 'Extraction complete');
  line(`  files written   ${written}`);
  line(`  bytes written   ${bytesHuman(writtenBytes)}`);
  line(`  denied          ${denied.length}`);
  line(`  audit log       ${logPath}`);
  if (denied.length > 0) {
    line();
    line(style.dim('Denied entries are recorded with their reason in the audit log.'));
  }
  line();
  line(style.bold('Extraction copies files. It does not validate, test, or operate them.'));
}
