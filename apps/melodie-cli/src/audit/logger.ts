/**
 * Melodie CLI Agent Platform - Audit Logger.
 *
 * Implements immutable JSONL audit recording and queries.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { AuditEvent, AuditEventType } from './types.ts';

export class AuditLogger {
  private logPath: string;

  constructor(customPath?: string) {
    this.logPath =
      customPath ||
      process.env.MELODIESPARK_AUDIT_LOG ||
      path.join(process.cwd(), '.melodie', 'audit.jsonl');
  }

  getLogPath(): string {
    return this.logPath;
  }

  log(
    eventType: AuditEventType,
    action: string,
    status: 'SUCCESS' | 'FAILURE' | 'DENIED' | 'GATE_HELD',
    options?: {
      target?: string;
      actor?: string;
      details?: Record<string, unknown>;
    }
  ): AuditEvent {
    const event: AuditEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      eventType,
      actor: options?.actor || process.env.MELODIESPARK_ACTOR || 'system',
      target: options?.target,
      action,
      status,
      details: options?.details,
    };

    const dir = path.dirname(this.logPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.appendFileSync(this.logPath, `${JSON.stringify(event)}\n`, 'utf-8');
    return event;
  }

  query(filter?: {
    eventType?: AuditEventType;
    status?: string;
    limit?: number;
  }): AuditEvent[] {
    if (!fs.existsSync(this.logPath)) return [];

    const content = fs.readFileSync(this.logPath, 'utf-8');
    const lines = content.split('\n').filter((l) => l.trim().length > 0);
    const events: AuditEvent[] = [];

    for (const line of lines) {
      try {
        const ev = JSON.parse(line) as AuditEvent;
        if (filter?.eventType && ev.eventType !== filter.eventType) continue;
        if (filter?.status && ev.status !== filter.status) continue;
        events.push(ev);
      } catch {
        // Skip malformed
      }
    }

    const limit = filter?.limit ?? 50;
    return events.slice(-limit).reverse();
  }
}

export const auditLogger = new AuditLogger();
