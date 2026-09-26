#requires -Version 7.0
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
  [string]$CommandCenterRoot = '',
  [switch]$SetPassword,
  [switch]$Open
)

$script = Join-Path $PSScriptRoot 'QuantumMatrix.ps1'
$args = @{ Action = 'Initialize'; CommandCenterRoot = $CommandCenterRoot }
if ($SetPassword) { $args.SetPassword = $true }
if ($Open) { $args.Open = $true }
& $script @args
