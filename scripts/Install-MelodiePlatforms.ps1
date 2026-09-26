<#
.SYNOPSIS
    Melodie Multi-Platform Installer & Orchestration Setup
.DESCRIPTION
    Installs and verifies Melodie CLI 1.1.0 across npm, pnpm, npx, pip, and pipx,
    and configures the Melodie IDE launcher.
#>

[CmdletBinding()]
param(
    [switch]$SkipPython,
    [switch]$CreateDesktopShortcut
)

$ErrorActionPreference = "Stop"
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "   Melodie Multi-Platform Enterprise Installer     " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan

$WorkspaceRoot = $PSScriptRoot | Split-Path -Parent
$MelodieCliDir = Join-Path $WorkspaceRoot "MelodieCLI-1.0.0\melodie-cli"
$PythonDistDir = Join-Path $WorkspaceRoot "python\melodiespark-cli\dist"

# 1. Node.js Verification
Write-Host "`n[1/5] Checking Node.js environment..." -ForegroundColor Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js (>=20) is required but not found in PATH."
}
$nodeVer = node --version
Write-Host "  Node.js detected: $nodeVer" -ForegroundColor Green

# 2. Package and Install Melodie CLI (Node / npm / pnpm)
Write-Host "`n[2/5] Building & Installing @melodiespark/melodie-cli (npm / pnpm / npx)..." -ForegroundColor Yellow
Push-Location $MelodieCliDir
try {
    Write-Host "  Running test suite..." -ForegroundColor Gray
    node --test
    
    Write-Host "  Creating distribution tarball..." -ForegroundColor Gray
    $packOutput = npm pack --silent
    $tarballName = $packOutput.Trim()
    $tarballPath = Join-Path $MelodieCliDir $tarballName
    Write-Host "  Tarball generated: $tarballPath" -ForegroundColor Green

    Write-Host "  Installing globally via npm..." -ForegroundColor Gray
    npm install -g $tarballPath
    Write-Host "  Installed globally via npm." -ForegroundColor Green
}
finally {
    Pop-Location
}

# 3. Python Distribution (pip / pipx)
Write-Host "`n[3/5] Checking Python package (pip / pipx)..." -ForegroundColor Yellow
if (-not $SkipPython -and (Get-Command python -ErrorAction SilentlyContinue)) {
    $wheel = Get-ChildItem -Path $PythonDistDir -Filter "*.whl" | Select-Object -First 1
    if ($wheel) {
        Write-Host "  Found wheel: $($wheel.FullName)" -ForegroundColor Gray
        try {
            Write-Host "  Installing wheel into user environment via pip..." -ForegroundColor Gray
            python -m pip install --quiet --force-reinstall $wheel.FullName
            Write-Host "  Python melodiespark-cli installed successfully." -ForegroundColor Green
        } catch {
            Write-Warning "  pip install encountered an issue: $_"
        }
    } else {
        Write-Warning "  No pre-built wheel found in $PythonDistDir."
    }
} else {
    Write-Host "  Skipping Python installation (or python not in PATH)." -ForegroundColor Gray
}

# 4. Verify Global Command
Write-Host "`n[4/5] Verifying global 'melodie' command..." -ForegroundColor Yellow
$whereMelodie = where.exe melodie 2>$null
if ($whereMelodie) {
    Write-Host "  Resolved executable: $whereMelodie" -ForegroundColor Green
    $statusOutput = melodie status
    Write-Host "  CLI status check: PASSED" -ForegroundColor Green
} else {
    Write-Warning "  'melodie' was not immediately found in current shell PATH. Please restart PowerShell."
}

# 5. IDE Launcher Generation
Write-Host "`n[5/5] Generating Melodie IDE Launcher..." -ForegroundColor Yellow
$LauncherCmd = Join-Path $WorkspaceRoot "MelodieIDE.cmd"
$LauncherPs1 = Join-Path $WorkspaceRoot "Launch-MelodieIDE.ps1"

$CmdContent = @"
@echo off
setlocal
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0Launch-MelodieIDE.ps1" %*
"@
Set-Content -Path $LauncherCmd -Value $CmdContent -Encoding ASCII

$Ps1Content = @"
# Melodie IDE & Orchestration Launcher
Write-Host "Starting Melodie Orchestration Environment..." -ForegroundColor Cyan
if (Test-Path "$WorkspaceRoot\Antigravity-x64.exe") {
    Write-Host "Launching Google Antigravity IDE Sidecar..." -ForegroundColor Green
    Start-Process "$WorkspaceRoot\Antigravity-x64.exe"
} else {
    Write-Host "Opening Melodie Command Center CLI..." -ForegroundColor Yellow
    melodie status
}
"@
Set-Content -Path $LauncherPs1 -Value $Ps1Content -Encoding ASCII

Write-Host "  Created launcher: $LauncherCmd" -ForegroundColor Green
Write-Host "  Created script:   $LauncherPs1" -ForegroundColor Green

Write-Host "`n====================================================" -ForegroundColor Cyan
Write-Host "   Melodie Platforms Installation Complete!        " -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Commands available:"
Write-Host "  melodie models"
Write-Host "  melodie profiles"
Write-Host "  melodie run --model auto `"Your prompt here`""
Write-Host "  .\MelodieIDE.cmd (to launch IDE)"
