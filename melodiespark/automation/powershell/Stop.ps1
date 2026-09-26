#requires -Version 7.0
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
param(
  [string]$CommandCenterRoot = '',
  [Parameter(Mandatory = $true)]
  [int]$ProcessId
)

$script = Join-Path $PSScriptRoot 'QuantumMatrix.ps1'
& $script -Action Stop -CommandCenterRoot $CommandCenterRoot -ProcessId $ProcessId
