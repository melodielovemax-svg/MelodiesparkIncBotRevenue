import test from 'node:test';
import assert from 'node:assert';
import fetch from 'node-fetch';

const API_URL = 'http://localhost:3000';
let testsPassed = 0;
let testsFailed = 0;

// Helper to make API calls
async function apiCall(method, path, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    
    const res = await fetch(`${API_URL}${path}`, options);
    const data = await res.json();
    return { status: res.status, data };
}

// TEST 1: Health Check
test('Health endpoint returns 200 and healthy status', async () => {
    try {
        const { status, data } = await apiCall('GET', '/health');
        assert.strictEqual(status, 200, `Expected 200, got ${status}`);
        assert.strictEqual(data.status, 'healthy', 'Expected status=healthy');
        assert(data.timestamp, 'Expected timestamp in response');
        testsPassed++;
        console.log('✅ PASS: Health endpoint');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Health endpoint -', err.message);
    }
});

// TEST 2: Game Event - Server-Authoritative Reward Calculation
test('POST /api/v1/game/event computes server-authoritative rewards', async () => {
    try {
        const { status, data } = await apiCall('POST', '/api/v1/game/event', {
            userId: 'user_001',
            eventType: 'BOSS_KILL',
            clientValue: 999 // Client tries to send 999, should be ignored
        });
        
        assert.strictEqual(status, 200, `Expected 200, got ${status}`);
        assert.strictEqual(data.karmaAwarded, 100, 'Expected karma=100 for BOSS_KILL (server-authoritative)');
        assert.strictEqual(data.verified, true, 'Expected verified=true');
        testsPassed++;
        console.log('✅ PASS: Server-authoritative game event');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Server-authoritative game event -', err.message);
    }
});

// TEST 3: Different Event Type - Different Reward
test('Different event types receive correct server-authoritative rewards', async () => {
    try {
        const { status, data } = await apiCall('POST', '/api/v1/game/event', {
            userId: 'user_002',
            eventType: 'QUEST_COMPLETE'
        });
        
        assert.strictEqual(status, 200);
        assert.strictEqual(data.karmaAwarded, 50, 'Expected karma=50 for QUEST_COMPLETE');
        testsPassed++;
        console.log('✅ PASS: Different event reward calculation');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Different event reward calculation -', err.message);
    }
});

// TEST 4: Unknown Event Type - Zero Reward
test('Unknown event types receive zero reward', async () => {
    try {
        const { status, data } = await apiCall('POST', '/api/v1/game/event', {
            userId: 'user_003',
            eventType: 'UNKNOWN_EVENT'
        });
        
        assert.strictEqual(status, 200);
        assert.strictEqual(data.karmaAwarded, 0, 'Expected karma=0 for unknown event');
        testsPassed++;
        console.log('✅ PASS: Unknown event type handling');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Unknown event type handling -', err.message);
    }
});

// TEST 5: Replay Protection - Same Event ID Rejected
test('Replay protection blocks duplicate events with same x-event-id', async () => {
    try {
        const eventId = `replay-test-${Date.now()}`;
        
        // First event - should succeed
        const options1 = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-event-id': eventId
            },
            body: JSON.stringify({
                userId: 'user_004',
                eventType: 'ITEM_COLLECT'
            })
        };
        
        const res1 = await fetch(`${API_URL}/api/v1/game/event`, options1);
        const data1 = await res1.json();
        assert.strictEqual(res1.status, 200, `First event failed: ${res1.status}`);
        
        // Second event with same ID - should be rejected
        const options2 = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-event-id': eventId
            },
            body: JSON.stringify({
                userId: 'user_004',
                eventType: 'ITEM_COLLECT'
            })
        };
        
        const res2 = await fetch(`${API_URL}/api/v1/game/event`, options2);
        const data2 = await res2.json();
        assert.strictEqual(res2.status, 409, `Expected 409 (Conflict), got ${res2.status}`);
        assert(data2.error.includes('Replay'), 'Expected error message about replay detection');
        
        testsPassed++;
        console.log('✅ PASS: Replay protection working');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Replay protection -', err.message);
    }
});

// TEST 6: Ledger Immutability - Events persist in database
test('Game events persist in immutable ledger', async () => {
    try {
        const userId = `user_ledger_${Date.now()}`;
        
        // Record an event
        await apiCall('POST', '/api/v1/game/event', {
            userId,
            eventType: 'BOSS_KILL'
        });
        
        // Retrieve ledger
        const { status, data } = await apiCall('GET', `/api/v1/game/ledger?userId=${userId}`);
        
        assert.strictEqual(status, 200);
        assert(data.ledger, 'Expected ledger array');
        assert(data.count > 0, 'Expected at least 1 ledger entry');
        assert.strictEqual(data.ledger[0].event_type, 'BOSS_KILL');
        
        testsPassed++;
        console.log('✅ PASS: Ledger immutability');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Ledger immutability -', err.message);
    }
});

// TEST 7: Metrics Endpoint
test('Prometheus metrics endpoint responds', async () => {
    try {
        const res = await fetch(`${API_URL}/metrics`);
        const text = await res.text();
        
        assert.strictEqual(res.status, 200);
        assert(text.includes('melodiespark_api_requests_total'), 'Expected prometheus metric');
        
        testsPassed++;
        console.log('✅ PASS: Metrics endpoint');
    } catch (err) {
        testsFailed++;
        console.error('❌ FAIL: Metrics endpoint -', err.message);
    }
});

// Run all tests
console.log('\n════════════════════════════════════════════════════');
console.log('  Melodiespark v0.4 Integration Test Suite');
console.log('════════════════════════════════════════════════════\n');

// Wait a moment then run tests
setTimeout(() => {
    console.log('\n════════════════════════════════════════════════════');
    console.log(`  Results: ${testsPassed} passed, ${testsFailed} failed`);
    console.log('════════════════════════════════════════════════════\n');
    
    if (testsFailed === 0) {
        console.log('✅✅✅ ALL TESTS PASSED ✅✅✅');
        process.exit(0);
    } else {
        console.log('❌ TESTS FAILED');
        process.exit(1);
    }
}, 2000);
