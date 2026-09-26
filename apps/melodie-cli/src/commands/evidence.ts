/**
 * Melodie CLI Agent Platform - Evidence Command.
 *
 * Implements:
 *   melodie evidence list
 *   melodie evidence verify [id]
 *   melodie evidence export
 */

import type { parseArgs } from '../args.ts';
import { heading, line, table, style, fail } from '../output.ts';
import { evidenceEngine } from '../evidence/recorder.ts';

export async function runEvidence(args: ReturnType<typeof parseArgs>): Promise<void> {
  const jsonMode = args.flags.has('json');
  const sub = args.positionals[0];

  // 1. melodie evidence verify [id]
  if (sub === 'verify') {
    const id = args.positionals[1];
    if (!id) {
      fail('Evidence verify requires an execution ID: melodie evidence verify <execution_id>');
      process.exitCode = 1;
      return;
    }

    heading(`Verifying Cryptographic Evidence: ${id}`);
    const res = evidenceEngine.verify(id);

    if (jsonMode) {
      line(JSON.stringify(res, null, 2));
      return;
    }

    if (res.ok) {
      line(style.green(`VERIFICATION PASSED: ${res.message}`));
      if (res.record) {
        line(`Task ID:         ${res.record.task_id}`);
        line(`Agent:           ${res.record.agent_id}`);
        line(`Model:           ${res.record.model}`);
        line(`Files Changed:   ${res.record.files_changed}`);
        line(`Tests Passed:    ${res.record.tests.passed} / ${res.record.tests.total}`);
        line(`Runtime Verified:${res.record.runtime_verified ? style.green('Yes') : style.yellow('No')}`);
      }
    } else {
      line(style.red(`VERIFICATION FAILED: ${res.message}`));
      process.exitCode = 1;
    }
    return;
  }

  // 2. melodie evidence export
  if (sub === 'export') {
    const records = evidenceEngine.list();
    heading('Exporting Cryptographic Evidence Bundle');
    line(JSON.stringify(records, null, 2));
    return;
  }

  // 3. Default: melodie evidence [list]
  const records = evidenceEngine.list();
  if (jsonMode) {
    line(JSON.stringify(records, null, 2));
    return;
  }

  heading(`Cryptographic Evidence Registry (${records.length} records)`);
  line(style.dim('Tamper-evident verification records from agent operations.\n'));

  if (records.length === 0) {
    line(style.dim('No evidence records logged yet. Run an agent task to generate evidence.'));
    return;
  }

  const rows = records.map((r) => [
    r.execution_id.slice(0, 8),
    r.task_id,
    r.agent_id,
    r.model,
    r.status === 'VERIFIED' ? style.green(r.status) : style.yellow(r.status),
    `${r.tests.passed}/${r.tests.total} pass`,
    r.checksum.slice(0, 10),
  ]);

  table(rows, ['Exec ID', 'Task', 'Agent', 'Model', 'Status', 'Tests', 'SHA-256']);
  line();
  line(style.dim('Run `melodie evidence verify <id>` to check cryptographic integrity.'));
}
