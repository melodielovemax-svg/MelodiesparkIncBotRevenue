# DEVIN TRANSFER — Path of Melodie: Maakaras Protocols

## Mission

Take ownership of the existing Windows/Unreal project at
`C:\MelodieCLI\PathOfMelodie` and advance it from its current evidence-backed
state to a verified Windows release candidate with a real `.exe` and installer.

This is an implementation mission, not permission to claim completion before
evidence exists. Preserve all existing user work, credentials, content, and Git
history. Never overwrite `.env` files or fabricate build, test, gameplay,
performance, commerce, blockchain, or release evidence.

## Current Known State

- Product vision and P0 specification: approved baseline.
- Root pnpm lockfile: synchronized and frozen installation observed passing.
- `packages/kernel`: typecheck and build observed passing.
- `packages/phoenix`: package-scoped `tsconfig.json` was added; UUID v9 typings
  were required. Revalidate rather than assuming PASS.
- Factory tests: previously reported as 19/20; one plugin-disable test failed.
  This is a blocking failure until repaired and rerun.
- Unreal project files and UE 5.8 tools were observed at the expected paths,
  but a successful current UBT build, complete gameplay test, package, first
  run, and installer have not yet been proven.
- Broader `C:\MelodieCLI` contains many unrelated, archived, generated, and
  syntactically broken TypeScript projects. Do not use root-wide TypeScript
  health as the Path of Melodie build boundary.

## Canonical Paths

| Purpose | Path |
| --- | --- |
| Workspace | `C:\MelodieCLI` |
| Game | `C:\MelodieCLI\PathOfMelodie` |
| Unreal project | `C:\MelodieCLI\PathOfMelodie\PathOfMelodie.uproject` |
| Unreal Engine | `D:\UE_5.8` |
| Build.bat | `D:\UE_5.8\Engine\Build\BatchFiles\Build.bat` |
| RunUAT.bat | `D:\UE_5.8\Engine\Build\BatchFiles\RunUAT.bat` |
| Editor command | `D:\UE_5.8\Engine\Binaries\Win64\UnrealEditor-Cmd.exe` |
| Kernel | `C:\MelodieCLI\packages\kernel` |
| Phoenix | `C:\MelodieCLI\packages\phoenix` |
| CLI Core | `C:\MelodieCLI\apps\cli` |
| MelodieCLI | `C:\MelodieCLI\apps\melodie-cli` |
| Evidence | `C:\MelodieCLI\PathOfMelodie\Reports\ReleaseEvidence` |

Resolve paths again during preflight. A path listed here is not proof that it
still exists.

## Immutable Operating Rules

1. `DESIGNED != IMPLEMENTED != TESTED != VERIFIED != RELEASED`.
2. File presence is never verification.
3. Build exit code zero is not proof that the game is playable.
4. A packaged executable is not a released product.
5. Never mark a test gate PASS when any required assertion fails.
6. Never waive the plugin-disable failure as “minor.”
7. Never use a mock launch check or fabricated transaction.
8. Never modify, disclose, copy, or regenerate secrets unnecessarily.
9. Finance, wallet, token, and blockchain functionality stays read-only or
   disabled unless separately authorized and legally cleared.
10. Blockchain is the ownership authority; databases are entitlement caches.
11. MA token implementation remains blocked pending legal compliance approval.
12. Preserve the separation of game gold, Karma progression, and crypto assets.
13. Do not delete user files, reset Git, or discard dirty-worktree changes.
14. Every gate must record command, UTC timestamp, exit code, logs, artifacts,
    SHA-256, and previous evidence hash.

## Product Target: P0 Foundation Slice

Deliver a real, deterministic vertical slice containing:

- Genesis Refuge hub with Architect NPC, forge, stash, menus, and spawn flow.
- One playable heroine with equipped starting gear.
- Sword, hammer, and spear families with 3–4 real skills each.
- One music-combat grammar: skill emits note; three notes resolve melody;
  melody enables a readable power state; audio and VFX resolve on the same
  gameplay event.
- One linear dungeon with 5–7 deterministic encounter chambers.
- ALPHA Protocol boss with three distinct attack patterns, silhouette-readable
  telegraphs, one irreversible Karma choice, one defeat condition, and one
  deterministic loot table.
- One-slot save/load covering inventory, equipment, stats, cleared chambers,
  ALPHA state, and safe reload at dungeon entry.
- Legacy preset suitable for GTX 1050-class hardware.
- Automation test from new character through ALPHA defeat and save.

## A–Z Execution Contract

### A — Acquire Baseline

- Inventory repository, Git root/branch/status, submodules, large files, engine
  association, plugins, source modules, maps, configs, assets, tests, scripts,
  and current evidence.
- Create a baseline manifest and SHA-256 inventory without hashing active logs.

### B — Back Up Safely

- Create a dedicated Git branch and non-destructive checkpoint.
- Do not stage secrets, generated binaries, caches, or unrelated roots.

### C — Confirm Factory Dependencies

- Run frozen pnpm installation at the workspace root.
- Inspect `allowBuilds`; do not authorize new lifecycle scripts silently.
- Record pnpm, Node, lockfile, and policy versions/hashes.

### D — Debug Factory Tests

- Reproduce the plugin-disable test alone.
- Repair lifecycle behavior in production code; do not weaken/remove the test.
- Run complete Kernel and Phoenix suites with structured Jest output.
- Require 100% pass for required tests.

### E — Establish Factory Boundary

- Validate only Kernel, Phoenix, CLI Core, and MelodieCLI for the game factory.
- Use package-local TypeScript configurations.
- Do not include reports, migration backups, unrelated products, or archives.

### F — Factory Build

- Typecheck and build Kernel, Phoenix, CLI Core, and MelodieCLI in dependency
  order.
- Prove expected `dist` artifacts exist and hash them.

### G — Game Source Census

- Parse `.uproject`, target files, module Build.cs files, C++ headers/sources,
  maps, configs, assets, tests, TODO/FIXME/MOCK markers, and compile database.
- Classify each subsystem as PRESENT, IMPLEMENTED, TESTED, VERIFIED, or BLOCKED.

### H — Harden Unreal Configuration

- Validate UE 5.8 association, target names, modules, plugin dependencies,
  default maps, input mappings, collision channels, packaging settings, and
  supported Windows SDK/toolchain.
- Remove deprecated configuration only with documented replacements.

### I — Implement Core Player

- Character, movement, camera, input, health/resources, equipment, damage,
  death/respawn, and deterministic initialization.

### J — Implement Weapons

- Sword, hammer, and spear data/abilities, animation hooks, cooldowns, damage,
  hit validation, and readable feedback.

### K — Implement Music Grammar

- Typed gameplay events for notes and melody resolution.
- Authoritative state transitions; synchronized audio/VFX; accessible cues.

### L — Lay Out Genesis Refuge

- Real `.umap`, spawn, NPC interaction, forge, stash, UI access, and dungeon
  transition. No empty placeholder map may satisfy this gate.

### M — Make Dungeon Route

- Five to seven real chambers, deterministic encounter definitions, traversal,
  checkpoints, arena transition, and completion tracking.

### N — Create ALPHA

- Boss state machine, three attacks, telegraphs, phases if justified, Karma
  choice, victory event, loot, and save integration.

### O — Operate Save/Load

- Versioned schema, atomic write, corruption handling, exact state assertions,
  backward-compatible migration policy, and close/reopen test.

### P — Performance Presets

- Cinematic, Ultra, Performance, Legacy, and low-overhead/2D strategy where
  feasible. Legacy must preserve attack readability.

### Q — Quality and Accessibility

- Input rebinding, scalable UI, subtitles, speaker/direction cues, non-color
  damage signals, pause behavior, error handling, and crash logging.

### R — Real UBT Build

Run the real editor target:

```powershell
& 'D:\UE_5.8\Engine\Build\BatchFiles\Build.bat' `
  PathOfMelodieEditor Win64 Development `
  '-Project=C:\MelodieCLI\PathOfMelodie\PathOfMelodie.uproject' `
  -WaitMutex -NoHotReloadFromIDE
```

Require exit code `0`, complete build log, expected binaries, and hashes.

### S — System Automation

Run `Genesis_Prototype_Start_to_Boss_Complete` through
`UnrealEditor-Cmd.exe`. Require discovered test count greater than zero,
explicit assertion results, exit code `0`, and a complete Unreal log.

### T — Test Save Persistence

- New game, progress, save, terminate, restart, load, and compare exact expected
  state. A same-process reload is insufficient.

### U — Unreal Packaging

Use real `RunUAT.bat BuildCookRun` with Win64 Shipping, build, cook, stage, pak,
and archive. Capture both stdout and stderr and use the child process exit code.

### V — Validate Executable

- Locate the packaged `.exe`, record size/hash, launch it, confirm process
  health, main menu, new game, Genesis Refuge load, clean shutdown, logs, and
  `FIRSTRUNCOMPLETED`.
- Do not call “file exists” a smoke-test PASS.

### W — Windows Installer

- Build a signed-ready installer using an available, declared installer system
  such as WiX or Inno Setup.
- Include application files, prerequisites, version metadata, Start Menu entry,
  uninstall support, upgrade behavior, license, install log, and integrity
  manifest.
- Do not claim code signing unless a real trusted certificate signs the files
  and verification passes.

### X — Cross-Machine Reproduction

- Install the identical artifact on two supported Windows machines.
- Prove matching installer hash and successful first-run events.
- Record hardware, OS, driver, runtime prerequisites, and results separately.

### Y — Yield Release Candidate

- Produce release notes, known issues, SBOM, third-party licenses, hashes,
  evidence index, rollback/uninstall instructions, minimum/recommended specs,
  and a clean distribution directory.

### Z — Zero-Fabrication Release Decision

Release candidate status requires all mandatory gates PASS. Public/commercial
release additionally requires product ownership clearance, content licenses,
security review, privacy/telemetry disclosure, store requirements, legal review,
support/rollback readiness, and an explicitly authorized release action.

## Required Evidence Gates

| Gate | Minimum evidence |
| --- | --- |
| Factory dependencies | Frozen install exit 0; lock/policy hashes |
| Factory compilation | Targeted typecheck/build exit 0; artifact hashes |
| Factory tests | All required tests pass; structured results |
| Unreal compilation | UBT exit 0; binaries; log and hashes |
| Playable hub | Runtime capture and assertions |
| Combat/music | Cast → note → melody → power → damage assertions |
| ALPHA | Full fight, Karma choice, victory and loot assertions |
| Persistence | Cross-process exact state comparison |
| Performance | GTX 1050 frame-time dataset and reproducible settings |
| Automation | Named test discovered and all assertions pass |
| Package | UAT exit 0; staged/pak/executable manifest |
| First run | Real process and `FIRSTRUNCOMPLETED` evidence |
| Installer | Install, launch, upgrade/reinstall, uninstall evidence |
| Reproduction | Same hashes and successful runs on two machines |
| Release | All prior gates plus legal/security/content approval |

## Evidence Schema

Every gate record must contain:

```json
{
  "gateId": "POM-GATE-0001",
  "timestampUtc": "ISO-8601",
  "status": "PASS|FAIL|BLOCKED|NOT_RUN",
  "command": "exact command without secrets",
  "workingDirectory": "absolute path",
  "exitCode": 0,
  "logPath": "absolute path",
  "logSha256": "SHA256",
  "artifactPaths": [],
  "artifactSha256": [],
  "previousEvidenceHash": "SHA256|GENESIS",
  "notes": "truthful interpretation"
}
```

Never write a PASS record merely because the script continued. Validate the
result object, process exit code, expected assertions, and artifacts.

## Installer Output Contract

Final distribution directory:

```text
C:\MelodieCLI\PathOfMelodie\Release\PathOfMelodie-P0-RC\
  PathOfMelodie-Setup-x64.exe
  PathOfMelodie-Win64.zip
  SHA256SUMS.txt
  SBOM.spdx.json
  THIRD-PARTY-LICENSES.txt
  RELEASE-NOTES.md
  KNOWN-ISSUES.md
  SYSTEM-REQUIREMENTS.md
  EVIDENCE-INDEX.json
```

Artifact names are targets, not claims that they currently exist.

## Status Vocabulary

- `NOT_RUN`: no valid execution evidence.
- `BLOCKED`: prerequisite unavailable or policy disallows progression.
- `FAIL`: execution occurred and acceptance criteria failed.
- `PASS`: the specific gate criteria passed with retained evidence.
- `RELEASE_CANDIDATE`: all engineering gates pass; final release approval not
  yet granted.
- `RELEASED`: authorized artifact actually distributed through the designated
  channel with recorded identity and rollback/support readiness.

## Devin Working Instructions

1. Begin by returning a concise baseline report; do not start broad rewrites.
2. Make small, reviewable commits with one concern per commit.
3. Preserve unrelated dirty-worktree changes.
4. Never repair generated/archive projects merely to make a broad root command
   green; correct the validation boundary instead.
5. After each failure, identify the earliest causal error rather than patching
   cascaded diagnostics.
6. Prefer Unreal-native automation, Gauntlet, and deterministic data assets.
7. Do not generate 30,000 assets before the P0 slice passes.
8. Do not implement MA token or real-value rewards without legal clearance.
9. Stop for missing credentials, signing certificates, store authority,
   external machines, or any destructive decision.
10. At every checkpoint, report VERIFIED, FAILED, BLOCKED, and NOT RUN
    separately.

## First Devin Response Required

Return exactly these sections after repository inspection:

1. `Baseline and Git Safety`
2. `Factory Gate Results`
3. `Unreal Toolchain Results`
4. `P0 System Inventory`
5. `First Blocking Defect`
6. `Proposed Smallest Patch`
7. `Evidence Paths`
8. `Next Authorized Action`

Do not state that the game is complete, playable, packaged, installed, or
released unless the corresponding evidence gate has passed.

## Immediate Starting Command

```powershell
Set-Location 'C:\MelodieCLI\PathOfMelodie'
git status --short
git rev-parse --show-toplevel
Get-Item '.\PathOfMelodie.uproject'
& 'D:\UE_5.8\Engine\Build\BatchFiles\Build.bat' `
  PathOfMelodieEditor Win64 Development `
  '-Project=C:\MelodieCLI\PathOfMelodie\PathOfMelodie.uproject' `
  -WaitMutex -NoHotReloadFromIDE
```

The build command is authorized only after Devin records the baseline and
confirms that running it will not overwrite unrelated user work.
