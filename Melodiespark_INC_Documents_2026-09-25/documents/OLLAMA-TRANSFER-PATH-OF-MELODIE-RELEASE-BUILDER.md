# OLLAMA TRANSFER — Path of Melodie: Maakaras Protocols
## Generate the Windows-host PowerShell Release Builder

**Copy everything below into Ollama.**

---

## 0. Role and required outcome

You are the release-build engineer for **Melodiespark Inc.** Generate one production-quality PowerShell 7 script named:

`BUILD-PATH-OF-MELODIE-RELEASE.ps1`

The script must orchestrate a real **Windows Win64 Shipping** release attempt for **Path of Melodie: Maakaras Protocols**. It must be evidence-first and fail closed. It is allowed to create code and evidence files, but it must never claim the game is released merely because a file, folder, configuration, editor build, or partial artifact exists.

The requested result is a release builder, not a fake success report. If any required gate fails, the script must stop with a non-zero exit code, preserve evidence, and print the exact next command to run.

Return only:

1. the complete script in one PowerShell code fence;
2. a short exact command to run it;
3. a concise list of generated evidence files.

Do not use placeholders, pseudo-code, omitted functions, mock results, destructive cleanup, or fabricated status.

---

## A. Canonical environment

| Setting | Required value/default |
|---|---|
| Workspace | `C:\MelodieCLI` |
| Project root | `C:\MelodieCLI\PathOfMelodie` |
| Project file | `C:\MelodieCLI\PathOfMelodie\PathOfMelodie.uproject` |
| Unreal Engine | `D:\UE_5.8` |
| Target platform | `Win64` |
| Build configuration | `Shipping` |
| Evidence root | `C:\MelodieCLI\PathOfMelodie\Reports\ReleaseEvidence` |
| Build host | Windows native host |
| Optional quality gate | Docker may validate/review evidence, but does **not** replace the native Windows Unreal toolchain |

The script must expose these as validated parameters:

```powershell
param(
  [string]$ProjectRoot = 'C:\MelodieCLI\PathOfMelodie',
  [string]$UEPath = 'D:\UE_5.8',
  [string]$EvidenceRoot = 'C:\MelodieCLI\PathOfMelodie\Reports\ReleaseEvidence',
  [ValidateSet('Win64')][string]$Platform = 'Win64',
  [ValidateSet('Development','Shipping')][string]$Configuration = 'Shipping',
  [switch]$SkipBuild,
  [switch]$SkipCook,
  [switch]$SkipStage,
  [switch]$SkipPackage,
  [switch]$SkipRuntimeSmoke,
  [switch]$RunAutomationTests,
  [switch]$UseDockerQualityGate
)
```

The defaults must perform the full release attempt; every `Skip*` flag must be clearly recorded in evidence as a skipped gate and must prevent a final `RELEASE_VERIFIED` result.

---

## B. Non-negotiable safety contract

The generated script must:

- use `Set-StrictMode -Version Latest` and `$ErrorActionPreference = 'Stop'`;
- never overwrite, delete, move, or regenerate `.env`, `.env.*`, secrets, signing keys, wallets, save data, user assets, or unrelated project work;
- never execute `git reset --hard`, `git clean`, `Remove-Item` against project directories, registry optimizers, credential actions, automatic funding, transfers, transaction signing, or blockchain broadcasts;
- never expose credentials in logs; redact known secret-looking environment variable values if environment metadata is captured;
- use an isolated, timestamped evidence directory and a dedicated staged/package output directory beneath the project’s `Saved` or `Reports` area;
- create only missing evidence/output subdirectories;
- avoid broad process killing and global Windows configuration changes;
- retain logs even on failure;
- set a non-zero process exit code on all failed or blocked required gates;
- record the actual external-command exit code and command line with sensitive values redacted.

Treasury and finance remain read-only. No real payment, transfer, signing, broadcasting, or fabricated revenue evidence is part of this script.

---

## C. Evidence state model

Use exactly these states in JSON and the human-readable summary:

`VERIFIED`, `IMPLEMENTED_NOT_TESTED`, `UNVERIFIED`, `FAILED`, `BLOCKED`, `INCONCLUSIVE`, `NOT_STARTED`, `SKIPPED`.

Each gate object must contain at least:

```json
{
  "name": "COOK",
  "status": "VERIFIED",
  "startedUtc": "...",
  "finishedUtc": "...",
  "command": "...",
  "exitCode": 0,
  "logPath": "...",
  "artifacts": ["..."],
  "detail": "...",
  "nextAction": "..."
}
```

The final result may be `RELEASE_VERIFIED` **only if** all required preflight, build, automation (when requested), cook, stage, package, artifact inventory, packaged launch/runtime smoke, and final manifest gates report `VERIFIED`.

Any skipped or failed required gate makes the final result `RELEASE_NOT_VERIFIED`.

---

## D. Required validation gates

### D1. Preflight

Validate, without modifying:

- PowerShell version is 7+;
- project directory and `.uproject` exist;
- UE directory exists;
- exact required tools exist:
  - `Engine\Build\BatchFiles\Build.bat`
  - `Engine\Build\BatchFiles\RunUAT.bat`
  - `Engine\Binaries\Win64\UnrealEditor-Cmd.exe`
- free disk space is measured and reported;
- required output folders are writable;
- Visual Studio/MSVC availability is inspected and recorded;
- any existing `.env` and key-related files are listed by name only, never content;
- current git revision is captured when Git is available, but absence of Git is recorded rather than mutated.

If a required tool is missing, mark `PREFLIGHT` `BLOCKED`, write the evidence summary, and stop.

### D2. Build

Use native Windows Unreal tooling. Do not run Unreal compilation in Linux Docker.

Build the game target in the requested configuration using `Build.bat`. Discover the target name safely from available `*.Target.cs` files or accept a validated `-TargetName` optional parameter; do not assume an arbitrary target name. Record the exact discovered target and its source.

Run the build with stdout and stderr captured to `build.log`. The external exit code must be checked immediately. A non-zero code makes `BUILD` `FAILED` and stops downstream gates.

### D3. Optional automation tests

Only when `-RunAutomationTests` is specified, invoke `UnrealEditor-Cmd.exe` with a noninteractive automation-test command appropriate to the project. Capture output to `automation.log`; do not treat a process launch as test success. Parse and report the return code and any explicit automation failure summary. If the results are ambiguous, use `INCONCLUSIVE`, block the release result, and stop.

### D4. Cook → stage → package

Use `RunUAT.bat BuildCookRun` and a command structure appropriate for a Win64 packaged client. The default full path must include the equivalent of:

```text
-project="<uproject>" -noP4 -platform=Win64 -clientconfig=Shipping
-build -cook -stage -package -archive -archivedirectory="<timestamped output>"
```

The implementation may use individual invocations only if it preserves a distinct evidence gate outcome for cook, stage, and package. Do not report cook/stage/package as verified merely because BuildCookRun produced a directory. Validate each outcome using both exit status and expected artifact checks.

Do not use `-skipbuild`, `-skipcook`, or `-skipstage` in the normal full path. If the matching explicit skip switch is used, record `SKIPPED` and make release non-verified.

Capture `cook.log`, `stage.log`, and `package.log` (or a unified UAT log plus clearly separated stage markers), record UAT exit code, and retain the exact archive root.

### D5. Packaged artifact inventory

After successful package:

- locate the packaged executable beneath the archive root;
- create `packaged-artifact-inventory.json` with relative path, byte length, SHA-256, and last-write UTC for every packaged file;
- create `packaged-artifact-inventory.txt` with a readable summary;
- fail the package gate if no executable or no valid archive contents are found;
- never create fake executable names or empty marker files to satisfy this gate.

### D6. Runtime smoke test

Run only after a verified package and discovered executable. Use a short, noninteractive launch with safe flags such as `-unattended -nullrhi -nosound -log` only if supported by the packaged game. Direct log output to the evidence directory. Impose a bounded timeout; if the process survives the expected window, gracefully stop that specific process and classify the outcome based on its log and exit state.

The smoke gate requires:

- executable starts;
- no immediate crash/non-zero failure;
- process/log output is captured;
- a clearly stated bounded duration;
- evidence supports the classification.

If the game cannot be smoke-tested noninteractively, mark `INCONCLUSIVE`, preserve the command/log, and do not call the release verified.

---

## E. Docker quality gate (optional, non-authoritative)

When `-UseDockerQualityGate` is provided and Docker is present, the script may run a read-only Docker validation step against a copy or mounted evidence directory. It may validate JSON schema, file presence, manifest hashes, and status consistency. It must not build Unreal, write into the project, or convert a failed/blocked/inconclusive host gate into a pass.

If Docker is not present, record `DOCKER_QUALITY_GATE` as `SKIPPED` and continue; the Windows host gate remains authoritative.

---

## F. Required outputs

Write these inside one timestamped directory:

```text
<EvidenceRoot>\release-<UTC timestamp>\
  release-summary.json
  release-summary.txt
  environment.json
  preflight.log
  build.log
  automation.log                  (when requested)
  cook.log
  stage.log
  package.log
  runtime-smoke.log
  packaged-artifact-inventory.json (after successful package)
  packaged-artifact-inventory.txt  (after successful package)
  commands.txt
  manifest.sha256
```

`release-summary.txt` must show a concise gate table followed by the exact next action. `release-summary.json` must be valid UTF-8 JSON with no comments or trailing commas. `manifest.sha256` must contain SHA-256 values for evidence files that exist.

At completion print:

```text
=== PATH OF MELODIE RELEASE RESULT ===
Result: RELEASE_VERIFIED | RELEASE_NOT_VERIFIED
Evidence: <absolute evidence directory>
Package:  <absolute archive directory or NOT_CREATED>
Next:     <single actionable command or human decision>
```

---

## G. Current truth that the script must respect

Known historical evidence is not permission to skip any gate:

| Area | Current known state |
|---|---|
| UE editor C++ build | VERIFIED in prior cycle evidence |
| UE automation tests | VERIFIED in prior cycle evidence |
| Shipping build | VERIFIED in prior cycle evidence |
| Runtime smoke | FAILED in prior cycle evidence |
| Cook | FAILED or incomplete in prior cycle evidence |
| Stage | FAILED or incomplete in prior cycle evidence |
| Package | FAILED in prior cycle evidence |
| GDevelop capture gate | INCONCLUSIVE; outside native UE package proof |
| R03 and Maakara Prime | LOCKED pending their real gate conditions |

Past success must be recorded as context only. This script must create fresh evidence for its own run and must not infer a pass from old files.

---

## H. Implementation quality requirements

- Implement small reusable PowerShell functions: `Write-Log`, `Invoke-External`, `Set-Gate`, `Write-Evidence`, `Get-Sha256`, `Get-AvailableTarget`, and a safe runtime-smoke function.
- Use `Start-Process` or direct invocation in a way that preserves external exit codes and captures stdout/stderr reliably.
- Do not trust `$?` alone for `.bat` files; check `$LASTEXITCODE` or `Process.ExitCode`.
- Quote paths robustly; support spaces.
- Use ISO 8601 UTC timestamps in metadata and a filesystem-safe UTC stamp in directory names.
- Ensure failure handling writes the summary/manifest before terminating.
- Avoid PowerShell syntax that behaves differently under Windows PowerShell 5.1; target PowerShell 7.
- Preserve testability: `-Skip*` is allowed for diagnostics but never produces `RELEASE_VERIFIED`.
- Add comments explaining safety boundaries and every Unreal command.

---

## I. Acceptance checklist for your output

Before you answer, validate your generated script against every item:

- [ ] A full normal invocation attempts build, cook, stage, package, inventory, and runtime smoke.
- [ ] It never claims a release pass after a skipped or failed gate.
- [ ] It preserves `.env`, keys, wallets, save data, and unrelated work.
- [ ] It records each external command, exit code, log file, artifacts, and next action.
- [ ] It does not rely on Docker for native Unreal compilation or authoritative release status.
- [ ] It has no placeholders or pseudo-code.
- [ ] Its release status is based on fresh evidence from the current run.
- [ ] It prints a concise human-readable result and persists a valid machine-readable result.

Now generate the complete `BUILD-PATH-OF-MELODIE-RELEASE.ps1` script.
