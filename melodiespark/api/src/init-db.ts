/**
 * Database initialization script
 * Creates all required tables on startup
 */

import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://melodiespark:dev_password@postgres:5432/melodiespark_dev'
});

const initSchema = async () => {
  try {
    console.log('🔧 Initializing database schema...');

    // Game ledger table (immutable, append-only)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS game_ledger (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        event_type TEXT NOT NULL,
        reward BIGINT DEFAULT 0,
        event_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_game_ledger_user_id ON game_ledger(user_id DESC);
      CREATE INDEX IF NOT EXISTS idx_game_ledger_type ON game_ledger(event_type);
    `);
    console.log('✅ game_ledger table created');

    // User game stats table (denormalized state)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_game_stats (
        user_id TEXT PRIMARY KEY,
        total_karma BIGINT DEFAULT 0,
        total_soul_core_essence BIGINT DEFAULT 0,
        guardians_count INT DEFAULT 0,
        power_points BIGINT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ user_game_stats table created');

    // Replay protection table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS replay_protection (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        nonce_hash TEXT UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE INDEX IF NOT EXISTS idx_replay_expires ON replay_protection(expires_at);
    `);
    console.log('✅ replay_protection table created');

    // Rate limiting table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS rate_limit_buckets (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        bucket_key TEXT NOT NULL,
        request_count INT DEFAULT 0,
        reset_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, bucket_key)
      );
      
      CREATE INDEX IF NOT EXISTS idx_rate_limit_reset ON rate_limit_buckets(reset_at);
    `);
    console.log('✅ rate_limit_buckets table created');

    // Insert seed data
    await pool.query(`
      INSERT INTO user_game_stats (user_id, total_karma, power_points)
      VALUES ('user123', 0, 0)
      ON CONFLICT (user_id) DO NOTHING;
    `);
    console.log('✅ Seed data inserted');

    console.log('✅ Database schema initialized successfully\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
};

initSchema();
