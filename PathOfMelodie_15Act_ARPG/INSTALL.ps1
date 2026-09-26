
[CmdletBinding()]
param([string]$InstallRoot="$env:USERPROFILE\PathOfMelodie15Act")
$ErrorActionPreference="Stop"
New-Item -ItemType Directory -Force -Path $InstallRoot | Out-Null
$zip=Join-Path $PSScriptRoot "PathOfMelodie_15Act_ARPG.zip"
Expand-Archive -Path $zip -DestinationPath $InstallRoot -Force
Write-Host "Installed to $InstallRoot" -ForegroundColor Green
Write-Host "Open project.godot in Godot 4, then Run Project." -ForegroundColor Cyan
