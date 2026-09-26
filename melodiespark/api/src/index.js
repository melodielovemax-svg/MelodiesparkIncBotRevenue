import Fastify from 'fastify';
import pg from 'pg';
import Redis from 'ioredis';
import cors from '@fastify/cors'; // ADDED THIS

const fastify = Fastify({ logger: true });

// ENABLE CORS - This allows localhost:3000 to talk to your frontend
fastify.register(cors, { 
  origin: true // In production, replace with your actual domain
});

fastify.register(async (instance) => {
    instance.decorate('db', new pg.Pool({ 
        connectionString: process.env.DATABASE_URL || 'postgresql://melodiespark:development-only@localhost:5432/melodiespark' 
    }));
    instance.decorate('cache', new Redis(process.env.REDIS_URL || 'redis://localhost:6379'));
}, { name: 'infra-plugin' });

fastify.addHook('preHandler', async (request, reply) => {
    if (request.url === '/health' || request.url === '/api/v1/game/info' || request.url === '/api/v1/game/ledger') return;
    const eventId = request.headers['x-event-id'];
    if (!eventId) return reply.status(400).send({ error: 'Missing x-event-id' });
    const isReplayed = await fastify.cache.get(`replay:${eventId}`);
    if (isReplayed) return reply.status(409).send({ error: 'Replay Attack Detected' });
    await fastify.cache.set(`replay:${eventId}`, '1', 'EX', 86400);
});

fastify.get('/health', async () => ({ status: 'healthy' }));
fastify.get('/api/v1/game/info', async () => {
    return { rewardTable: { 'BOSS_KILL': 100, 'QUEST_COMPLETE': 50, 'ITEM_COLLECT': 10 } };
});
fastify.get('/api/v1/game/ledger', async (request) => {
    const { userId } = request.query;
    const result = await fastify.db.query('SELECT * FROM game_ledger WHERE user_id = $1', [userId]);
    return { userId, ledgerEntries: result.rows.length, entries: result.rows };
});
fastify.post('/api/v1/game/event', async (request, reply) => {
    const { userId, eventType } = request.body;
    const RewardTable = { 'BOSS_KILL': 100, 'QUEST_COMPLETE': 50, 'ITEM_COLLECT': 10 };
    const reward = RewardTable[eventType] || 0;
    try {
        await fastify.db.query('INSERT INTO game_ledger (user_id, event_type, reward) VALUES ($1, $2, $3)', [userId, eventType, reward]);
        return { status: 'VERIFIED', reward: reward };
    } catch (e) { return reply.status(500).send({ error: 'Ledger Failure' }); }
});

const start = async () => {
    try {
        await fastify.listen({ port: 3000, host: '0.0.0.0' });
        console.log('🚀 v0.4 Backend Engine Live on Port 3000');
    } catch (err) { process.exit(1); }
};
start();
