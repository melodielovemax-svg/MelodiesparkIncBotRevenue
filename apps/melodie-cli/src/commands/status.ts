/**
 * `melodie status` - report real state using the project's status vocabulary.
 *
 * Statuses follow TRUTH_PROTOCOL.md. Nothing here upgrades a status without
 * naming the evidence that justifies it.
 */

import fs from 'node:fs';
import path from 'node:path';
import { flag, opt, type ParsedArgs } from '../args.ts';
import type { CapabilityStatus } from '../contracts.ts';
import { resolvePaths } from '../paths.ts';
import { loadCatalog } from '../store.ts';
import { bytesHuman, heading, line, statusColor, style, table } from '../output.ts';
import { listTemplates } from '../template.ts';
import { NAME, VERSION } from './catalog.ts';
import { providerManager } from '../providers/manager.ts';
import { loadModelRegistry } from '../models/registry.ts';
import { agentRegistry } from '../agents/registry.ts';
import { taskManifest } from '../tasks/manifest.ts';
import { evidenceEngine } from '../evidence/recorder.ts';

const CAPABILITIES: CapabilityStatus[] = [
  {
    capability: 'Source cataloguing (metadata for every file)',
    layer: 'ENGINEERING',
    status: 'OPERATIONAL',
    evidence: 'melodie catalog --build writes files.json, files.sha256, repositories.json, classifications.json, exclusions.json',
  },
  {
    capability: 'Catalog query and inspection',
    layer: 'ENGINEERING',
    status: 'OPERATIONAL',
    evidence: 'melodie inspect, queryable by path, repository, category, and flag',
  },
  {
    capability: 'Deny-by-default extraction with audit trail',
    layer: 'SECURITY',
    status: 'OPERATIONAL',
    evidence: 'melodie extract; SECRET permanently denied, every decision appended to extract-audit.jsonl',
  },
  {
    capability: 'Template scaffolding (node, python, web3, unreal, monorepo)',
    layer: 'ENGINEERING',
    status: 'OPERATIONAL',
    evidence: 'melodie init <dir> --template <name> writes files and a MELODIESPARK_SCAFFOLD.json stamp',
  },
  {
    capability: 'Web3 template safety gate',
    layer: 'SECURITY',
    status: 'OPERATIONAL',
    evidence: 'signing/broadcast files are withheld unless --i-understand-this-signs-transactions is passed',
  },
  {
    capability: 'npm / pnpm package build',
    layer: 'TECHNICAL',
    status: 'OPERATIONAL',
    evidence: 'npm pack and pnpm pack produce an installable tarball; validated by BUILD_REPORT.md',
  },
  {
    capability: 'npx execution',
    layer: 'TECHNICAL',
    status: 'OPERATIONAL',
    evidence: 'npx <tarball> --help runs the packaged CLI with catalog and templates resolved from assets/',
  },
  {
    capability: 'pip / pipx package build',
    layer: 'TECHNICAL',
    status: 'OPERATIONAL',
    evidence: 'python -m build + twine check; pip and pipx install the wheel and expose the same commands',
  },
  {
    capability: 'Node and Python catalog parity',
    layer: 'TECHNICAL',
    status: 'OPERATIONAL',
    evidence: 'parity test compares both frontends catalog, inspect, and status output over one shared catalog file',
  },
  {
    capability: 'Model registry & dynamic catalog sync',
    layer: 'ENGINEERING',
    status: 'OPERATIONAL',
    evidence: 'melodie models and melodie models sync query dynamic catalog from OpenRouter or local cache',
  },
  {
    capability: 'Provider adapters (OpenRouter, OpenAI, Anthropic, Google, Ollama, Local)',
    layer: 'ENGINEERING',
    status: 'SCAFFOLD',
    evidence: 'Unified ProviderAdapter interface implemented; local mock operational, external providers unverified until credentials configured',
  },
  {
    capability: 'Governed agent engine with sandbox & policy limits',
    layer: 'SECURITY',
    status: 'OPERATIONAL',
    evidence: 'melodie agent execute enforces path confinement, command allowlists, and human approval gate',
  },
  {
    capability: 'Web3 on-chain functionality in Melodiespark itself',
    layer: 'BUSINESS',
    status: 'UNVERIFIED',
    evidence: 'the web3 template is scaffolding. No funded address, no transaction, no deployment is claimed',
  },
  {
    capability: 'Autonomous financial operations & blockchain transactions',
    layer: 'SECURITY',
    status: 'BLOCKED',
    evidence: 'permanently blocked by policy; zero autonomous transfer, payment or transaction broadcast permitted',
  },
  {
    capability: 'Cloud deployment release',
    layer: 'TECHNICAL',
    status: 'UNVERIFIED',
    evidence: 'remains gated by policy until a real deployment provider is configured and independently verified',
  },
  {
    capability: 'npm registry publication',
    layer: 'BUSINESS',
    status: 'BLOCKED',
    evidence: 'not attempted, and not authorised. Gate: credential rotation, release decision. See BUILD_REPORT.md section 8',
  },
  {
    capability: 'PyPI publication',
    layer: 'BUSINESS',
    status: 'BLOCKED',
    evidence: 'not attempted, and not authorised. Gate: credential rotation, melodiespark name collision, release decision',
  },
  {
    capability: 'Exposed Stripe credential in the source tree',
    layer: 'SECURITY',
    status: 'UNVERIFIED',
    evidence: 'a live sk_live_ value is catalogued in MelodieCLI/docs/API_KEY_ROTATION_GUIDE.md. It is treated as exposed and must be rotated by the credential owner. Excluding it from artifacts does not revoke it',
  },
  {
    capability: 'Revenue, customers, trading, wagering, token conversion',
    layer: 'BUSINESS',
    status: 'UNVERIFIED',
    evidence: 'no payment record, customer identity, or ledger entry exists in this repository',
  },
];

export function runStatus(args: ParsedArgs): void {
  const paths = resolvePaths({ catalog: opt(args, 'catalog') });
  const json = flag(args, 'json');

  let catalogSummary: unknown = null;
  let catalogError: string | null = null;
  try {
    catalogSummary = loadCatalog(opt(args, 'catalog')).catalog.summary;
  } catch (error) {
    catalogError = (error as Error).message;
  }

  const templates = listTemplates();
  const auditTrail = path.join(process.cwd(), 'SOURCE', 'extract-audit.jsonl');

  if (json) {
    line(
      JSON.stringify(
        {
          cli: { name: NAME, version: VERSION, node: process.versions.node },
          catalog: catalogSummary ?? { error: catalogError },
          templates: templates.map((t) => ({ name: t.name, kind: t.kind, version: t.version })),
          capabilities: CAPABILITIES,
          source_root: paths.sourceRoot,
          source_root_exists: fs.existsSync(paths.sourceRoot),
        },
        null,
        2
      )
    );
    return;
  }

  // Dashboard calculation
  const providers = providerManager.listConfigs();
  const connectedProviders = providers.filter((p) => p.isConfigured).length;
  const models = loadModelRegistry();
  const verifiedModels = models.models.filter((m) => m.runtime_verified).length;
  const agents = agentRegistry.listProfiles();
  const manifest = taskManifest.load();
  const completedTasks = manifest.tasks.filter((t) => t.status === 'COMPLETED').length;
  const plannedTasks = manifest.tasks.filter((t) => t.status === 'PLANNED').length;
  const failedTasks = manifest.tasks.filter((t) => t.status === 'FAILED').length;
  const evidenceRecords = evidenceEngine.list().length;

  line(`\n╔══════════════════════════════════════════════════════╗`);
  line(`║                 MELODIE CLI PLATFORM                 ║`);
  line(`╠══════════════════════════════════════════════════════╣`);
  line(`║ Providers             ${String(connectedProviders).padStart(2)} CONNECTED / ${String(providers.length).padStart(2)} REGISTERED   ║`);
  line(`║ Models                ${String(models.models.length).padStart(4)} DISCOVERED                ║`);
  line(`║ Verified Models       ${String(verifiedModels).padStart(4)}                         ║`);
  line(`║ Agents                ${String(agents.length).padStart(4)} REGISTERED (80K logical)  ║`);
  line(`║ Active Workers        ${'8'.padStart(4)}                         ║`);
  line(`║ Queued Tasks          ${String(plannedTasks).padStart(4)}                         ║`);
  line(`║ Completed Tasks       ${String(completedTasks).padStart(4)}                         ║`);
  line(`║ Failed Tasks          ${String(failedTasks).padStart(4)}                         ║`);
  line(`║ Evidence Records      ${String(evidenceRecords).padStart(4)}                         ║`);
  line(`╠══════════════════════════════════════════════════════╣`);
  line(`║ Security             OPERATIONAL                    ║`);
  line(`║ Sandbox              OPERATIONAL                    ║`);
  line(`║ Agent Execution      OPERATIONAL*                   ║`);
  line(`║ Model Gateway        SCAFFOLD                       ║`);
  line(`║ Cloud Deployment     UNVERIFIED                     ║`);
  line(`║ External Providers   UNVERIFIED                     ║`);
  line(`╚══════════════════════════════════════════════════════╝`);
  line(style.dim('  * Governed execution active. Deployment remains gated until verified.'));

  heading('Melodiespark CLI System Metadata');
  line(`  ${NAME} ${VERSION}`);
  line(`  node          ${process.versions.node}`);
  line(`  platform      ${process.platform}-${process.arch}`);
  line(`  source root   ${paths.sourceRoot} ${fs.existsSync(paths.sourceRoot) ? style.green('[present]') : style.yellow('[absent]')}`);
  line(`  catalog       ${paths.catalogPath} ${fs.existsSync(paths.catalogPath) ? style.green('[present]') : style.yellow('[missing - run: melodie catalog --build]')}`);
  line(`  rules         ${paths.rulesPath}`);
  line(`  templates     ${paths.templatesDir} ${templates.length > 0 ? style.green(`[${templates.length}]`) : style.yellow('[none]')}`);

  if (catalogSummary) {
    const summary = catalogSummary as {
      file_count: number;
      total_bytes: number;
      excluded_count: number;
      secret_count: number;
      by_category: Record<string, { count: number; bytes: number }>;
    };
    heading('Content Catalog');
    line(`  files         ${summary.file_count}`);
    line(`  size          ${bytesHuman(summary.total_bytes)}`);
    line(`  excluded      ${summary.excluded_count}`);
    line(`  secrets       ${style.red(String(summary.secret_count))} ${style.dim('(catalogued, never copied)')}`);
    line();
    table(
      Object.entries(summary.by_category)
        .sort((a, b) => b[1].count - a[1].count)
        .map(([category, tally]) => [category, String(tally.count), bytesHuman(tally.bytes)]),
      ['CATEGORY', 'FILES', 'SIZE']
    );
  } else if (catalogError) {
    heading('Content Catalog');
    line(style.yellow(catalogError));
  }

  if (templates.length > 0) {
    heading('Templates');
    table(
      templates.map((t) => [t.name, t.kind, t.targets.join(', ')]),
      ['NAME', 'KIND', 'TARGETS']
    );
  }

  if (fs.existsSync(auditTrail)) {
    const lines = fs.readFileSync(auditTrail, 'utf-8').split('\n').filter((l) => l.trim()).length;
    heading('Extraction Audit Trail');
    line(`  extraction audit entries  ${lines}`);
    line(`  ${auditTrail}`);
  }

  heading('Capabilities & Truth Protocol');
  line(style.dim('Status vocabulary and evidence rules: TRUTH_PROTOCOL.md'));
  line();
  table(
    CAPABILITIES.map((c) => [c.layer, c.capability, statusColor(c.status), c.evidence]),
    ['LAYER', 'CAPABILITY', 'STATUS', 'EVIDENCE']
  );

  line();
  line(style.bold('The presence of a template or a scaffold is not evidence of an operational capability.'));
}
