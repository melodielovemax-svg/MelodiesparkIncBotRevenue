$gameDir = 'C:\melodie\apps\command-center\game'
param(
  [string]$Root = 'C:\melodie',
  [string]$Output = "C:\melodie\releases\PathOfMelodie-Ultimate-AZ-30000.zip",
  [int]$RequiredArtworkCount = 30000
)

$ErrorActionPreference = "Stop"
$gameNames = @(
  "PathOfMelodie15Act","PathOfMelodie","PathOfMelodieGame",
  "MelodiesparkCommandCenter","game"
)
$artNames = @(
  "artwork","artworks","art","assets\artwork","assets\artworks",
  "game\artwork","game\artworks","game\assets\artwork","game\assets\artworks"
)

function Get-ExistingDirs([string[]]$names) {
  $dirs = New-Object System.Collections.Generic.List[string]
  foreach ($name in $names) {
    $p = Join-Path $Root $name
    if (Test-Path -LiteralPath $p -PathType Container) { $dirs.Add((Resolve-Path $p).Path) }
  }
  $dirs | Select-Object -Unique
}

$gameDirs = Get-ExistingDirs $gameNames
$artDirs  = Get-ExistingDirs $artNames

if ($gameDirs.Count -eq 0) {
  throw "No Path of Melodie/game directory was found under $Root. Nothing will be invented or fabricated."
}
if ($artDirs.Count -eq 0) {
  throw "No artwork directory was found under $Root. Nothing will be invented or fabricated."
}

$extensions = @("*.png","*.jpg","*.jpeg","*.webp","*.bmp","*.tga","*.gif")
$artList = New-Object System.Collections.Generic.List[System.IO.FileInfo]
foreach ($d in $artDirs) {
  foreach ($e in $extensions) {
    Get-ChildItem -LiteralPath $d -Recurse -File -Filter $e -ErrorAction SilentlyContinue | ForEach-Object { [void]$artList.Add($_) }
  }
}
$artFiles = @($artList | Sort-Object FullName -Unique)

if ($artFiles.Count -lt $RequiredArtworkCount) {
  throw "Artwork gate failed: found $($artFiles.Count), required $RequiredArtworkCount. No fake placeholders are generated."
}

$secretPatterns = @(
  "\.env($|\.)","credentials","credential","apikey","api[_-]?key",
  "private[_-]?key","secret","jwt[_-]?private","secrets\.ya?ml",
  "EncryptedAPIKey","CREDENTIALS_QUICK_REFERENCE"
)

$allRoots = @($gameDirs + $artDirs) | Select-Object -Unique
$files = foreach ($d in $allRoots) { Get-ChildItem -LiteralPath $d -Recurse -File }
$blocked = $files | Where-Object {
  $n = $_.FullName
  ($secretPatterns | Where-Object { $n -match $_ }).Count -gt 0
}

$included = $files | Where-Object { $blocked -notcontains $_ }

$manifest = [ordered]@{
  package = "Path of Melodie Ultimate A-Z"
  generated_utc = [DateTime]::UtcNow.ToString("o")
  root = $Root
  game_directories = $gameDirs
  artwork_directories = $artDirs
  artwork_count = $artFiles.Count
  required_artwork_count = $RequiredArtworkCount
  total_files = $included.Count
  blocked_secret_files = $blocked.Count
  status = "PACKAGED_FROM_EXISTING_FILES_ONLY"
}

$manifestPath = Join-Path $env:TEMP "path-of-melodie-release-manifest.json"
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $manifestPath -Encoding UTF8

$parent = Split-Path -Parent $Output
New-Item -ItemType Directory -Force -Path $parent | Out-Null
if (Test-Path $Output) { Remove-Item -LiteralPath $Output -Force }

$tmp = Join-Path $env:TEMP ("PathOfMelodiePackage-" + [guid]::NewGuid())
New-Item -ItemType Directory -Force -Path $tmp | Out-Null

try {
  $rootName = "PathOfMelodie"
  foreach ($f in $included) {
    $relative = $f.FullName.Substring($Root.TrimEnd('\').Length).TrimStart('\')
    $dest = Join-Path $tmp (Join-Path $rootName $relative)
    New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
    Copy-Item -LiteralPath $f.FullName -Destination $dest
  }
  Copy-Item $manifestPath (Join-Path $tmp "$rootName\RELEASE-MANIFEST.json")

  Compress-Archive -Path (Join-Path $tmp $rootName) -DestinationPath $Output -CompressionLevel Optimal

  $hash = (Get-FileHash -LiteralPath $Output -Algorithm SHA256).Hash
  $size = (Get-Item $Output).Length
  Write-Host ""
  Write-Host "PACKAGING COMPLETE" -ForegroundColor Green
  Write-Host "ZIP: $Output"
  Write-Host "SIZE: $size bytes"
  Write-Host "SHA256: $hash"
  Write-Host "FILES: $($included.Count)"
  Write-Host "ARTWORK: $($artFiles.Count)"
  Write-Host "BLOCKED SECRETS: $($blocked.Count)"
}
finally {
  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
  Remove-Item -LiteralPath $manifestPath -Force -ErrorAction SilentlyContinue
}


