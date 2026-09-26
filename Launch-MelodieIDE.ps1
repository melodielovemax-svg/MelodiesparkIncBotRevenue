# Melodie IDE & Orchestration Launcher
Write-Host "Starting Melodie Orchestration Environment..." -ForegroundColor Cyan
if (Test-Path "C:\melodie\Antigravity-x64.exe") {
    Write-Host "Launching Google Antigravity IDE Sidecar..." -ForegroundColor Green
    Start-Process "C:\melodie\Antigravity-x64.exe"
} else {
    Write-Host "Opening Melodie Command Center CLI..." -ForegroundColor Yellow
    melodie status
}
