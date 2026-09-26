/**
 * Content-level secret guard.
 *
 * Path-based classification cannot catch a real credential that was pasted
 * into an ordinary `.md`, `.ts`, or `.py` file. Before any content is copied,
 * the candidate is scanned against the high-signal patterns declared in the
 * shared rules contract. A match downgrades the entry to denied-by-default.
 *
 * A match is NOT a permanent deny: documentation legitimately shows example
 * keys, and an operator may authorize copying after review. It is never copied
 * silently, and it is always recorded in the audit log with its pattern id.
 */

import fs from 'node:fs';
import type { ExtractionPolicy } from './contracts.ts';

export interface ContentSignal {
  id: string;
  pattern: string;
  severity: string;
}

export interface ContentFinding {
  id: string;
  severity: string;
  /** 1-based line number of the first match. */
  line: number;
}

const cache = new Map<string, RegExp>();

function compile(pattern: string): RegExp {
  const cached = cache.get(pattern);
  if (cached) return cached;
  let body = pattern;
  let flags = '';
  if (body.startsWith('(?i)')) {
    flags += 'i';
    body = body.slice(4);
  }
  const re = new RegExp(body, flags);
  cache.set(pattern, re);
  return re;
}

export function scanContent(
  absPath: string,
  policy: ExtractionPolicy
): ContentFinding[] {
  const spec = policy.content_sensitive_patterns;
  if (!spec || !Array.isArray(spec.patterns) || spec.patterns.length === 0) return [];

  let stat: fs.Stats;
  try {
    stat = fs.statSync(absPath);
  } catch {
    return [];
  }
  if (stat.size > spec.max_scan_bytes) return [];

  let text: string;
  try {
    text = fs.readFileSync(absPath, 'utf-8');
  } catch {
    return [];
  }
  // A NUL byte in the first block means this is not really text.
  if (text.indexOf('\u0000') !== -1) return [];

  const lines = text.split('\n');
  const findings: ContentFinding[] = [];
  for (const signal of spec.patterns as ContentSignal[]) {
    const re = compile(signal.pattern);
    for (let i = 0; i < lines.length; i += 1) {
      if (re.test(lines[i])) {
        findings.push({ id: signal.id, severity: signal.severity, line: i + 1 });
        break;
      }
    }
  }
  return findings;
}
