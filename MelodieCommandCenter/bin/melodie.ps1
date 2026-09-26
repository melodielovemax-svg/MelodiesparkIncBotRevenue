param([string]$Command)
switch ($Command) {
    'build' { Write-Host 'Starting Total Build...'; & 'C:\melodie\MelodieCommandCenter\scripts\deploy.ps1' }
    'launch' { Write-Host 'Launching Path of Melodie...'; start-process 'C:\melodie\PathOfMelodie-Unreal\PathOfMelodie.uproject' }
    'hardware' { Write-Host 'Applying MegaHARDWARE Profiles...'; # Apply Registry Tweaks }
    'dos' { Write-Host 'Launching DOS Game Hub...'; # Open DOSBox }
    'status' { Get-Content 'C:\melodie\PathOfMelodie-Release\RELEASE-EVIDENCE.json' }
    Default { Write-Host 'Usage: melodie [build|launch|hardware|dos|status]' }
}
