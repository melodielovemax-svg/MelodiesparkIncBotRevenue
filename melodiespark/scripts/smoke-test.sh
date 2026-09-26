#!/bin/bash
# Melodiespark v0.4 Smoke Test

set -e

API="http://localhost:3000/api/v1"
PASSED=0
FAILED=0

echo "════════════════════════════════════════════════════"
echo "  Melodiespark v0.4 Smoke Test"
echo "════════════════════════════════════════════════════"
echo ""

echo "[1/6] Testing API health..."
if curl -f http://localhost:3000/health > /dev/null 2>&1; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

echo "[2/6] Testing user registration..."
REGISTER=$(curl -s -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"smoke_$(date +%s)@test.local\",\"password\":\"Test123!\"}")

TOKEN=$(echo $REGISTER | jq -r '.token // empty')
if [ ! -z "$TOKEN" ]; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

echo "[3/6] Testing authentication..."
if curl -s -H "Authorization: Bearer $TOKEN" $API/auth/me | jq -e '.user.id' > /dev/null 2>&1; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

echo "[4/6] Testing game event..."
EVENT=$(curl -s -X POST $API/game/event \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"enemy_defeated","enemyLevel":5,"playerLevel":3,"gameSessionId":"smoke"}')

if echo $EVENT | jq -e '.karmaAwarded' > /dev/null 2>&1; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

echo "[5/6] Testing ledger..."
if curl -s -H "Authorization: Bearer $TOKEN" "$API/game/ledger" | jq -e '.ledger' > /dev/null 2>&1; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL"
  ((FAILED++))
fi

echo "[6/6] Testing replay protection..."
REPLAY=$(curl -s -X POST $API/game/event \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"eventType":"enemy_defeated","enemyLevel":5,"playerLevel":3,"gameSessionId":"smoke"}')

if echo $REPLAY | jq -e '.error' > /dev/null 2>&1; then
  echo "✅ PASS"
  ((PASSED++))
else
  echo "❌ FAIL (replay protection did not block)"
  ((FAILED++))
fi

echo ""
echo "Passed: $PASSED / Failed: $FAILED"
if [ $FAILED -eq 0 ]; then
  echo "✅ ALL SMOKE TESTS PASSED"
  exit 0
else
  exit 1
fi
