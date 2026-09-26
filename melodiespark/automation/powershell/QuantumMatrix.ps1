#requires -Version 7.0
<#
.SYNOPSIS
  Wrapper PowerShell borné pour le Melodiespark Command Center.

.DESCRIPTION
  QuantumMatrix démarre, valide et arrête le workflow local existant. Il ne
  crée aucun revenu, ne signe aucune transaction, ne déploie aucun smart
  contract et ne lance aucune action financière. Le mode continu délègue au
  runner Node, qui impose un intervalle minimal et s’arrête sur SIGINT.

.EXAMPLE
  .\QuantumMatrix.ps1 -Action Health

.EXAMPLE
  .\QuantumMatrix.ps1 -Action Cycle -Cycles 3

.EXAMPLE
  .\QuantumMatrix.ps1 -Action Continuous -IntervalSeconds 300

.EXAMPLE
  .\QuantumMatrix.ps1 -Action Initialize -SetPassword -Open

.EXAMPLE
  .\QuantumMatrix.ps1 -Action ProductSync

.EXAMPLE
  .\QuantumMatrix.ps1 -Action WalletVerify

.EXAMPLE
  .\QuantumMatrix.ps1 -Action TaskRun -TaskId health

.EXAMPLE
  .\QuantumMatrix.ps1 -Action RevReport
#>
[CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
param(
    [ValidateSet('Health', 'Cycle', 'Continuous', 'Initialize', 'Start', 'Stop', 'Status', 'ProductSync', 'WalletVerify', 'TaskRun', 'RevReport')]
    [string]$Action = 'Health',
    [string]$CommandCenterRoot = '',
    [ValidateRange(1, 10000)]
    [int]$Cycles = 1,
    [ValidateRange(30, 86400)]
    [int]$IntervalSeconds = 300,
    [ValidateRange(0, 2147483647)]
    [int]$ProcessId = 0,
    [string]$TaskId = '',
    [switch]$SetPassword,
    [switch]$Open
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
if (-not $IsWindows) {
    throw 'QuantumMatrix est conçu pour Windows et utilise CIM pour vérifier les processus.'
}

function Write-Stage([string]$Message) {
    Write-Host "[QUANTUM-MATRIX] $Message" -ForegroundColor Cyan
}

function Resolve-CommandCenterRoot {
    if ([string]::IsNullOrWhiteSpace($CommandCenterRoot)) {
        # Try multiple possible locations
        $legacyPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\MelodiesparkCommandCenter'))
        $newPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\apps\command-center'))
        $altPath = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..\..\apps\command-center'))
        
        if (Test-Path -LiteralPath $legacyPath -PathType Container) {
            return $legacyPath
        } elseif (Test-Path -LiteralPath $newPath -PathType Container) {
            return $newPath
        } elseif (Test-Path -LiteralPath $altPath -PathType Container) {
            return $altPath
        } else {
            return $legacyPath # Default to legacy path for error messages
        }
    }
    return [IO.Path]::GetFullPath($CommandCenterRoot)
}

function Assert-NodeVersion {
    if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
        throw 'Node.js 22.5 ou plus récent est requis.'
    }
    $versionOutput = & node --version
    if ($LASTEXITCODE -ne 0) { throw 'Impossible de déterminer la version de Node.js.' }
    $versionText = ([string]($versionOutput | Select-Object -First 1)).Trim()
    if ($versionText -notmatch '^v?(?<version>\d+\.\d+\.\d+)') {
        throw "Format de version Node.js non reconnu : $versionText."
    }
    $version = [version]$Matches['version']
    if ($version.Major -lt 22 -or ($version.Major -eq 22 -and $version.Minor -lt 5)) {
        throw "Node.js 22.5 ou plus récent est requis. Version trouvée : $versionText."
    }
}

function Assert-CommandCenter([string]$Root, [switch]$RequireNode) {
    $required = @(
        'scripts\run-safe-cycle.mjs',
        'src\server.mjs'
    )
    # Start-Melodiespark.ps1 is optional for CLI commands
    if (Test-Path -LiteralPath (Join-Path $Root 'Start-Melodiespark.ps1') -PathType Leaf) {
        $required += 'Start-Melodiespark.ps1'
    }
    
    $missing = $required | Where-Object {
        -not (Test-Path -LiteralPath (Join-Path $Root $_) -PathType Leaf)
    }
    if ($missing) {
        throw "Command Center incomplet. Fichiers manquants : $($missing -join ', ')"
    }
    if ($RequireNode) { Assert-NodeVersion }
}

function Invoke-NodeScript {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Low')]
    param(
        [string]$Root,
        [string[]]$Arguments
    )
    $script = Join-Path $Root 'scripts\run-safe-cycle.mjs'
    $description = "workflow local sûr : $($Arguments -join ' ')"
    if (-not $PSCmdlet.ShouldProcess($script, $description)) { return }
    Write-Stage "Exécution du workflow local sûr : $($Arguments -join ' ')"
    & node $script @Arguments
    if ($LASTEXITCODE -ne 0) {
        throw "Le workflow local sûr a échoué avec le code de sortie $LASTEXITCODE."
    }
}

function Invoke-Initialize {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
    param([string]$Root)
    $launcher = Join-Path $Root 'Start-Melodiespark.ps1'
    if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
        throw "Start-Melodiespark.ps1 introuvable : $launcher"
    }
    $description = 'initialiser la configuration locale puis démarrer le Command Center'
    if (-not $PSCmdlet.ShouldProcess($launcher, $description)) { return }
    $launcherArgs = @('-Initialize')
    if ($SetPassword) { $launcherArgs += '-SetPassword' }
    if ($Open) { $launcherArgs += '-Open' }
    Write-Stage 'Initialisation du Command Center.'
    & $launcher @launcherArgs
    if ($LASTEXITCODE -ne 0) { throw "L’initialisation a échoué avec le code de sortie $LASTEXITCODE." }
}

function Invoke-Start {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
    param([string]$Root)
    $launcher = Join-Path $Root 'Start-Melodiespark.ps1'
    if (-not (Test-Path -LiteralPath $launcher -PathType Leaf)) {
        throw "Start-Melodiespark.ps1 introuvable : $launcher"
    }
    if (-not $PSCmdlet.ShouldProcess($launcher, 'démarrer le Command Center')) { return }
    $launcherArgs = @()
    if ($Open) { $launcherArgs += '-Open' }
    Write-Stage 'Démarrage du Command Center. Appuyez sur Ctrl+C pour arrêter.'
    & $launcher @launcherArgs
    if ($LASTEXITCODE -ne 0) { throw "Le Command Center s’est arrêté avec le code de sortie $LASTEXITCODE." }
}

function Test-MelodiesparkServerProcess($Process, [string]$Root) {
    if ($null -eq $Process) { return $false }
    $serverPath = [IO.Path]::GetFullPath((Join-Path $Root 'src\server.mjs'))
    $commandLine = ([string]$Process.CommandLine).Replace('/', '\')
    return [string]$Process.Name -ieq 'node.exe' -and
        $commandLine.IndexOf($serverPath, [StringComparison]::OrdinalIgnoreCase) -ge 0
}

function Stop-ManagedServer {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
    param(
        [string]$Root,
        [int]$TargetProcessId
    )
    if ($TargetProcessId -le 0) {
        throw "Stop nécessite -ProcessId avec le PID d’un serveur Command Center vérifié."
    }
    $process = Get-CimInstance Win32_Process -Filter "ProcessId = $TargetProcessId" -ErrorAction SilentlyContinue
    if ($null -eq $process) {
        Write-Stage "Processus $TargetProcessId introuvable ; rien à arrêter."
        return
    }
    if (-not (Test-MelodiesparkServerProcess $process $Root)) {
        throw "Le processus $TargetProcessId n’est pas un serveur Melodiespark Command Center vérifié ; arrêt refusé."
    }
    $creationDate = [string]$process.CreationDate
    if ($PSCmdlet.ShouldProcess("PID $TargetProcessId", 'arrêter le serveur Melodiespark Command Center')) {
        $currentProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $TargetProcessId" -ErrorAction SilentlyContinue
        if ($null -eq $currentProcess -or
            [string]$currentProcess.CreationDate -ne $creationDate -or
            -not (Test-MelodiesparkServerProcess $currentProcess $Root)) {
            throw "Le processus $TargetProcessId a changé pendant la vérification ; arrêt refusé."
        }
        Stop-Process -Id $TargetProcessId -ErrorAction Stop
        Write-Stage "Serveur Command Center arrêté : processus $TargetProcessId."
    }
}

function Show-Status([string]$Root) {
    $status = [ordered]@{
        action = 'Status'
        commandCenterRoot = $Root
        nodeAvailable = [bool](Get-Command node -ErrorAction SilentlyContinue)
        databaseExists = Test-Path -LiteralPath (Join-Path $Root 'data\melodiespark.db') -PathType Leaf
        envExists = Test-Path -LiteralPath (Join-Path $Root '.env') -PathType Leaf
        running = $false
    }
    $processes = Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        Test-MelodiesparkServerProcess $_ $Root
    }
    $status.running = @($processes).Count -gt 0
    $status | ConvertTo-Json
}

if ($SetPassword -and $Action -ne 'Initialize') {
    throw "-SetPassword n’est valide que pour l’action Initialize."
}
if ($Open -and $Action -notin @('Initialize', 'Start')) {
    throw "-Open n’est valide que pour les actions Initialize et Start."
}
if ($ProcessId -ne 0 -and $Action -ne 'Stop') {
    throw "-ProcessId n’est valide que pour l’action Stop."
}
if ($TaskId -ne '' -and $Action -ne 'TaskRun') {
    throw "-TaskId n’est valide que pour l’action TaskRun."
}
if ($Action -eq 'TaskRun' -and [string]::IsNullOrWhiteSpace($TaskId)) {
    throw "-TaskId est requis pour l’action TaskRun."
}

$root = Resolve-CommandCenterRoot
if ($Action -eq 'Stop') {
    $serverEntryPoint = Join-Path $root 'src\server.mjs'
    if (-not (Test-Path -LiteralPath $serverEntryPoint -PathType Leaf)) {
        throw "Serveur Command Center introuvable : $serverEntryPoint"
    }
}
else {
    Assert-CommandCenter $root -RequireNode:($Action -ne 'Status')
}
Write-Stage "Racine du Command Center : $root"

switch ($Action) {
    'Health' {
        Invoke-NodeScript $root @('1')
    }
    'Cycle' {
        Invoke-NodeScript $root @("$Cycles")
    }
    'Continuous' {
        Invoke-NodeScript $root @('1', '--continuous', "--interval=$IntervalSeconds")
    }
    'Initialize' {
        Invoke-Initialize $root
    }
    'Start' {
        Invoke-Start $root
    }
    'Stop' {
        Stop-ManagedServer $root $ProcessId
    }
    'Status' {
        Show-Status $root
    }
    'ProductSync' {
        Invoke-NodeScript $root @('product-sync')
    }
    'WalletVerify' {
        Invoke-NodeScript $root @('wallet-verify')
    }
    'TaskRun' {
        Invoke-NodeScript $root @('task-run', $TaskId)
    }
    'RevReport' {
        Invoke-NodeScript $root @('rev-report')
    }
}

Write-Stage "Demande d’action traitée : $Action"
