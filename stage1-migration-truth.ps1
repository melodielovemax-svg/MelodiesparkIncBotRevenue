# Stage 1: Migration of Truth
# Migrate verified v0.1.0 Command Center into Enterprise Structure

$ErrorActionPreference = "Stop"

Write-Host "============================================================"
Write-Host " STAGE 1: MIGRATION OF TRUTH"
Write-Host "============================================================"

Write-Host "Migrating verified v0.1.0 Command Center..." -ForegroundColor Cyan
$Source = "C:\Melodie\MelodiesparkCommandCenter"
$Destination = "C:\Melodie\apps\command-center"

if (Test-Path $Source) {
    if (Test-Path $Destination) { 
        Write-Host "Removing existing destination..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $Destination 
    }
    Write-Host "Moving files..." -ForegroundColor Yellow
    Move-Item -Path $Source -Destination $Destination
    Write-Host "✅ Migration Complete: $Destination" -ForegroundColor Green
} else {
    Write-Error "CRITICAL: Source v0.1.0 folder not found at $Source"
    exit
}

Write-Host "`nVerifying migration..." -ForegroundColor Cyan
if (Test-Path $Destination) {
    Write-Host "✅ Destination verified: $Destination" -ForegroundColor Green
    $itemCount = (Get-ChildItem -Path $Destination -Recurse -File -ErrorAction SilentlyContinue).Count
    Write-Host "✅ File count: $itemCount" -ForegroundColor Green
} else {
    Write-Error "CRITICAL: Migration verification failed"
    exit
}

Write-Host "`n============================================================"
Write-Host " MIGRATION COMPLETE"
Write-Host "============================================================"
Write-Host "Next: Execute test suite to verify functionality"
Write-Host "Command: cd $Destination && npm test"
Write-Host "============================================================"