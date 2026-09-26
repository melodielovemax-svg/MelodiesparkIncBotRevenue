#requires -Version 5.1
# MELODIESPARK INC - ENTERPRISE FOUNDATION BUILDER
# Safe / Idempotent / Evidence-first / Finance read-only

$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$ROOT = "C:\Melodie"
$UTF8 = New-Object System.Text.UTF8Encoding $false

Write-Host "============================================================"
Write-Host " MELODIESPARK INC - ENTERPRISE FOUNDATION BUILDER"
Write-Host " TARGET ROOT: $ROOT"
Write-Host "============================================================"

Write-Host "[CHECK] Validating drive access..."
try {
    $driveLetter = Split-Path -Qualifier $ROOT
    if (-not (Test-Path -LiteralPath $driveLetter)) {
        throw "The drive $driveLetter is not connected or not ready."
    }
    $testFile = Join-Path $ROOT "write_test.tmp"
    if (-not (Test-Path -LiteralPath $ROOT)) {
        New-Item -ItemType Directory -Path $ROOT -Force -ErrorAction Stop | Out-Null
    }
    [IO.File]::WriteAllText($testFile, "test", $UTF8)
    [IO.File]::Delete($testFile)
    Write-Host "[OK] Drive $driveLetter is ready and writeable."
}
catch {
    Write-Host "[CRITICAL ERROR] DRIVE NOT READY"
    Write-Host "The path $ROOT is inaccessible."
    Write-Host "Reason: $($_.Exception.Message)"
    Write-Host "FIX: Please change the `$ROOT variable at the top of the script."
    exit
}

function Ensure-Dir {
    param([Parameter(Mandatory)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path)) {
        try {
            New-Item -ItemType Directory -Path $Path -Force -ErrorAction Stop | Out-Null
            Write-Host "[DIR]  $Path"
        }
        catch {
            throw "Failed to create directory $Path. Error: $($_.Exception.Message)"
        }
    }
}

function Write-SafeFile {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)][AllowEmptyString()][string]$Content
    )
    $parent = Split-Path -Parent $Path
    if ($parent) { Ensure-Dir $parent }

    if ([IO.Path]::GetFileName($Path) -match '^\.env($|\.)') {
        if (Test-Path -LiteralPath $Path) {
            Write-Host "[KEEP] $Path"
            return
        }
    }

    try {
        if (-not (Test-Path -LiteralPath $Path)) {
            [IO.File]::WriteAllText($Path, $Content, $UTF8)
            Write-Host "[FILE] $Path"
        } else {
            Write-Host "[KEEP] $Path"
        }
    }
    catch {
        throw "Failed to write file $Path. Error: $($_.Exception.Message)"
    }
}

function Write-JsonSafe {
    param(
        [Parameter(Mandatory)][string]$Path,
        [Parameter(Mandatory)]$Object
    )
    $json = $Object | ConvertTo-Json -Depth 20
    Write-SafeFile $Path $json
}

$Directories = @(
    ".github", ".github\workflows", ".github\ISSUE_TEMPLATE", ".vscode",
    "apps", "apps\web", "apps\api", "apps\admin", "apps\command-center", "apps\storefront", "apps\evidence-dashboard", "apps\developer-portal",
    "services", "services\phoenix-kernel", "services\kayla-orchestrator", "services\melodie-gateway", "services\botrevenue", "services\identity-nexus", "services\legal-nexus", "services\evidence-nexus", "services\entitlement", "services\catalog", "services\fulfillment", "services\notifications", "services\observability",
    "packages", "packages\shared", "packages\config", "packages\database", "packages\schemas", "packages\events", "packages\security", "packages\evidence", "packages\contracts", "packages\ui", "packages\sdk", "packages\agent-runtime", "packages\mcp", "packages\payments", "packages\wallet", "packages\game",
    "platform", "platform\kernel", "platform\runtime", "platform\control-plane", "platform\data-plane", "platform\event-plane", "platform\evidence-plane",
    "phoenix", "phoenix\kernel", "phoenix\orchestrator", "phoenix\builder", "phoenix\studio", "phoenix\workflows", "phoenix\contracts", "phoenix\evidence",
    "kayla", "kayla\orchestrator", "kayla\agents", "kayla\skills", "kayla\policies", "kayla\workflows",
    "melodiecli", "melodiecli\src", "melodiecli\commands", "melodiecli\modules", "melodiecli\tests",
    "gateway", "gateway\src", "gateway\providers", "gateway\routing", "gateway\policies",
    "botrevenue", "botrevenue\api", "botrevenue\catalog", "botrevenue\checkout", "botrevenue\fulfillment", "botrevenue\ledger", "botrevenue\reconciliation", "botrevenue\evidence",
    "metamello", "metamello\wallet", "metamello\observer", "metamello\rpc", "metamello\policies", "metamello\evidence",
    "nexus", "nexus\identity", "nexus\legal", "nexus\evidence", "nexus\commerce", "nexus\security",
    "commerce", "commerce\catalog", "commerce\products", "commerce\pricing", "commerce\orders", "commerce\payments", "commerce\entitlements", "commerce\delivery", "commerce\support",
    "enterprise", "enterprise\governance", "enterprise\finance", "enterprise\sales", "enterprise\marketing", "enterprise\operations", "enterprise\security", "enterprise\legal", "enterprise\product", "enterprise\engineering", "enterprise\customer-success",
    "docs", "docs\architecture", "docs\business", "docs\corporate", "docs\engineering", "docs\governance", "docs\legal", "docs\operations", "docs\product", "docs\security", "docs\release", "docs\runbooks", "docs\adr", "docs\api",
    "schemas", "schemas\events", "schemas\evidence", "schemas\commerce", "schemas\identity", "schemas\wallet",
    "infra", "infra\docker", "infra\kubernetes", "infra\terraform", "infra\nats", "infra\postgres", "infra\redis", "infra\observability", "infra\scripts",
    "security", "security\policies", "security\scans", "security\incident-response", "security\threat-models",
    "evidence", "evidence\build", "evidence\tests", "evidence\security", "evidence\release", "evidence\payments", "evidence\deployments", "evidence\acceptance", "evidence\audit",
    "tests", "tests\unit", "tests\integration", "tests\e2e", "tests\acceptance", "tests\security", "tests\smoke",
    "scripts", "scripts\build", "scripts\dev", "scripts\test", "scripts\release", "scripts\security", "scripts\evidence",
    "tools", "tools\generators", "tools\validators", "tools\migration",
    "games", "games\path-of-melodie", "games\path-of-melodie\design", "games\path-of-melodie\data", "games\path-of-melodie\art", "games\path-of-melodie\godot", "games\path-of-melodie\unreal",
    "archive"
)

foreach ($dir in $Directories) {
    Ensure-Dir (Join-Path $ROOT $dir)
}

Write-SafeFile "$ROOT\README.md" "# Melodiespark Inc.`nUnified AI-native enterprise platform."
Write-SafeFile "$ROOT\docs\corporate\CORPORATE-CHARTER.md" "# Melodiespark Inc. - Corporate Charter`nMission: Build secure, evidence-driven AI-native software."
Write-SafeFile "$ROOT\docs\architecture\PLATFORM-ARCHITECTURE.md" "# Platform Architecture`nControl Plane / Runtime Plane / Commerce Plane."
Write-SafeFile "$ROOT\docs\governance\EVIDENCE-POLICY.md" "# Evidence Policy`nReality and evidence outrank automation."

$TreasuryPolicy = @{
    version = "1.0"; enabled = $true; read_only = $true; require_human_approval = $true;
    allow_broadcast = $false; allow_transfers = $false; max_transaction_value = 0; evidence_required = $true
}
Write-JsonSafe "$ROOT\metamello\policies\treasury-policy.json" $TreasuryPolicy

$EvidencePolicy = @{
    schema_version = "1.0"; allowed_statuses = @("VERIFIED", "UNVERIFIED", "BLOCKED", "DISABLED", "DRAFT", "PENDING_APPROVAL", "FAILED", "COMPLETED")
    fabricated_evidence_forbidden = $true; simulated_revenue_forbidden = $true
}
Write-JsonSafe "$ROOT\security\policies\evidence-policy.json" $EvidencePolicy

$Packages = @("shared", "config", "database", "schemas", "events", "security", "evidence", "contracts", "ui", "sdk", "agent-runtime", "mcp", "payments", "wallet", "game")
foreach ($pkg in $Packages) {
    $name = "@melodiespark/$pkg"
    Write-JsonSafe "$ROOT\packages\$pkg\package.json" @{ name = $name; version = "0.1.0"; private = $true; type = "module" }
    Ensure-Dir "$ROOT\packages\$pkg\src"
    Write-SafeFile "$ROOT\packages\$pkg\src\index.ts" "// Package: $name`nexport const version = '0.1.0';"
}

Write-JsonSafe "$ROOT\package.json" @{ name = "melodiespark-enterprise"; version = "0.1.0"; private = $true; packageManager = "pnpm@latest" }
Write-SafeFile "$ROOT\pnpm-workspace.yaml" "packages:`n  - 'apps/*'`n  - 'packages/*'`n  - 'services/*'"
Write-SafeFile "$ROOT\.gitignore" "node_modules/`n.env`n.turbo/`ndist/"

Write-Host "[VERIFY] Running real disk inventory..."

$ActualDirs = (Get-ChildItem $ROOT -Directory -Recurse -ErrorAction SilentlyContinue).Count
$ActualFiles = (Get-ChildItem $ROOT -File -Recurse -ErrorAction SilentlyContinue).Count

Write-Host "============================================================"
Write-Host " MELODIESPARK ENTERPRISE FOUNDATION CREATED"
Write-Host "============================================================"
Write-Host "ROOT              : $ROOT"
Write-Host "Actual Directories: $ActualDirs"
Write-Host "Actual Files      : $ActualFiles"
Write-Host "Finance Status    : READ_ONLY"
Write-Host "Release Status    : BLOCKED"
Write-Host "============================================================"

if ($ActualFiles -eq 0) {
    Write-Host "WARNING: 0 files created. Check your permissions!"
} else {
    Write-Host "Foundation successfully written to disk."
}