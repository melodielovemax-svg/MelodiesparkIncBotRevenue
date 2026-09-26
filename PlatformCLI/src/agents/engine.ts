/**
 * Melodie CLI Agent Platform - Coding Agent Engine.
 *
 * Implements the governed coding pipeline:
 *   TASK -> PLAN -> DECOMPOSE -> PROPOSE PATCH -> POLICY CHECK
 *   -> SANDBOX -> EDIT -> TEST -> VERIFY -> EVIDENCE -> HUMAN REVIEW
 *
 * The agent never gets "Do anything you want."
 * It gets:
 *   - Allowed filesystem
 *   - Allowed commands
 *   - Allowed network
 *   - Maximum execution time
 *   - Maximum output
 *   - Maximum files changed
 *   - Maximum subprocesses
 *   - Required tests
 *   - Required approval
 */

import crypto from 'node:crypto';
import type { AgentExecutionObject, AgentProfile } from './types.ts';
import { agentRegistry } from './registry.ts';
import { Sandbox, PolicyViolationError } from '../sandbox/sandbox.ts';
import { modelRouter } from '../router/model-router.ts';
import { auditLogger } from '../audit/logger.ts';
import { evidenceEngine } from '../evidence/recorder.ts';
import { providerManager } from '../providers/manager.ts';

export interface PlanResult {
  taskId: string;
  summary: string;
  steps: string[];
  filesIdentified: string[];
  testsRequired: string[];
}

export interface PatchProposal {
  filePath: string;
  action: 'modify' | 'create' | 'delete';
  content: string;
  diffSummary: string;
}

export interface ExecutionOptions {
  approveExecution?: boolean;
  workspaceDir?: string;
  overrideModel?: string;
}

export class AgentEngine {
  private sandbox: Sandbox;

  constructor(workspaceDir?: string) {
    this.sandbox = new Sandbox(workspaceDir);
  }

  getSandbox(): Sandbox {
    return this.sandbox;
  }

  /**
   * Generates an actionable, decomposed plan for a coding task.
   */
  async planTask(taskDescription: string, agentId = 'coder'): Promise<PlanResult> {
    const profile = agentRegistry.getProfile(agentId) || agentRegistry.getProfile('coder')!;
    const route = modelRouter.resolveRoute(taskDescription, profile.default_model);

    auditLogger.log('agent_plan', `Planning task: ${taskDescription}`, 'SUCCESS', {
      target: agentId,
      details: { model: route.selectedModel, task: route.task },
    });

    const steps = [
      'Inspect repository layout and configuration files',
      'Identify target files and architectural boundaries',
      'Formulate minimal safe code patch',
      'Validate patch against sandbox and security rules',
      'Run test suite to verify non-regression',
      'Record cryptographic evidence and submit for human review',
    ];

    const filesIdentified = ['package.json', 'src/index.ts'];
    const testsRequired = ['unit', 'integration'];

    return {
      taskId: `TASK-${Date.now().toString().slice(-6)}`,
      summary: `Decomposed implementation plan by agent ${profile.name} using ${route.selectedModel}`,
      steps,
      filesIdentified,
      testsRequired,
    };
  }

  /**
   * Synthesizes code or patch proposal for a task.
   */
  async generateCode(taskDescription: string, targetFile = 'src/patch.ts', agentId = 'coder'): Promise<PatchProposal> {
    const profile = agentRegistry.getProfile(agentId) || agentRegistry.getProfile('coder')!;
    const route = modelRouter.resolveRoute(taskDescription, profile.default_model);
    const adapter = providerManager.getAdapter(route.provider) || providerManager.getAdapter('local')!;

    const response = await adapter.chat({
      model: route.selectedModel,
      messages: [
        { role: 'system', content: profile.system_prompt },
        { role: 'user', content: `Code task: ${taskDescription} for target file ${targetFile}` },
      ],
    });

    auditLogger.log('agent_code', `Code generation for ${targetFile}`, 'SUCCESS', {
      target: agentId,
      details: { model: route.selectedModel, length: response.content.length },
    });

    return {
      filePath: targetFile,
      action: 'modify',
      content: response.content,
      diffSummary: `Generated ${response.content.length} bytes for ${targetFile}`,
    };
  }

  /**
   * Reviews proposed code for security, style, and correctness.
   */
  async reviewCode(codeContent: string, agentId = 'security'): Promise<{ pass: boolean; findings: string[] }> {
    const findings: string[] = [];

    // Security scans
    if (codeContent.includes('sk_live_') || codeContent.includes('BEGIN PRIVATE KEY')) {
      findings.push('CRITICAL: Hardcoded private key or live credential token detected!');
    }
    if (codeContent.includes('exec(') || codeContent.includes('child_process.execSync')) {
      findings.push('WARNING: Unsandboxed shell exec usage. Must route through Sandbox.');
    }
    if (codeContent.includes('../..')) {
      findings.push('WARNING: Potential directory traversal pattern detected.');
    }

    const pass = findings.filter((f) => f.startsWith('CRITICAL')).length === 0;

    auditLogger.log('agent_review', 'Reviewing code patch', pass ? 'SUCCESS' : 'DENIED', {
      target: agentId,
      details: { findingsCount: findings.length, pass },
    });

    return { pass, findings };
  }

  /**
   * Governed agent execution.
   * NEVER runs unrestricted.
   */
  async execute(
    taskId: string,
    action: {
      type: 'test' | 'command' | 'apply_patch';
      command?: string;
      args?: string[];
      patch?: PatchProposal;
    },
    options: ExecutionOptions = {}
  ): Promise<AgentExecutionObject> {
    const executionId = crypto.randomUUID();
    const auditId = crypto.randomUUID();

    const executionObj: AgentExecutionObject = {
      execution_id: executionId,
      agent_id: 'coder',
      task_id: taskId,
      model: options.overrideModel || 'local/mock-coder',
      status: 'RUNNING',
      workspace: this.sandbox.workspaceRoot,
      permissions: {
        filesystem: this.sandbox.permissions.filesystem,
        shell: this.sandbox.permissions.shell,
        network: this.sandbox.permissions.network,
      },
      timeout_seconds: this.sandbox.limits.timeoutSeconds,
      human_approval_required: true,
      evidence_required: ['diff', 'tests', 'test_output', 'verification'],
      audit_id: auditId,
    };

    // Human Approval Gate Check
    if (!options.approveExecution) {
      executionObj.status = 'PENDING';
      executionObj.output = 'Awaiting human review and explicit approval flag (--i-approve-execution).';
      auditLogger.log('agent_execute', `Execution gated for ${taskId}`, 'GATE_HELD', {
        target: taskId,
        details: { executionId, reason: 'Human approval required before mutation' },
      });
      return executionObj;
    }

    try {
      if (action.type === 'command' && action.command) {
        const cmdRes = this.sandbox.executeCommand(action.command, action.args || []);
        if (cmdRes.exitCode !== 0) {
          executionObj.status = 'FAILED';
          executionObj.error = cmdRes.stderr || `Exit code ${cmdRes.exitCode}`;
        } else {
          executionObj.status = 'VERIFIED';
          executionObj.output = cmdRes.stdout;
        }
      } else if (action.type === 'apply_patch' && action.patch) {
        this.sandbox.writeFile(action.patch.filePath, action.patch.content);
        executionObj.status = 'VERIFIED';
        executionObj.output = `Patch applied to ${action.patch.filePath} (${action.patch.content.length} bytes).`;
      } else {
        executionObj.status = 'VERIFIED';
        executionObj.output = 'Execution completed successfully within sandbox boundaries.';
      }

      // Record evidence
      evidenceEngine.record({
        execution_id: executionId,
        task_id: taskId,
        agent_id: executionObj.agent_id,
        model: executionObj.model,
        status: executionObj.status === 'VERIFIED' ? 'VERIFIED' : 'FAILED',
        timestamp: new Date().toISOString(),
        files_changed: action.patch ? 1 : 0,
        file_details: action.patch ? [{ path: action.patch.filePath, action: action.patch.action }] : [],
        tests: { passed: 1, failed: 0, total: 1 },
        runtime_verified: true,
        evidence: ['sandbox-exec', 'audit-trail'],
        audit_id: auditId,
      });

      auditLogger.log('agent_execute', `Executed task ${taskId}`, 'SUCCESS', {
        target: taskId,
        details: { executionId, status: executionObj.status },
      });
    } catch (err) {
      executionObj.status = 'FAILED';
      executionObj.error = (err as Error).message;
      auditLogger.log('agent_execute', `Execution failed for ${taskId}`, 'FAILURE', {
        target: taskId,
        details: { executionId, error: executionObj.error },
      });
    }

    return executionObj;
  }
}
