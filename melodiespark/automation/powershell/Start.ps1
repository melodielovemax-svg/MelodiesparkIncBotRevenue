#requires -Version 7.0
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
  [string]$CommandCenterRoot = '',
  [switch]$Open
)

$script = Join-Path $PSScriptRoot 'QuantumMatrix.ps1'
$args = @{ Action = 'Start'; CommandCenterRoot = $CommandCenterRoot }
if ($Open) { $args.Open = $true }
& $script @args
