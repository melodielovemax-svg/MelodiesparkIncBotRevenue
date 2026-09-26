# PATH OF MELODIE: MAAKARA PROTOCOLS
## ULTIMATE ARENA.AI FULL-GAME TRANSFER / BUILD BLUEPRINT

**Purpose:** One authoritative transfer brief for Arena.ai to implement the game application from the existing Path of Melodie architecture.

**Status:** DESIGN + IMPLEMENTATION SPECIFICATION  
**Runtime status:** NOT VERIFIED  
**R03:** NOT VERIFIED  
**Gate 00:** BLOCKED unless newer raw Unreal evidence proves otherwise  
**Shipping:** NOT VERIFIED  
**MAAKARA PRIME:** BLOCKED

> RELEASE LAW: DEFINED != IMPLEMENTED != TESTED != VERIFIED != AUDITED != RELEASED

---

# A. ABSOLUTE EXECUTION RULES

Arena.ai must:

1. Preserve the canonical namespace **POM-DOM-001 → POM-DOM-750**.
2. Treat `01-POM-DOM-MASTER-REGISTRY-001-750.md` as the authoritative registry source.
3. Never renumber, recycle, or silently delete a domain ID.
4. Build incrementally from the Genesis vertical slice.
5. Generate tests with code.
6. Generate evidence with tests.
7. Never mark a gate passed because a file exists.
8. Preserve all `.env` files and credentials; never overwrite them.
9. Never place private keys or seed phrases in source code.
10. Never allow client authority over HP, damage, loot, KPP, Souls, boss completion, wallet payouts, or reward eligibility.
11. Keep Unreal Engine development native Windows.
12. Use Docker/WSL2 for backend, persistence, telemetry, CI, content generation, and support services.
13. Fail closed on economy, reward, security, and migration errors.
14. Make all external-value reward features disabled by default.
15. Keep the game fully playable without crypto.

---

# B. GAME IDENTITY

**Title:** Path of Melodie: MAAKARA Protocols  
**Genre:** Isometric dark-fantasy MMOARPG  
**Art style:** MAAKARA Cartoon Gothic  
**Engine:** Unreal Engine 5  
**World model:** Campaign + deterministic procedural Realms + persistent MMO social layer  
**Endgame:** The Infinite Protocol  
**Primary fantasy:** Grow from an Origin into an Ascended identity, master Karma, evolve a build through the MAAKARA Constellation, conquer increasingly unstable Realms, defeat Sovereigns/Omega bosses, and shape civilizations.

Core loop:

```text
FIGHT
→ LOOT
→ EQUIP / CRAFT
→ PROTOCOL BUILD
→ SOUL PROGRESSION
→ KARMA EVENT
→ KPP / PILLAR MASTERY
→ CONSTELLATION
→ REALM
→ BOSS
→ ASCENSION / ENDGAME
→ INFINITE PROTOCOL
```

---

# C. ECONOMIC FIREWALL

The following are separate ledgers and must never be collapsed:

```text
GAMEPLAY CURRENCIES
!=
SOUL ESSENCE
!=
KPP / PILLARS
!=
GAMEPLAY MA
!=
EXTERNAL REWARDS
```

## C1. Gameplay currencies
79 gameplay-only currency types for crafting, vendors, services, Realm activation, and item manipulation.

## C2. Soul Essence
Banked / Unbanked gameplay-risk progression.

## C3. KPP / Pillars
Permanent, server-verified, non-transferable progression credential.

**KPP is never spent, traded, sold, tokenized, or converted to another balance.**

## C4. Gameplay MA
Fictional endgame Protocol resource.

## C5. External rewards
Optional separately funded rewards held externally.

The bridge is:

```text
VERIFIED GAMEPLAY
→ KARMA EVENT
→ KPP / PILLAR STATE
→ ACHIEVEMENT
→ ELIGIBILITY RECORD
→ POLICY / ANTI-CHEAT / BUDGET / JURISDICTION
→ MANUAL PLAYER CLAIM
→ EXTERNAL WALLET SIGNATURE
→ DISTRIBUTOR
→ BLOCKCHAIN CONFIRMATION
→ AUDIT
```

No crypto wagering. No boss entry paid with external assets. No automatic payouts.

---

# D. TARGET REPOSITORY

```text
C:\MelodieCLI\PathOfMelodie
├─ PathOfMelodie.uproject
├─ Config\
├─ Content\
│  ├─ Characters\
│  ├─ Origins\
│  ├─ Ascensions\
│  ├─ Protocols\
│  ├─ Items\
│  ├─ Enemies\
│  ├─ Bosses\
│  ├─ Realms\
│  ├─ Constellations\
│  ├─ Karma\
│  ├─ Souls\
│  ├─ UI\
│  ├─ Audio\
│  ├─ VFX\
│  └─ Data\
├─ Source\
│  ├─ PathOfMelodie\
│  │  ├─ Combat\
│  │  ├─ GAS\
│  │  ├─ Attributes\
│  │  ├─ Damage\
│  │  ├─ Status\
│  │  ├─ Resources\
│  │  ├─ Death\
│  │  ├─ Characters\
│  │  ├─ Karma\
│  │  ├─ Souls\
│  │  ├─ Constellation\
│  │  ├─ Protocols\
│  │  ├─ Items\
│  │  ├─ Loot\
│  │  ├─ Crafting\
│  │  ├─ Enemies\
│  │  ├─ Bosses\
│  │  ├─ Realms\
│  │  ├─ Networking\
│  │  ├─ Persistence\
│  │  └─ Telemetry\
│  └─ PathOfMelodieEditor\
├─ services\
│  ├─ gateway\
│  ├─ account-service\
│  ├─ character-service\
│  ├─ inventory-service\
│  ├─ economy-service\
│  ├─ karma-service\
│  ├─ soul-service\
│  ├─ boss-service\
│  ├─ realm-service\
│  ├─ matchmaking-service\
│  ├─ guild-service\
│  ├─ civilization-service\
│  ├─ telemetry-service\
│  └─ reward-service\
├─ packages\
│  ├─ contracts\
│  ├─ schemas\
│  ├─ deterministic-rng\
│  ├─ events\
│  └─ evidence-sdk\
├─ database\
│  ├─ migrations\
│  └─ seeds\
├─ generated\
│  ├─ bosses\
│  ├─ protocols\
│  ├─ items\
│  ├─ monsters\
│  ├─ quests\
│  ├─ realms\
│  └─ modules\
├─ docker\
├─ scripts\
├─ tests\
├─ evidence\
└─ release\
```

---

# E. RUNTIME ARCHITECTURE

```text
UNREAL CLIENT
  ↓ predicted presentation only
AUTHORITATIVE GAME SERVER
  ├─ Combat / GAS
  ├─ Character / Attributes / Resources
  ├─ Inventory / Equipment
  ├─ Karma / Souls
  ├─ Constellation
  ├─ Realm / Boss Runtime
  └─ Save / Replication
        ↓
API GATEWAY
  ├─ Account
  ├─ Character
  ├─ Inventory
  ├─ Economy
  ├─ Karma
  ├─ Soul
  ├─ Realm
  ├─ Boss
  ├─ Matchmaking
  ├─ Guild
  ├─ Civilization
  └─ Telemetry
        ↓
PostgreSQL / Redis / NATS / ClickHouse / OpenTelemetry
```

---

# F. CORE COMBAT STACK

Implement the canonical pipeline:

```text
INPUT
→ VALIDATION
→ RESOURCE CHECK
→ GAS ACTIVATION
→ ANIMATION
→ TRACE / PROJECTILE / AOE
→ SERVER HIT VALIDATION
→ DAMAGE ENGINE
→ CRITICAL
→ STATUS
→ STAGGER
→ REACTION
→ DEATH
→ REWARD ELIGIBILITY
→ LOOT / SOUL / KARMA CANDIDATES
→ TELEMETRY
```

Required:

- startup / active / recovery windows
- animation cancel policy
- hit stop
- camera impulse
- dodge / i-frames
- block / parry / guard
- poise / stagger
- projectile / AoE / ground effects
- summons / constructs / minions
- aggro / threat
- deterministic boss telegraphs
- server-owned HP and damage
- death dedupe
- replay determinism

Damage families:

- Physical
- Fire
- Cold
- Lightning
- Void
- Radiant
- Nature
- Blood
- Karma
- Fractal

---

# G. CHARACTER FOUNDATION

Seven starting Origins:

1. Oracle
2. Sentinel
3. Shade
4. Luminary
5. Architect
6. Revenant
7. Wanderer

Target identity architecture:

```text
FIXED ORIGIN
+
ACTIVE ASCENSION
+
CUSTOMIZATION / COSMETICS
=
CURRENT PLAYABLE IDENTITY
```

Target total:

- 7 starting Origins
- 38 unlockable Ascensions
- 45 canonical identity paths

Genesis first slice:

- Architect → Protocol Engineer
- Oracle → Chronomancer

---

# H. KPP & TWELVE KARMA PILLARS

Pillars:

- Sahaaya — Service
- Vidya — Knowledge
- Svasthya — Balance
- Prakriti — Nature
- Karuna — Compassion
- Srujana — Creation
- Niti — Integrity
- Sambandha — Connection
- Samadhana — Resolution
- Prerana — Inspiration
- Daana — Generosity
- Pragati — Progress

Mastery:

```text
INITIATE
→ ATTUNED
→ MASTERED
→ SOVEREIGN
```

Mastery evaluation must include:

- total Pillar KPP
- event diversity
- milestone flags
- server provenance

Repeated farming of a single Karma event cannot be sufficient for high-tier mastery.

---

# I. MAAKARA CONSTELLATION

Character build graph:

- Genesis Core
- 12 Pillar sectors
- sector bridges
- small nodes
- notables
- keystones
- sockets
- gate nodes
- threshold nodes
- conversion nodes
- Ascension nodes
- Soul nodes
- Realm nodes
- Civilization nodes
- seasonal nodes
- Fractal / Corrupted / Genesis / Omega nodes

Server allocation validation:

```text
REQUEST
→ NODE EXISTS
→ PATH CONNECTED
→ POINT AVAILABLE
→ PILLAR GATE
→ KPP THRESHOLD
→ ASCENSION REQUIREMENT
→ CONFLICT CHECK
→ ATOMIC COMMIT
→ APPLY MODIFIER
→ SAVE
→ TELEMETRY
```

---

# J. REALM CONSTELLATION

This is distinct from the character Constellation.

It biases:

- biome
- monster family
- elite density
- mutations
- boss eligibility
- reward categories
- Soul encounters
- Karma opportunities
- settlement events
- civilization events
- corruption
- Fractal activity
- Genesis activity
- Infinite Protocol routing

It must never directly mint loot, Souls, KPP, or external rewards.

---

# K. PROTOCOL SYSTEM

## K1. Protocol Gems
Active abilities.

Target template foundation: 240.

## K2. Modifier Protocols
Support/transform modifiers.

Target template foundation: 360.

Required features:

- leveling
- quality
- XP
- sockets
- links
- ordering
- recursion guards
- entity caps
- tooltip composition
- damage / cost projection
- cooldowns
- charges
- reservations
- interrupts
- channels
- cast times
- movement abilities
- conversions
- echoes
- Fractals
- corruption
- Karma integration
- Soul integration
- Realm integration
- equipment affinity
- Ascension affinity
- Constellation affinity
- presets
- loadouts
- migration
- anti-cheat

---

# L. ITEMIZATION

Target foundation:

- 953 unique items
- 79 gameplay currencies
- equipment bases
- weapon families
- armor families
- jewelry
- relics
- charms
- Protocol gear
- Soul gear
- Karma gear
- Fractal gear
- Corrupted gear
- Genesis gear
- Omega gear

Nine rarity levels:

1. Bronze
2. Silver
3. Gold
4. Platinum
5. Diamond
6. Legendary Diamond
7. Mythic Diamond
8. Divine Diamond
9. Mythological Diamond

Every item instance requires:

- ItemInstanceID
- owner
- base
- item level
- affixes
- implicits
- sockets / links
- quality
- corruption state
- Fractal state
- provenance
- serialization version
- integrity hash

No player market until item duplication tests pass.

---

# M. SOUL ENGINE

Soul state:

```text
UNBANKED SOULS = AT RISK
BANKED SOULS = PROTECTED
```

Death can generate a Soul Echo.

Required:

- Soul reward evaluator
- Soul collection
- Echo creation
- placement
- recovery
- destruction
- crash recovery
- Sanctuary banking
- Soul Forge
- Soul Memory Codex
- Soul awakening
- Boss Souls
- Sovereign Souls
- Omega Souls
- Corrupted / Fractal / Genesis Souls
- purification
- sealing
- sacrifice
- study
- chains
- surge
- resonance
- storm
- execution
- hunts
- anti-farming
- anti-duplication

---

# N. 59,304 BOSS NETWORK

Total deterministic boss identities:

```text
STANDARD:
Levels 1–4,999
10 bosses / level
49,990 bosses

DEEP:
Levels 5,000–14,313
1 boss / level
9,314 bosses

TOTAL = 59,304
```

IDs:

```text
POM-BOSS-00001
...
POM-BOSS-59304
```

Each BossDefinition:

```json
{
  "BossID": "POM-BOSS-00001",
  "Level": 1,
  "Layer": "STANDARD",
  "Seed": 0,
  "Archetype": "",
  "PillarAffinity": "",
  "EncounterProfileID": "",
  "PortalPolicyID": "",
  "LootProfileID": "",
  "SoulProfileID": "",
  "KarmaContextID": "",
  "Version": 1
}
```

Required boss functionality:

- encounter state machine
- phases
- enrage
- wipe rules
- arena hazards
- checkpoint policy
- first-kill state
- repeat-kill policy
- loot eligibility
- Soul eligibility
- Karma eligibility
- party scaling
- telemetry
- deterministic replay

---

# O. LEVEL 5,000+ DEEP PORTALS

“Deep Investment” means **gameplay resource investment only**.

Possible resources:

- Genesis Shards
- Fractal Sigils
- Sovereign Marks
- Omega Dust
- Protocol Catalysts

Portal transaction:

```text
PLAYER REQUEST
→ REQUIREMENT CHECK
→ KPP ELIGIBILITY CHECK (NO SPEND)
→ PILLAR CHECK
→ GAMEPLAY RESOURCE RESERVATION
→ REALM GENERATION
→ REALM VALIDATION
→ COMMIT RESERVATION
→ OPEN PORTAL
```

Generation failure releases the reserved gameplay resources.

No external asset may be staked, wagered, or lost through combat.

---

# P. PROCEDURAL REALMS

Realm input:

```text
RealmSeed
+ GeneratorVersion
+ ContentVersion
+ RealmConstellationSnapshot
+ DifficultyProfile
+ SeasonProfile
```

Realm output:

- biome
- topology
- rooms
- corridors
- monsters
- elites
- objectives
- boss
- loot placement
- Sanctuary
- Soul Echo locations
- hazards
- secrets
- mutation set
- completion rules

Mandatory validation:

- connectivity
- NavMesh
- valid spawn points
- reachable objective
- valid boss
- valid exit
- mutation compatibility
- no empty monster pool
- no impossible topology

---

# Q. CAMPAIGN & QUESTS

Target: 10 acts.

Canonical later acts:

- Act VIII — The Fallen Saints
- Act IX — Genesis
- Act X — Civilization

Campaign content must support:

- primary quests
- optional quests
- Karma resolution paths
- faction outcomes
- Soul discoveries
- boss milestones
- Realm unlocks
- Ascension Trials
- Sovereign encounters
- civilization consequences

---

# R. MMOARPG CONTENT

Build:

- persistent hubs
- wilderness spaces
- Mega Realm shards
- world boss network
- Omega world events
- Sovereign Hunts
- Nemesis bosses
- evolving bosses
- Boss Constellation
- Boss Memory Codex
- Infinite Dungeons
- Fractal Dungeons
- Corrupted / Genesis / Black Sun / Soul / Karma / Civilization Realms
- dynamic Realm weather
- Realm ecology
- public events
- event chains
- server-wide invasions
- Fractal breaches
- Karma emergencies
- settlement sieges
- caravans
- exploration secrets
- treasure expeditions
- world puzzles

---

# S. PARTY / GUILD / CIVILIZATION

Party:

- invitations
- leader
- loot policy
- Soul policy
- Karma policy
- resurrection
- matchmaking
- disconnect recovery

Guild:

- creation
- membership
- roles
- permissions
- storage
- projects
- expeditions
- research
- alliances
- wars
- citadel

Civilization:

```text
BAND
→ ORDER
→ ALLIANCE
→ CITY
→ NATION
→ CIVILIZATION
```

Buildings:

- Forge
- Temple
- Marketplace
- Academy
- Validator Tower
- Garden
- Arena
- Portal Nexus
- Guild Hall
- Treasury
- Research Laboratory

---

# T. PvP

Optional only:

- 1v1 Duel
- 3v3 Protocol Arena
- Guild Wars
- Civilization Siege
- Battle Royale event
- Karma Tournament

No mandatory open-world PvP for core progression.

PvP uses its own balance coefficient layer.

---

# U. LIVE OPERATIONS

Protocol Seasons:

- Corruption
- Ascension
- Genesis
- Fracture
- Oracle
- Singularity
- Karma War
- Infinite City
- Black Sun
- Omega

Build:

- season migration
- seasonal characters
- Realm mutations
- bosses
- Protocol Gems
- Modifier Protocols
- Constellation extensions
- Soul Hunts
- Karma events
- Civilization events
- global challenges
- community milestones
- content rotation
- live scheduling
- live telemetry
- emergency feature disable

---

# V. BACKEND SERVICES

Minimum services:

- API Gateway
- Authentication
- Character
- Inventory
- Economy
- Karma
- Soul
- Realm
- Boss
- Matchmaking
- Guild
- Civilization
- Telemetry
- Notifications
- Configuration / Feature Flags

Infrastructure:

- PostgreSQL
- Redis
- NATS
- ClickHouse
- OpenTelemetry Collector

---

# W. DATABASE CORE TABLES

Minimum entities:

- accounts
- sessions
- characters
- character_origins
- ascension_unlocks
- character_identity
- attributes
- resources
- inventory
- item_instances
- item_provenance
- stash
- karma_events
- kpp_state
- pillar_mastery
- soul_ledger
- soul_echoes
- constellation_state
- constellation_allocations
- realm_constellation_state
- realm_instances
- boss_definitions
- boss_attempts
- boss_completions
- quests
- guilds
- guild_members
- civilizations
- achievements
- telemetry_outbox
- evidence_records

Optional external reward tables must live in a clearly separated schema.

---

# X. EVENT BUS

Core events:

```text
account.created
character.created
character.identity.changed
ascension.unlocked
combat.skill_cast
combat.damage_dealt
combat.status_applied
combat.staggered
combat.entity_died
loot.eligible
loot.generated
item.equipped
soul.debited
soul.echo_created
soul.echo_recovered
karma.event_verified
karma.mastery_changed
constellation.node_allocated
realm.requested
realm.generated
realm.entered
realm.completed
boss.spawned
boss.phase_changed
boss.completed
guild.project_completed
civilization.building_completed
season.started
season.closed
```

---

# Y. TELEMETRY

Capture:

- skill usage
- damage
- deaths
- boss phases
- wipes
- build composition
- Protocol combinations
- item drops
- crafting
- Soul losses / recoveries
- Karma event distributions
- Pillar mastery
- Realm seeds
- generation failures
- boss completion
- party performance
- economy inflation
- duplication alerts
- crash reports
- latency
- server load

---

# Z. ACCESSIBILITY

Required:

- high-contrast telegraphs
- screen-shake slider
- motion-reduction options
- scalable UI
- text size controls
- color accessibility
- captions
- full key rebinding
- hold/toggle alternatives
- controller navigation
- audio danger cues
- readable loot beams

---

# AA. ART DIRECTION

MAAKARA Cartoon Gothic:

- cel-influenced lighting
- painterly surfaces
- strong silhouettes
- occult geometry
- ancient mystical symbolism
- neon Karma accents
- exaggerated readable enemies
- clear boss telegraphs
- dramatic loot beams
- spectral Soul ribbons
- Fractal polygon effects

Use:

- Nanite where appropriate
- Lumen
- Virtual Shadow Maps
- Niagara
- Chaos
- Motion Warping
- Control Rig
- GAS
- World Partition where appropriate

All performance claims remain unverified until measured.

---

# AB. AUDIO

Create:

- biome ambience
- combat impacts
- Protocol cast identities
- status sounds
- Soul Echo audio
- Karma mastery audio
- boss phase stingers
- Sovereign themes
- Omega themes
- civilization ambience
- music state transitions

---

# AC. UI / UX SCREENS

- Splash / login
- account
- character select
- Origin select
- Ascension
- HUD
- inventory
- equipment
- Protocol Gems
- modifier linking
- MAAKARA Constellation
- Realm Constellation
- Realm Portal
- Boss Portal
- Karma / Pillars
- Soul Codex
- crafting
- Forge
- stash
- vendor
- player market
- quests
- map
- party
- matchmaking
- guild
- civilization
- season
- achievements
- settings
- accessibility

Optional:
- external reward portfolio, completely separated visually and technically

---

# AD. GENESIS VERTICAL SLICE

Arena.ai must build this **before** attempting full MMO scale:

- Architect
- Oracle
- Protocol Engineer
- Chronomancer
- Genesis Refuge
- 3 zones
- 30 enemies
- 4 elite modifier families
- 1 dungeon
- 2 bosses
- 20 Protocol Gems
- 30 Modifier Protocols
- 100 equipment bases/modifiers
- small MAAKARA Constellation
- small Realm Constellation
- basic crafting
- procedural Realm generator
- save/load
- combat telemetry
- boss telemetry

Acceptance:

```text
SPAWN
→ MOVE
→ ATTACK
→ TAKE DAMAGE
→ DODGE
→ KILL ENEMY
→ DROP LOOT
→ EQUIP
→ STAT CHANGE
→ CAST PROTOCOL
→ MODIFY PROTOCOL
→ GAIN VERIFIED KARMA
→ UPDATE PILLAR
→ ALLOCATE CONSTELLATION
→ GENERATE REALM
→ FIGHT BOSS
→ SAVE
→ RELOAD
```

---

# AE. IMPLEMENTATION PHASES

## Phase 0 — Toolchain
Unreal, MSVC, project generation, compile, Docker, DB.

## Phase 1 — Player Runtime
Spawn, movement, camera, attributes, resources, save.

## Phase 2 — Combat
Attack, ability, server damage, status, stagger, death.

## Phase 3 — Loot / Equipment
Drops, inventory, equip, affixes, stat integration.

## Phase 4 — Protocols
Gems, modifiers, sockets, cooldowns, costs.

## Phase 5 — Souls / Karma
Soul ledger/Echo, Karma event ledger, Pillar mastery.

## Phase 6 — Constellation
Allocation, gates, respec, migration, save.

## Phase 7 — Realms
Seed, grammar, validation, portal.

## Phase 8 — Bosses
Boss runtime + generated catalog integration.

## Phase 9 — Online
Accounts, persistence, matchmaking.

## Phase 10 — Social
Parties, guilds, civilization.

## Phase 11 — Live Ops
Seasons, feature flags, telemetry.

## Phase 12 — Optional Reward Eligibility
Separate external reward authority; disabled by default.

## Phase 13 — Release
Performance, installer, clean machine, evidence.

---

# AF. RELEASE GATES

```text
GATE 00  Unreal installation/detection structurally valid
GATE 01  Unreal project compiles
GATE 02  Character spawns
GATE 03  Movement works
GATE 04  Enemy spawns
GATE 05  Damage authoritative
GATE 06  Enemy dies
GATE 07  Loot physically drops
GATE 08  Item equips
GATE 09  Stats change combat
GATE 10  Protocol Gem executes
GATE 11  Modifier changes Protocol
GATE 12  Karma changes progression
GATE 13  Constellation changes build
GATE 14  Realm seed generates playable map
GATE 15  Boss encounter completes
GATE 16  Character saves/reloads
GATE 17  Shipping build succeeds
GATE 18  Installer succeeds
GATE 19  Clean-machine launch succeeds
GATE 20  30-minute loop stable
```

---

# AG. TEST MATRIX

Mandatory categories:

- unit
- integration
- functional
- gameplay automation
- network
- authority
- save/load
- migration
- crash recovery
- duplication
- exploit regression
- CPU
- GPU
- memory
- network profiling
- server load
- database load
- Realm generation
- long-session
- 30-minute gate
- 2-hour stability
- soak
- installer
- upgrade
- rollback
- compatibility
- accessibility
- localization
- controller
- keyboard/mouse
- display
- audio
- disconnect recovery
- server restart recovery

---

# AH. EVIDENCE CONTRACT

Every domain implementation must create:

```text
evidence/<domain>/
├─ DOMAIN-SPEC.json
├─ DOMAIN-DEFINITIONS.json
├─ DOMAIN-POLICIES.json
├─ DOMAIN-AUTOMATED-TESTS.json
├─ DOMAIN-NETWORK-TESTS.json
├─ DOMAIN-SMOKE.log
├─ DOMAIN-RESULT.json
└─ SHA256SUMS.txt
```

Domain-specific evidence is added when needed.

Never promote status from file presence.

---

# AI. CONTENT GENERATOR RULES

All deterministic generated content requires:

- stable IDs
- deterministic seed
- generator version
- input manifest
- output manifest
- exact count
- validation
- SHA-256

Generated quantity is not balance verification.

---

# AJ. OPTIONAL REAL-VALUE REWARD LAYER

Implement only behind feature flags.

Mandatory protections:

- manual player claim
- external wallet signing
- no stored private key
- bounded campaign treasury
- budget circuit breaker
- anti-Sybil
- anti-bot
- collusion detection
- jurisdiction policy
- reward rate limiting
- immutable audit
- failed transaction recovery
- policy versioning
- external contract audit before production

KPP is only a possible eligibility input.

---

# AK. POM-DOM MASTER REGISTRY

**Do not recreate or reinterpret the registry from memory.**

Load:

`01-POM-DOM-MASTER-REGISTRY-001-750.md`

That file is the authoritative contiguous domain namespace for this transfer.

Every module, issue, test, migration, evidence artifact, and release note should reference its owning `POM-DOM-###`.

---

# AL. ARENA.AI REQUIRED OUTPUTS

Arena.ai should create:

1. Unreal C++ modules.
2. Unreal DataAssets / tables.
3. Blueprint-facing interfaces where useful.
4. Backend services.
5. Docker Compose.
6. SQL migrations.
7. schemas.
8. event contracts.
9. deterministic generators.
10. tests.
11. telemetry.
12. evidence.
13. developer scripts.
14. build scripts.
15. installer pipeline.
16. release manifests.
17. documentation.
18. content-validation tools.
19. migration tools.
20. rollback tools.

---

# AM. ARENA.AI DEFINITION OF DONE

A feature is IMPLEMENTED only if code exists and compiles in its target context.

A feature is TESTED only if declared tests execute.

A feature is VERIFIED only if tests pass and evidence is captured.

A feature is AUDITED only if required review evidence exists.

A feature is RELEASED only when the governing release authority has passed all mandatory gates.

---

# AN. CURRENT BASELINE

Preserve this state until newer raw evidence supersedes it:

```text
POM-DOM-001 → 750: DEFINED / NAMESPACE LOCKED
POM-DOM-020: IMPLEMENTATION-READY specification
59,304 Boss Catalog: GENERATED DATA / NOT RUNTIME VERIFIED
30,000 Module Factory: GENERATED / NOT RUNTIME VERIFIED
R03: NOT VERIFIED
GATE 00: BLOCKED
SHIPPING: NOT VERIFIED
MAAKARA PRIME: BLOCKED
```

---

# AO. FINAL BUILD DIRECTIVE

Build **Path of Melodie: MAAKARA Protocols** as an original, production-grade Unreal MMOARPG by proving the smallest complete gameplay loop first, then expanding through the canonical POM-DOM registry.

Do not optimize for file count.

Optimize for:

- responsiveness
- deterministic authority
- boss quality
- build depth
- item integrity
- Realm replayability
- progression clarity
- social persistence
- security
- evidence-backed releases

**FIRST SUCCESS TARGET:** one stable Genesis loop.

**FINAL SUCCESS TARGET:** MAAKARA Prime release only after build, gameplay, content, save, network, security, performance, installer, clean-machine, and evidence gates are all true.
