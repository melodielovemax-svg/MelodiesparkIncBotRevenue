$TaskFile = "C:\melodie\MelodieCLI_Enterprise_RealOnly_Template\18-tasks\TASKLIST_1000.csv"
$ManifestPath = "C:\melodie\MelodieCLI_Enterprise_RealOnly_Template\PROJECT_MANIFEST.json"

try {
    $Rows = Import-Csv -LiteralPath $TaskFile
    $Manifest = Get-Content -Raw -LiteralPath $ManifestPath | ConvertFrom-Json
    
    $ActualCount = $Rows.Count
    $ExpectedCount = [int]$Manifest.task_count

    Write-Host "`n--- FINAL FORENSIC VERIFICATION ---" -ForegroundColor Cyan
    
    if ($ActualCount -eq $ExpectedCount) {
        Write-Host "TASK INTEGRITY: VALID" -ForegroundColor Green
        Write-Host "Count: $ActualCount / $ExpectedCount" -ForegroundColor Green
    } else {
        Write-Host "TASK INTEGRITY: FAILED" -ForegroundColor Red
        Write-Host "Actual Rows: $ActualCount" -ForegroundColor Red
        Write-Host "Manifest Count: $ExpectedCount" -ForegroundColor Red
    }
} catch {
    Write-Host "CRITICAL ERROR during audit: $($_.Exception.Message)" -ForegroundColor Red
}
