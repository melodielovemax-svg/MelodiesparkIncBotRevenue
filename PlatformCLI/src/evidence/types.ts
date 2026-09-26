/**
 * Melodie CLI Agent Platform - Evidence Engine Types.
 */

export interface TestResultSummary {
  passed: number;
  failed: number;
  total: number;
  durationMs?: number;
}

export interface FileChangeRecord {
  path: string;
  action: 'create' | 'modify' | 'delete';
  sha256Before?: string;
  sha256After?: string;
}

export interface EvidenceRecord {
  execution_id: string;
  task_id: string;
  agent_id: string;
  model: string;
  status: 'VERIFIED' | 'FAILED' | 'REJECTED' | 'UNVERIFIED';
  timestamp: string;
  files_changed: number;
  file_details: FileChangeRecord[];
  tests: TestResultSummary;
  runtime_verified: boolean;
  evidence: string[];
  audit_id: string;
  checksum: string;
}
