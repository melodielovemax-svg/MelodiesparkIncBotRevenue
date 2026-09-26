# PATH OF MELODIE — SHATTERING CORE

## Purpose

This package is the combat foundation for the 3D ARPG vertical slice.

It separates:

- hitboxes
- hurtboxes
- damage packets
- armor mitigation
- poise
- stagger/shatter
- kill events
- VFX/SFX routing
- skill data

## Recommended scene

```text
CombatRoot
├── ShatteringCore
├── ImpactRouter
└── VFX
    ├── HitSpark
    ├── HeavyImpact
    └── ShatterBurst
```

Player/enemy:

```text
CharacterBody3D
├── Visual
├── CollisionShape3D
├── Hurtbox3D
└── Hitbox3D
```

## Hit flow

```text
Input
  ↓
Skill
  ↓
Hitbox window
  ↓
Overlap / sweep
  ↓
DamagePacket
  ↓
Hurtbox
  ↓
Armor / HP / Poise
  ↓
Shatter?
  ├── no → normal impact
  └── yes → stagger + shatter VFX
  ↓
Death?
  ├── no
  └── yes → loot/event pipeline
```

## Design goals

The core is deliberately data-driven so later Acts can reuse the same combat code.

New skills should normally be data/resources rather than giant branches inside player.gd.

## Production next layer

1. Animation-driven hit windows.
2. Shape casts for melee arcs.
3. Ray/shape sweeps for fast attacks.
4. Invulnerability frames during dodge.
5. Damage numbers.
6. Status effects.
7. Resistance matrix.
8. Boss stagger bars.
9. Destructible armor.
10. Skill-specific VFX.
11. Loot tables.
12. Multiplayer-safe authoritative validation if an online backend is introduced.

## Safety

This is game combat logic only. It does not interact with wallets, payments, private keys or financial transfers.
