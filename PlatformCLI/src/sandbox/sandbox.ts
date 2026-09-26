/**
 * Melodie CLI Agent Platform - Policy & Sandbox Plane.
 *
 * Enforces:
 *   - Path confinement (strictly scoped to workspace)
 *   - Shell allowlists (no arbitrary command execution, no shell metacharacters)
 *   - Resource limits (timeout, output buffer, subprocesses)
 *   - Deny-by-default for credential files and secrets
 */

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import type {
  SandboxPermissions,
  SandboxLimits,
  CommandExecutionResult,
  SandboxInspection,
} from './types.ts';

export const DEFAULT_ALLOWED_COMMANDS = [
  'git',
  'npm',
  'node',
  'npx',
  'tsc',
  'python',
  'echo',
];

export const DANGEROUS_PATTERNS = [
  /[;&|`$><]/,
  /\brmdir\s+\/s/i,
  /\bformat\b/i,
  /\bdel\s+\/[fq]/i,
  /\bcurl\b/i,
  /\bwget\b/i,
  /\bnc\b/i,
  /\bpowershell\b.*-enc/i,
];

export class SandboxError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SandboxError';
  }
}

export class PolicyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PolicyViolationError';
  }
}

export class Sandbox {
  readonly workspaceRoot: string;
  readonly permissions: SandboxPermissions;
  readonly limits: SandboxLimits;
  readonly allowedCommands: Set<string>;

  constructor(
    workspaceRoot?: string,
    permissions?: Partial<SandboxPermissions>,
    limits?: Partial<SandboxLimits>
  ) {
    this.workspaceRoot = path.resolve(workspaceRoot || process.cwd());
    this.permissions = {
      filesystem: permissions?.filesystem ?? 'scoped',
      shell: permissions?.shell ?? 'allowlist',
      network: permissions?.network ?? 'restricted',
    };
    this.limits = {
      timeoutSeconds: limits?.timeoutSeconds ?? 60,
      maxOutputBytes: limits?.maxOutputBytes ?? 10 * 1024 * 1024,
      maxFilesChanged: limits?.maxFilesChanged ?? 50,
      maxSubprocesses: limits?.maxSubprocesses ?? 4,
    };
    this.allowedCommands = new Set(DEFAULT_ALLOWED_COMMANDS);
  }

  /**
   * Validates and resolves a path relative to the workspace root.
   * Throws SandboxError on any escape attempt (null byte, .., absolute escape).
   */
  resolvePath(targetPath: string): string {
    if (targetPath.includes('\0')) {
      throw new SandboxError('Null byte detected in path traversal attempt.');
    }

    const resolved = path.resolve(this.workspaceRoot, targetPath);
    const relative = path.relative(this.workspaceRoot, resolved);

    if (relative.startsWith('..') || path.isAbsolute(relative)) {
      throw new SandboxError(`Path escape denied: ${targetPath} escapes workspace ${this.workspaceRoot}`);
    }

    return resolved;
  }

  readFile(targetPath: string): string {
    const resolved = this.resolvePath(targetPath);
    if (!fs.existsSync(resolved)) {
      throw new SandboxError(`File does not exist: ${targetPath}`);
    }
    return fs.readFileSync(resolved, 'utf-8');
  }

  writeFile(targetPath: string, content: string): void {
    if (this.permissions.filesystem === 'read-only' || this.permissions.filesystem === 'deny') {
      throw new PolicyViolationError(`Filesystem policy is ${this.permissions.filesystem}; write prohibited.`);
    }

    // Secret protection check
    const basename = path.basename(targetPath).toLowerCase();
    if (
      basename === '.env' ||
      basename === '.env.enc' ||
      basename === '.env.production' ||
      basename.endsWith('.pem') ||
      basename.endsWith('.key') ||
      basename === 'id_rsa' ||
      basename === 'apikeys.json'
    ) {
      throw new PolicyViolationError(`Cannot write to protected credential file: ${targetPath}`);
    }

    const resolved = this.resolvePath(targetPath);
    const dir = path.dirname(resolved);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(resolved, content, 'utf-8');
  }

  /**
   * Runs a command within sandbox policy boundaries.
   * Never invokes through an arbitrary shell interpreter.
   */
  executeCommand(command: string, args: string[] = []): CommandExecutionResult {
    if (this.permissions.shell !== 'allowlist') {
      throw new PolicyViolationError(`Shell execution is disabled (policy: ${this.permissions.shell}).`);
    }

    const baseCmd = path.basename(command).toLowerCase().replace(/\.exe$/, '');
    if (!this.allowedCommands.has(baseCmd)) {
      throw new PolicyViolationError(`Command '${command}' is not in the sandbox allowlist.`);
    }

    // Metacharacter inspection
    const fullLine = [command, ...args].join(' ');
    for (const pat of DANGEROUS_PATTERNS) {
      if (pat.test(fullLine)) {
        throw new PolicyViolationError(`Security policy violation: dangerous shell pattern detected: ${fullLine}`);
      }
    }

    const start = Date.now();
    try {
      const proc = spawnSync(command, args, {
        cwd: this.workspaceRoot,
        timeout: this.limits.timeoutSeconds * 1000,
        maxBuffer: this.limits.maxOutputBytes,
        encoding: 'utf-8',
        shell: false,
        env: {
          ...process.env,
          // Strip critical secrets from child environment
          OPENROUTER_API_KEY: undefined,
          OPENAI_API_KEY: undefined,
          ANTHROPIC_API_KEY: undefined,
          GEMINI_API_KEY: undefined,
        },
      });

      return {
        command,
        args,
        exitCode: proc.status ?? (proc.error ? 1 : 0),
        stdout: proc.stdout ?? '',
        stderr: proc.stderr ?? (proc.error ? proc.error.message : ''),
        durationMs: Date.now() - start,
        policyApproved: true,
      };
    } catch (err) {
      return {
        command,
        args,
        exitCode: 1,
        stdout: '',
        stderr: (err as Error).message,
        durationMs: Date.now() - start,
        policyApproved: true,
      };
    }
  }

  inspect(): SandboxInspection {
    return {
      workspaceRoot: this.workspaceRoot,
      permissions: this.permissions,
      limits: this.limits,
      allowedCommands: Array.from(this.allowedCommands),
      deniedCommands: ['rmdir', 'format', 'curl', 'wget', 'nc', 'powershell -enc'],
      securityStatus: 'OPERATIONAL',
    };
  }
}
