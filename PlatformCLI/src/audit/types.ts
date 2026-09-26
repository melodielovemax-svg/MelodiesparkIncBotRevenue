/**
 * Melodie CLI Agent Platform - Audit Event Types.
 */

export type AuditEventType =
  | 'provider_verify'
  | 'model_sync'
  | 'agent_plan'
  | 'agent_code'
  | 'agent_review'
  | 'agent_execute'
  | 'sandbox_command'
  | 'policy_violation'
  | 'evidence_recorded'
  | 'deployment_blocked';

export interface AuditEvent {
  id: string;
  timestamp: string;
  eventType: AuditEventType;
  actor: string;
  target?: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'GATE_HELD';
  details?: Record<string, unknown>;
}
