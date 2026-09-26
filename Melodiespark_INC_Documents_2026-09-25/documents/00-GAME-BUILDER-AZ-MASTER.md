# Path of Melodie: MAAKARA Protocols - Game Builder A-Z Transfer

**Status:** DEFINED / IMPLEMENTATION TRANSFER / NOT RUNTIME VERIFIED

**Engine root:** `D:\UE_5.8`

> Original implementation brief. Inspirations are high-level genre references only; do not copy protected expression.

## 0. Build Authority & Non-Fabrication

This transfer package is an implementation specification for a game builder. It does not assert that gameplay, assets, performance targets, networking, packaging, or release gates have passed. File presence is not verification. Runtime states advance only through evidence.

Canonical runtime order: UE installation -> Gate 00 -> toolchain -> Gate 01 compile -> Genesis Golden Path -> R03 evidence -> Shipping -> clean-machine -> release authority.

Absolute economy firewall: Gameplay currencies != Soul Essence != KPP/Pillars != Gameplay MA != external reward assets != corporate revenue. KPP is mastery/eligibility, never spendable, tradable, or directly convertible to money.

## 1. Product Vision

Build an original high-fidelity isometric action RPG combining the systemic depth, dangerous atmosphere, deliberate combat readability, dense itemization, approachable stylization, strong silhouettes, colorful effects, and readable loot presentation associated with modern loot ARPGs - without copying protected characters, maps, UI, story, names, assets, or exact implementations from any existing game.

Identity: MAAKARA Cartoon Gothic. Tone: ancient occult civilization + techno-mysticism + painterly dark fantasy + neon Karma geometry. Core promise: deep builds, tactile combat, deterministic realms, meaningful bosses, physical loot, persistent progression, and an enormous original Constellation.

## 2. Golden Gameplay Loop

Character Init -> authoritative movement/combat -> enemy death -> physical loot -> equipment/stat mutation -> Protocol Gem + Modifier -> Soul cycle -> verified Karma event -> KPP/Pillar update -> Constellation allocation -> deterministic Realm -> Boss 1 -> Boss 2 -> save/reload -> evidence-chain finalization.

Every system in the first playable must serve this loop. Civilization, guild scale, seasons, market scale, and optional external reward authority remain downstream.

## 3. Camera, View & Input

Primary camera: elevated isometric/three-quarter perspective with controlled zoom. Maintain combat-space visibility, telegraph readability, loot readability, and strong silhouette separation.

PC first: keyboard/mouse and controller. Movement, dodge, primary/secondary attack, 5-8 mapped Protocol slots, potion/resource actions, interact, inventory, map, Constellation, character panel, loot filter modifier, target assist for controller.

Camera effects are bounded: hit stop and impulse reinforce impact but cannot obscure lethal telegraphs. Provide screen-shake intensity and motion-reduction settings.

## 4. Rendering & Visual Quality Ladder

Unreal Engine 5.8 target. Use Nanite selectively for high-density static environment meshes; Lumen where quality/performance allows; Virtual Shadow Maps where appropriate; Niagara for Protocol/VFX; Chaos for bounded physics/destruction; Control Rig/Motion Warping for character polish.

Quality tiers: Low, Medium, High, Ultra, Cinematic/Photo. Expose shadows, GI/reflections, textures, effects, foliage, post-process, view distance, anti-aliasing/upscaling, resolution scale, motion blur, bloom, chromatic aberration, depth of field, screen shake, damage-number density, corpse persistence and ragdoll limits.

Art direction outranks raw polygon count. Optimize readability before spectacle.

## 5. Resolution, FPS & Refresh Targets

Supported design targets (to be profiled, not guaranteed): 1280x720 minimum fallback; 1920x1080 primary baseline; 2560x1440 high-quality target; 3840x2160 premium target; ultrawide 21:9 and 32:9 UI-safe support where feasible.

Frame caps: 30, 60, 90, 120, 144, 165, 240, Unlimited. Refresh-aware presentation for 60/75/90/120/144/165/240 Hz displays. VSync on/off and VRR-friendly mode. Do not tie simulation, cooldowns, animation authority, loot, AI, or damage to rendered frame rate.

Performance gates must measure frame-time percentiles, not only average FPS.

## 6. Performance Budgets

Genesis initial target: stable 60 FPS at 1080p on the project's validated minimum machine after profiling. Treat this as a target until measured.

Budget categories: Game Thread, Render Thread, GPU, animation, Niagara, AI, navigation, physics, audio voices, streaming, memory, network replication, save serialization. Use scalability buckets and distance-based significance managers.

Establish per-encounter budgets for normal packs, elites, Boss 1, Boss 2, and stress scenes. Capture Unreal Insights traces for regressions. No performance PASS without reproducible capture metadata.

## 7. Color, Lighting & Materials

Palette: obsidian/charcoal foundations; antique gold/brass architecture; ember orange danger; electric violet Fractal; cyan/azure Protocol; crimson Blood/Corruption; emerald Prakriti; white-gold Genesis/Karma highlights.

Characters must remain readable against environments. Enemy attacks use consistent danger-language. Interactive objects receive restrained emissive accents. Loot rarity uses color + iconography + beam geometry, never color alone.

Materials combine painterly roughness breakup, stylized edge response, restrained surface noise, readable macro shapes and high-frequency detail only near focal areas.

## 8. Character Visual System

Seven Origins: Oracle, Sentinel, Shade, Luminary, Architect, Revenant, Wanderer. Each requires unique silhouette, stance, locomotion flavor, combat pose language, VFX accent and equipment readability.

Equipment layering: body/base -> armor -> accessories -> weapon -> Protocol/Soul/Fractal effects -> cosmetic overrides. Avoid VFX that erase equipment silhouettes. Provide LODs, animation budgets, material-instance variants and platform scalability.

## 9. Combat Presentation

Combat is server-authoritative and visually immediate. Pipeline: input -> validation -> resource check -> ability/animation -> hit -> damage -> crit/status/stagger -> death -> reward eligibility -> KPP event -> telemetry.

Visual impact stack: anticipation pose, weapon trail, contact flash, bounded hit stop, directional reaction, impact sound, decal/particle response, damage feedback, stagger/poise cue, death state. Boss telegraphs prioritize timing and safe-space comprehension over visual noise.

Damage families: Physical, Fire, Cold, Lightning, Void, Radiant, Nature, Blood, Karma, Fractal.

## 10. VFX Language

Create a reusable Niagara library: projectile cores, trails, impacts, ground AoE, channels, beams, shields, barriers, status loops, death bursts, loot beams, portals, Soul Echoes, Karma events, Fractal distortions, Genesis geometry, boss telegraphs.

Protocol modifiers alter VFX semantically: Fractal multiplies geometry; Echo repeats temporal motifs; Corruption destabilizes form; Karma introduces ordered sacred geometry; Singularity bends trajectories/space; Sacrifice uses controlled blood/soul language.

Every effect gets visibility, lifetime, spawn-count and overdraw budgets.

## 11. Animation

Core locomotion: idle, walk, run, sprint, starts/stops, pivots, strafing where needed, dodge, hit reactions, knockback, knockdown, death, resurrection. Combat: light/heavy/charged attacks, casts, channels, movement Protocols, blocks/parries where supported, executions and boss-specific interactions.

Use montage sections, notifies, motion warping, root-motion selectively, layered upper-body actions and procedural adjustments. Animation cancel windows are data-driven and authority-validated.

## 12. Audio & Music

Layered dark-fantasy orchestral/electronic score with MAAKARA motifs. Adaptive music states: exploration, threat, elite, boss phase, victory, sanctuary, Realm instability, Genesis/Omega.

SFX hierarchy: gameplay-critical cues > combat impacts > enemy tells > ambient detail. Spatial audio for threats and objectives. Dynamic-range presets: Night, Standard, Cinematic. Separate sliders for master/music/SFX/dialogue/UI/ambience.

## 13. UI/HUD

HUD: Life, Barrier, Protocol Energy, Stamina/Resolve where relevant, mapped Protocols, cooldown/charge state, status effects, boss health/phases, objectives, minimap, loot prompts and interaction state.

Visual style: dark translucent panels, thin antique-metal borders, geometric MAAKARA line work, strong typography, minimal obstruction. Never reproduce another game's HUD.

Support 16:9, 16:10, ultrawide safe zones, UI scale, large text, controller glyph switching and keyboard remapping.

## 14. Accessibility

Color-blind-safe danger indicators, icon + shape redundancy, subtitle size/background/speaker labels, UI scale, remapping, hold/toggle options, screen-shake slider, motion blur toggle, flash reduction, damage-number density, auto-target options, aim assist for controller, audio cue reinforcement and high-contrast interactables.

Accessibility is included in Genesis testing, not postponed to final release.

## 15. World & Environment

Genesis Refuge anchors the first playable. Three zones must each have a distinct silhouette grammar, navigation rhythm, lighting identity, monster ecology, environmental hazards and visual landmark hierarchy.

Environment kit categories: cliffs/terrain, ruins, temples, mechanical/Protocol structures, vegetation, props, decals, destructibles, traversal blockers, interactables, portals, sanctuaries, boss arenas. Modular kits must support deterministic procedural assembly.

## 16. Procedural Realm Graphics

Realm generation inputs: seed, generator version, biome, civilization state, Karma alignment, boss, monster family, mutations, environmental rules, reward budget, corruption, instability, difficulty and immutable Realm Influence Snapshot.

Visual generation is deterministic at structural level. Cosmetic micro-variation may be seeded separately but cannot alter authoritative collision, objective placement or reward logic without being part of the deterministic state.

## 17. Monster & Boss Visual Production

Build enemies from archetype families plus mutation layers. Separate gameplay skeleton/ability identity from cosmetic variants. Elite modifiers add recognizable VFX and iconography.

Boss production template: silhouette thesis, arena, phase graph, attack kit, telegraph language, weak/strong windows, add mechanics, environmental interaction, Soul/Karma eligibility, loot profile, performance budget, accessibility notes, telemetry and evidence requirements.

The 59,304-boss catalog remains data-defined/not balance-verified; Genesis implements only two bosses.

## 18. Loot & Item Visuals

Rarity must be readable in ground mesh/icon/frame/beam/audio. Equipment categories include weapons, armor, jewelry, relics, charms, Protocol equipment, Soul equipment, Karma equipment, Fractal, Corrupted, Genesis and Omega tiers.

Item tooltip prioritizes: identity -> requirements -> core stats -> modifiers -> special rules -> sockets/links -> provenance -> comparison. Advanced details can be toggled.

The canonical 953 uniques and 79-currency design sets remain data catalogs, not proof of implementation.

## 19. Protocol Gems & Modifiers

Protocol Gems are active abilities. Modifier Protocols transform behavior. Runtime must support socket/link compatibility, ordering, recursion guards, entity caps, costs, cooldowns, charges, channels, cast time, movement, conversions, Echo, Fractal, Corruption, Karma, Soul, Realm, Origin, Ascension, equipment and Constellation affinities.

Genesis content target: 20 Protocol Gems + 30 Modifier Protocols, with a smaller curated subset fully polished before breadth.

## 20. MAAKARA Grand Constellation

Implement the existing DOM-020 as a massive original interconnected passive graph. Full-release design target: roughly 12,000-18,000 nodes; Genesis proves ~130 nodes first.

Node taxonomy: small, notable, keystone, socket, bridge, gate, threshold, conversion, conditional, Ascension, Soul, Realm, Civilization, Guild, Seasonal, Fractal, Corrupted, Genesis, Omega.

Seven Origins enter through distinct vectors but may eventually bridge. KPP/Pillar Mastery gates eligibility; KPP is never spent. Allocation is server-validated, versioned, persisted, migrated and evidence-emitting.

## 21. Twelve Karma Pillar Visual Sectors

Sahaaya, Vidya, Svasthya, Prakriti, Karuna, Srujana, Niti, Sambandha, Samadhana, Prerana, Daana, Pragati each receive unique geometry, motif, icon, accent language and node-effect families.

Constellation navigation needs semantic zoom, search, path preview, shortest valid route, planned nodes, filters, compare, refund preview and build export/import later. Genesis implements the interaction model before scale.

## 22. Soul Visual System

Soul Essence and Soul Echoes use a distinct visual language from KPP, gameplay currencies and external rewards. Soul Echo placement must be readable and recoverable. Death/recovery states require clear risk messaging without financial language.

Soul visual states: unbanked, banked, exposed, echo, corrupted, purified, sealed, resonant, boss, sovereign, omega, genesis. Effects must communicate state without relying solely on color.

## 23. Economy Firewall UX

Never visually merge KPP, Souls, gameplay MA, item currencies, external rewards or corporate payment balances. Separate screens, icons, labels, terminology and APIs.

Store purchases create platform entitlements. Game client reads verified entitlements. Game client cannot command the store to create a purchase. No gameplay button may silently trigger a financial transaction.

## 24. Networking & Authority

Dedicated authoritative server architecture. Client predicts presentation/movement where appropriate but never mints damage, loot, KPP, Soul state, Constellation allocation, boss completion or reward eligibility.

Replication uses relevancy, dormancy, prioritization and bounded update rates. Combat authority tests, reconnect tests, duplicate-event tests and latency simulation are mandatory before multiplayer claims.

## 25. Persistence

Character identity, inventory, equipment, Protocol loadout, Constellation allocation, Souls, Karma/Pillar progression, Realm continuation and entitlements use versioned schemas.

Save/reload Genesis gate: exit after meaningful progression, relaunch, recover identical authoritative state, verify no duplication/loss, and emit evidence. Migrations are explicit and reversible where feasible.

## 26. Evidence Engine

Canonical event envelope: EventID, ActorID, SourceID, ServerTimestamp, PayloadHash, PreviousHash, AuthoritySignature, SchemaVersion. Add deterministic serialization, canonical timestamps/numbers, signature algorithm/version, KeyID, idempotency key, sequence/stream identity and recovery rules.

PreviousHash supplies tamper evidence; signatures establish authority. Evidence files are outputs of executed tests, not substitutes for tests.

## 27. Asset Production A-Z

A - architecture kits; B - biome kits; C - characters; D - decals/destruction; E - enemies; F - foliage; G - ground/terrain; H - HUD; I - icons/items; J - journals/quests; K - Karma/Pillar visuals; L - lighting/LUTs; M - materials; N - Niagara; O - objectives; P - Protocol effects; Q - quality/scalability; R - Realm kits; S - sounds/souls; T - textures/telegraphs; U - UI/UX; V - VFX; W - weapons/world props; X - cross-platform input assets; Y - yield/performance LODs; Z - zones/zero-fabrication evidence captures.

## 28. Texture & Mesh Standards

Use texel-density standards by asset class. Author source textures at sensible maximums, then ship platform-scaled mips. Avoid blanket 4K/8K. Hero assets may justify higher resolution; repeated props should be efficient.

Meshes require clean pivots, collision policy, LOD/Nanite decision, material-slot budget, lightmap policy if applicable, naming convention and metadata. Validate shader complexity and overdraw in representative scenes.

## 29. Content Naming

Recommended IDs: POM_CHR_*, POM_ENM_*, POM_BOSS_*, POM_ITM_*, POM_PG_*, POM_MOD_*, POM_VFX_*, POM_SFX_*, POM_UI_*, POM_RLM_*, POM_CONST_*, POM_KARMA_*.

Names are stable identifiers; localized display names are separate. Never encode mutable balance values into IDs.

## 30. Folder Transfer Contract

Game builder should preserve a data-driven hierarchy: Config, Content, Source, Plugins, Build, Scripts, Tests, Evidence, Docs. Within Content: Characters, Enemies, Bosses, Items, Protocols, Constellation, Realms, Environments, VFX, Audio, UI, Cinematics, Data.

Generated catalogs should be importable through schemas rather than copied into hand-authored Blueprint logic.

## 31. Genesis Asset Minimum

First playable asset slice: Architect + Oracle; two complete character presentation kits; three zones; 30 monsters; four elite modifier families; one dungeon; two bosses; 20 Protocol Gem definitions; 30 Modifier definitions; 100 equipment bases/modifiers; ~130 Constellation nodes; core loot beams/icons; Soul Echo; Karma/Pillar feedback; Realm portal; save/reload UI; telemetry/evidence feedback.

Polish a vertical slice before scaling catalogs.

## 32. Genesis Visual Acceptance

Pass only with captured runtime evidence: both characters readable; three zones navigable; combat telegraphs readable; enemy death/loot physical; equipment visibly/statistically changes build; Protocol modifier changes behavior and presentation; Soul death/recovery understandable; Karma/KPP/Pillar update visible and authoritative; Constellation allocation changes build; deterministic Realm launches; both bosses complete; save/reload preserves state.

## 33. QA Matrix

Test resolutions, windowed/borderless/fullscreen, DPI scaling, aspect ratios, refresh rates, VSync/VRR, frame caps, graphics tiers, input devices, remapping, language expansion, accessibility settings, alt-tab, focus loss, disconnect/reconnect, save corruption recovery, crash recovery and long-session stability.

Performance QA records machine spec, build hash, map/encounter, settings, resolution, FPS cap, frame-time percentiles, memory and trace path.

## 34. Release Ladder

Gate 00 Unreal structural validation. Gate 01 editor compile. Then gameplay gates: spawn, movement, enemy, damage, death, loot, equip, stats, Protocol, modifier, Karma, Constellation, Realm, boss, save/reload. Shipping build, installer, clean-machine launch, 30-minute stable loop follow.

POM-DOM-598 and POM-DOM-750 remain BLOCKED until their mandatory evidence equations are satisfied.

## 35. Game Builder Execution Order

Phase 1: ingest project + validate UE 5.8 at D:\UE_5.8. Phase 2: compile PathOfMelodieEditor. Phase 3: implement Genesis character/movement/combat. Phase 4: enemy/death/loot/equipment. Phase 5: Protocols/modifiers. Phase 6: Soul/Karma/KPP/Pillars. Phase 7: ~130-node Genesis Constellation. Phase 8: deterministic Realm + two bosses. Phase 9: save/reload. Phase 10: evidence and telemetry. Phase 11: performance/accessibility QA. Phase 12: Shipping/installer/clean-machine only after prior gates pass.

## 36. Builder Do-Not-Do List

Do not copy Path of Exile, Path of Exile 2, Torchlight, Final Fantasy X or any other game's protected assets, UI, maps, characters, story, names or exact mechanics. Do not fabricate evidence. Do not convert KPP to money. Do not embed private keys. Do not auto-transfer crypto. Do not make client authoritative for valuable state. Do not claim 60/120/144 FPS until measured. Do not generate 59,304 bespoke bosses before the two Genesis bosses pass.

## 37. Definition of Done

Genesis First Playable is done only when the complete Golden Path executes in a real build and produces reproducible evidence. The builder must return: build logs, executable/build identity, runtime test results, save/reload proof, authority rejection tests, deterministic Realm reproduction proof, performance captures, crash logs if any, evidence-chain verification and SHA-256 manifest.

Anything not evidenced remains NOT VERIFIED.
