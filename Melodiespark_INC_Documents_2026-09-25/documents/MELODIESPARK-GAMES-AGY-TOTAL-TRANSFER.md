# MELODIESPARK INC — TOTAL GAMES OVERVIEW & AGY TRANSFER

**Transfer target:** AGY / Antigravity CLI  
**Owner:** Melodiespark Inc — Maxime Aubé / Melodie Max  
**Primary game:** *Path of Melodie: Maakara Protocols*  
**Secondary known game property:** *Apotheosis*  
**Document date:** 2026-09-16  
**Operating doctrine:** inspect first, preserve originals and credentials, build real systems, and never report a gate as passed without evidence.

---

## 1. AGY Mission

AGY is the coding and orchestration layer responsible for consolidating, auditing, repairing, implementing, testing, packaging, and documenting the Melodiespark game portfolio. AGY must work from the real filesystem and actual tool output. Plans, scaffolds, generated source, imported assets, compiled binaries, packaged builds, and runtime-tested releases are different states and must never be conflated.

The required evidence flow is:

`INTENT → INVENTORY → IMPLEMENTATION → BUILD → TEST → COOK → STAGE → PACKAGE → RUNTIME → EVIDENCE → RELEASE`

AGY must preserve all existing work, never overwrite `.env`, never expose credentials, never delete duplicate or obsolete projects automatically, and never fabricate build, performance, gameplay, revenue, player, or release evidence.

---

## 2. Portfolio Overview

### 2.1 Path of Melodie: Maakara Protocols

The flagship game is an isometric dark-fantasy action RPG inspired by the clarity, progression depth, loot energy, and visual intensity of modern ARPGs while maintaining original Melodiespark identity, lore, mechanics, art direction, naming, and implementation.

Core identity:

- Isometric action combat; never redesign as an FPS.
- Musical powers and resonance-driven abilities.
- Meaningful loot, itemization, crafting, upgrades, and build expression.
- Karma Ascension as non-financial game progression.
- Maakara bosses with staged encounters and mechanics.
- Arc Angels, Souls Core, Guardians, and Karma Ledger Protector pillars.
- Ten-act campaign target with maps, quests, events, encounters, bosses, cinematics, and endgame foundations.
- Scalable settings for low-end hardware, with higher visual tiers available only when supported.

### 2.2 Apotheosis

Apotheosis is a known Melodiespark game property. Its real project location, engine version, source status, design documentation, and playable state must be discovered from the workspace. AGY must not infer that it is implemented merely because its name appears in transfer documents.

Required first classification:

- `DISCOVERED`
- `DOCUMENTATION_ONLY`
- `SCAFFOLDED_UNVERIFIED`
- `BUILDABLE`
- `PLAYABLE`
- `PACKAGED`
- `RUNTIME_VERIFIED`

### 2.3 Additional game candidates

Any other discovered `.uproject`, Unity project, Godot project, game design document, source-art repository, prototype, packaged binary, or installer must be inventoried as a separate candidate. AGY must deduplicate by file hashes, project identifiers, source history, and content—not by folder name alone.

---

## 3. Canonical Workspaces and Environment

Known historical Windows roots include `C:\MelodieCLI`, `D:\MelodieCLII`, `H:\KAYLA`, and other migrated roots. The current Linux work includes:

- Workspace: `/home/melodiespark/Melodiespark`
- Unreal installation target: `/home/melodiespark/UnrealEngine/UE_5.8.2`
- Path of Melodie target: `/home/melodiespark/Melodiespark/UnrealProjects/PathOfMelodie`
- Project file target: `/home/melodiespark/Melodiespark/UnrealProjects/PathOfMelodie/PathOfMelodie.uproject`
- Large source-art candidate: `/home/melodiespark/Downloads/Path_of_Melodie_NECLAS_30000_Artworks`

These are discovery hints, not proof of current existence. AGY must locate the real roots and record them in an inventory before choosing a canonical project.

Known Linux workstation evidence:

- Ubuntu 24.04
- glibc 2.39
- Dell OptiPlex 7040
- Intel i5-6500, 4 cores / 4 threads
- NVIDIA GTX 1050, 2 GB VRAM
- NVIDIA proprietary driver 580.178.04 previously detected
- Vulkan previously detected the GTX 1050 as a discrete device
- Unreal Engine archive named `Linux_Unreal_Engine_5.8.2.zip`

Hardware and drivers must be rechecked on the active machine. The GTX 1050 target requires conservative defaults and bounded build parallelism.

---

## 4. Current Truth Snapshot

### Verified from prior evidence

- The intended game is *Path of Melodie: Maakara Protocols*.
- Its target genre is isometric action RPG.
- UE Linux dependencies, NVIDIA detection, and Vulkan detection previously passed.
- An Unreal 5.8.2 Linux archive was identified by filename.
- A prior Windows installer for Path of Melodie was compiled at 86.21 MB, with a recorded SHA-256 beginning `613572A7E1309522`; the full hash must be recovered from the manifest before use.
- Twelve source images were previously imported into an Unreal project in an earlier workspace.
- A prior cook and stage reportedly passed in an earlier Windows environment, but those results do not validate the current Linux tree.

### Failed or blocked in the latest Linux attempt

- `PathOfMelodieEditor` C++ build exited with code `1`.
- `PathOfMelodie` game build exited with code `1`.
- BuildCookRun/package later exited with code `150`.
- A script printed VERIFIED labels after failures because interactive PowerShell `return` did not abort the remaining pasted statements.
- No valid release manifest was produced in that failed run.

Therefore, the current Linux release status is **NOT VERIFIED**. Packaging must not be retried until the actual UnrealBuildTool compiler error is extracted and corrected.

### Planned or scaffolded, not yet proven complete

- Full combat and ability implementation.
- Arc Angels system.
- Souls Core system.
- Guardians system.
- Karma Ascension and Karma Ledger Protector.
- Three-phase Maakara boss framework.
- Complete loot, inventory, equipment, crafting, and progression.
- Acts 1–10 content.
- Multiplayer backend and live operations.
- Full 30,000-asset import and validation.
- Accessibility, controller, localization, telemetry, balance, and performance gates.

---

## 5. Game Vision and Player Experience

The player enters a fractured musical cosmos where harmony, memory, souls, karma, and corruption shape combat and world state. The intended experience combines fast readable combat with deep build crafting and emotionally resonant music-driven powers.

Primary loop:

1. Enter a region or dungeon.
2. Explore, fight, and solve encounter mechanics.
3. Earn verified in-game loot and progression rewards.
4. Develop abilities, equipment, Souls Core, and Karma Ascension.
5. Resolve quests, guardian events, and narrative choices.
6. Defeat a Maakara or major boss.
7. Return to a hub, craft, equip, allocate progression, and prepare the next run.
8. Save, exit, reload, and verify state continuity.

The Karma system is game progression only. It must not manufacture real monetary balances or be represented as redeemable currency unless a separately reviewed legal, economic, and technical design explicitly enables that later.

---

## 6. Required Gameplay Systems

### Player and camera

- Isometric camera with bounded zoom, rotation policy, occlusion handling, and camera shake accessibility control.
- Click-to-move and/or direct movement, configurable input, controller support, rebinding, and input buffering.
- Character movement, dodge, locomotion states, animation state machine, targeting, hit reactions, death, respawn, and checkpoints.

### Combat

- Damage pipeline with typed damage, criticals, armor/resistance, mitigation, status effects, stagger, resource costs, cooldowns, and deterministic ordering.
- Melee, ranged, projectile, area, channeled, movement, summon, aura, and defensive abilities.
- Clear telegraphs, cancel windows, invulnerability rules, crowd control, combat feedback, and combat logging.
- Gameplay Ability System may be used, but AGY must first inspect existing dependencies and modules.

### Musical powers

- Notes, chords, resonance, rhythm, harmony, and dissonance as original mechanical vocabulary.
- Abilities can chain into harmonies, alter zones, empower allies, destabilize enemies, or interact with environmental elements.
- Audio timing must enhance combat without making accessibility or latency-sensitive input unfair.

### Arc Angels

- High-order entities tied to roles, schools, covenants, or major progression paths.
- Each Arc Angel requires a unique silhouette, gameplay identity, encounter logic, lore, reward table, audio identity, and progression connection.

### Souls Core

- Modular progression foundation containing unlocks, modifiers, affinities, upgrade rules, capacity limits, and save serialization.
- Every modifier must be data-driven and testable; UI must expose source, effect, limits, and conflicts.

### Guardians

- Companions, protectors, summons, or encounter guardians, according to discovered canonical lore.
- Required behavior: acquisition, configuration, AI states, abilities, scaling, targeting, revival/despawn rules, and save/load.

### Karma Ascension and Karma Ledger Protector

- Karma is earned only from recorded in-game actions and validated objectives.
- The ledger records event type, source, amount, timestamp, session, version, and integrity data.
- Protector detects invalid mutation, duplication, impossible sequence, save rollback abuse, schema mismatch, and unsigned migration.
- Local integrity mechanisms must not be misrepresented as unbeatable anti-cheat.

### Enemies and AI

- Perception, navigation, threat, combat roles, behavior trees/state trees, group tactics, retreat, leashing, cooldowns, and difficulty scaling.
- Enemy archetypes must remain readable through silhouette, color, animation, effects, and audio.

### Bosses and Maakara encounters

- Minimum three-phase architecture with health or mechanic transitions.
- Phase-specific abilities, arenas, summons, hazards, checkpoints, wipe/reset behavior, loot tables, and cinematic hooks.
- Boss completion must generate auditable game-state evidence and save correctly.

### Loot and itemization

- Item bases, rarity, affixes, tags, requirements, sockets or equivalent build components, drop tables, crafting, comparison UI, filtering, inventory, stash, vendors, salvage, and equipment.
- Loot outcomes must come from real game events and deterministic/testable random-generation rules.

### Progression

- Character level, stats, skill allocation, Karma Ascension, Souls Core, quests, acts, unlocks, difficulty progression, and endgame hooks.
- Migration/version rules are required for every persistent schema.

### World, quests, and acts

- Acts 1–10 each require a region identity, hub or staging point, quest chain, side content, enemy families, events, dungeons, boss, rewards, transition, and completion state.
- Streaming, checkpoints, travel, respawn, interaction, collision, navigation, and world-state persistence must be validated.

### UI, accessibility, and localization

- HUD, menus, inventory, equipment, skills, Souls Core, Karma, quests, map, settings, pause, death, loading, credits, legal, and error states.
- Scalable UI, subtitles, color alternatives, reduced motion, remapping, controller navigation, audio sliders, readable telegraphs, and localization-ready strings.

### Save and account state

- Versioned save schema, atomic writes, backup/recovery, corruption detection, migration, character slots, settings separation, and deterministic test fixtures.
- Cloud or online synchronization remains disabled until its provider, conflict policy, privacy rules, and recovery path are implemented and tested.

---

## 7. Art, Audio, and Content Pipeline

Content categories include concept art, environments, characters, enemies, bosses, weapons, armor, items, icons, UI, materials, textures, VFX, animation, cinematics, music, dialogue, sound effects, 3D models, sprites, trailers, and marketing assets.

AGY rules:

- Preserve original source files under `SourceArt`; Unreal-generated `.uasset` files belong under `Content`.
- Copying an image into a project does not count as a successful Unreal import.
- Build a manifest containing source path, relative destination, media type, dimensions/duration, byte size, SHA-256, import state, Unreal object path, warnings, and license/provenance.
- Detect corrupt, unsupported, duplicate, near-duplicate, oversized, NPOT, alpha, color-space, naming, and path-length issues before bulk import.
- Import in bounded batches appropriate for 2 GB VRAM and limited RAM.
- Save assets, rescan the registry, and verify object existence after import.
- Never claim that 30,000 assets were generated or imported unless the count is proven from the manifest and Unreal registry.

Naming baseline:

- `T_` texture
- `M_` material
- `MI_` material instance
- `SM_` static mesh
- `SK_` skeletal mesh
- `A_` animation
- `S_` sound
- `NS_` Niagara system
- `BP_` Blueprint
- `WBP_` UI widget
- `DA_` data asset
- `DT_` data table
- `L_` level/map

---

## 8. Unreal Architecture Target

Suggested module boundaries, subject to inspection of existing code:

- `PathOfMelodieCore`: shared types, tags, logging, settings, versioning.
- `PathOfMelodieGameplay`: player, attributes, abilities, combat, interaction.
- `PathOfMelodieAI`: enemies, guardians, behavior, navigation, encounter control.
- `PathOfMelodieItems`: loot, inventory, equipment, crafting, vendors.
- `PathOfMelodieProgression`: Souls Core, Karma, quests, acts, unlocks.
- `PathOfMelodieWorld`: maps, streaming, checkpoints, travel, world state.
- `PathOfMelodieUI`: HUD, menus, settings, accessibility.
- `PathOfMelodieAudio`: music systems, resonance, SFX integration.
- `PathOfMelodieDeveloper`: validation commands, test fixtures, evidence export; editor/development only.

Prefer data-driven assets and gameplay tags over hardcoded content. Every new plugin or module must have an explicit owner, purpose, dependency reason, build status, and removal strategy.

---

## 9. Performance Baseline

Primary low-end reference machine is the i5-6500 / GTX 1050 2 GB system. The target is playable performance, with a stretch goal of 60 FPS at the lowest supported preset. AGY must not promise 60 FPS until a packaged build is profiled on target hardware.

Initial conservative profile:

- Texture streaming enabled.
- Streaming pool approximately 800–900 MB, refined through measurement.
- Nanite off unless a measured content-specific exception is justified.
- Lumen and hardware ray tracing off.
- Virtual shadow maps off.
- Bounded view distance, effects, foliage, particles, decals, and dynamic lights.
- LODs/HLODs and simplified collision required.
- Shader compilation and build parallelism kept conservative.
- Frame-time evidence must include game, render, GPU, memory, hitch, loading, and asset-streaming metrics.

Presets: Potato, Low, Medium, High, Ultra. Release acceptance requires the minimum supported preset to be stable in packaged runtime, not merely in-editor.

---

## 10. Build and Release Gates

AGY must execute gates in order and stop on failure:

1. Workspace discovery and hash inventory.
2. Canonical `.uproject` selection.
3. Unreal installation and toolchain verification.
4. Project-file generation.
5. Editor target compile.
6. Game target compile.
7. Static validation and automated tests.
8. Headless editor/project load.
9. Asset registry and redirector validation.
10. Cook.
11. Stage.
12. Package/archive.
13. Packaged executable discovery.
14. Runtime smoke test.
15. New game → combat → loot → save → exit → reload.
16. Boss/Maakara completion path.
17. Performance and memory capture.
18. SHA-256 manifest and evidence envelope.
19. Release candidate approval.

Each gate records command, working directory, timestamps, exit code, log path, artifacts, hashes, and status. Allowed statuses are `VERIFIED`, `FAILED`, `BLOCKED`, `UNVERIFIED`, and `DISABLED`.

An artifact existing on disk is not enough to mark a gate VERIFIED. A packaged executable is not a verified release until runtime and gameplay smoke tests pass.

---

## 11. Immediate AGY Work Order

### Phase 0 — Safe intake

1. Print AGY version and active working directory.
2. Detect OS, CPU, RAM, disks, GPU, drivers, Vulkan, compilers, Git, Git LFS, PowerShell, Python, Node, and Unreal installations.
3. Discover all likely Melodiespark roots and every `.uproject` without modifying them.
4. Capture Git roots, remotes, branches, dirty state, nested repositories, archives, installers, manifests, and evidence folders.
5. Search for `.env` files by pathname only; never print their contents.

### Phase 1 — Portfolio census

Create:

- `GAME-PORTFOLIO-INVENTORY.json`
- `PROJECT-VARIANTS.csv`
- `DEPENDENCY-MAP.md`
- `ASSET-CENSUS.json`
- `BUILD-EVIDENCE-INDEX.md`
- `RISKS-BLOCKERS.md`
- `TRUTH-LEDGER.jsonl`
- `CHANGE-LEDGER.jsonl`

Classify Path of Melodie, Apotheosis, and all other candidates. Do not merge or delete variants.

### Phase 2 — Fix current Linux compilation

1. Run `PathOfMelodieEditor Linux Development <uproject> -WaitMutex -Verbose` as one saved script, not interactively pasted fragments.
2. Preserve the complete UnrealBuildTool log.
3. Extract the first causal compiler/toolchain error, not only the final exit code.
4. Apply the smallest fix consistent with existing architecture.
5. Rebuild the editor target until exit code `0`.
6. Build the game target until exit code `0`.
7. Commit or checkpoint only related changes with evidence.

Do not run packaging while either C++ target fails.

### Phase 3 — Vertical slice

Deliver one evidence-backed playable slice containing:

- Isometric camera and movement.
- One player archetype.
- Basic attack, one movement skill, one musical power, and one defensive skill.
- Three regular enemy archetypes.
- One guardian or companion behavior.
- Loot pickup, inventory, equipment, and one upgrade path.
- Souls Core minimum viable progression.
- Karma event recording and integrity validation.
- One quest chain and one complete region.
- One three-phase Maakara boss.
- Save, exit, reload, and boss-completion persistence.
- Low-end preset and packaged-runtime performance capture.

### Phase 4 — Expand toward ten acts

Scale only after the vertical slice passes. Use reusable encounter templates, data assets, procedural placement where appropriate, content validation, automated regression, and per-act completion gates.

---

## 12. Security, Legal, and Economy Boundaries

- Preserve credentials and never overwrite `.env`.
- Never commit secrets, private keys, wallet seed phrases, tokens, API credentials, or personal data.
- No autonomous transfers, swaps, withdrawals, treasury movement, or funding.
- Any real financial operation requires explicit user approval and an external signer where applicable.
- Game Karma/KPP/MA progression must remain separate from real currency and revenue accounting.
- No mock, simulated, synthetic, or forecast value may be labeled real revenue.
- Third-party assets require provenance and licensing records before release.
- Inspiration from other games must not become copied characters, names, maps, lore, UI, code, textures, audio, or trade dress.
- Multiplayer, telemetry, accounts, commerce, and online services require privacy, consent, retention, security, and failure-mode review.

---

## 13. Integration with the Melodiespark Platform

The game layer may integrate with the wider Phoenix Continuum only through explicit contracts:

- **BITSUM Gate:** identity, sessions, rate limiting, audit boundaries.
- **PowerShield:** policy and enforcement.
- **MelodieLiteLLM / PhoenixLLM:** model routing, RAG, context, and approved AI features.
- **Phoenix:** work orders, orchestration, builds, tests, deployment, and evidence.
- **Game Gateway:** game-facing service boundary.
- **Identity Nexus / Legal Nexus:** authorization, consent, policy, and evidence chain.
- **MetaMello / Web3:** external-wallet and chain services only when separately enabled and approved.
- **BotRevenue / commerce:** legitimate storefront, orders, verified payments, fulfillment, and accounting; never gameplay-generated money.

Offline single-player gameplay must not fail merely because an optional platform, AI, wallet, commerce, telemetry, or account service is unavailable.

---

## 14. Definition of Done

Path of Melodie is not done because source exists, art was copied, or Unreal produced an executable. A release candidate is acceptable only when:

- The canonical source tree and provenance are known.
- Editor and game targets compile cleanly.
- Automated tests and validators pass.
- Cook, stage, and package pass from a clean state.
- The packaged build launches on target hardware.
- The vertical slice is playable end to end.
- Save/reload preserves valid state.
- The Maakara encounter can be completed.
- Performance and memory stay within documented budgets.
- No secrets or unlicensed assets are included.
- A complete SHA-256 manifest and Evidence Envelope exist.
- All unresolved risks are explicitly listed.
- Release status is approved by the owner.

---

## 15. AGY Execution Prompt

Use the following as the top-level AGY instruction:

> You are the lead game engineering and release agent for Melodiespark Inc. Read this transfer completely. Work evidence-first and fail closed. Begin with read-only discovery of the real machine and all Melodiespark game roots. Locate every `.uproject`, identify Path of Melodie: Maakara Protocols and Apotheosis, inventory variants and dependencies, preserve all originals and credentials, and create the required truth/change/evidence ledgers. Make Path of Melodie the primary Unreal Engine 5.8.2 target. Do not claim unverified systems are complete. First diagnose and fix the current `PathOfMelodieEditor` build failure using the full UnrealBuildTool log; do not package until both editor and game targets compile with exit code 0. Then execute tests, cook, stage, package, runtime smoke, vertical-slice gameplay, save/reload, Maakara completion, performance capture, and release manifest gates in order. Stop at every failed gate, report the causal error and evidence path, and apply the smallest safe correction. Never overwrite `.env`, expose secrets, delete variants automatically, fabricate revenue or balances, or perform financial/token transfers. Keep Karma and other game progression non-financial. Optimize for the i5-6500 and GTX 1050 2 GB low-end reference without claiming 60 FPS until measured in a packaged build.

---

## 16. Required Final AGY Report

AGY must return:

1. Canonical project paths and discovered variants.
2. Portfolio classification for every game candidate.
3. Toolchain and Unreal version evidence.
4. Build/test/cook/stage/package/runtime gate table.
5. Implemented gameplay systems with source paths and tests.
6. Planned, blocked, disabled, and unverified systems.
7. Asset counts, import counts, failures, provenance gaps, and registry verification.
8. Performance results by preset and test scene.
9. Security, privacy, licensing, and release risks.
10. Release artifact paths, sizes, hashes, and manifest hash.
11. Exact reproduction commands.
12. The next smallest work order if release is not yet approved.

This document transfers intent and known state. The filesystem, source control, compiler output, Unreal logs, runtime behavior, and signed evidence remain the authorities for implementation truth.
