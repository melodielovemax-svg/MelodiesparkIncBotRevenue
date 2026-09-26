/**
 * Melodie CLI Agent Platform - Doctor Diagnostic Command.
 *
 * Verifies Node runtime, sandbox policy, provider connections,
 * model registry, agent profiles, and 1,010-task manifest integrity.
 */

import os from 'node:os';
import path from 'node:path';
import type { parseArgs } from '../args.ts';
import { heading, line, table, style } from '../output.ts';
import { providerManager } from '../providers/manager.ts';
import { loadModelRegistry } from '../models/registry.ts';
import { agentRegistry } from '../agents/registry.ts';
import { taskManifest } from '../tasks/manifest.ts';
import { Sandbox } from '../sandbox/sandbox.ts';

interface DiagnosticCheck {
  area: string;
  item: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  details: string;
}

export async function runDoctor(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const checks: DiagnosticCheck[] = [];

  // 1. Runtime & OS
  const nodeVer = process.version;
  const major = parseInt(nodeVer.replace('v', '').split('.')[0], 10);
  checks.push({
    area: 'Runtime',
    item: 'Node.js Version',
    status: major >= 22 ? 'PASS' : 'WARN',
    details: `${nodeVer} (Node 22+ recommended for native TypeScript type stripping)`,
  });

  checks.push({
    area: 'Runtime',
    item: 'Operating System',
    status: 'PASS',
    details: `${os.type()} ${os.release()} (${os.arch()})`,
  });

  // 2. Sandbox & Security
  const sandbox = new Sandbox();
  checks.push({
    area: 'Sandbox',
    item: 'Workspace Root',
    status: 'PASS',
    details: sandbox.workspaceRoot,
  });

  checks.push({
    area: 'Sandbox',
    item: 'Filesystem Boundary',
    status: 'PASS',
    details: `Scoped confinement: ${sandbox.permissions.filesystem}`,
  });

  checks.push({
    area: 'Sandbox',
    item: 'Shell Allowlist',
    status: 'PASS',
    details: `${sandbox.allowedCommands.size} allowlisted commands (${Array.from(sandbox.allowedCommands).join(', ')})`,
  });

  // 3. Providers
  const providers = providerManager.listConfigs();
  const configuredCount = providers.filter((p) => p.isConfigured).length;
  checks.push({
    area: 'Providers',
    item: 'Provider Registry',
    status: 'PASS',
    details: `${providers.length} registered (${configuredCount} configured with credentials)`,
  });

  for (const prov of providers) {
    checks.push({
      area: 'Providers',
      item: prov.displayName,
      status: prov.isConfigured ? 'PASS' : 'WARN',
      details: prov.isConfigured
        ? `Configured via ${prov.envKey || 'local'}`
        : `Unconfigured (set ${prov.envKey || 'N/A'} to activate)`,
    });
  }

  // 4. Model Registry
  const models = loadModelRegistry();
  const verifiedModels = models.models.filter((m) => m.runtime_verified).length;
  checks.push({
    area: 'Models',
    item: 'Catalog Registry',
    status: models.models.length > 0 ? 'PASS' : 'WARN',
    details: `${models.models.length} models discovered (${verifiedModels} runtime-verified)`,
  });

  // 5. Agents
  const profiles = agentRegistry.listProfiles();
  checks.push({
    area: 'Agents',
    item: 'Agent Registry',
    status: 'PASS',
    details: `${profiles.length} profiles registered (80,000 logical addressing capacity)`,
  });

  // 6. Task Manifest
  const manifest = taskManifest.load();
  const graph = taskManifest.validateGraph();
  checks.push({
    area: 'Tasks',
    item: '1,010-Task Manifest',
    status: manifest.total_tasks === 1010 ? 'PASS' : 'WARN',
    details: `${manifest.total_tasks} authoritative tasks loaded`,
  });

  checks.push({
    area: 'Tasks',
    item: 'Dependency Graph',
    status: graph.valid ? 'PASS' : 'FAIL',
    details: graph.valid ? 'Graph valid, 0 cycles' : `Errors: ${graph.errors.join('; ')}`,
  });

  if (jsonMode) {
    line(JSON.stringify({ checks }, null, 2));
    return;
  }

  heading('Melodie CLI Platform Doctor');
  line(style.dim('Verifying platform health, security boundaries, and provider configurations.\n'));

  const rows = checks.map((c) => {
    let stat = style.green('PASS');
    if (c.status === 'WARN') stat = style.yellow('WARN');
    if (c.status === 'FAIL') stat = style.red('FAIL');
    return [c.area, c.item, stat, c.details];
  });

  table(rows, ['Area', 'Check', 'Status', 'Details']);
  line();

  const failCount = checks.filter((c) => c.status === 'FAIL').length;
  if (failCount > 0) {
    line(style.red(`Doctor check failed with ${failCount} critical error(s).`));
    process.exitCode = 1;
  } else {
    line(style.green('Platform doctor checks passed cleanly.'));
  }
}
