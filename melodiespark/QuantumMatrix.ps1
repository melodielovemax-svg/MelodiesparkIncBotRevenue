#requires -Version 7.0
<#
.SYNOPSIS
  Point d’entrée compatible du wrapper QuantumMatrix.

.DESCRIPTION
  Transmet les paramètres à automation/powershell/QuantumMatrix.ps1.
  Ce fichier ne contient aucune logique d’orchestration supplémentaire.
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [ValidateSet('Health', 'Cycle', 'Continuous', 'Initialize', 'Start', 'Stop', 'Status')]
    [string]$Action = 'Health',
    [string]$CommandCenterRoot = '',
    [ValidateRange(1, 10000)]
    [int]$Cycles = 1,
    [ValidateRange(30, 86400)]
    [int]$IntervalSeconds = 300,
    [ValidateRange(0, 2147483647)]
    [int]$ProcessId = 0,
    [switch]$SetPassword,
    [switch]$Open
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$canonical = Join-Path $PSScriptRoot 'automation\powershell\QuantumMatrix.ps1'
if (-not (Test-Path -LiteralPath $canonical -PathType Leaf)) {
    throw "Orchestrateur canonique introuvable : $canonical"
}

$description = "transmettre l’action $Action au wrapper canonique"
if (-not $PSCmdlet.ShouldProcess($canonical, $description)) { return }

$canonicalArguments = @{
    Action = $Action
    CommandCenterRoot = $CommandCenterRoot
    Cycles = $Cycles
    IntervalSeconds = $IntervalSeconds
    ProcessId = $ProcessId
    Confirm = $false
}
if ($SetPassword) { $canonicalArguments.SetPassword = $true }
if ($Open) { $canonicalArguments.Open = $true }

& $canonical @canonicalArguments
