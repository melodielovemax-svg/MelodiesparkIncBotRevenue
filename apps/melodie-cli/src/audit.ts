/**
 * Append-only audit log for content extraction.
 *
 * Every successful or denied extraction writes one JSONL record so that
 * "who read what, when, and under which authorization" is answerable.
 */

import fs from 'node:fs';
import path from 'node:path';

export interface AuditRecord {
  ts: string;
  actor: string;
  action: 'EXTRACT' | 'EXTRACT_DENIED' | 'TEMPLATE_INIT' | 'VERIFY';
  target: string;
  outcome: 'ALLOWED' | 'DENIED';
  bytes: number;
  authorization: boolean;
  reason: string;
  /** Ids of content-scan signals that fired, e.g. CS001_STRIPE_LIVE_SECRET. */
  content_signals: string[];
  catalog: string;
  host: string;
}

export function auditActor(): string {
  return process.env.MELODIESPARK_ACTOR || process.env.USERNAME || process.env.USER || 'unknown';
}

export function appendAudit(logPath: string, record: Omit<AuditRecord, 'ts' | 'actor' | 'host'>): AuditRecord {
  const full: AuditRecord = {
    ts: new Date().toISOString(),
    actor: auditActor(),
    host: `${process.platform}-${process.arch}`,
    ...record,
  };
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.appendFileSync(logPath, `${JSON.stringify(full)}\n`, 'utf-8');
  return full;
}

export function readAudit(logPath: string): AuditRecord[] {
  if (!fs.existsSync(logPath)) return [];
  const raw = fs.readFileSync(logPath, 'utf-8');
  const out: AuditRecord[] = [];
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    try {
      out.push(JSON.parse(line) as AuditRecord);
    } catch {
      // A corrupt line must not hide the rest of the trail.
    }
  }
  return out;
}
