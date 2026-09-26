#requires -Version 7.0
<#
  Backup local conservative : copie uniquement la base SQLite et produit un
  manifeste SHA-256. Ne copie jamais .env, les secrets ou les clés privées.
  Pour une base ouverte et écrite en continu, utiliser l’API de sauvegarde
  SQLite ou arrêter le service ; ce wrapper est une aide locale.
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
  [string]$CommandCenterRoot = '',
  [string]$DatabasePath = '',
  [string]$OutputDirectory = ''
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($CommandCenterRoot)) {
  $CommandCenterRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\MelodiesparkCommandCenter'))
}
$CommandCenterRoot = [IO.Path]::GetFullPath($CommandCenterRoot)
if ([string]::IsNullOrWhiteSpace($DatabasePath)) {
  $DatabasePath = Join-Path $CommandCenterRoot 'data\melodiespark.db'
}
if ([string]::IsNullOrWhiteSpace($OutputDirectory)) {
  $OutputDirectory = Join-Path $CommandCenterRoot 'backups'
}
$DatabasePath = [IO.Path]::GetFullPath($DatabasePath)
$OutputDirectory = [IO.Path]::GetFullPath($OutputDirectory)
if (-not (Test-Path -LiteralPath $DatabasePath -PathType Leaf)) {
  throw "Database not found: $DatabasePath"
}
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
$destination = Join-Path $OutputDirectory "backup-$stamp"
if (-not $PSCmdlet.ShouldProcess($destination, 'Create local database backup')) { return }
New-Item -ItemType Directory -Force -Path $destination | Out-Null
$databaseCopy = Join-Path $destination 'melodiespark.db'
Copy-Item -LiteralPath $DatabasePath -Destination $databaseCopy -Force
$hash = (Get-FileHash -LiteralPath $databaseCopy -Algorithm SHA256).Hash.ToLowerInvariant()
$manifest = [ordered]@{
  createdAt = (Get-Date).ToUniversalTime().ToString('o')
  source = $DatabasePath
  file = $databaseCopy
  algorithm = 'SHA256'
  hash = $hash
  containsSecrets = $false
  note = 'Secrets and environment files are intentionally excluded.'
}
$manifest | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $destination 'manifest.json') -Encoding UTF8
Write-Host "[BACKUP] Database backup created: $destination" -ForegroundColor Green
Write-Host "[BACKUP] SHA256: $hash" -ForegroundColor Green
