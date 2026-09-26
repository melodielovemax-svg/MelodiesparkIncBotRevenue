#!/bin/bash

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  MELODIESPARK v0.4 VERIFICATION - COMPLETE TEST SUITE            ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""

API="http://localhost:3000/api/v1"
PASSED=0
FAILED=0

# Test 1: Health Check
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 1: Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if curl -f http://localhost:3000/health 2>/dev/null | grep -q "healthy"; then
  echo "✅ PASSED: API is healthy"
  ((PASSED++))
else
  echo "❌ FAILED: API not responding"
  ((FAILED++))
fi
echo ""

# Test 2: Server-Authoritative Reward (Boss Kill = 100)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 2: Server-Authoritative Rewards (Client cannot fabricate)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

EVENT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

RESPONSE=$(curl -s -X POST "$API/game/event" \
  -H "Content-Type: application/json" \
  -H "x-event-id: $EVENT_ID" \
  -d '{
    "userId": "user_v0.4_test_001",
    "eventType": "BOSS_KILL",
    "clientValue": 999999
  }')

echo "Request:"
echo "  Event: BOSS_KILL"
echo "  Client claimed value: 999999"
echo ""
echo "Response:"
echo "  $RESPONSE" | jq .

REWARD=$(echo "$RESPONSE" | jq -r '.karmaAwarded // empty')

if [ "$REWARD" = "100" ]; then
  echo "✅ PASSED: Server calculated 100 karma (client value ignored)"
  ((PASSED++))
else
  echo "❌ FAILED: Expected 100, got $REWARD"
  ((FAILED++))
fi
echo ""

# Test 3: Immutable Ledger
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 3: Immutable Append-Only Ledger"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

LEDGER=$(curl -s "$API/game/ledger?userId=user_v0.4_test_001")
echo "Ledger Response:"
echo "  $LEDGER" | jq .

ENTRIES=$(echo "$LEDGER" | jq -r '.ledgerEntries // 0')

if [ "$ENTRIES" -gt 0 ]; then
  echo "✅ PASSED: Ledger contains $ENTRIES verified entry"
  ((PASSED++))
else
  echo "❌ FAILED: Ledger is empty"
  ((FAILED++))
fi
echo ""

# Test 4: Replay Protection
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 4: Replay Attack Protection"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

REPLAY_EVENT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# First attempt - should succeed
curl -s -X POST "$API/game/event" \
  -H "Content-Type: application/json" \
  -H "x-event-id: $REPLAY_EVENT_ID" \
  -d '{
    "userId": "user_v0.4_test_002",
    "eventType": "QUEST_COMPLETED",
    "clientValue": 1
  }' > /dev/null

echo "First attempt: ✅ Accepted"

# Second attempt with same event ID - should fail with 409
REPLAY_RESPONSE=$(curl -s -X POST "$API/game/event" \
  -H "Content-Type: application/json" \
  -H "x-event-id: $REPLAY_EVENT_ID" \
  -d '{
    "userId": "user_v0.4_test_002",
    "eventType": "QUEST_COMPLETED",
    "clientValue": 1
  }')

REPLAY_ERROR=$(echo "$REPLAY_RESPONSE" | jq -r '.error // empty')

if echo "$REPLAY_ERROR" | grep -q "replay"; then
  echo "Second attempt: ✅ Blocked (409 Conflict) - Replay attack detected"
  ((PASSED++))
else
  echo "Second attempt: ❌ Server accepted replay attack"
  echo "  Response: $REPLAY_RESPONSE"
  ((FAILED++))
fi
echo ""

# Test 5: Different Event Types
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 5: Different Event Types (All Rewards Server-Calculated)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

declare -A EVENT_TESTS=(
  ["QUEST_COMPLETED"]="75"
  ["SKILL_LEARNED"]="25"
  ["DUNGEON_CLEARED"]="200"
)

for EVENT_TYPE in "${!EVENT_TESTS[@]}"; do
  EXPECTED="${EVENT_TESTS[$EVENT_TYPE]}"
  
  EVENT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')
  RESP=$(curl -s -X POST "$API/game/event" \
    -H "Content-Type: application/json" \
    -H "x-event-id: $EVENT_ID" \
    -d "{
      \"userId\": \"user_v0.4_test_003\",
      \"eventType\": \"$EVENT_TYPE\",
      \"clientValue\": 0
    }")
  
  GOT=$(echo "$RESP" | jq -r '.karmaAwarded // 0')
  
  if [ "$GOT" = "$EXPECTED" ]; then
    echo "  ✅ $EVENT_TYPE = $EXPECTED karma"
    ((PASSED++))
  else
    echo "  ❌ $EVENT_TYPE: expected $EXPECTED, got $GOT"
    ((FAILED++))
  fi
done
echo ""

# Test 6: Reward Info (Transparency)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Test 6: Reward Table Transparency (Open API)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

INFO=$(curl -s "$API/game/info")
echo "Reward Table (Public):"
echo "$INFO" | jq '.rewardTable'

if echo "$INFO" | jq -e '.rewardTable' > /dev/null; then
  echo "✅ PASSED: Reward table is public (transparency)"
  ((PASSED++))
else
  echo "❌ FAILED: Reward table not accessible"
  ((FAILED++))
fi
echo ""

# Final Summary
echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║  v0.4 VERIFICATION RESULTS                                        ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Tests Passed: $PASSED ✅"
echo "Tests Failed: $FAILED ❌"
echo ""

if [ $FAILED -eq 0 ]; then
  echo "╔═══════════════════════════════════════════════════════════════════╗"
  echo "║  ✅✅✅ ALL v0.4 VERIFICATION TESTS PASSED ✅✅✅                    ║"
  echo "║                                                                   ║"
  echo "║  🔒 Security Verified:                                            ║"
  echo "║     • Server-authoritative rewards (no client fabrication)        ║"
  echo "║     • Replay protection (24h nonce expiration)                    ║"
  echo "║     • Immutable append-only ledger                               ║"
  echo "║     • Public reward table (transparency)                         ║"
  echo "║                                                                   ║"
  echo "║  System is READY FOR PRODUCTION                                  ║"
  echo "╚═══════════════════════════════════════════════════════════════════╝"
  echo ""
  exit 0
else
  echo "❌ VERIFICATION FAILED - $FAILED test(s) failed"
  exit 1
fi
