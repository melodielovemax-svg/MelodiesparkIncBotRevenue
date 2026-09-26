$baseUrl = "http://localhost:3000/api/v1"
Write-Host "
--- STARTING v0.4 FINAL VERIFICATION ---
" -ForegroundColor Cyan

function Run-Test($name, $method, $endpoint, $body, $expectedStatus, $expectedValue) {
    Write-Host "Testing: $name... " -NoNewline
    try {
        $headers = @{ "x-event-id" = [guid]::NewGuid().ToString() }
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method $method -Body ($body | ConvertTo-Json) -ContentType "application/json" -Headers $headers -ErrorAction Stop
        
        if ($response.reward -eq $expectedValue -or $response.status -eq $expectedValue) {
            Write-Host "✅ PASSED" -ForegroundColor Green
            return $true
        }
        Write-Host "❌ FAILED (Got $(.reward))" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq $expectedStatus) {
            Write-Host "✅ PASSED (Expected Error $expectedStatus)" -ForegroundColor Green
            return $true
        }
        Write-Host "❌ FAILED: $(.Exception.Message)" -ForegroundColor Red
    }
    return $false
}

# Test 1: Replay Protection
$eventId = [guid]::NewGuid().ToString()
$payload = @{ userId="user_test"; eventType="BOSS_KILL" }
$headers = @{ "x-event-id" = $eventId }
try {
    Invoke-RestMethod -Uri "$baseUrl/game/event" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "Testing: Replay First Attempt... ✅ PASSED" -ForegroundColor Green
} catch { Write-Host "Testing: Replay First Attempt... ❌ FAILED" -ForegroundColor Red }

try {
    Invoke-RestMethod -Uri "$baseUrl/game/event" -Method Post -Body ($payload | ConvertTo-Json) -ContentType "application/json" -Headers $headers -ErrorAction Stop | Out-Null
    Write-Host "Testing: Replay Second Attempt... ❌ FAILED" -ForegroundColor Red
} catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode.value__ -eq 409) { Write-Host "Testing: Replay Second Attempt... ✅ PASSED" -ForegroundColor Green }
}

# Test 2: Authoritative Reward
Run-Test "Authoritative Reward (Boss Kill)" "Post" "/game/event" @{ userId="user_test"; eventType="BOSS_KILL" } 201 100

# Test 3: Ledger Integrity
Write-Host "Testing: Ledger Entry... " -NoNewline
try {
    $ledger = Invoke-RestMethod -Uri "$baseUrl/game/ledger?userId=user_test" -Method Get -ErrorAction Stop
    if ($ledger.ledgerEntries -gt 0) { Write-Host "✅ PASSED" -ForegroundColor Green } else { Write-Host "❌ FAILED" -ForegroundColor Red }
} catch { Write-Host "❌ FAILED" -ForegroundColor Red }

# Test 4: Transparency
Write-Host "Testing: Reward Table... " -NoNewline
try {
    $info = Invoke-RestMethod -Uri "$baseUrl/game/info" -Method Get -ErrorAction Stop
    if ($info.rewardTable -ne $null) { Write-Host "✅ PASSED" -ForegroundColor Green } else { Write-Host "❌ FAILED" -ForegroundColor Red }
} catch { Write-Host "❌ FAILED" -ForegroundColor Red }

Write-Host "
--- VERIFICATION COMPLETE ---
" -ForegroundColor Cyan
