/**
 * Melodie CLI Agent Platform - Audit Command.
 *
 * Implements:
 *   melodie audit [query]
 */

import type { parseArgs } from '../args.ts';
import { heading, line, table, style } from '../output.ts';
import { auditLogger } from '../audit/logger.ts';

export async function runAudit(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const query = args.positionals[0];
  const events = auditLogger.query({ limit: 50 });

  const filtered = query
    ? events.filter(
        (e) =>
          e.action.toLowerCase().includes(query.toLowerCase()) ||
          e.eventType.toLowerCase().includes(query.toLowerCase()) ||
          (e.target && e.target.toLowerCase().includes(query.toLowerCase()))
      )
    : events;

  if (jsonMode) {
    line(JSON.stringify(filtered, null, 2));
    return;
  }

  heading(`Audit Trail (${filtered.length} events logged)`);
  line(style.dim(`Log location: ${auditLogger.getLogPath()}\n`));

  if (filtered.length === 0) {
    line(style.dim('No audit events logged yet.'));
    return;
  }

  const rows = filtered.map((e) => [
    e.timestamp.slice(0, 19).replace('T', ' '),
    e.eventType,
    e.status === 'SUCCESS'
      ? style.green(e.status)
      : e.status === 'GATE_HELD'
      ? style.yellow(e.status)
      : style.red(e.status),
    e.actor,
    e.action.slice(0, 50),
  ]);

  table(rows, ['Timestamp', 'Type', 'Status', 'Actor', 'Action']);
}
