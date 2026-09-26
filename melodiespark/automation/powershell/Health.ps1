#requires -Version 7.0
[CmdletBinding(SupportsShouldProcess = $true)]
param(
  [string]$CommandCenterRoot = '',
  [ValidateRange(1, 10000)]
  [int]$Cycles = 1
)

$script = Join-Path $PSScriptRoot 'QuantumMatrix.ps1'
& $script -Action Cycle -CommandCenterRoot $CommandCenterRoot -Cycles $Cycles
