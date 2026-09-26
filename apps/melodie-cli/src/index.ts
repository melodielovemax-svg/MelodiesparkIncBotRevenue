#!/usr/bin/env node
/**
 * @melodiespark/cli - cross-platform content catalog and template CLI.
 *
 * One catalog, two frontends. The Python package in `python/melodiespark-cli`
 * is a thin compatibility frontend over the same catalog and templates, so the
 * two implementations cannot disagree about extraction policy.
 *
 * Command surface (identical in both frontends):
 *   catalog   build / summarize the content catalog
 *   inspect   query catalog metadata (never prints file contents)
 *   extract   copy content, deny-by-default, with an audit trail
 *   template  list and describe scaffolding templates
 *   init      scaffold a project from a template
 *   verify    prove catalog integrity and scan for secret leakage
 *   status    report real capability state per TRUTH_PROTOCOL.md
 */

import { parseArgs, shiftCommand } from './args.ts';
import { ClassificationError } from './classifier.ts';
import { CatalogError } from './store.ts';
import { fail, heading, line, style } from './output.ts';
import { runCatalog, NAME, VERSION } from './commands/catalog.ts';
import { runInspect } from './commands/inspect.ts';
import { runExtract } from './commands/extract.ts';
import { runTemplate } from './commands/template.ts';
import { runInit } from './commands/init.ts';
import { runVerify } from './commands/verify.ts';
import { runStatus } from './commands/status.ts';

const COMMANDS: Record<string, (args: ReturnType<typeof parseArgs>) => void> = {
  catalog: runCatalog,
  inspect: runInspect,
  extract: runExtract,
  template: runTemplate,
  init: runInit,
  verify: runVerify,
  status: runStatus,
};

function help(): void {
  heading(`${NAME} ${VERSION}`);
  line('  Content catalog and template CLI for the Melodiespark source tree.');
  line();
  line('  Usage: melodie <command> [options]');
  line();
  line('  Commands');
  line('    catalog                 Summarize the catalog');
  line('      --build               Rebuild from the source tree (hashes every file)');
  line('      --source <dir>        Source root (default: C:/melodie/Melodiespark_Source)');
  line('      --out <dir>           Output directory for the catalog artifacts');
  line('      --repos               Repository provenance table');
  line('      --category <name>     List files in one category');
  line('    inspect <path...>       Show metadata for catalog entries');
  line('      --repo <name>         Filter by repository');
  line('      --category <name>     Filter by category');
  line('      --flag <name>         Filter by classification flag');
  line('      --limit <n>           Max rows (default 50)   --json   Machine output');
  line('    extract <path...>       Copy content. DENY BY DEFAULT');
  line('      --out <dir>           Destination (default ./SOURCE)');
  line('      --dry-run             Decide and audit, write nothing');
  line('      --i-have-authorization  Allow SENSITIVE / excluded categories');
  line('                            (SECRET stays permanently denied)');
  line('    template [name]         List or describe templates');
  line('      list                  List all templates (same as no argument)');
  line('      show <name>           Describe one template (same as: template <name>)');
  line("      --files               List a template's files            --json");
  line('    init <dir>              Scaffold a project');
  line('      --template <name>     Template to use    --force  Allow non-empty dir');
  line('      --i-understand-this-signs-transactions');
  line('                            Include Web3 signing/broadcast code (off by default)');
  line('    verify                  Catalog integrity + secret-leak scan');
  line('      --deep                Re-hash every source file and compare');
  line('    status                  Capability status per TRUTH_PROTOCOL.md');
  line();
  line('  Environment');
  line('    MELODIESPARK_CATALOG    Path to a catalog file');
  line('    MELODIESPARK_RULES      Path to classification rules');
  line('    MELODIESPARK_TEMPLATES  Path to the templates directory');
  line('    MELODIESPARK_SOURCE     Source root override');
  line('    MELODIESPARK_ACTOR      Actor recorded in the audit log');
  line();
  line(style.dim('  The catalog records that a file exists. It does not expose its contents.'));
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const command = args.positionals[0];

  // Version is checked BEFORE the help branch. `--version` parses to a flag
  // with no positional command, so checking help first made `melodie
  // --version` print the help text instead of the version.
  if (
    command === 'version' ||
    command === '--version' ||
    args.flags.has('version') ||
    args.flags.has('v')
  ) {
    line(VERSION);
    return;
  }

  if (!command || command === 'help' || args.flags.has('help') || args.flags.has('h')) {
    help();
    return;
  }

  const handler = COMMANDS[command];
  if (!handler) {
    fail(`Unknown command: ${command}`);
    line(style.dim('Run `melodie help` for the command list.'));
    process.exitCode = 1;
    return;
  }

  try {
    handler(shiftCommand(args));
  } catch (error) {
    if (error instanceof CatalogError || error instanceof ClassificationError) {
      fail(error.message);
      process.exitCode = 1;
      return;
    }
    fail(`Unexpected error: ${(error as Error).message}`);
    if (process.env.MELODIESPARK_DEBUG) {
      process.stderr.write(`${(error as Error).stack ?? ''}\n`);
    }
    process.exitCode = 1;
  }
}

main();
