# Path of Melodie — Production ARPG Implementation Transfer

**Target model:** Gemini Flash 3.8  
**Role:** Principal game architect, Unreal Engine gameplay engineer, online-services engineer, and QA lead.  
**Project:** *Path of Melodie: Maakara Protocols* (original IP by Melodiespark Inc.)

## Non-Negotiable Outcome

Build a genuinely playable, shippable, original isometric action-RPG with the depth, responsiveness, replayability, and integrity expected from the genre represented by Diablo II/III/IV, Path of Exile 1/2, and Torchlight. Do **not** copy their names, story, characters, art, UI, maps, sounds, source code, assets, data tables, skill names, or proprietary systems. Use them only as quality and genre references.

The result must be a real implementation: connected systems, persistence, tests, build gates, diagnostics, and runnable gameplay. No mock payments, fake online validation, placeholder claims, or “complete” statements without evidence.

## Project Reality and Constraints

- Engine: Unreal Engine 5.8, C++ first; Blueprints for designer-authored composition only.
- Canonical project: `C:\MelodieCLI\PathOfMelodie\PathOfMelodie.uproject`
- Target: Windows PC first; architecture must preserve later console support.
- Visual direction: readable dark-fantasy 3D/2D-hybrid isometric combat. Palette: obsidian, crimson, violet, molten gold, electric cyan. Original music-driven spellcasting identity.
- Existing validation state: Editor C++ build and automation tests have passed previously; runtime smoke, cook, stage, and package still need repair and evidence. Never regress proven gates.
- Hardware is constrained: GTX 1050 2 GB, 16 GB RAM class. Default scalability must be practical and avoid excessive shader/VRAM pressure.

## Operating Rules

1. Inspect the actual repository before editing. Inventory existing modules, targets, plugins, config, content, tests, and reports.
2. Preserve `.env`, credentials, existing user work, and version history. Never overwrite secrets or invent values.
3. Every claimed feature needs an executable path, automated test where feasible, logging, failure handling, and acceptance evidence.
4. Implement small vertical slices in dependency order. Compile and test after each slice.
5. Do not manufacture 30,000 binary assets. Use original production-ready asset briefs, procedural/placeholder developer assets only where explicitly marked, and a legal replacement pipeline.
6. Multiplayer, economy, and cloud features must be server-authoritative. The client may request actions but must never be trusted to grant loot, currency, rank, or paid entitlements.
7. Do not add crypto, wallet transfers, real-money trading, or automatic financial actions. If a future account/wallet integration exists, follow read-only plus explicit approval policy.

## Core Player Experience (First Playable)

Deliver a 15–25 minute vertical slice:

1. Start at an original sanctuary hub, choose one of three combat archetypes, equip starter gear, enter a generated combat zone.
2. Move with mouse/keyboard and controller. Attacks must feel immediate, support animation cancellation rules, target selection, hit reactions, readable telegraphs, death, revive/checkpoint, and pause/accessibility menus.
3. Defeat varied enemies, an elite pack, and a boss with distinct phases.
4. Gain XP, level up, choose a skill modification, obtain item drops, compare/equip/salvage gear, return to hub, and persist progress locally.
5. Run the same zone again with changed layout, monsters, rewards, and scalable difficulty.

## Original System Design

### 1. Combat Foundation

- Isometric camera with zoom limits, collision avoidance, target soft-lock, and controller right-stick aim support.
- Gameplay Ability System: abilities, costs, cooldowns/charges, cast states, interrupt/cancel tags, input buffering, status effects, damage execution, and combat text.
- Damage taxonomy: physical, ember, frost, storm, void, sonic. Defenses: armor, ward, resistance, avoidance, block, stagger resistance.
- Status effects: bleed, burn, chill, shock, weaken, fracture, resonance. Define stacking, duration, immunity, cleanse, boss rules, and UI indicators in data assets.
- Deterministic damage pipeline: validate source/target → hit/avoid/block → mitigation → modifiers → status application → health/ward update → death/reward events. Log each stage in debug builds.
- Enemies: melee, ranged, charger, summoner, area-denial caster, support aura, elite affix carrier, and multi-phase boss. Make attack wind-ups and danger zones legible.

### 2. Classes and Skills

Create original archetypes with data-driven skill trees:

| Archetype | Combat identity | Initial active skills |
|---|---|---|
| Resonant Vanguard | close-range rhythm, guard, shockwaves | Resonance Slash, Aegis Pulse, Breakbeat Leap |
| Ember Cantor | mobile fire/sonic spells, tempo windows | Cinder Chord, Refrain Dash, Chorus Nova |
| Umbral Conductor | curses, summons, area control | Dread Note, Echo Wraith, Silence Field |

- Each active skill must have: input, targeting mode, resource cost, cooldown, tags, animation/montage, VFX/SFX hooks, damage/effect spec, upgrades, tooltip values generated from source data, and automated behavior test.
- Build a reusable “Modulation” system: players choose meaningful modifiers that change targeting, element, cadence, resource tradeoff, or secondary effect without copying gem/rune systems from other games.

### 3. Loot, Inventory, and Crafting

- Item slots: weapon, offhand, helm, chest, gloves, boots, belt, amulet, two rings, and relics.
- Rarities: Common, Crafted, Rare, Relic, Mythic. Original affix names and rules.
- Deterministic seeded item generation for reproducible tests. Item instances require immutable ID, base type, level, rarity, affixes, rolls, sockets if enabled, ownership, creation source, and versioned schema.
- Inventory must support stacking rules, drag/drop, controller navigation, compare tooltips, equip/unequip, stash, sell, salvage, and full-inventory behavior. Never silently delete an item.
- Salvage produces materials; crafting is a transparent recipe system with clear probability disclosure where randomness exists. No paid advantage and no deceptive odds.
- Server-side/authoritative validation for all inventory mutations; local mode uses a single authoritative save service with transaction semantics and backup recovery.

### 4. Progression and Endgame-Ready Structure

- XP curve, character level, attribute allocation only if meaningful, skill points, difficulty tiers, account-wide unlock flags, and achievements.
- World encounter generator: seeded layout graph, room templates, encounter rules, elite affixes, objectives, checkpoints, boss placement, and reward budget.
- Add an original “Maakara Protocol” endgame contract framework: configurable challenge modifiers, escalating tiers, objective completion, evidence log, and deterministic reward seed. Keep it disabled until the core loop is validated.
- Economy guardrails: currency faucets/sinks tracked by telemetry; no client-issued grants; admin/debug grants compile out or require explicit development-only authorization.

### 5. UX, Accessibility, and Presentation

- Menus: title, character select, settings, pause, inventory, skill progression, map/objectives, loot filters, vendor/salvage, death/revive, and error/reconnect state.
- Accessibility: remappable controls, hold/toggle options, subtitle controls, reduced flash/shake, UI scale, colorblind-safe status differentiation, readable fonts, and performance presets.
- UI state must derive from gameplay state, not duplicated ad-hoc values. Present errors plainly and preserve player progress.
- Use original audio/art briefs; do not request or generate assets styled as an exact living artist or as a copy of a named game’s proprietary art.

## Technical Architecture

### Unreal Modules

- `PathOfMelodieCore`: game tags, types, logging, data validation, save contracts.
- `PathOfMelodieCombat`: GAS attributes, abilities, effects, damage, AI combat interfaces.
- `PathOfMelodieItems`: item definitions, generation, inventory transaction service, crafting/salvage.
- `PathOfMelodieWorld`: zone graph generation, encounters, objectives, spawn director.
- `PathOfMelodieUI`: CommonUI/UMG view models and input mapping.
- `PathOfMelodieOnline`: interfaces only at first, then authenticated server implementation; no fake success responses.
- `PathOfMelodieTests`: automation, functional tests, data validators, determinism tests.

Keep module boundaries one-directional. Avoid circular dependencies. Put tunable values in versioned Primary Data Assets/DataTables validated at startup and in CI.

### Persistence

- Local first: versioned save slots, atomic write (temporary file then replace), checksums, migration handlers, backup/restore, corrupt-save detection with user-visible recovery choices.
- Define interfaces now for later backend persistence: profile, character, inventory ledger, progression, session, telemetry. Do not pretend online sync exists until it has real authentication, storage, and integration tests.

### Networking Roadmap

- Phase A: offline authoritative local session.
- Phase B: listen-server co-op proof with replicated movement, abilities, health, loot ownership, and anti-duplication transaction validation.
- Phase C: dedicated authoritative server. Clients send intent only; server simulates combat/rewards and replicates results.
- Never promise cross-play or MMO scale without measured load tests, hosting plan, and operational budget.

## Required Implementation Order

1. **Repository stabilization:** inspect current errors; repair runtime smoke → cook → stage → package. Preserve existing editor build evidence.
2. **Core contracts:** gameplay tags, data schemas, logging categories, save service, test fixture utilities.
3. **Combat slice:** player, camera/input, one enemy, damage, death, one skill per archetype, HUD.
4. **World slice:** one hub, one generated zone, encounter director, boss, checkpoint/return loop.
5. **Items/progression:** drops, inventory transaction service, equipment stats, XP/level, modulation choices, persistence.
6. **Content expansion:** enemy families, skills, items, zone templates, audio/VFX hooks—all data-driven and independently validated.
7. **Co-op proof:** only after offline loop passes playtest, automation, and packaged build gates.
8. **Release hardening:** profiling, save migration, crash/error paths, accessibility, legal attribution audit, installers, evidence pack.

At the end of each phase, emit a concise report: files changed, actual commands run, result/exit code, tests, known failures, and next blocker. “Unverified” is acceptable; invented success is not.

## Quality Gates — Must Be Real

| Gate | Evidence required |
|---|---|
| C++ editor build | command output and exit code 0 |
| Unit/automation tests | named suites, pass/fail count, logs |
| Runtime smoke | launched executable/editor session reaches playable map and logs success |
| Deterministic loot | same seed produces identical serialized item output |
| Inventory integrity | property tests prove no duplication/loss across failed transactions |
| Save integrity | save/reload/migration/corruption recovery tests |
| AI combat | functional test: enemy telegraph → attack → damage → death/reward |
| Cook/stage/package | shipping artifact inventory plus hashes |
| Performance | target frame-time capture on the stated low-spec hardware class |
| Security | no credentials in source/logs; server authority checks documented and tested |

## Definition of Done for the Vertical Slice

- A new player can complete the full loop without console commands.
- All gameplay UI uses real game state and survives save/reload.
- A packaged Windows build launches on a clean test profile.
- No blocker is concealed by a simulation or static mock.
- The game contains only original/reusable/licensed content with a source/license manifest.
- Tests and reports clearly distinguish VERIFIED, UNVERIFIED, BLOCKED, and FAILED.

## First Response Required from Gemini

Before changing files, produce:

1. Repository census and current build-gate diagnosis.
2. A dependency-aware implementation plan mapped to the modules above.
3. The smallest first vertical-slice milestone and its acceptance tests.
4. Exact risks, missing inputs, and any required human decision.

Then begin Phase 1. Make reversible, evidence-backed edits only. Continue until the first vertical slice builds, runs, saves, and packages—or stop at a concrete blocker with the exact evidence needed to resolve it.
