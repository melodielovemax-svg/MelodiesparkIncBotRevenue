# MELODIESPARK — MASTER REPLENISHED SYSTEM ARCHITECTURE

## 1. Vue d'ensemble du Système

Le projet unifie deux produits hautement spécialisés, liés par un pont d'événements et de télémétrie asynchrone mais strictement découplés dans leur exécution :

```
                 MELODIESPARK
                      │
        ┌─────────────┴─────────────┐
        │                           │
 COMMAND CENTER               PATH OF MELODIE
 [Node.js / SQLite / PG]       [Godot 4.x / GDScript]
        │                           │
 Auth / Revenue                Combat / ShatteringCore
 Webhooks / Store              Catalogs / Skills / Runes
 EIP-191 Non-Custodial         Loot / Items / Builds
 600 Guardians Profiles        15 Acts Campaign
 Safe Automation Cycles        Status / Damage Packet
        │                           │
        └──────── API / EVENTS ─────┘
                      │
            PostgreSQL / Audit
```

---

## 2. Règle Maîtresse

> **Définition ≠ Runtime ≠ Infrastructure ≠ UI ≠ Finance**

1. **Définition :** Les données déclaratives (catalogues JSON de compétences, affixes d'objets, archétypes, actes, profils de gardiens).
2. **Runtime :** Les moteurs d'exécution déterministes (boucle de combat, résolution de dégâts, altérations d'état, scheduler de workflows bornés).
3. **Infrastructure :** Les adaptateurs de persistance et de communication (SQLite, PostgreSQL, connecteurs HTTP, serveurs d'API).
4. **UI :** Les interfaces de présentation (dashboard web HTML5/CSS, vue isométrique 3D Godot, console CLI).
5. **Finance :** Frontière cryptographique et bancaire étanche. Aucun transfert sans signature explicite du joueur (EIP-191). Aucune clé privée stockée sur les serveurs. Zéro promesse de gain automatique.

---

## 3. Melodiespark Command Center

### 3.1 Identité & Sécurité
- **Chiffrement :** Hachage des mots de passe par `scrypt` avec sel cryptographique aléatoire.
- **Sessions :** Sessions serveur opaques avec hachage SHA-256 (`id_hash`, `csrf_hash`).
- **CSRF & Rate Limiting :** Tokens HMAC signés et buckets glissants sur les routes sensibles (`/api/auth/login`, `/api/workflows/run`, etc.).
- **Audit :** Journal d'audit immuable avec pseudonymisation d'IP (`audit_logs`).

### 3.2 Revenue Hub & Commerce
- **Sources :** Webhooks signés Stripe et Shopify.
- **Idempotence :** Clé unique `(source, external_id)` avec calculs financiers en entiers (*minor currency units*).
- **États de réconciliation :**
  $$\text{PENDING} \rightarrow \text{CONFIRMED} \rightarrow \text{RECONCILED}$$
  $$\text{PENDING} \rightarrow \text{FAILED / REFUNDED / DISPUTED}$$

### 3.3 Wallet Boundary (Web3 Non-Custodial)
- **Flux de vérification :**
  1. Le client demande un défi : `GET /api/wallet/challenge?address=0x...&chainId=1`
  2. Le serveur génère un nonce aléatoire et un message canonique expirant (5 minutes).
  3. Le joueur signe via MetaMask / EIP-191.
  4. Le serveur vérifie cryptographiquement la signature via `viem`.
  5. Une session de portefeuille authentifiée est établie.
- **Intention de retrait :**
  - La signature d'un message d'intention ne déplace pas de fonds et n'accorde aucun droit de débit automatique.

### 3.4 Guardian Matrix & Automation Core
- **Matrice :** 600 profils déterministes : Arc-Angels (12) $\rightarrow$ Guardians $\rightarrow$ Sub-Guardians (588).
- **Automation Core :** Bounded cycles avec timeouts stricts, disjoncteur (circuit-breaker), et journalisation d'audit complète.

---

## 4. Path of Melodie — Phoenix Ascension (ARPG)

### 4.1 Pipeline de Combat & Shattering Core
```text
CombatCatalog
      ↓
SkillRuntime
      ↓
Hitbox / Hurtbox
      ↓
DamagePacket
      ↓
ShatteringCore
      ↓
ReactionRuntime
      ↓
StatusRuntime
      ↓
Poise / Stagger
      ↓
Death
      ↓
LootRuntime
      ↓
ItemInstance
      ↓
InventoryRuntime
      ↓
EquipmentRuntime
      ↓
StatAggregator
      ↓
BuildRuntime
```

### 4.2 Réactions Élémentaires (`ReactionRuntime`)
1. **Fire + Ice** $\rightarrow$ `thermal_break` (rupture thermique, dégâts massifs et bris d'armure).
2. **Lightning + Water** $\rightarrow$ `electrified` (arcs électriques en chaîne et étourdissement).
3. **Fire + Corruption** $\rightarrow$ `soulfire` (brasier corrompu infligeant un DoT continu et drain de poise).
4. **Ice + Soul** $\rightarrow$ `frozen_soul` (cristallisation de l'âme et fragmentation à l'impact).
5. **Phoenix + Fire** $\rightarrow$ `infernal_ascension` (déflagration cataclysmique rechargeant la jauge Phoenix).

### 4.3 Altérations d'État (`StatusRuntime`)
- `burn` (dégâts de feu sur la durée, jusqu'à 5 stacks)
- `freeze` (immobilisation complète)
- `shock` (arcs de foudre sur dégâts subis)
- `stun` (interruption d'actions)
- `corruption` (amplification des dégâts reçus)
- `shattered` (malus de défense de 50% suite à un bris de poise)

### 4.4 Soul Core (Méta-progression)
Cinq piliers fondamentaux :
- **POWER :** Multiplicateur d'attaque et impact de poise.
- **SOUL :** Capacité d'essence d'âme et réduction du temps de recharge.
- **MELODIE :** Puissance des réactions élémentaires et rayon d'aura.
- **KARMA :** Protection défensive et réputation communautaire.
- **ASCENSION :** Vitesse de génération du Phoenix et durée de l'Ascension.

### 4.5 Phoenix Ascension
- **7 Rangs :** Soulborn $\rightarrow$ Awakened $\rightarrow$ Guardian $\rightarrow$ Seraph $\rightarrow$ Arc-Angel $\rightarrow$ Phoenix $\rightarrow$ Phoenix Eternal.
- **5 Branches :**
  - *Phoenix of Fire* (offensive pyrotechnique pure)
  - *Phoenix of Souls* (drain vital et échos spirituels)
  - *Phoenix of Time* (accélération chronologique et vitesse doublée)
  - *Phoenix of Void* (gravité abyssale et singularités)
  - *Phoenix of Harmony* (immunité poise et résonance de karma)

### 4.6 Économie Interne (7 Devises Cloisonnées)
| Monnaie | Rôle |
|---|---|
| **Gold** | Commerce auprès des marchands en jeu |
| **Shards** | Crafting et réenchantement d'affixes d'équipement |
| **Soul Essence** | Amélioration des piliers du Soul Core |
| **Karma Points** | Progression communautaire et sanctuaire de faction |
| **Power Points** | Déblocage des paliers d'Ascension |
| **Items** | Équipements, gemmes et runes |
| **MA** | Unités de progression numérique optionnelles (non-spéculatives) |

### 4.7 Campagne des 15 Actes
1. *Ashes of Aurelion* (Nethervale) — Boss : The Cinder Warden
2. *The Broken Guardian* (Elysara) — Boss : Guardian Thorne
3. *Cathedral of Lost Souls* (Nethervale) — Boss : The Soul Bishop
4. *Pyra, Land of Fire* (Pyra) — Boss : Vulkarion
5. *The Frozen Oath* (Nivalis) — Boss : Queen Crysera
6. *The Corrupted Choir* (Varkaan) — Boss : The Choirmaster
7. *The Seven Gates* (Aurelion) — Boss : Seraph Vael
8. *War of the Arc-Angels* (Aurelion) — Boss : Archangel Maakar
9. *The Soul Sea* (The Veil) — Boss : Leviathan of Echoes
10. *The Phoenix Prison* (Pyra) — Boss : The Imprisoned Phoenix
11. *Return of the First Soul* (Nethervale) — Boss : The First Soul
12. *The Maakaras Protocols* (The Veil) — Boss : Protocol Zero
13. *Paradise Reborn* (Aurelion) — Boss : The False Paradise
14. *The Last Ascension* (All Realms) — Boss : The Eternal Guardian
15. *Phoenix Eternal* (Maakaras Core) — Boss : Maakaras, Heart of the World

### 4.8 Endgame : Protocoles de Maakaras (I à VIII)
- **Protocol I — World :** Infinite Veil (cartes procédurales)
- **Protocol II — Soul :** Soul Realms (combats d'échos)
- **Protocol III — Guardian :** Arc-Angel Trials
- **Protocol IV — Arc-Angel :** Celestial Spires
- **Protocol V — Phoenix :** Phoenix Rifts
- **Protocol VI — Void :** The Infinite Void
- **Protocol VII — Eternal :** Legacy Sanctum
- **Protocol VIII — Maakaras :** Maakaras Core Raid
