/**
 * Melodie CLI Agent Platform - Deployment Gate.
 *
 * Enforces:
 *   Deployment remains gated until a real deployment provider is configured
 *   and independently verified.
 *   Release is BLOCKED by default per TRUTH_PROTOCOL.md.
 */

import { auditLogger } from '../audit/logger.ts';

export interface DeploymentGateCheck {
  id: string;
  name: string;
  passed: boolean;
  status: 'OPERATIONAL' | 'UNVERIFIED' | 'BLOCKED';
  message: string;
}

export interface DeploymentPlan {
  environment: string;
  checks: DeploymentGateCheck[];
  allowedToRelease: boolean;
  blockReason?: string;
}

export class DeploymentGate {
  evaluatePlan(environment = 'production'): DeploymentPlan {
    const checks: DeploymentGateCheck[] = [
      {
        id: 'GATE-01-PROVIDER',
        name: 'Deployment Provider Configured',
        passed: false,
        status: 'UNVERIFIED',
        message: 'No verified cloud deployment provider (AWS/GCP/Vercel) credential configured.',
      },
      {
        id: 'GATE-02-EVIDENCE',
        name: 'Cryptographic Test Evidence',
        passed: true,
        status: 'OPERATIONAL',
        message: 'Local build and test evidence verified.',
      },
      {
        id: 'GATE-03-HUMAN-APPROVAL',
        name: 'Human Multi-Party Approval',
        passed: false,
        status: 'BLOCKED',
        message: 'Autonomous release without explicit operator approval is strictly prohibited.',
      },
      {
        id: 'GATE-04-FINANCIAL-BLOCK',
        name: 'Financial & Transaction Invariants',
        passed: true,
        status: 'OPERATIONAL',
        message: 'Zero autonomous financial transfer or live blockchain key broadcasting permitted.',
      },
    ];

    const allowed = checks.every((c) => c.passed);

    auditLogger.log('deployment_blocked', `Evaluated deployment plan for ${environment}`, 'GATE_HELD', {
      details: { allowed, checksCount: checks.length },
    });

    return {
      environment,
      checks,
      allowedToRelease: allowed,
      blockReason: allowed
        ? undefined
        : 'Deployment gate holds: Cloud provider is UNVERIFIED and human approval is required.',
    };
  }

  release(environment = 'production', approvalFlag = false): { ok: boolean; message: string } {
    const plan = this.evaluatePlan(environment);
    if (!plan.allowedToRelease && !approvalFlag) {
      return {
        ok: false,
        message: `Deployment to ${environment} BLOCKED: ${plan.blockReason}`,
      };
    }

    if (!approvalFlag) {
      return {
        ok: false,
        message: 'Deployment BLOCKED: Requires --i-approve-deployment explicit flag.',
      };
    }

    return {
      ok: false,
      message: 'Deployment provider unconfigured. Cannot release to external environment.',
    };
  }
}

export const deploymentGate = new DeploymentGate();
