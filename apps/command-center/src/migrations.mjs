export const CURRENT_SCHEMA_VERSION = '0.2.0';

export const MIGRATIONS = [
  {
    from: '0.1.0',
    to: '0.2.0',
    apply(db) {
      db.exec(`
        CREATE TABLE IF NOT EXISTS executions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          authorization_intent_id TEXT NOT NULL REFERENCES withdrawal_intents(id),
          status TEXT NOT NULL CHECK (status IN ('proposed', 'authorized', 'queued', 'running', 'succeeded', 'failed', 'cancelled')),
          actor_user_id TEXT NOT NULL REFERENCES users(id),
          runner_result_json TEXT,
          error_code TEXT,
          error_message TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          authorized_at TEXT,
          queued_at TEXT,
          started_at TEXT,
          completed_at TEXT,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, authorization_intent_id)
        );
        CREATE TABLE IF NOT EXISTS execution_transitions (
          id TEXT PRIMARY KEY,
          execution_id TEXT NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
          from_status TEXT,
          to_status TEXT NOT NULL,
          actor_user_id TEXT REFERENCES users(id),
          reason TEXT,
          details_json TEXT,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE IF NOT EXISTS execution_metrics (
          metric TEXT PRIMARY KEY,
          count INTEGER NOT NULL DEFAULT 0,
          updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_executions_intent ON executions(authorization_intent_id);
        CREATE INDEX IF NOT EXISTS idx_executions_created ON executions(created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_execution_transitions_status ON execution_transitions(to_status, created_at DESC);
      `);
    }
  }
];

export function applyMigrations(db) {
  const current = db.prepare("SELECT value FROM schema_metadata WHERE key = 'version'").get()?.value || '0.1.0';
  let version = current;
  for (const migration of MIGRATIONS) {
    if (version !== migration.from) continue;
    migration.apply(db);
    db.prepare(`UPDATE schema_metadata SET value = ?, updated_at = CURRENT_TIMESTAMP WHERE key = 'version'`).run(migration.to);
    version = migration.to;
  }
  if (version !== CURRENT_SCHEMA_VERSION) {
    throw new Error(`Unsupported database schema version: ${version}. Expected ${CURRENT_SCHEMA_VERSION}.`);
  }
  return version;
}
