-- Melodiespark v0.4 Database Schema Initialization

-- Create game_ledger table (immutable, append-only)
CREATE TABLE IF NOT EXISTS game_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    reward BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on user_id for fast queries
CREATE INDEX IF NOT EXISTS idx_game_ledger_user_id ON game_ledger(user_id DESC);

-- Create user_game_stats table (denormalized state)
CREATE TABLE IF NOT EXISTS user_game_stats (
    user_id TEXT PRIMARY KEY,
    total_karma BIGINT DEFAULT 0,
    total_soul_core_essence BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
