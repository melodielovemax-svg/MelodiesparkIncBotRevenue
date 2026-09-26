Write-Host 'Pushing to GitHub...' -ForegroundColor Cyan
git add .
git commit -m 'Automated Release from MCC'
git push origin main

Write-Host 'Packaging EXE Installer...' -ForegroundColor Cyan
# Integration with Inno Setup or WiX Toolset
