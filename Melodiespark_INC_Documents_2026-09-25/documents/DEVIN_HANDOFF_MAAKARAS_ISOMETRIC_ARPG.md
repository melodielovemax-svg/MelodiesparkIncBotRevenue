# Devin Build Handoff — Path of Melodie: Maakaras Protocols

## Mission

Convert the existing Unreal Engine 5.8 C++ project into a playable **isometric action RPG**. The reference *feel* is the readability and combat cadence of Diablo and Path of Exile, but all characters, world, music, enemies, names, assets, story, UI, and code must be original to Melodiespark Inc.

This is not a first-person shooter. Do not retain FPS camera, gun, crosshair, or shooter loops as the primary experience.

## Canonical Project and Toolchain

| Item | Required value |
|---|---|
| Engine | Unreal Engine 5.8 |
| Working project | `C:\\Users\\melod\\Documents\\Unreal Projects\\PathofMelodie 5.8\\PathofMelodie.uproject` |
| Original preserved project | `C:\\MelodieCLI\\PathOfMelodie\\PathOfMelodie.uproject` |
| C++ module | `PathOfMelodie` |
| Editor target | `PathOfMelodieEditor` |
| Initial playable map | `Content/Maps/TestMap.umap` |
| Engine install | `D:\\UE_5.8` |
| Primary platform | Windows 64-bit |
| Hardware acceptance target | i5-6500, GTX 1050 2 GB, 16 GB RAM |

## Current Facts (Do Not Overstate)

- The copied project contains `Source/PathOfMelodie.Target.cs`, `Source/PathOfMelodieEditor.Target.cs`, and `Source/PathOfMelodie/PathOfMelodie.Build.cs`.
- The source project previously achieved an editor C++ build and automation-test pass; runtime smoke, cook, stage, and package were not yet verified.
- The copied project has **not** yet achieved a verified baseline build in its new location.
- A prior build invocation failed only because it passed no target name. It was not a compile failure.
- Asset-factory briefs exist, but no claim may say that 30,000 finished Unreal assets were imported.

## Non-Negotiable Product Definition

### Player fantasy

The player is a melody-bonded combatant who purifies corrupted Maakara Protocols through rhythmic elemental magic. Combat rewards positioning, timing, build choices, and clear telegraphs.

### Camera and control

- Third-person **isometric** camera: elevated, pitched down, with an optional slight yaw; no eye-level/FPS view.
- Camera follows a spring arm and keeps the player in a lower-middle safe frame.
- Keyboard movement: world-relative WASD/controller left stick.
- Mouse: aim/cast direction; optional click-to-move only if fully functional and tested.
- Controller: right stick aims; face buttons and triggers cast skills.
- Camera must not clip through terrain or jitter under normal traversal.

### Vertical-slice loop

1. Spawn in TestMap hub/arena.
2. Move and aim from isometric view.
3. Use a basic musical attack and a cooldown ability.
4. Defeat a small wave of hostile corrupted entities.
5. Receive visible experience/loot feedback.
6. Interact with a goal marker or portal and complete the encounter.
7. Save/load minimal player settings or progression state.

## Build in This Order

### 0. Preserve and establish truth

1. Create a Git branch and baseline commit before modifications; never overwrite `.env` files or credentials.
2. Run the explicit editor target build:

```powershell
& 'D:\\UE_5.8\\Engine\\Build\\BatchFiles\\Build.bat' `
  'PathOfMelodieEditor' 'Win64' 'Development' `
  '-Project=C:\\Users\\melod\\Documents\\Unreal Projects\\PathofMelodie 5.8\\PathofMelodie.uproject' `
  '-WaitMutex' '-NoHotReloadFromIDE'
```

3. Capture the log, exit code, exact commit, Unreal version, and any changed files. Do not begin a shipping build until the editor target is green.

### 1. Replace the FPS shell with an isometric foundation

Create or adapt clearly named C++ classes; do not duplicate a class under multiple names.

- `AMaakarasCharacter` — third-person/isometric pawn, capsule, mesh, movement component, health/mana, ability entry points.
- `AMaakarasPlayerController` — Enhanced Input bindings, cursor/aim projection, command routing.
- `AMaakarasPlayerCameraManager` or camera component setup — stable elevated camera, collision-aware spring arm, no first-person camera.
- `AMaakarasGameMode` — assigns default pawn/controller/HUD.
- `AMaakarasEnemyCharacter` — minimal state machine: idle, pursue, wind-up, attack, hit, dead.
- `UMaakarasCombatComponent` — data-driven damage/cooldown/resource checks; server-authoritative boundaries if multiplayer is later enabled.
- `AMaakarasProjectile` or pooled spell actor — capped lifetime, collision channel, damage payload, VFX/SFX hooks.

Use Unreal naming conventions, `UPROPERTY` exposure only where useful, and `UE_LOG` categories for testable errors. Fix root causes rather than commenting out compiler errors or disabling plugins broadly.

### 2. Isometric map and encounter

- Retain `TestMap` as the first verified map unless a replacement map is deliberately created and configured as the default.
- Place a player start, collision-safe floor, camera-tested walls, one encounter zone, one objective/exit, and navigation support only if AI needs it.
- Start with three enemy archetypes: melee pursuer, slow ranged caster, and telegraphed elite. Reuse a small original asset set rather than generating unusable placeholders.
- Make spawn limits configurable. No unbounded actor spawning.

### 3. Combat and progression minimum

- Primary attack: responsive musical bolt or close-range pulse.
- Skill 1: area effect with clear ground telegraph.
- Skill 2: mobility or defensive beat.
- All damage runs through one health/damage path with invulnerability/death handling.
- Enemy death: despawn safely after feedback, grant test XP/loot event, no client-only authority claim.
- HUD: health, resource, cooldowns, objective, pause/settings, and FPS display in development only.

### 4. Quality, menus, save, and input

- Implement pause and settings screens that change scalability, resolution, master volume, and frame cap.
- Save only non-sensitive local preferences/progression. Do not add Web3, payments, real currency, wallet signing, or online account code to this vertical slice.
- Validate keyboard/mouse and controller paths separately.

## Low-End Performance Contract

Target 60 FPS on the stated i5-6500 / GTX 1050 2 GB hardware at 1280x720 or 1600x900 **Low**. This is a target to measure, not a claim until profiled.

- Disable Lumen, Nanite, hardware ray tracing, virtual shadow maps, motion blur, depth of field, bloom-heavy effects, and costly screen-space effects for the low preset.
- Favor baked/static lighting, compact arenas, simple materials, small texture budgets, capped particles, and pooled transient actors.
- Cap active enemies, projectiles, and effects. Expose caps in a data asset/config.
- Avoid Tick when timers/events suffice; profile any remaining Tick.
- Add `r.ScreenPercentage`, scalability, and frame-limit options. Provide 30 FPS fallback for unstable low-end situations.
- Use Unreal Insights/stat unit/stat gpu evidence. Do not call it 60 FPS based solely on an empty editor viewport.

## Required Config Outcomes

- DefaultGame.ini points to the isometric GameMode and an intentional startup map.
- DefaultInput.ini / Enhanced Input mappings have move, aim, primary attack, skills, interact, pause, and controller equivalents.
- DefaultEngine.ini enables the appropriate navigation/collision channels only when required.
- Package settings remain Windows-focused until the first packaged build passes.

## Explicit Exclusions

- No copied Diablo, Path of Exile, Torchlight, or other third-party art/code/audio/levels/characters.
- No massive procedural content claim, fake asset counts, mock revenue, wallet automation, token minting, or payment flow.
- No force-killing user processes, disabling Windows security, broad Defender exclusions, destructive clean commands, or overwriting the original project.
- No release claim from compile-only evidence.

## Acceptance Gates

| Gate | Evidence required |
|---|---|
| Source integrity | Git diff + commit + changed-file manifest |
| Editor compile | `PathOfMelodieEditor Win64 Development` exit code 0 |
| Editor launch | Project opens from copied `.uproject` without blocking module/dialog error |
| Isometric proof | Screenshot/video showing elevated camera, movement, aiming, and no FPS gun/camera |
| Combat proof | One completed encounter: player damages enemies, enemies damage player, enemies die cleanly |
| Performance proof | 60-second capture at target Low settings with average FPS, 1% low, resolution, hardware, and active enemy count |
| Package proof | Cook, stage, package exit code 0 plus packaged executable smoke test |

Status labels must be: `VERIFIED`, `FAILED`, `BLOCKED`, or `UNVERIFIED`. File presence is not verification.

## Delivery Structure

Deliver in small commits, each with a build log and concise report:

1. `baseline/copied-project-build`
2. `feature/isometric-camera-controller`
3. `feature/player-combat-core`
4. `feature/enemy-encounter-testmap`
5. `feature/hud-settings-save`
6. `perf/low-end-profile`
7. `release/windows-package-proof`

For each commit: intent, files changed, build command, exit code, tests/smoke actions, known risks, and rollback command. Stop and report a concrete blocker rather than substituting placeholder claims.

## Definition of Done for the First Playable Slice

The game launches on Windows, enters TestMap, presents an isometric camera, supports move/aim/cast, completes one original combat encounter, displays core HUD/settings, runs acceptably at low settings on the target machine, and has evidence for compile, launch, runtime, performance, and packaging. It is not the claim of the full final game; it is the verified foundation for Maakaras Protocols.
