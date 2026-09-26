-- Melodiespark target extension schema — PostgreSQL 16+
-- Additif et non appliqué automatiquement au runtime existant.
-- Schéma SQLite local : C:\melodie\MelodiesparkCommandCenter\db\schema.sql
-- Schéma PostgreSQL de référence : C:\melodie\MelodiesparkCommandCenter\db\postgresql.sql
--
-- Portée : extension cible pour l'orchestration, l'inbox/outbox et le socle du paper trading.
-- Ce fichier est un bootstrap de référence réexécutable sur une base créée par ce
-- même fichier ; ce n'est pas une migration de mise à niveau d'un schéma arbitraire.
--
-- Règles de sécurité :
-- - aucune clé privée, clé API ou identifiant brut ;
-- - aucun payout ni ordre de change exécuté automatiquement ;
-- - traitement idempotent des tâches et des webhooks ;
-- - enregistrements d'audit et d'outbox orientés ajout ;
-- - migrations à versionner séparément de cette définition cible.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS schema_metadata (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feature_flags (
  key text PRIMARY KEY,
  description text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  rollout_percentage integer NOT NULL DEFAULT 0 CHECK (rollout_percentage BETWEEN 0 AND 100),
  owner text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS task_definitions (
  id text NOT NULL,
  version integer NOT NULL CHECK (version > 0),
  domain text NOT NULL,
  name text NOT NULL,
  input_schema jsonb NOT NULL,
  output_schema jsonb NOT NULL,
  side_effects text NOT NULL CHECK (side_effects IN ('read_only', 'local_write', 'external_read', 'financial_pending', 'execution_blocked')),
  requires_approval boolean NOT NULL DEFAULT false,
  timeout_seconds integer NOT NULL DEFAULT 120 CHECK (timeout_seconds > 0),
  max_retries integer NOT NULL DEFAULT 0 CHECK (max_retries >= 0),
  enabled boolean NOT NULL DEFAULT false,
  owner text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id, version),
  CHECK (side_effects NOT IN ('financial_pending', 'execution_blocked') OR requires_approval)
);

CREATE TABLE IF NOT EXISTS task_dependencies (
  task_definition_id text NOT NULL,
  task_definition_version integer NOT NULL,
  depends_on_task_id text NOT NULL,
  depends_on_task_version integer NOT NULL,
  PRIMARY KEY (
    task_definition_id,
    task_definition_version,
    depends_on_task_id,
    depends_on_task_version
  ),
  CHECK (task_definition_id <> depends_on_task_id),
  FOREIGN KEY (task_definition_id, task_definition_version)
    REFERENCES task_definitions(id, version) ON DELETE CASCADE,
  FOREIGN KEY (depends_on_task_id, depends_on_task_version)
    REFERENCES task_definitions(id, version) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS task_cycle_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id text NOT NULL UNIQUE,
  trigger_source text NOT NULL,
  status text NOT NULL CHECK (status IN ('running', 'succeeded', 'partial', 'failed', 'cancelled')),
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  details_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  CHECK (
    (status = 'running' AND completed_at IS NULL)
    OR (status <> 'running' AND completed_at IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS task_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_definition_id text NOT NULL,
  task_version integer NOT NULL,
  cycle_id text REFERENCES task_cycle_runs(cycle_id) ON DELETE SET NULL,
  status text NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed', 'cancelled', 'blocked')),
  attempt integer NOT NULL DEFAULT 0 CHECK (attempt >= 0),
  input_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  output_json jsonb,
  error_code text,
  error_message text,
  requested_by_user_id uuid,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (task_definition_id, task_version)
    REFERENCES task_definitions(id, version) ON DELETE RESTRICT,
  CHECK (
    (status IN ('queued', 'running') AND completed_at IS NULL)
    OR (status IN ('succeeded', 'failed', 'cancelled', 'blocked') AND completed_at IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS task_runs_status_created_idx ON task_runs (status, created_at);
CREATE INDEX IF NOT EXISTS task_runs_definition_idx ON task_runs (task_definition_id, task_version, created_at DESC);
CREATE INDEX IF NOT EXISTS task_runs_cycle_idx ON task_runs (cycle_id);

CREATE TABLE IF NOT EXISTS worker_leases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id text NOT NULL,
  task_run_id uuid NOT NULL REFERENCES task_runs(id) ON DELETE CASCADE,
  lease_token_hash text NOT NULL UNIQUE CHECK (length(lease_token_hash) >= 32),
  acquired_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  released_at timestamptz,
  CHECK (expires_at > acquired_at)
);
CREATE INDEX IF NOT EXISTS worker_leases_active_idx ON worker_leases (task_run_id, expires_at);

CREATE TABLE IF NOT EXISTS event_inbox (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  external_event_id text NOT NULL,
  event_type text NOT NULL,
  payload_hash text NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  processing_error text,
  UNIQUE (provider, external_event_id)
);
CREATE INDEX IF NOT EXISTS event_inbox_unprocessed_idx ON event_inbox (processed_at, received_at);

CREATE TABLE IF NOT EXISTS outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deduplication_key text NOT NULL UNIQUE,
  aggregate_type text NOT NULL,
  aggregate_id text NOT NULL,
  event_type text NOT NULL,
  payload_json jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  publish_attempts integer NOT NULL DEFAULT 0 CHECK (publish_attempts >= 0)
);
CREATE INDEX IF NOT EXISTS outbox_unpublished_idx ON outbox_events (published_at, created_at);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  scope text NOT NULL,
  key text NOT NULL,
  request_hash text NOT NULL,
  response_status integer,
  response_json jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  PRIMARY KEY (scope, key)
);
CREATE INDEX IF NOT EXISTS idempotency_expiry_idx ON idempotency_keys (expires_at);

CREATE TABLE IF NOT EXISTS market_data_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  symbol text NOT NULL,
  price numeric(36, 18) NOT NULL CHECK (price >= 0),
  currency char(3) NOT NULL CHECK (currency ~ '^[A-Z]{3}$'),
  observed_at timestamptz NOT NULL,
  source_timestamp timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, symbol, currency, observed_at)
);
CREATE INDEX IF NOT EXISTS market_data_symbol_idx ON market_data_snapshots (symbol, observed_at DESC);

CREATE TABLE IF NOT EXISTS paper_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  base_currency char(3) NOT NULL DEFAULT 'USD' CHECK (base_currency ~ '^[A-Z]{3}$'),
  starting_balance numeric(36, 18) NOT NULL CHECK (starting_balance >= 0),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

CREATE TABLE IF NOT EXISTS paper_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_account_id uuid NOT NULL REFERENCES paper_accounts(id) ON DELETE CASCADE,
  client_order_id text NOT NULL,
  symbol text NOT NULL,
  side text NOT NULL CHECK (side IN ('buy', 'sell')),
  order_type text NOT NULL CHECK (order_type IN ('market', 'limit')),
  quantity numeric(36, 18) NOT NULL CHECK (quantity > 0),
  limit_price numeric(36, 18) CHECK (limit_price IS NULL OR limit_price > 0),
  status text NOT NULL CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected')),
  risk_decision_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (paper_account_id, client_order_id),
  CHECK (
    (order_type = 'market' AND limit_price IS NULL)
    OR (order_type = 'limit' AND limit_price IS NOT NULL)
  )
);
CREATE INDEX IF NOT EXISTS paper_orders_account_idx ON paper_orders (paper_account_id, created_at DESC);

CREATE TABLE IF NOT EXISTS risk_decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  account_id uuid REFERENCES paper_accounts(id) ON DELETE SET NULL,
  decision text NOT NULL CHECK (decision IN ('approved', 'rejected', 'review_required')),
  reason_code text NOT NULL,
  strategy_version text,
  input_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS risk_decisions_account_idx ON risk_decisions (account_id, created_at DESC);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'paper_orders'::regclass
      AND conname = 'paper_orders_risk_decision_fk'
  ) THEN
    ALTER TABLE paper_orders
      ADD CONSTRAINT paper_orders_risk_decision_fk
      FOREIGN KEY (risk_decision_id) REFERENCES risk_decisions(id) ON DELETE SET NULL;
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS compliance_cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  case_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('open', 'in_review', 'approved', 'rejected', 'closed')),
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  reason_code text,
  assigned_to text,
  evidence_json jsonb NOT NULL DEFAULT '{}'::jsonb,
  opened_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE INDEX IF NOT EXISTS compliance_cases_status_idx ON compliance_cases (status, opened_at);

INSERT INTO schema_metadata (key, value)
VALUES
  ('target_extension.name', 'orchestration_and_paper_trading'),
  ('target_extension.version', '0.1.0'),
  ('target_extension.last_reviewed', '2026-09-24')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;
