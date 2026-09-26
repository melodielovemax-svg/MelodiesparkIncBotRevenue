# PATH OF MELODIE — UNREAL IMPLEMENTATION TRANSFER

## Current implementation evidence

The package now contains a minimal Unreal Engine 5.8 C++ project scaffold:

- `../PathOfMelodie.uproject` and Game/Editor target rules
- `../Source/PathOfMelodie/` primary runtime module
- `APoMGameMode`, configured against the engine's built-in `/Engine/Maps/Entry`
- `APoMRuntimeProbe`, spawned when the game mode starts
- `PathOfMelodie.Runtime.Smoke`, an Editor automation test for module load,
  transient world creation, actor spawn, and `BeginPlay`

This is implementation scaffolding, not a verified Unreal capability. The
project has not yet been compiled or opened in the Editor, the automation test
has not run, and no packaged build or custom gameplay level exists. The local
environment has Unreal Engine 5.8 installed but no detected Visual Studio C++
toolchain; build verification is therefore blocked until a supported compiler
toolchain is available.

## Source-of-truth order
1. Verified source code and tests
2. Master specification
3. Game design documents
4. Art/audio/content specifications
5. Roadmap and future proposals

## C++ ownership map

### UPathOfMelodieGameInstance
Global session/bootstrap state.

### APathOfMelodieCharacter
Movement, camera-facing presentation and component composition.

### UPoMCombatComponent
Combat requests and combat state.

### UPoMAbilitySystemComponent
GAS integration.

### UPoMAttributeSet
Health, resource, armor, resistances, Phoenix and derived stats.

### UPoMSoulCoreComponent
Soul Core state and progression.

### UPoMPhoenixComponent
Phoenix meter, Ascension and Eternal progression.

### UPoMLootComponent
Drops, pickup and item generation.

### UPoMInventoryComponent
Inventory/equipment/stash.

### UPoMProgressionComponent
Level, archetype/build progression.

### UPoMQuestComponent
Campaign quest state.

### UPoMSaveGame
Versioned local persistence.

### AI
Use behavior trees/state trees plus reusable combat/encounter components.

## Data-driven content
Every class, skill, enemy, boss, item base, affix, unique, zone, quest and encounter should have a stable content ID.

Example:
POM_CLASS_PHOENIX_WARRIOR
POM_SKILL_PHOENIX_STRIKE
POM_BOSS_ACT01_01
POM_UNIQUE_CROWN_FIRST_PHOENIX

## Testing layers
- unit tests
- gameplay functional tests
- automation tests
- save migration tests
- network authority tests
- packaged-build smoke tests
- performance tests
- content validation
- asset-reference validation

## CI target
Clean checkout -> dependency validation -> compile -> automated tests -> cook -> package -> smoke test -> artifact archive.

## Vertical slice acceptance
A reviewer must be able to launch a packaged build and complete:
spawn -> move -> fight -> use 4 skills -> dodge -> gain Phoenix -> Ascend -> kill elite -> loot -> equip -> save -> reload -> fight boss -> receive reward.
