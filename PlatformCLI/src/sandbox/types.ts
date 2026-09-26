/**
 * Melodie CLI Agent Platform - Sandbox & Policy Types.
 */

export interface SandboxPermissions {
  filesystem: 'scoped' | 'read-only' | 'deny';
  shell: 'allowlist' | 'none';
  network: 'restricted' | 'localhost' | 'none';
}

export interface SandboxLimits {
  timeoutSeconds: number;
  maxOutputBytes: number;
  maxFilesChanged: number;
  maxSubprocesses: number;
}

export interface CommandExecutionResult {
  command: string;
  args: string[];
  exitCode: number;
  stdout: string;
  stderr: string;
  durationMs: number;
  policyApproved: boolean;
}

export interface SandboxInspection {
  workspaceRoot: string;
  permissions: SandboxPermissions;
  limits: SandboxLimits;
  allowedCommands: string[];
  deniedCommands: string[];
  securityStatus: 'OPERATIONAL' | 'SCAFFOLD' | 'BLOCKED';
}
