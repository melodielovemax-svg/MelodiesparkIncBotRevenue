/**
 * Melodie CLI Agent Platform - Deployment Command.
 *
 * Implements:
 *   melodie deployment plan
 *   melodie deployment verify
 *   melodie deployment release
 *
 * Enforces TRUTH_PROTOCOL.md: Cloud deployment remains gated/blocked until
 * independently verified and explicitly authorized.
 */

import type { parseArgs } from '../args.ts';
import { heading, line, table, style, fail } from '../output.ts';
import { deploymentGate } from '../deployment/gate.ts';

export async function runDeployment(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const sub = args.positionals[0];
  const env = args.options.get('env') || 'production';

  // 1. melodie deployment release
  if (sub === 'release') {
    heading(`Deployment Release Request: ${env}`);
    const approval = args.flags.has('i-approve-deployment');
    const res = deploymentGate.release(env, approval);

    if (jsonMode) {
      line(JSON.stringify(res, null, 2));
      return;
    }

    if (res.ok) {
      line(style.green(`Release succeeded: ${res.message}`));
    } else {
      line(style.red(`RELEASE REJECTED: ${res.message}`));
      line(style.dim('Per governance rules, deployment cannot release without a verified cloud provider.'));
      process.exitCode = 1;
    }
    return;
  }

  // 2. melodie deployment verify
  if (sub === 'verify') {
    heading(`Verifying Deployment Readiness: ${env}`);
    const plan = deploymentGate.evaluatePlan(env);

    if (jsonMode) {
      line(JSON.stringify(plan, null, 2));
      return;
    }

    const rows = plan.checks.map((c) => [
      c.id,
      c.name,
      c.passed ? style.green('PASS') : style.red('BLOCKED'),
      c.message,
    ]);
    table(rows, ['Gate ID', 'Check', 'Status', 'Details']);
    line();

    if (!plan.allowedToRelease) {
      line(style.yellow(`Deployment Status: GATED (${plan.blockReason})`));
    }
    return;
  }

  // 3. Default: melodie deployment plan
  heading(`Deployment Plan Evaluation: ${env}`);
  const plan = deploymentGate.evaluatePlan(env);

  if (jsonMode) {
    line(JSON.stringify(plan, null, 2));
    return;
  }

  const rows = plan.checks.map((c) => [
    c.id,
    c.name,
    c.status === 'OPERATIONAL' ? style.green(c.status) : style.yellow(c.status),
    c.message,
  ]);
  table(rows, ['Gate ID', 'Check', 'Status', 'Details']);
  line();
  line(style.dim('Autonomous deployment is permanently disabled. Human approval required.'));
}
