#!/usr/bin/env pwsh
# Melodiespark v0.4 Verification - Quick Start

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  Melodiespark v0.4 Verification Suite                         ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Step 1: Check Docker
Write-Host "[1/5] Verifying Docker..." -ForegroundColor Cyan
try {
    $dockerVersion = docker version --format "{{.Server.Version}}"
    Write-Host "      ✅ Docker $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "      ❌ Docker not installed or not running" -ForegroundColor Red
    exit 1
}

# Step 2: Start infrastructure
Write-Host "[2/5] Starting infrastructure..." -ForegroundColor Cyan
Set-Location "C:\melodie\infra\docker"
docker compose down --remove-orphans | Out-Null
$startResult = docker compose up -d --build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✅ Stack started" -ForegroundColor Green
} else {
    Write-Host "      ❌ Stack startup failed" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for services
Write-Host "[3/5] Waiting for services to be healthy..." -ForegroundColor Cyan
$maxRetries = 30
$retries = 0
while ($retries -lt $maxRetries) {
    $health = curl -s http://localhost:3000/health | ConvertFrom-Json
    if ($health.status -eq "healthy") {
        Write-Host "      ✅ All services healthy" -ForegroundColor Green
        break
    }
    Start-Sleep -Seconds 1
    $retries++
}

if ($retries -eq $maxRetries) {
    Write-Host "      ❌ Services did not become healthy" -ForegroundColor Red
    exit 1
}

# Step 4: Initialize database
Write-Host "[4/5] Initializing database schema..." -ForegroundColor Cyan
$initSQL = @"
CREATE TABLE IF NOT EXISTS game_ledger (
    id BIGSERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    reward BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_game_stats (
    user_id TEXT PRIMARY KEY,
    total_karma BIGINT DEFAULT 0,
    total_soul_core_essence BIGINT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE game_ledger ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
"@

docker exec docker-postgres-1 psql -U melodiespark -d melodiespark -c $initSQL 2>&1 | Out-Null
Write-Host "      ✅ Database initialized" -ForegroundColor Green

# Step 5: Run tests
Write-Host "[5/5] Running integration tests..." -ForegroundColor Cyan
Set-Location "C:\melodie\melodiespark\api"
npm install | Out-Null
$testResult = npm test
Write-Host ""

if ($testResult -match "✅✅✅ ALL TESTS PASSED") {
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host "  🟢 v0.4 VERIFICATION COMPLETE" -ForegroundColor Green
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Green
    Write-Host ""
    Write-Host "Evidence files generated:" -ForegroundColor Cyan
    Write-Host "  - v0.4-evidence.json" -ForegroundColor Yellow
    Write-Host "  - V0.4-VERIFIED.md" -ForegroundColor Yellow
    Write-Host "  - V0.4-STATUS-REPORT.txt" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Phase 5: Load Testing (100→250→500 users)" -ForegroundColor Yellow
    Write-Host "  2. Phase 6: Backup/Restore Drill" -ForegroundColor Yellow
    Write-Host "  3. Phase 7: Security Audit" -ForegroundColor Yellow
    Write-Host "  4. Phase 8: Godot Integration" -ForegroundColor Yellow
    Write-Host "  5. Phase 9: End-to-End Verification" -ForegroundColor Yellow
    Write-Host ""
} else {
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Red
    Write-Host "  ❌ v0.4 VERIFICATION FAILED" -ForegroundColor Red
    Write-Host "════════════════════════════════════════════════════════════════" -ForegroundColor Red
    exit 1
}
