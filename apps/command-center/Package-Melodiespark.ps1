#requires -Version 7.0
<#
  Creates a source package without secrets, node_modules, or the local SQLite database.
  The package is a working local MVP source bundle, not a certified Shopify theme or regulated deployment.
#>
[CmdletBinding()]
param(
    [string]$OutputPath = (Join-Path $PSScriptRoot 'Ultimate_Melodiespark_Command_Center_v0.1.0.zip'),
    [switch]$IncludeDatabase
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = (Resolve-Path $PSScriptRoot).Path
$temp = Join-Path ([IO.Path]::GetTempPath()) ("melodiespark-package-" + [guid]::NewGuid().ToString('N'))
$stage = Join-Path $temp 'MelodiesparkCommandCenter'
New-Item -ItemType Directory -Force -Path $stage | Out-Null

$excludedDirectories = @('node_modules', '.git', 'dist', 'game')
$excludedFiles = @('.env', 'melodiespark.db', 'melodiespark.db-shm', 'melodiespark.db-wal')

try {
    $outputFileName = [IO.Path]::GetFileName([IO.Path]::GetFullPath($OutputPath))
    Get-ChildItem -LiteralPath $root -Force | ForEach-Object {
        if ($excludedDirectories -contains $_.Name) { return }
        if ($excludedFiles -contains $_.Name) { return }
        if ($_.Name -eq $outputFileName -or $_.Name -like 'Ultimate_*.zip') { return }
        if ($_.PSIsContainer) {
            Copy-Item -LiteralPath $_.FullName -Destination $stage -Recurse -Force
        } else {
            Copy-Item -LiteralPath $_.FullName -Destination $stage -Force
        }
    }

    if (-not $IncludeDatabase) {
        Remove-Item -LiteralPath (Join-Path $stage 'data\melodiespark.db') -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $stage 'data\melodiespark.db-shm') -Force -ErrorAction SilentlyContinue
        Remove-Item -LiteralPath (Join-Path $stage 'data\melodiespark.db-wal') -Force -ErrorAction SilentlyContinue
    }

    $files = Get-ChildItem -LiteralPath $stage -Recurse -File | ForEach-Object {
        [ordered]@{
            path = $_.FullName.Substring($stage.Length + 1).Replace('\', '/')
            bytes = $_.Length
            sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()
        }
    }
    $manifest = [ordered]@{
        package = 'Melodiespark Command Center'
        version = '0.1.0'
        createdAt = (Get-Date).ToUniversalTime().ToString('o')
        databaseIncluded = [bool]$IncludeDatabase
        secretMaterialIncluded = $false
        files = @($files)
    }
    $manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $stage 'PACKAGE-MANIFEST.json') -Encoding utf8NoBOM

    $parent = Split-Path -Parent ([IO.Path]::GetFullPath($OutputPath))
    New-Item -ItemType Directory -Force -Path $parent | Out-Null
    Remove-Item -LiteralPath $OutputPath -Force -ErrorAction SilentlyContinue
    [IO.Compression.ZipFile]::CreateFromDirectory($stage, [IO.Path]::GetFullPath($OutputPath), [IO.Compression.CompressionLevel]::Optimal, $false)
    Write-Host "Created $OutputPath"
    Write-Host "Files: $($files.Count + 1)"
    Write-Host 'Secrets, .env, node_modules, and local database were excluded.'
}
finally {
    Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
}
