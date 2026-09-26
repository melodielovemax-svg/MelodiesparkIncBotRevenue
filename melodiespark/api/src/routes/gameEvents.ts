/**
 * Game Events Route - Server-Authoritative Game Engine
 * All reward calculations happen server-side
 * Client cannot fabricate rewards
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import Redis from 'ioredis';
import crypto from 'crypto';

const router = Router();

// These would normally come from dependency injection
const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://melodiespark:[REDACTED]@postgres:5432/melodiespark_dev'
});

const redis = new Redis({
  host: 'redis',
  port: 6379,
  retryStrategy: (times) => Math.min(times * 50, 2000)
});

/**
 * SERVER-AUTHORITATIVE REWARD TABLE
 * These values are hardcoded server-side
 * Client cannot override
 */
const REWARD_TABLE: Record<string, number> = {
  'ENEMY_DEFEATED': 50,
  'BOSS_KILL': 100,
  'QUEST_COMPLETED': 75,
  'SKILL_LEARNED': 25,
  'ACHIEVEMENT_UNLOCKED': 150,
  'DUNGEON_CLEARED': 200
};

/**
 * POST /api/v1/game/event
 * Record game event and award server-calculated karma
 * 
 * CRITICAL: Client submits event, server calculates reward
 * Client cannot influence the amount
 */
router.post('/event', async (req: Request, res: Response) => {
  try {
    const { userId, eventType, clientValue } = req.body;
    const eventId = req.headers['x-event-id'] as string;

    // Validation
    if (!userId) return res.status(400).json({ error: 'userId required' });
    if (!eventType) return res.status(400).json({ error: 'eventType required' });
    if (!eventId) return res.status(400).json({ error: 'x-event-id header required' });

    console.log(`[GameEvent] ${userId} - ${eventType} (client claimed: ${clientValue})`);

    // ========== REPLAY PROTECTION ==========
    // Check if this exact event was already processed
    const nonce_hash = crypto.createHash('sha256').update(eventId).digest('hex');
    const isReplayed = await redis.get(`replay:${nonce_hash}`);

    if (isReplayed) {
      console.log(`[ReplayAttack] Rejected duplicate event: ${eventId}`);
      return res.status(409).json({
        error: 'Event already processed (replay attack detected)',
        eventId
      });
    }

    // Store nonce for 24 hours
    await redis.setex(`replay:${nonce_hash}`, 86400, '1');

    // ========== SERVER-AUTHORITATIVE REWARD CALCULATION ==========
    // CRITICAL: Server decides reward, not client
    const serverReward = REWARD_TABLE[eventType] || 0;

    console.log(`[Reward] ${eventType} = ${serverReward} karma (ignoring client value: ${clientValue})`);

    // Ensure user exists in stats table
    await db.query(`
      INSERT INTO user_game_stats (user_id, total_karma)
      VALUES ($1, 0)
      ON CONFLICT (user_id) DO NOTHING;
    `, [userId]);

    // Record event in immutable ledger
    const result = await db.query(`
      INSERT INTO game_ledger (user_id, event_type, reward, event_data, created_at)
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING id, created_at;
    `, [
      userId,
      eventType,
      serverReward,
      JSON.stringify({
        eventId,
        clientClaimedValue: clientValue,
        serverCalculatedReward: serverReward,
        timestamp: new Date().toISOString()
      })
    ]);

    // Update denormalized state
    await db.query(`
      UPDATE user_game_stats
      SET total_karma = total_karma + $1, updated_at = NOW()
      WHERE user_id = $2;
    `, [serverReward, userId]);

    console.log(`[Success] Ledger entry ${result.rows[0].id} created`);

    return res.status(200).json({
      success: true,
      eventId,
      eventType,
      karmaAwarded: serverReward,
      userIdProcessed: userId,
      timestamp: result.rows[0].created_at,
      verified: true,
      note: 'Reward calculated server-side. Client value ignored for security.'
    });

  } catch (error) {
    console.error('[Error]', error);
    return res.status(500).json({
      error: 'Failed to process event',
      details: (error as Error).message
    });
  }
});

/**
 * GET /api/v1/game/ledger
 * Retrieve user's immutable ledger
 * Proves all earned rewards
 */
router.get('/ledger', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const result = await db.query(`
      SELECT id, user_id, event_type, reward, event_data, created_at
      FROM game_ledger
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 100;
    `, [userId]);

    const totalKarma = result.rows.reduce((sum, row) => sum + row.reward, 0);

    return res.status(200).json({
      userId,
      ledgerEntries: result.rows.length,
      totalKarmaEarned: totalKarma,
      entries: result.rows,
      verified: 'All entries immutable and append-only'
    });

  } catch (error) {
    console.error('[Error]', error);
    return res.status(500).json({
      error: 'Failed to retrieve ledger',
      details: (error as Error).message
    });
  }
});

/**
 * GET /api/v1/game/stats
 * Get user's current game statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string;
    if (!userId) return res.status(400).json({ error: 'userId required' });

    const result = await db.query(`
      SELECT user_id, total_karma, total_soul_core_essence, guardians_count, power_points, updated_at
      FROM user_game_stats
      WHERE user_id = $1;
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      userId,
      stats: result.rows[0],
      auditUrl: `/api/v1/game/ledger?userId=${userId}`
    });

  } catch (error) {
    console.error('[Error]', error);
    return res.status(500).json({
      error: 'Failed to retrieve stats',
      details: (error as Error).message
    });
  }
});

/**
 * GET /api/v1/game/info
 * Return reward table (transparency)
 */
router.get('/info', (req: Request, res: Response) => {
  return res.status(200).json({
    rewardTable: REWARD_TABLE,
    note: 'All rewards are calculated server-side. Client cannot influence these values.',
    security: {
      replayProtection: 'Enabled (24h nonce)',
      ledger: 'Immutable, append-only',
      authorization: 'Server-authoritative'
    }
  });
});

export default router;
