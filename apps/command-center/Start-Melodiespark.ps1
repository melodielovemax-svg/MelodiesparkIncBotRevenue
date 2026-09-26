#requires -Version 7.0
<#
.SYNOPSIS
  Launches the security-first Melodiespark Command Center.

.DESCRIPTION
  Initializes local secrets, installs the single runtime dependency, runs safe validation cycles,
  and starts the local dashboard. Safe cycles never trade, publish products, or move funds.

.EXAMPLE
  .\Start-Melodiespark.ps1 -Initialize -SetPassword -Open

.EXAMPLE
  .\Start-Melodiespark.ps1 -Cycles 3

.EXAMPLE
  .\Start-Melodiespark.ps1 -Continuous -IntervalSeconds 300 -Open
#>
[CmdletBinding()]
param(
    [string]$Root = $PSScriptRoot,
    [switch]$Initialize,
    [switch]$SetPassword,
    [switch]$SkipInstall,
    [switch]$Open,
    [switch]$Continuous,
    [ValidateRange(1, 10000)]
    [int]$Cycles = 1,
    [ValidateRange(30, 86400)]
    [int]$IntervalSeconds = 300
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Write-Stage([string]$Message) {
    Write-Host "[MELODIESPARK] $Message" -ForegroundColor Cyan
}

function Assert-Node {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { throw 'Node.js 22.5 or newer is required.' }
    $versionText = (& node --version).TrimStart('v')
    $version = [version]$versionText
    if ($version.Major -lt 22 -or ($version.Major -eq 22 -and $version.Minor -lt 5)) {
        throw "Node.js 22.5 or newer is required. Found $versionText."
    }
}

function Install-Dependencies {
    if ($SkipInstall) { return }
    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is required.' }
    Write-Stage 'Installing pinned project dependencies...'
    & npm install --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) { throw 'npm install failed.' }
}

function Set-AdminPassword {
    $secure = Read-Host 'Create administrator password (12+ characters)' -AsSecureString
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    try {
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
        if ($plain.Length -lt 12) { throw 'Password must contain at least 12 characters.' }
        $env:MELODIESPARK_PASSWORD = $plain
        & node (Join-Path $Root 'scripts\set-password.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Password setup failed.' }
    }
    finally {
        Remove-Item Env:MELODIESPARK_PASSWORD -ErrorAction SilentlyContinue
        if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
        $plain = $null
        $secure = $null
    }
}

Push-Location $Root
try {
    Assert-Node
    if ($Initialize) {
        Install-Dependencies
        Write-Stage 'Initializing local configuration and database...'
        & node (Join-Path $Root 'scripts\initialize.mjs')
        if ($LASTEXITCODE -ne 0) { throw 'Initialization failed.' }
    }
    else {
        Install-Dependencies
        if (-not (Test-Path (Join-Path $Root '.env'))) {
            Write-Stage 'No .env found; initializing a safe local configuration...'
            & node (Join-Path $Root 'scripts\initialize.mjs')
            if ($LASTEXITCODE -ne 0) { throw 'Initialization failed.' }
        }
    }

    if ($SetPassword) { Set-AdminPassword }

    if ($Continuous) {
        Write-Stage "Starting continuous safe cycles every $IntervalSeconds seconds. Press Ctrl+C to stop."
        & node (Join-Path $Root 'scripts\run-safe-cycle.mjs') '1' '--continuous' "--interval=$IntervalSeconds"
        if ($LASTEXITCODE -ne 0) { throw 'Safe cycle runner failed.' }
    }
    elseif ($Cycles -gt 0) {
        Write-Stage "Running $Cycles safe validation cycle(s)..."
        & node (Join-Path $Root 'scripts\run-safe-cycle.mjs') "$Cycles"
        if ($LASTEXITCODE -ne 0) { throw 'Safe cycle runner failed.' }
    }

    $port = 4173
    $envFile = Join-Path $Root '.env'
    if (Test-Path $envFile) {
        $portLine = Get-Content $envFile | Where-Object { $_ -match '^PORT=' } | Select-Object -Last 1
        if ($portLine -and $portLine -match '^PORT=(\d+)$') { $port = [int]$Matches[1] }
    }
    $url = "http://127.0.0.1:$port"

    Write-Stage 'Starting dashboard...'
    if ($Open) { Start-Process $url }
    & node (Join-Path $Root 'src\server.mjs')
    if ($LASTEXITCODE -ne 0) { throw 'Server exited with an error.' }
}
finally {
    Pop-Location
}
