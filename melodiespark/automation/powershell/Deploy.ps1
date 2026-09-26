#requires -Version 7.0
<#
  Validation-only deployment gate. This script never deploys a financial or
  production system by itself. Staging and production require a separately
  approved release pipeline and a human owner.
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [ValidateSet('local', 'staging', 'production')]
  [string]$Target = 'local',
  [string]$CommandCenterRoot = '',
  [switch]$Approved
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if ([string]::IsNullOrWhiteSpace($CommandCenterRoot)) {
  $CommandCenterRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\MelodiesparkCommandCenter'))
}
$CommandCenterRoot = [IO.Path]::GetFullPath($CommandCenterRoot)
if (-not (Test-Path -LiteralPath (Join-Path $CommandCenterRoot 'package.json') -PathType Leaf)) {
  throw "Command Center package not found: $CommandCenterRoot"
}
if ($Target -ne 'local' -and -not $Approved) {
  throw "Deployment target '$Target' requires explicit human approval and a reviewed release pipeline."
}
if ($Target -ne 'local') {
  throw "This consolidation package does not perform remote deployment. Use an approved CI/CD pipeline after review."
}
if (-not $PSCmdlet.ShouldProcess($CommandCenterRoot, 'Run local deployment validation')) { return }
Push-Location $CommandCenterRoot
try {
  Write-Host '[DEPLOY] Running local validation only; no remote deployment.' -ForegroundColor Cyan
  & npm test
  if ($LASTEXITCODE -ne 0) { throw "Local validation failed with exit code $LASTEXITCODE." }
  Write-Host '[DEPLOY] Local validation passed.' -ForegroundColor Green
}
finally {
  Pop-Location
}
