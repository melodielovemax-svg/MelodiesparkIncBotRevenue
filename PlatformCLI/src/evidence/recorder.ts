/**
 * Melodie CLI Agent Platform - Evidence Engine.
 *
 * Implements cryptographic evidence capture, storage, and verification.
 * Enforces: Evidence determines status; sophistication does not.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import type { EvidenceRecord } from './types.ts';

export class EvidenceEngine {
  private evidenceDir: string;

  constructor(customDir?: string) {
    this.evidenceDir =
      customDir ||
      process.env.MELODIESPARK_EVIDENCE_DIR ||
      path.join(process.cwd(), '.melodie', 'evidence');
  }

  getEvidenceDir(): string {
    return this.evidenceDir;
  }

  computeHash(content: string | Buffer): string {
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  record(data: Omit<EvidenceRecord, 'checksum'>): EvidenceRecord {
    const rawForHash = JSON.stringify({
      execution_id: data.execution_id,
      task_id: data.task_id,
      agent_id: data.agent_id,
      model: data.model,
      status: data.status,
      timestamp: data.timestamp,
      files_changed: data.files_changed,
      tests: data.tests,
      runtime_verified: data.runtime_verified,
    });

    const checksum = this.computeHash(rawForHash);
    const fullRecord: EvidenceRecord = {
      ...data,
      checksum,
    };

    if (!fs.existsSync(this.evidenceDir)) {
      fs.mkdirSync(this.evidenceDir, { recursive: true });
    }

    const targetFile = path.join(this.evidenceDir, `${fullRecord.execution_id}.json`);
    fs.writeFileSync(targetFile, JSON.stringify(fullRecord, null, 2), 'utf-8');
    return fullRecord;
  }

  list(): EvidenceRecord[] {
    if (!fs.existsSync(this.evidenceDir)) return [];

    const files = fs.readdirSync(this.evidenceDir).filter((f) => f.endsWith('.json'));
    const records: EvidenceRecord[] = [];

    for (const f of files) {
      try {
        const content = fs.readFileSync(path.join(this.evidenceDir, f), 'utf-8');
        records.push(JSON.parse(content) as EvidenceRecord);
      } catch {
        // Skip invalid
      }
    }

    return records.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  get(executionId: string): EvidenceRecord | undefined {
    const targetFile = path.join(this.evidenceDir, `${executionId}.json`);
    if (!fs.existsSync(targetFile)) return undefined;

    try {
      return JSON.parse(fs.readFileSync(targetFile, 'utf-8')) as EvidenceRecord;
    } catch {
      return undefined;
    }
  }

  verify(executionId: string): { ok: boolean; message: string; record?: EvidenceRecord } {
    const record = this.get(executionId);
    if (!record) {
      return { ok: false, message: `Evidence record ${executionId} not found.` };
    }

    const rawForHash = JSON.stringify({
      execution_id: record.execution_id,
      task_id: record.task_id,
      agent_id: record.agent_id,
      model: record.model,
      status: record.status,
      timestamp: record.timestamp,
      files_changed: record.files_changed,
      tests: record.tests,
      runtime_verified: record.runtime_verified,
    });

    const computed = this.computeHash(rawForHash);
    if (computed !== record.checksum) {
      return {
        ok: false,
        message: `Checksum mismatch! Record has been tampered with. Expected ${record.checksum}, got ${computed}.`,
        record,
      };
    }

    return {
      ok: true,
      message: `Evidence record ${executionId} verified successfully (SHA-256: ${record.checksum.slice(0, 12)}...).`,
      record,
    };
  }
}

export const evidenceEngine = new EvidenceEngine();
