<#
.SYNOPSIS
    Builds and validates the Melodiespark content catalog and both CLI frontends.

.DESCRIPTION
    Local only. This script never contacts npm, PyPI, or any other registry and
    never requires a registry token. It produces installable artifacts and proves
    they work; deciding whether to publish them is a separate step.

    Stages:
      1. Build the content catalog over Melodiespark_Source (hashes every file)
      2. Sync the shared catalog, rules, and templates into the Python package
      3. Typecheck and test the TypeScript CLI, including Node/Python parity
      4. Run the Python policy and dispatch tests
      5. Build the Python wheel and sdist, then twine check
      6. Run catalog integrity and secret-leak verification
      7. Pack the Node CLI as a tarball
      8. Smoke-test the deny-by-default safety properties

    Step 2 precedes step 3 deliberately. The Node suite exercises the Python
    frontend, whose `verify` compares its bundled catalog against the canonical
    one byte for byte. Testing before syncing makes a correct staleness check
    report as a parity failure.

.PARAMETER SkipCatalog
    Reuse the existing catalog instead of rebuilding it. The rebuild hashes
    657 MB and takes roughly a minute.

.PARAMETER Deep
    Also re-hash every catalogued source file and compare. Adds about 45 s.

.EXAMPLE
    pwsh -File .\Build-CatalogCLI.ps1

.EXAMPLE
    pwsh -File .\Build-CatalogCLI.ps1 -SkipCatalog -Deep
#>
[CmdletBinding()]
param(
    [switch] $SkipCatalog,
    [switch] $Deep
)

$ErrorActionPreference = 'Stop'
$Root = $PSScriptRoot
$NodeCli = Join-Path $Root 'apps\melodie-cli'
$PyPkg = Join-Path $Root 'python\melodiespark-cli'
$Melodie = Join-Path $NodeCli 'bin\melodie.mjs'
$Log = @()
$Failed = 0
$TestSuites = @()
$Artifacts = @()
$SecretScan = @()

function Step {
    param([string] $Name, [scriptblock] $Action)
    Write-Host ''
    Write-Host "=== $Name ===" -ForegroundColor Cyan
    $sw = [Diagnostics.Stopwatch]::StartNew()
    try {
        # Captured rather than discarded: a test step records what it observed,
        # not merely that it exited 0. `*>&1` merges every stream, because
        # `python -m unittest` reports its summary on stderr.
        $output = & $Action *>&1 | Out-String
        $sw.Stop()
        $script:Log += [pscustomobject]@{
            Step     = $Name
            Result   = 'PASS'
            Seconds  = [math]::Round($sw.Elapsed.TotalSeconds, 1)
        }
        if ($output -and ($output -match 'tests\s+\d+' -or $output -match 'Ran\s+\d+\s+test')) {
            $counts = Get-TestCounts $output
            $script:TestSuites += [ordered]@{
                step   = $Name
                tests  = $counts.tests
                pass   = $counts.pass
                fail   = $counts.fail
                result = 'PASS'
            }
        }
        if ($output -and $output.Trim()) { Write-Host $output.TrimEnd() }
        Write-Host "--- $Name OK ($([math]::Round($sw.Elapsed.TotalSeconds,1))s)" -ForegroundColor Green
    } catch {
        $sw.Stop()
        $script:Failed++
        $script:Log += [pscustomobject]@{
            Step     = $Name
            Result   = 'FAIL'
            Seconds  = [math]::Round($sw.Elapsed.TotalSeconds, 1)
        }
        Write-Host "--- $Name FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Assert-True {
    param([bool] $Condition, [string] $Message)
    if (-not $Condition) { throw $Message }
}

# Parses pass/fail counts out of either test runner, so the evidence file
# records what was observed rather than what a document asserts.
#
# Deliberately tolerant of runner formatting. `node --test` prefixes its summary
# with a box-drawing character that may arrive as mojibake depending on the
# console code page, and `python -m unittest` writes its summary to stderr.
# Anchoring on a specific leading character made the counts silently null,
# which is worse than not recording them at all: it looks like evidence.
function Get-TestCounts {
    param([string] $Output)
    $result = [ordered]@{ tests = $null; pass = $null; fail = $null }
    foreach ($raw in ($Output -split "`r?`n")) {
        $line = $raw.Trim()
        if (-not $line) { continue }
        # Only consider short lines, so prose cannot produce a false count.
        if ($line.Length -gt 32) { continue }
        if ($result.tests -eq $null -and $line -match '(?:^|\s)tests?\s+(\d+)') { $result.tests = [int]$Matches[1]; continue }
        if ($result.tests -eq $null -and $line -match '^Ran\s+(\d+)\s+test') { $result.tests = [int]$Matches[1]; continue }
        if ($result.pass -eq $null -and $line -match '(?:^|\s)pass\s+(\d+)') { $result.pass = [int]$Matches[1]; continue }
        if ($result.fail -eq $null -and $line -match '(?:^|\s)fail\s+(\d+)') { $result.fail = [int]$Matches[1]; continue }
        if ($result.fail -eq $null -and $line -match '^FAILED') { $result.fail = -1; continue }
        if ($line -eq 'OK') {
            # unittest reports "OK" rather than a fail count. OK means zero
            # failures, so record that rather than leaving the field unknown.
            if ($null -eq $result.pass) { $result.pass = $result.tests }
            if ($null -eq $result.fail) { $result.fail = 0 }
        }
    }
    return $result
}

Write-Host 'Melodiespark catalog + CLI build' -ForegroundColor White
Write-Host "root: $Root"
Write-Host 'Local build and validation only. Nothing is published.'

if (-not $SkipCatalog) {
    Step 'Build catalog (hashes every source file)' {
        & node $Melodie catalog --build
        Assert-True ($LASTEXITCODE -eq 0) "catalog build exited $LASTEXITCODE"
    }
}

Step 'Install Node dependencies' {
    & npm --prefix $NodeCli install --no-audit --no-fund | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "npm install exited $LASTEXITCODE"
}

Step 'Typecheck TypeScript CLI' {
    & npm --prefix $NodeCli run build | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "tsc exited $LASTEXITCODE"
}

Step 'Sync shared assets into the Python package' {
    # Must run BEFORE the test suites. The Node suite exercises the Python
    # frontend too, and that frontend's `verify` compares its bundled catalog
    # against the canonical one byte for byte. Right after a `catalog --build`
    # the bundle is stale, so testing first makes a correct staleness check
    # look like a parity failure.
    & python (Join-Path $PyPkg 'scripts\sync_data.py') | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "sync_data exited $LASTEXITCODE"
}

Step 'Node tests: policy + Node/Python parity' {
    & npm --prefix $NodeCli test
    Assert-True ($LASTEXITCODE -eq 0) "node tests exited $LASTEXITCODE"
}

Step 'Python policy tests' {
    $env:PYTHONPATH = Join-Path $PyPkg 'src'
    & python -m unittest discover -s (Join-Path $PyPkg 'tests')
    Assert-True ($LASTEXITCODE -eq 0) "python tests exited $LASTEXITCODE"
}

Step 'Build Python wheel and sdist' {
    $dist = Join-Path $PyPkg 'dist'
    if (Test-Path $dist) { Remove-Item -Recurse -Force $dist }
    & python -m build --outdir $dist $PyPkg | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "python -m build exited $LASTEXITCODE"
    $wheel = Get-ChildItem (Join-Path $dist '*.whl') -ErrorAction SilentlyContinue
    Assert-True ($null -ne $wheel) 'no wheel produced'
}

Step 'twine check' {
    $dist = Join-Path $PyPkg 'dist'
    & python -m twine check (Join-Path $dist '*') | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "twine check exited $LASTEXITCODE"
}

$verifyArgs = @($Melodie, 'verify')
if ($Deep) { $verifyArgs += '--deep' }

Step 'Verify catalog integrity and secret scan' {
    & node @verifyArgs | Out-Null
    Assert-True ($LASTEXITCODE -eq 0) "verify exited $LASTEXITCODE"
}

Step 'Pack the Node CLI' {
    Push-Location $NodeCli
    try {
        Get-ChildItem '*.tgz' -ErrorAction SilentlyContinue | Remove-Item -Force
        & npm pack | Out-Null
        Assert-True ($LASTEXITCODE -eq 0) "npm pack exited $LASTEXITCODE"
        $tarball = Get-ChildItem '*.tgz' -ErrorAction SilentlyContinue
        Assert-True ($null -ne $tarball) 'no tarball produced'
    } finally { Pop-Location }
}

# --- Safety properties ------------------------------------------------------
# These assert the deny-by-default boundary, not just that a command exits 0.

Step 'Safety: credential files are permanently denied' {
    $json = & node $Melodie inspect --category SECRET --limit 5000 --json | ConvertFrom-Json
    Assert-True ($json.count -gt 0) 'no SECRET entries found; the audit is not running'
    foreach ($f in $json.files) {
        Assert-True $f.permanently_denied "$($f.path) is not permanently denied"
        Assert-True (-not $f.extractable) "$($f.path) is extractable"
        Assert-True (-not $f.authorization_required) "$($f.path) is only authorization-gated"
    }
    Write-Host "  $($json.count) SECRET entries, all permanently denied"
}

Step 'Safety: extracting credentials writes nothing' {
    $out = Join-Path $env:TEMP ("ms-safety-" + [guid]::NewGuid().ToString('N'))
    try {
        & node $Melodie extract 'config/APIKeys.json' --out $out | Out-Null
        $copied = @(Get-ChildItem $out -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -ne 'extract-audit.jsonl' })
        Assert-True ($copied.Count -eq 0) "$($copied.Count) credential file(s) were copied"
        $audit = Join-Path $out 'extract-audit.jsonl'
        Assert-True (Test-Path $audit) 'no audit trail was written'
        Write-Host '  0 files copied, audit trail present'
    } finally {
        Remove-Item -Recurse -Force $out -ErrorAction SilentlyContinue
    }
}

Step 'Safety: content guard blocks a live key in an ordinary doc' {
    $out = Join-Path $env:TEMP ("ms-safety-" + [guid]::NewGuid().ToString('N'))
    try {
        & node $Melodie extract 'API_KEY_ROTATION_GUIDE' --out $out | Out-Null
        $copied = @(Get-ChildItem $out -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -ne 'extract-audit.jsonl' })
        Assert-True ($copied.Count -eq 0) "$($copied.Count) file(s) with a live key were copied"
        Write-Host '  0 files copied'
    } finally {
        Remove-Item -Recurse -Force $out -ErrorAction SilentlyContinue
    }
}

Step 'Safety: the default web3 scaffold withholds signing code' {
    $out = Join-Path $env:TEMP ("ms-safety-" + [guid]::NewGuid().ToString('N'))
    try {
        & node $Melodie init $out --template web3 --force | Out-Null
        Assert-True (-not (Test-Path (Join-Path $out 'src\wallet\signing.ts'))) 'signing.ts was emitted without consent'
        Assert-True (-not (Test-Path (Join-Path $out 'src\wallet\broadcast.ts'))) 'broadcast.ts was emitted without consent'
        Write-Host '  signing.ts and broadcast.ts correctly absent'
    } finally {
        Remove-Item -Recurse -Force $out -ErrorAction SilentlyContinue
    }
}

# --- Secret scan of the built artifacts -------------------------------------
# Evidence, not assertion. Every pattern hit is recorded with its file and
# line, then classified. An unclassified hit blocks publication. A hit inside a
# test fixture that self-identifies as synthetic is recorded as such, because a
# secret detector must be able to test itself.

$SecretPatterns = @(
    @{ Id = 'CS001_STRIPE_LIVE_SECRET'; Re = 'sk_live_[0-9A-Za-z]{16,}' }
    @{ Id = 'CS002_AWS_ACCESS_KEY_ID'; Re = 'AKIA[0-9A-Z]{16}' }
    @{ Id = 'CS003_GITHUB_TOKEN'; Re = 'gh[pousr]_[A-Za-z0-9]{36}' }
    @{ Id = 'CS004_SLACK_TOKEN'; Re = 'xox[baprs]-[0-9A-Za-z-]{10,}' }
    @{ Id = 'CS005_PRIVATE_KEY_BLOCK'; Re = '-----BEGIN [A-Z ]*PRIVATE KEY-----' }
    @{ Id = 'CS009_GOOGLE_API_KEY'; Re = 'AIza[0-9A-Za-z_-]{35}' }
    @{ Id = 'CS010_NPM_TOKEN'; Re = 'npm_[0-9A-Za-z]{36}' }
)

function Get-ArtifactScan {
    param([System.IO.FileInfo[]] $Artifacts)

    Add-Type -AssemblyName System.IO.Compression.FileSystem -ErrorAction SilentlyContinue
    $results = @()
    foreach ($artifact in $Artifacts) {
        $tmp = Join-Path $env:TEMP ('ms-scan-' + [guid]::NewGuid().ToString('N'))
        New-Item -ItemType Directory -Force -Path $tmp | Out-Null
        try {
            if ($artifact.Extension -eq '.whl') {
                [System.IO.Compression.ZipFile]::ExtractToDirectory($artifact.FullName, $tmp)
            } else {
                tar -xzf $artifact.FullName -C $tmp 2>$null | Out-Null
            }
            foreach ($pattern in $SecretPatterns) {
                $hits = Get-ChildItem $tmp -Recurse -File -ErrorAction SilentlyContinue |
                    Select-String -Pattern $pattern.Re -ErrorAction SilentlyContinue
                foreach ($hit in $hits) {
                    $rel = $hit.Path.Replace($tmp, '')
                    # A detector's own fixture is allowed to contain the pattern
                    # it looks for, provided it says so in the value itself.
                    $synthetic = ($rel -match 'test' -and $hit.Line -match 'SYNTHETIC')
                    $results += [pscustomobject]@{
                        artifact  = $artifact.Name
                        file      = $rel
                        line      = $hit.LineNumber
                        pattern   = $pattern.Id
                        synthetic = $synthetic
                        value     = $hit.Line.Trim()
                    }
                }
            }
        } finally {
            Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
        }
    }
    return $results
}

Step 'Secret scan of the built artifacts' {
    $script:Artifacts = @()
    $script:Artifacts += (Get-ChildItem (Join-Path $NodeCli '*.tgz') -ErrorAction SilentlyContinue)
    $script:Artifacts += (Get-ChildItem (Join-Path $PyPkg 'dist\*.whl') -ErrorAction SilentlyContinue)
    $script:Artifacts += (Get-ChildItem (Join-Path $PyPkg 'dist\*.tar.gz') -ErrorAction SilentlyContinue)
    Assert-True ($script:Artifacts.Count -ge 3) "expected 3 artifacts, found $($script:Artifacts.Count)"

    $script:SecretScan = Get-ArtifactScan -Artifacts $script:Artifacts
    $unclassified = @($script:SecretScan | Where-Object { -not $_.synthetic })
    $synthetic = @($script:SecretScan | Where-Object { $_.synthetic })

    Write-Host "  artifacts scanned : $($script:Artifacts.Count)"
    Write-Host "  synthetic fixtures: $($synthetic.Count)"
    Write-Host "  unclassified hits : $($unclassified.Count)"
    Assert-True ($unclassified.Count -eq 0) "$($unclassified.Count) unclassified secret match(es) in a build artifact"
}

# --- Evidence emission ------------------------------------------------------
# The report references this file. Evidence is recorded here, at run time, by
# the thing that actually performed the work. A hand-written claim in a
# document is an assertion; this is a record.

function Get-Sha256 {
    param([string] $Path)
    (Get-FileHash -Path $Path -Algorithm SHA256).Hash.ToLowerInvariant()
}

$catalogSummary = $null
try { $catalogSummary = (& node $Melodie catalog --json | ConvertFrom-Json) } catch { }

$unclassifiedHits = @($SecretScan | Where-Object { -not $_.synthetic })
$syntheticHits = @($SecretScan | Where-Object { $_.synthetic })

# Publication is gated on facts, not on optimism. These are computed here so
# that nobody can mark a release authorised by editing a document.
$Blocking = @(
    [ordered]@{
        id          = 'GATE_CREDENTIAL_ROTATION'
        status      = 'OPEN'
        blocks      = @('npm publication', 'PyPI publication')
        summary     = 'A live Stripe sk_live_ secret was found in the source tree and is treated as exposed.'
        requirement = 'Rotated at Stripe by the credential owner, and the rotation confirmed in writing.'
        note        = 'Removing the value from the package does not reduce the exposure. Only rotation does.'
        owner       = 'operator'
    }
    [ordered]@{
        id          = 'GATE_COMMAND_NAME_COLLISION'
        status      = 'OPEN'
        blocks      = @('PyPI publication')
        summary     = 'melodiespark-py and melodiespark-cli both install a `melodiespark` console script.'
        requirement = 'A decision on which package owns the name, recorded in DECISIONS.md.'
        note        = 'Must not be resolved by renaming one package just to make a build pass.'
        owner       = 'operator'
    }
    [ordered]@{
        id          = 'GATE_RELEASE_AUTHORISATION'
        status      = 'OPEN'
        blocks      = @('npm publication', 'PyPI publication')
        summary     = 'No publication decision has been taken.'
        requirement = 'An explicit authorisation, after the two gates above are closed and artifacts are rebuilt and rescanned.'
        owner       = 'operator'
    }
)

$evidence = [ordered]@{
    schema         = 'melodiespark-build-evidence/1.0.0'
    generated_at   = (Get-Date).ToUniversalTime().ToString('o')
    scope          = 'Local build and validation of apps/melodie-cli and python/melodiespark-cli. No registry was contacted. No credential was used or required.'
    establishes    = 'That the named paths behaved as described on this host at this time.'
    does_not_establish = @(
        'That the Melodiespark product is operational.',
        'That any external integration, service, or on-chain capability works.',
        'That untested code paths behave as tested paths do.',
        'That any business capability exists (revenue, customers, trading, wagering, token conversion).'
    )
    host           = [ordered]@{
        os                = [System.Environment]::OSVersion.VersionString
        arch              = $env:PROCESSOR_ARCHITECTURE
        node              = (& node --version)
        python            = (& python --version 2>&1)
    }
    catalog        = $catalogSummary
    steps          = $Log
    test_suites    = $script:TestSuites
    artifacts      = @($Artifacts | ForEach-Object {
        [ordered]@{
            name   = $_.Name
            bytes  = $_.Length
            sha256 = Get-Sha256 $_.FullName
        }
    })
    secret_scan    = [ordered]@{
        patterns            = $SecretPatterns.Id
        artifacts_scanned   = @($Artifacts).Count
        unclassified_hits   = $unclassifiedHits
        synthetic_fixtures  = $syntheticHits
        verdict             = $(if ($unclassifiedHits.Count -eq 0) { 'CLEAN' } else { 'BLOCKED' })
    }
    publication    = [ordered]@{
        authorized          = $false
        registry_contacted  = $false
        credential_used     = $false
        blocking            = $Blocking
    }
    disclaimer     = 'A passing test count establishes the tested implementation paths on this host. It does not establish that the Melodiespark product, or any external integration, is operational.'
}

$evidencePath = Join-Path $Root 'BUILD_EVIDENCE.json'
$evidence | ConvertTo-Json -Depth 8 | Set-Content -Path $evidencePath -Encoding utf8

# --- Summary ----------------------------------------------------------------

Write-Host ''
Write-Host '=== Summary ===' -ForegroundColor Cyan
$Log | Format-Table -AutoSize | Out-String | Write-Host

if ($Failed -gt 0) {
    Write-Host "$Failed step(s) FAILED." -ForegroundColor Red
    Write-Host "Evidence written to $evidencePath (result: FAILED)." -ForegroundColor Red
    exit 1
}

Write-Host 'All steps passed.' -ForegroundColor Green
Write-Host ''
Write-Host 'Artifacts:'
foreach ($artifact in $Artifacts) {
    Write-Host ("  {0,-46} {1,8:N0} KB  sha256={2}" -f $artifact.Name, ($artifact.Length / 1KB), (Get-Sha256 $artifact.FullName).Substring(0, 16))
}
Write-Host ''
Write-Host "Evidence record: $evidencePath" -ForegroundColor Cyan
Write-Host ''
Write-Host '=== Publication gate ===' -ForegroundColor Yellow
foreach ($gate in $Blocking) {
    Write-Host "  OPEN  $($gate.id)  - $($gate.summary)" -ForegroundColor Yellow
}
Write-Host ''
Write-Host 'PUBLICATION NOT AUTHORIZED. No registry was contacted and no token was used.' -ForegroundColor Yellow
Write-Host 'A passing build does not authorise a release, and does not establish that the' -ForegroundColor Yellow
Write-Host 'Melodiespark product or any external integration is operational.' -ForegroundColor Yellow
Write-Host 'See BUILD_REPORT.md and BUILD_EVIDENCE.json for the full record.'
