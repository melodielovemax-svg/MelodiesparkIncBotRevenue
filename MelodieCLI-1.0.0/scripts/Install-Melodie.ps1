[CmdletBinding()]
param(
    [string]$InstallRoot = "$env:USERPROFILE\MelodieCLI"
)

$ErrorActionPreference = "Stop"

Write-Host "== Melodie CLI Installer ==" -ForegroundColor Cyan

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "Node.js is required. Install Node.js 20+ and reopen PowerShell."
}

$nodeVersion = node --version
Write-Host "Node.js: $nodeVersion"

$SourceRoot = Split-Path -Parent $PSScriptRoot

New-Item -ItemType Directory -Force $InstallRoot | Out-Null

Copy-Item "$SourceRoot\package.json" "$InstallRoot\package.json" -Force
Copy-Item "$SourceRoot\src" "$InstallRoot\src" -Recurse -Force
if (Test-Path "$SourceRoot\config") {
    Copy-Item "$SourceRoot\config" "$InstallRoot\config" -Recurse -Force
}

$Bin = Join-Path $InstallRoot "bin"
New-Item -ItemType Directory -Force $Bin | Out-Null

$Shim = Join-Path $Bin "melodie.cmd"

@"
@echo off
node "$InstallRoot\src\cli.js" %*
"@ | Set-Content $Shim -Encoding ASCII

$UserPath = [Environment]::GetEnvironmentVariable("Path", "User")

if (-not $UserPath) {
    $UserPath = ""
}

$Paths = $UserPath -split ";" | Where-Object { $_ }

if ($Paths -notcontains $Bin) {
    [Environment]::SetEnvironmentVariable(
        "Path",
        (($Paths + $Bin) -join ";"),
        "User"
    )
}

Write-Host ""
Write-Host "Melodie CLI installed successfully." -ForegroundColor Green
Write-Host "Install location: $InstallRoot"
Write-Host "Executable: $Shim"
Write-Host ""
Write-Host "Close PowerShell and open a NEW PowerShell window."
Write-Host "Then run:"
Write-Host "  melodie status"
Write-Host "  melodie providers"
