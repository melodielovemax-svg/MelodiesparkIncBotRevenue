/**
 * Melodie CLI Agent Platform - Agent Command Suite.
 *
 * Implements:
 *   melodie agent list
 *   melodie agent create <name>
 *   melodie agent plan <task>
 *   melodie agent code <task>
 *   melodie agent review <target>
 *   melodie agent test
 *   melodie agent security
 *   melodie agent execute <task_id> [--i-approve-execution]
 */

import fs from 'node:fs';
import type { parseArgs } from '../args.ts';
import { heading, line, table, style, fail } from '../output.ts';
import { agentRegistry } from '../agents/registry.ts';
import { AgentEngine } from '../agents/engine.ts';

export async function runAgent(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const sub = args.positionals[0];
  const engine = new AgentEngine();

  // 1. melodie agent plan <task>
  if (sub === 'plan') {
    const taskDesc = args.positionals.slice(1).join(' ');
    if (!taskDesc) {
      fail('Agent plan requires a task description: melodie agent plan <task>');
      process.exitCode = 1;
      return;
    }

    heading('Agent Planning Engine');
    line(style.dim(`Decomposing task: "${taskDesc}"\n`));

    const plan = await engine.planTask(taskDesc);
    if (jsonMode) {
      line(JSON.stringify(plan, null, 2));
      return;
    }

    line(`Task ID: ${style.bold(plan.taskId)}`);
    line(`Summary: ${plan.summary}`);
    line('\nDecomposed Execution Steps:');
    plan.steps.forEach((step, idx) => {
      line(`  ${idx + 1}. ${step}`);
    });
    line(`\nTarget Files Identified: ${plan.filesIdentified.join(', ')}`);
    line(`Verification Requirements: ${plan.testsRequired.join(', ')}`);
    return;
  }

  // 2. melodie agent code <task>
  if (sub === 'code') {
    const taskDesc = args.positionals.slice(1).join(' ');
    if (!taskDesc) {
      fail('Agent code requires a task description: melodie agent code <task>');
      process.exitCode = 1;
      return;
    }

    heading('Agent Code Generation');
    const targetFile = args.options.get('file') || 'src/generated.ts';
    line(style.dim(`Generating patch for: "${taskDesc}" -> ${targetFile}\n`));

    const patch = await engine.generateCode(taskDesc, targetFile);
    if (jsonMode) {
      line(JSON.stringify(patch, null, 2));
      return;
    }

    line(style.green(`Patch Proposal Formulated for ${patch.filePath}:`));
    line(style.dim(patch.content));
    line();
    line(style.dim('Patch held in review buffer. Run `melodie agent execute` with approval to apply.'));
    return;
  }

  // 3. melodie agent review <file>
  if (sub === 'review') {
    const target = args.positionals[1];
    let contentToReview = '';

    if (target && fs.existsSync(target)) {
      contentToReview = fs.readFileSync(target, 'utf-8');
    } else {
      contentToReview = target || 'const apiKey = "sk_live_synthetic";';
    }

    heading('Agent Code Review');
    const review = await engine.reviewCode(contentToReview);

    if (jsonMode) {
      line(JSON.stringify(review, null, 2));
      return;
    }

    if (review.pass) {
      line(style.green('Review Result: PASS. No security policy violations found.'));
    } else {
      line(style.red('Review Result: FAILED. Policy violations found:'));
      review.findings.forEach((f) => line(`  - ${f}`));
    }
    return;
  }

  // 4. melodie agent test
  if (sub === 'test') {
    heading('Agent Test Execution');
    line('Running test suite via sandbox policy...');
    const result = engine.getSandbox().executeCommand('npm', ['test']);

    if (jsonMode) {
      line(JSON.stringify(result, null, 2));
      return;
    }

    if (result.exitCode === 0) {
      line(style.green('Sandbox test run PASSED.'));
      line(style.dim(result.stdout.slice(0, 400)));
    } else {
      line(style.red(`Sandbox test run FAILED (code ${result.exitCode}).`));
      line(result.stderr || result.stdout);
    }
    return;
  }

  // 5. melodie agent security
  if (sub === 'security') {
    heading('Agent Security Audit');
    const inspection = engine.getSandbox().inspect();

    if (jsonMode) {
      line(JSON.stringify(inspection, null, 2));
      return;
    }

    line(`Security Plane Status: ${style.green(inspection.securityStatus)}`);
    line(`Workspace Boundary:   ${inspection.workspaceRoot}`);
    line(`Filesystem Access:    ${inspection.permissions.filesystem}`);
    line(`Shell Execution:      ${inspection.permissions.shell}`);
    line(`Network Policy:       ${inspection.permissions.network}`);
    line(`Allowed Commands:     ${inspection.allowedCommands.join(', ')}`);
    line(`Blocked Subprocesses: ${inspection.deniedCommands.join(', ')}`);
    return;
  }

  // 6. melodie agent execute <task_id>
  if (sub === 'execute') {
    const taskId = args.positionals[1] || 'TASK-000001';
    const approved = args.flags.has('i-approve-execution') || args.flags.has('force');

    heading(`Governed Agent Execution: ${taskId}`);
    line(style.dim('Execution passes through policy, sandbox, limits, and audit.\n'));

    const execResult = await engine.execute(
      taskId,
      { type: 'test' },
      { approveExecution: approved }
    );

    if (jsonMode) {
      line(JSON.stringify(execResult, null, 2));
      return;
    }

    line(`Execution ID:  ${execResult.execution_id}`);
    line(`Task ID:       ${execResult.task_id}`);
    line(`Assigned Agent:${execResult.agent_id}`);
    line(`Model:         ${execResult.model}`);
    line(`Status:        ${execResult.status === 'VERIFIED' ? style.green(execResult.status) : style.yellow(execResult.status)}`);
    line(`Output:        ${execResult.output || execResult.error}`);

    if (!approved) {
      line();
      line(style.yellow('Autonomous shell mutation blocked by governance policy.'));
      line(style.dim('To authorize execution, provide the flag: --i-approve-execution'));
    }
    return;
  }

  // 7. melodie agent create <name>
  if (sub === 'create') {
    const name = args.positionals[1];
    if (!name) {
      fail('Agent create requires a profile name: melodie agent create <name>');
      process.exitCode = 1;
      return;
    }

    const reg = agentRegistry.loadRegistry();
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    reg.profiles.push({
      id,
      name,
      role: 'coder',
      type: 'agent_profile',
      engineering_state: 'SCAFFOLD',
      runtime_state: 'UNVERIFIED',
      description: `Custom agent profile: ${name}`,
      system_prompt: `You are custom agent ${name}. Follow Melodie truth protocols.`,
      default_model: 'openrouter/flavor-pareto-code',
      allowed_tools: ['inspect', 'patch'],
      permissions: { filesystem: 'scoped', shell: 'allowlist', network: 'restricted' },
    });
    agentRegistry.saveRegistry(reg);
    line(style.green(`Agent profile '${name}' registered with engineering_state: SCAFFOLD.`));
    return;
  }

  // 8. Default: melodie agent [list]
  const profiles = agentRegistry.listProfiles();
  if (jsonMode) {
    line(JSON.stringify(profiles, null, 2));
    return;
  }

  heading(`Agent Registry (${profiles.length} profiles registered / 80,000 logical capacity)`);
  line(style.dim('Registered agent profiles and functional role specifications.\n'));

  const rows = profiles.slice(0, 30).map((p) => [
    p.id,
    p.name,
    p.role,
    p.engineering_state,
    p.runtime_state === 'VERIFIED' ? style.green(p.runtime_state) : style.yellow(p.runtime_state),
    p.default_model,
  ]);

  table(rows, ['Agent ID', 'Name', 'Role', 'Engineering State', 'Runtime State', 'Default Model']);
  if (profiles.length > 30) {
    line(style.dim(`... and ${profiles.length - 30} more profiles registered.`));
  }
  line();
  line(style.dim('Run `melodie agent plan <task>` to initiate a task decomposition.'));
}
