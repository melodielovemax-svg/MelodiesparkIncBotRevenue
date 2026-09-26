#!/usr/bin/env node
/**
 * @melodiespark/cli - Melodie CLI Coding-Agent Platform & Catalog CLI.
 *
 * Governed execution platform with evidence-first status tracking:
 *   CATALOG ENTRY != CONNECTED PROVIDER != SUCCESSFUL INFERENCE != PRODUCTION READY
 *
 * Command Surface:
 *   System & Diagnostics:
 *     doctor       check runtime, sandbox boundaries, and provider configurations
 *     status       report capability and platform dashboard per TRUTH_PROTOCOL.md
 *     verify       prove catalog integrity, policy rules, and secret scans
 *     audit        query immutable audit event logs
 *
 *   Models & Providers:
 *     models       list, sync, search, inspect, or test AI models
 *     provider     list, add, verify, or remove model gateway adapters
 *
 *   Project Engine (Builder Studio):
 *     project      create, inspect, analyze, plan, build, test, and package projects
 *
 *   Coding-Agent Engine:
 *     agent        list, plan, code, review, test, security, or execute governed agent tasks
 *
 *   Workflows & Orchestration:
 *     workflow     orchestrate Quantum Fractal Matrix (ALPHA->BETA->THETA->DELTA->BRAVO->GAMMA->OMEGA)
 *
 *   Evidence & Sandbox:
 *     evidence     inspect and cryptographically verify execution records
 *     sandbox      inspect and reset sandbox execution boundaries
 *     deployment   plan, verify, and release deployment gates (gated by default)
 *
 *   Catalog & Scaffolding (Legacy Compatibility):
 *     catalog      build / summarize the content catalog
 *     inspect      query catalog metadata (never prints file contents)
 *     extract      copy content, deny-by-default, with an audit trail
 *     template     list and describe scaffolding templates
 *     init         scaffold a project from a template or agent blueprint
 */

import { parseArgs, shiftCommand } from './args.ts';
import { ClassificationError } from './classifier.ts';
import { CatalogError } from './store.ts';
import { SandboxError, PolicyViolationError } from './sandbox/sandbox.ts';
import { fail, heading, line, style } from './output.ts';

import { runCatalog, NAME, VERSION } from './commands/catalog.ts';
import { runInspect } from './commands/inspect.ts';
import { runExtract } from './commands/extract.ts';
import { runTemplate } from './commands/template.ts';
import { runInit } from './commands/init.ts';
import { runVerify } from './commands/verify.ts';
import { runStatus } from './commands/status.ts';
import { runDoctor } from './commands/doctor.ts';
import { runModels } from './commands/models.ts';
import { runProvider } from './commands/provider.ts';
import { runProject } from './commands/project.ts';
import { runAgent } from './commands/agent.ts';
import { runWorkflow } from './commands/workflow.ts';
import { runEvidence } from './commands/evidence.ts';
import { runSandbox } from './commands/sandbox.ts';
import { runDeployment } from './commands/deployment.ts';
import { runAudit } from './commands/audit.ts';
import { runWeb3 } from './commands/web3.ts';
import { runIde } from './commands/ide.ts';

const COMMANDS: Record<string, (args: ReturnType<typeof parseArgs>) => void | Promise<void>> = {
  // Catalog & Scaffolding
  catalog: runCatalog,
  inspect: runInspect,
  extract: runExtract,
  template: runTemplate,
  init: runInit,
  verify: runVerify,
  status: runStatus,

  // Platform Diagnostics & Audit
  doctor: runDoctor,
  audit: runAudit,

  // Models & Providers
  models: runModels,
  provider: runProvider,

  // Builder Studio & Agents
  project: runProject,
  agent: runAgent,

  // Workflows & Matrix
  workflow: runWorkflow,

  // Evidence, Sandbox & Deployment
  evidence: runEvidence,
  sandbox: runSandbox,
  deployment: runDeployment,

  // Web3 & Crypto (NEW V9.34.32999)
  web3: runWeb3,

  // IDE & Development (NEW V9.34.32999)
  ide: runIde,
};

function help(): void {
  heading(`${NAME} ${VERSION} - Melodie CLI V9.34.32999`);
  line('  Unified MelodieMetamelo-DS Ultimate CLI with Web3, IDE orchestration, and coding-agent platform.');
  line();
  line('  Usage: melodie <command> [subcommand] [options]');
  line();
  line('  Platform Commands');
  line('    doctor                  Verify runtime, environment, sandbox, and provider health');
  line('    status                  Display platform dashboard and capability status matrix');
  line('    verify                  Catalog integrity, secret scanning, and security tests');
  line('    audit [query]           Inspect tamper-evident audit event trail');
  line();
  line('  Models & Providers');
  line('    models [list]           List models in registry');
  line('    models sync             Sync dynamic model catalog from OpenRouter API');
  line('    models search <query>   Search model registry by capability, provider, or name');
  line('    models inspect <model>  Show metadata, context window, and pricing');
  line('    models test <model>     Run live inference test probe');
  line('    provider list           List configured model gateway adapters');
  line('    provider verify <name>  Test provider connectivity and health');
  line('    provider add <name>     Register custom model provider');
  line('    provider remove <name>  Unregister model provider');
  line();
  line('  Project Engine (Builder Studio)');
  line('    project create <name>   Initialize a new project scaffold');
  line('    project inspect [dir]   Inspect repository structure');
  line('    project analyze [dir]   Deep repository analysis (languages, tests, security)');
  line('    project plan [dir]      Synthesize architecture proposal & task roadmap');
  line('    project build [dir]     Build project artifacts via sandbox');
  line('    project test [dir]      Execute project test suite');
  line('    project package [dir]   Package project for distribution');
  line();
  line('  Coding-Agent Engine');
  line('    agent list              List registered agent profiles (80,000 logical capacity)');
  line('    agent create <name>     Create custom agent profile');
  line('    agent plan <task>       Decompose a task into architectural steps');
  line('    agent code <task>       Synthesize code patch proposal');
  line('    agent review <target>   Review patch or file for security and style');
  line('    agent test              Execute test suite in sandbox');
  line('    agent security          Inspect sandbox boundaries and active policies');
  line('    agent execute <task_id> Governed agent execution (--i-approve-execution required)');
  line();
  line('  Workflows & Orchestration');
  line('    workflow run <task>     Execute Quantum Fractal Matrix (7-Node Pipeline)');
  line('    workflow history        Inspect past workflow execution traces');
  line('    workflow create/pause/resume/cancel');
  line();
  line('  Web3 & Crypto (NEW V9.34.32999)');
  line('    web3 connect           Connect to Web3 wallet (read-only)');
  line('    web3 status            Show wallet status and balance');
  line('    web3 intent <addr>     Create transaction intent (no execution)');
  line('    web3 sign <msg>         Sign message (requires explicit consent)');
  line('    web3 config             Configure Web3 settings');
  line();
  line('  IDE & Development (NEW V9.34.32999)');
  line('    ide launch [name]       Launch IDE (default: antigravity)');
  line('    ide status              Show IDE status and configurations');
  line('    ide config              Configure IDE settings');
  line('    ide open <path>         Open project in IDE');
  line('    ide template <type>     Create IDE-specific project');
  line();
  line('  Evidence & Sandbox');
  line('    evidence list           List cryptographic evidence records');
  line('    evidence verify <id>    Verify SHA-256 integrity of evidence record');
  line('    evidence export         Export evidence registry as JSON');
  line('    sandbox inspect         Inspect sandbox confinement and limits');
  line('    sandbox permissions     Display active permissions');
  line('    sandbox reset           Reset sandbox execution workspace');
  line();
  line('  Deployment Gates');
  line('    deployment plan         Evaluate deployment readiness and gating checks');
  line('    deployment verify       Verify target cloud provider environment');
  line('    deployment release      Attempt release (gated by default; requires approval)');
  line();
  line('  Content Catalog (Legacy)');
  line('    catalog                 Summarize catalog (--build to re-hash tree)');
  line('    inspect <path...>       Show catalog metadata (never prints file contents)');
  line('    extract <path...>       Copy content. DENY BY DEFAULT');
  line('    template [name]         List or describe templates');
  line('    init <dir>              Scaffold a project from template');
  line();
  line(style.dim('  Governance rule: Catalog entry != Connected provider != Live inference != Production ready.'));
  line(style.dim('  Web3 operations are read-only by default. Transaction signing requires explicit consent.'));
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);
  const command = args.positionals[0];

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
    await handler(shiftCommand(args));
  } catch (error) {
    if (
      error instanceof CatalogError ||
      error instanceof ClassificationError ||
      error instanceof SandboxError ||
      error instanceof PolicyViolationError
    ) {
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
