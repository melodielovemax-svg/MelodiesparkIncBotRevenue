CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'viewer')),
    created_at TEXT NOT NULL
);
CREATE TABLE sessions (
    token_hash TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    csrf_token TEXT NOT NULL,
    expires_at TEXT NOT NULL
);
CREATE INDEX sessions_expires ON sessions(expires_at);
CREATE TABLE records (
    id INTEGER PRIMARY KEY,
    kind TEXT NOT NULL CHECK (kind IN ('products','customers','agents','work_orders','cases','integrations')),
    title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 120),
    description TEXT NOT NULL DEFAULT '' CHECK (length(description) <= 2000),
    status TEXT NOT NULL CHECK (status IN ('DRAFT','UNVERIFIED','BLOCKED','PENDING_APPROVAL','DISABLED','COMPLETED')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id)
);
CREATE INDEX records_kind ON records(kind, id DESC);
CREATE TABLE audit_events (
    id INTEGER PRIMARY KEY,
    at TEXT NOT NULL,
    actor_id INTEGER NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    subject TEXT NOT NULL,
    payload TEXT NOT NULL,
    previous_hash TEXT NOT NULL,
    hash TEXT NOT NULL UNIQUE
);
CREATE TRIGGER audit_no_update BEFORE UPDATE ON audit_events BEGIN SELECT RAISE(ABORT, 'audit history is immutable'); END;
CREATE TRIGGER audit_no_delete BEFORE DELETE ON audit_events BEGIN SELECT RAISE(ABORT, 'audit history is immutable'); END;
CREATE TABLE login_attempts (
    email TEXT PRIMARY KEY COLLATE NOCASE,
    failures INTEGER NOT NULL DEFAULT 0,
    locked_until TEXT
);
