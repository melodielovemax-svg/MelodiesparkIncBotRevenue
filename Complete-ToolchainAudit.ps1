# Complete the toolchain audit step
$MCC_Root = "C:\melodie\MelodieCommandCenter"
New-Item -ItemType Directory -Force -Path $MCC_Root | Out-Null

$Tools = @("npm", "pnpm", "npx", "pip", "pipx", "git", "make")
$ToolStatus = @()
foreach ($tool in $Tools) {
    $check = Get-Command $tool -ErrorAction SilentlyContinue
    $status = if ($check) { "INSTALLED" } else { "MISSING" }
    $ToolStatus += [ordered]@{ Tool = $tool; Status = $status }
}
$ToolStatus | ConvertTo-Json | Set-Content "$MCC_Root\toolchain_audit.json" -Encoding UTF8
Write-Host "Toolchain audit completed successfully"
$ToolStatus | Format-Table -AutoSize