# PATH OF MELODIE — MAARKARAS PROTOCOLS
## Ultimate Unreal Engine Transfer Package

**Purpose:** transfer the complete Path of Melodie game vision from concept/Godot prototype into a structured Unreal Engine production program.

### Evidence boundary
The package includes a minimal Unreal Engine 5.8 `.uproject`, C++ module source, and an automation smoke-test definition. These files establish a project scaffold only: no successful Unreal compilation, Editor launch, automation-test run, custom level, packaged build, or playable ARPG has been verified. The transfer specification and production blueprint must not be presented as a completed Unreal game.

### Creative direction
Original dark-fantasy isometric action RPG evolving toward a hopeful/cosmic conclusion. Reference inspirations for genre language and feature expectations: Path of Exile 1–2, Diablo 2–4, Torchlight Infinite, and Last Epoch. The implementation must use an original visual identity, original characters, environments, items, UI, lore, names, and generated artwork.

### Existing prototype controls
- WASD / arrows: movement
- Left click: primary attack
- Shift: dodge
- 1–4: skills
- Space: Phoenix Ascension at 100% Phoenix
- R: replay after victory

### Core pillars
1. Isometric ARPG combat
2. Soul Core progression
3. Souls and Phoenix systems
4. Guardians and Arc-Angels
5. Karma and Power Points
6. Classes/archetypes and build diversity
7. Procedural/structured loot, affixes, equipment and inventory
8. Enemy AI, elites and bosses
9. 15-act campaign
10. Maakaras Protocols
11. Endgame progression
12. Persistence and authoritative game state
13. Optional multiplayer architecture
14. cinematic dark-to-hopeful narrative
15. production-grade testing and telemetry

### 15-act campaign
1. Ashes of Aurelion
2. Broken Guardian
3. Cathedral of Lost Souls
4. Pyra
5. Frozen Oath
6. Corrupted Choir
7. Seven Gates
8. War of Arc-Angels
9. Soul Sea
10. Phoenix Prison
11. Return of First Soul
12. Maakaras Protocols
13. Paradise Reborn
14. Last Ascension
15. Phoenix Eternal

### Archetypes currently established
- Phoenix Warrior
- Soul Reaper
- Guardian Knight
- Arc-Angel
- Void Hunter
- Shatter Berserker

### Signature concepts
- Phoenix Ascension / Phoenix Eternal
- Soul Core
- Guardians
- Arc-Angels
- Souls
- Karma Points
- Power Points
- Maakaras Protocols
- named unique item: Crown of the First Phoenix

## Unreal architecture target

### Modules
- PathOfMelodie
- PathOfMelodieCore
- PathOfMelodieCombat
- PathOfMelodieCharacters
- PathOfMelodieAI
- PathOfMelodieLoot
- PathOfMelodieProgression
- PathOfMelodieWorld
- PathOfMelodieUI
- PathOfMelodiePersistence
- PathOfMelodieOnline
- PathOfMelodieTests

### Recommended engine architecture
- Unreal Engine 5.x
- C++ for authoritative/core systems
- Blueprints for composition, content wiring and iteration
- Gameplay Ability System for abilities, attributes, effects and tags
- Enhanced Input
- Data Assets / Data Tables for content definitions
- Niagara for VFX
- MetaSounds for audio
- World Partition / level streaming where appropriate
- server authority for multiplayer
- deterministic IDs for items, characters and progression records

### Required gameplay systems
Combat:
- attack chains
- hit detection
- damage types
- resistances
- armor/mitigation
- crowd control
- status effects
- dodge/invulnerability windows
- resource generation/spending
- Phoenix meter
- reaction chains
- death/revive rules

Abilities:
- primary attack
- four mapped skills
- movement/dodge ability
- Phoenix Ascension
- passive tree/build modifiers
- cooldowns
- costs
- tags
- animation/VFX/SFX hooks

Loot:
- item bases
- rarity
- affixes
- prefixes/suffixes
- implicit modifiers
- unique items
- sockets
- crafting hooks
- drop tables
- loot filtering
- inventory
- equipment
- stash

AI:
- perception
- navigation
- threat/aggro
- archetype behaviors
- elites
- bosses
- phase transitions
- telegraphs
- encounter scripting

Progression:
- levels
- attributes
- skills
- passive/build system
- Soul Core
- Souls
- Guardians
- Arc-Angels
- Karma
- Power Points
- Ascension

Campaign:
- 15 acts
- towns/hubs
- zones
- quests
- NPCs
- cinematics
- bosses
- rewards
- checkpoints
- save/load

Endgame:
- maps/expeditions
- modifiers
- escalating difficulty
- boss encounters
- seasonal/content hooks
- leaderboards as a future optional service

## Production gates

### Gate 0 — Transfer
Deliver `.uproject`, source tree, build configuration, project settings, content structure, CI/build instructions.

### Gate 1 — Core playable
Player movement, camera, targeting, primary attack, one enemy, damage, death, respawn.

### Gate 2 — Vertical slice
One polished zone, one class, four skills, loot, inventory, one boss, save/load, UI.

### Gate 3 — Campaign framework
All 15 act definitions, world/quest framework, encounters, progression hooks.

### Gate 4 — Content production
Classes, enemies, bosses, items, environments, VFX, SFX, cinematics.

### Gate 5 — Online/persistence
Only after local authoritative gameplay is stable.

### Gate 6 — Release candidate
Automated tests, packaged builds, performance budgets, crash handling, save migration, security review and runtime verification.

## Evidence policy
A feature is not called OPERATIONAL merely because it is documented, represented by a Blueprint, shown in a mockup, or described by an AI. Promotion requires implementation evidence, runtime verification and passing tests. The game remains separate from Melodiespark business claims.

## Unreal transfer acceptance checklist
- [ ] `.uproject` opens
- [ ] C++ compiles from clean checkout
- [ ] editor launches
- [ ] packaged build launches
- [ ] player moves
- [ ] combat works
- [ ] abilities work
- [ ] AI works
- [ ] loot works
- [ ] inventory works
- [ ] save/load works
- [ ] campaign progression works
- [ ] boss encounter works
- [ ] performance profiling completed
- [ ] automated tests pass
- [ ] packaged build verified on target hardware

## Copyright / originality rule
The listed games are inspirations/reference points for genre analysis only. Do not copy their proprietary characters, environments, logos, UI, assets, story text, maps, sound, animation or distinctive protected expression. Artwork generated for Path of Melodie must be original and tracked by asset ID, prompt, seed/version where available, review state and license/provenance metadata.
