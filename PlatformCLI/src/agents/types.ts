/**
 * Melodie CLI Agent Platform - Agent Registry & Execution Types.
 */

import type { SandboxPermissions } from '../sandbox/types.ts';

export type AgentRole =
  | 'coder'
  | 'tester'
  | 'security'
  | 'forensic'
  | 'research'
  | 'documentation'
  | 'product'
  | 'sales'
  | 'revenue'
  | 'web3'
  | 'compliance'
  | 'deployment'
  | 'observability'
  | 'data'
  | 'qa';

export type EngineeringState = 'SCAFFOLD' | 'IMPLEMENTED' | 'OPERATIONAL' | 'PLANNED';
export type RuntimeState = 'UNVERIFIED' | 'VERIFIED' | 'FAILED' | 'BLOCKED';

export interface AgentProfile {
  id: string;
  name: string;
  role: AgentRole;
  namespace?: string;
  type: 'agent_profile';
  engineering_state: EngineeringState;
  runtime_state: RuntimeState;
  description: string;
  system_prompt: string;
  default_model: string;
  allowed_tools: string[];
  permissions: SandboxPermissions;
}

export interface AgentExecutionObject {
  execution_id: string;
  agent_id: string;
  task_id: string;
  model: string;
  status: 'PENDING' | 'PLANNING' | 'RUNNING' | 'VERIFIED' | 'FAILED' | 'CANCELLED';
  workspace: string;
  permissions: {
    filesystem: string;
    shell: string;
    network: string;
  };
  timeout_seconds: number;
  human_approval_required: boolean;
  evidence_required: string[];
  audit_id: string;
  output?: string;
  error?: string;
}

export interface AgentRegistryData {
  version: string;
  updated_at: string;
  logical_agent_count: number;
  profiles: AgentProfile[];
}
