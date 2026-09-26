$ErrorActionPreference='Stop'
Write-Host 'MegaGameOS / MegaHARDWARE developer bootstrap'
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { Write-Warning 'Node.js not installed; install Node.js LTS first.' }
if (Get-Command git -ErrorAction SilentlyContinue) { git --version }
if (Get-Command python -ErrorAction SilentlyContinue) { python --version }
if (Get-Command cmake -ErrorAction SilentlyContinue) { cmake --version }
if (Get-Command docker -ErrorAction SilentlyContinue) { docker --version }
if (Get-Command ollama -ErrorAction SilentlyContinue) { ollama --version }
Write-Host 'Bootstrap inspection complete. External installers are not executed automatically.'
