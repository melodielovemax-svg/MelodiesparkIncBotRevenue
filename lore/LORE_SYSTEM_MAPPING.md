# MELODIESPARK: THE LONG SONG — CORRESPONDANCE SYSTÈMES ET LORE

- **Statut :** document d’intégration technique et narrative
- **Version :** 1.0.0
- **Vérification du code :** 2026-09-24
- **Répertoire de référence :** `C:\melodie\MelodiesparkCommandCenter`
- **Statut du code :** existant, non modifié par le canon

## 1. Principe d’intégration

```text
Code stable
   ↓
Exigences
   ↓
Extension de données
   ↓
Tests
   ↓
Persistance et migration
   ↓
Intégration narrative
```

Le lore peut donner un sens à une mécanique. Il ne doit pas imposer une réécriture de l’architecture.

## 2. Référence de code vérifiée

| Système | Emplacement actuel | Rôle technique vérifié | Correspondance lore possible |
|---|---|---|---|
| Catalogues de combat | `game/data/combat/skills.json` | définitions de skills, runes, réactions et statuts | langues de transformation |
| Catalogues de loot | `game/data/loot/affixes.json` | raretés, affixes et exemples légendaires | rareté de gameplay et rareté historique |
| Catalogues de build | `game/data/builds/archetypes.json` | archétypes et affinités de départ | identité opérationnelle naissante |
| Loader de catalogues | `game/scripts/systems/combat_catalog.gd` | lecture des JSON en lecture seule | couche de définition |
| `SkillRuntime` | `game/scripts/runtime/skill_runtime.gd` | cooldown, état et définition copiée d’un skill | skill comme motif de transformation |
| `CombatDamagePacket` | `game/scripts/combat/damage_packet.gd` | source, quantité, type, skill, poise et tags | résonance transmise |
| `CombatShatteringCore` | `game/scripts/combat/shattering_core.gd` | impact, critique, poise, shatter et mort | Fracture contrôlée |
| `CombatHurtbox3D` | `game/scripts/combat/hurtbox_3d.gd` | réception de coups et état de structure | structure exposée |
| `ReactionRuntime` | `game/scripts/runtime/reaction_runtime.gd` | réactions élémentaires | fréquences qui se répondent |
| `StatusRuntime` | `game/scripts/runtime/status_runtime.gd` | statuts et dégâts dans le temps | mémoire altérée ou résonance persistante |
| `ItemInstance` | `game/scripts/runtime/item_instance.gd` | instance unique avec six champs actuels | objet actuel + histoire éventuelle |
| `LootRuntime` | `game/scripts/runtime/loot_runtime.gd` | génération d’un objet à partir de catalogues | provenance d’un objet découvert |
| `InventoryRuntime` | `game/scripts/runtime/inventory_runtime.gd` | tableau, capacité et snapshot | mémoire matérielle du joueur |
| `EquipmentRuntime` | `game/scripts/runtime/equipment_runtime.gd` | slots et agrégation d’affixes | tenue, transmission et usage |
| `BuildRuntime` | `game/scripts/runtime/build_runtime.gd` | liste d’équipement et résumé de statistiques | identité opérationnelle du personnage |
| `SoulCoreRuntime` | `game/scripts/runtime/soul_core_runtime.gd` | cinq piliers et bonus | tradition de transformation |
| `GuardianRuntime` | `game/scripts/runtime/guardian_runtime.gd` | gardiens, niveaux, auras et évolution Arc-Angel | compagnon et gardien de mémoire |
| `AscensionRuntime` | `game/scripts/runtime/ascension_runtime.gd` | rangs et branches Phoenix | transformation successive du héros |
| `EconomyRuntime` | `game/scripts/runtime/economy_runtime.gd` | sept paniers de ressources de jeu | valeur de création, de soin et de transmission |
| `ProtocolsRuntime` | `game/scripts/runtime/protocols_runtime.gd` | huit protocoles de gameplay | systèmes de reconstruction |
| `MelodieActs` | `game/scripts/campaign/acts.gd` | liste actuelle de quinze actes | première campagne locale |
| Sauvegarde locale | `game/scripts/main.gd` | sauvegarde JSON version 4 | héritage local du joueur |

## 3. Ce qui est réellement présent aujourd’hui

### 3.1 `ItemInstance`

Le type actuel possède exactement ces champs :

```text
id
definition_id
name
rarity
affixes
legendary_effect
```

`create_from_roll()` génère actuellement l’identifiant, copie les affixes et associe une définition. `to_dict()` sérialise ces champs.

Les champs narratifs comme `origin`, `age`, `civilization`, `creator`, `previousOwners`, `memory`, `significance` et `provenance` ne sont pas présents dans le runtime actuel. Toute description contraire est une proposition, pas une fonctionnalité existante.

### 3.2 Inventaire et build

`InventoryRuntime` conserve un tableau, une capacité et un snapshot. `BuildRuntime` conserve une liste d’équipement et calcule un résumé de statistiques.

Le code actuel ne constitue donc pas encore un inventaire historique ou un système complet de provenance.

### 3.3 Sauvegarde

La sauvegarde du jeu utilise actuellement la version **4**. Elle contient notamment :

- `version` ;
- `inventory_count` ;
- `act` ;
- `inventory` sous forme de snapshot ;
- `build` sous forme de résumé ;
- `economy` ;
- `soul_core`.

Le loader actuel exploite notamment le compteur d’inventaire, l’acte, l’économie et le Soul Core. Une extension narrative ne doit pas supposer que la réhydratation complète des objets et du build existe déjà.

## 4. Correspondance narrative proposée

### 4.1 Catalogues → Définitions de Création

Les catalogues JSON décrivent ce qui peut être créé. Dans le lore, ils peuvent devenir une bibliothèque de motifs : skills, runes, affixes, archétypes et équipements de base.

**Règle :** une définition peut avoir une origine, mais son origine ne doit pas modifier silencieusement ses statistiques.

### 4.2 `SkillRuntime` → Motif de transformation

Une skill représente une transformation répétable. Son école narrative peut être `Ancient`, `Arcane`, `Machine`, `Resonance`, `Memory` ou `Creation`.

Cette catégorie doit être ajoutée comme donnée de gameplay si elle est introduite. Elle ne doit pas être déduite du nom d’une skill.

### 4.3 `CombatDamagePacket` → Résonance

Un `CombatDamagePacket` transporte une transformation d’un point à un autre. Dans le lore, il peut être interprété comme une résonance, une intention ou une mémoire active.

Le type de dégât technique reste la source de vérité du gameplay. Le terme de résonance est une couche d’interprétation.

### 4.4 `CombatShatteringCore` → Fracture contrôlée

Le `CombatShatteringCore` est la correspondance narrative la plus directe avec The Fracture. Le runtime traite les dégâts, la poise, le shatter, la mort et le loot. Le lore peut expliquer pourquoi certains fragments deviennent accessibles après une rupture contrôlée.

### 4.5 `LootRuntime` → Découverte d’un héritage

Le loot est le premier contact du joueur avec un objet. Chaque objet peut commencer comme une ressource de gameplay et devenir, plus tard, une trace historique.

La première étape ne consiste pas à forcer une ancienne identité sur tous les objets. Il faut prévoir des objets sans provenance connue.

### 4.6 `InventoryRuntime` → Musée de mémoire

L’inventaire peut évoluer vers un musée personnel : identité, origine, propriétaire, historique, état, valeur et potentiel.

Cette évolution doit être progressive et compatible avec la capacité de 60 éléments existante.

### 4.7 `BuildRuntime` → Identité en construction

Le build est la combinaison actuelle de l’équipement. Le lore peut ajouter une histoire de build : qui a choisi ces objets, quelles transformations ont été apprises et quel héritage est en train de naître.

Cette histoire ne doit pas être inventée à partir d’une simple statistique. Elle doit provenir d’événements de jeu explicites.

### 4.8 `GuardianRuntime` → Gardien et compagnon

Les gardiens peuvent être des traces de civilisations mémorielles. Leur évolution Guardian → Arc-Angel peut représenter une nouvelle forme de protection, sans imposer immédiatement une origine cosmique.

### 4.9 `AscensionRuntime` → Transformation successives

Les rangs d’Ascension sont une mécanique existante. Dans le lore, ils peuvent symboliser la capacité de transmettre une forme de soi à la génération suivante.

Cette interprétation ne signifie pas que chaque rang est une renaissance historique identique.

### 4.10 `EconomyRuntime` → Valeurs séparées

Les sept catégories de gameplay doivent rester séparées. Le lore peut ajouter des distinctions importantes entre la valeur de gameplay, la valeur historique, la valeur esthétique et la valeur de transmission, mais il ne doit pas convertir automatiquement une monnaie de jeu en actif financier.

## 5. Extension proposée de `ItemInstance`

Cette section est une **spécification future**, pas une modification réalisée.

### 5.1 Principes

- conserver les six champs existants ;
- ajouter un bloc de données versionné ;
- accepter les anciennes sauvegardes ;
- ne pas confondre âge, âge cosmique et date réelle ;
- distinguer une source confirmée d’une rumeur ;
- permettre un objet sans origine connue ;
- garder les noms de joueurs ou données personnelles hors du lore.

### 5.2 Bloc conceptuel

```json
{
  "lore": {
    "schema_version": 1,
    "origin_id": "shattered_archivists_ruin",
    "age_id": "late_shattered_age",
    "civilization_id": "archivists",
    "creator_ids": [],
    "previous_owner_ids": [],
    "memory_refs": [],
    "significance": "unresolved",
    "provenance": []
  }
}
```

`memory_refs` désigne des références de contenu fictif, pas une copie de données personnelles. `provenance` doit pouvoir contenir des sources contradictoires et un niveau de confiance.

### 5.3 Migration progressive

1. Écrire les exigences et les critères d’acceptation.
2. Définir des identifiants stables pour les ères et civilisations.
3. Ajouter un schéma de lecture tolérant aux objets anciens.
4. Ajouter une migration de sauvegarde testée.
5. Ajouter la génération de provenance pour les nouveaux objets.
6. Ajouter l’interface d’inspection.
7. Ne modifier le combat que si une exigence technique le demande.

## 6. Raretés : ne pas renommer brutalement

Le catalogue de loot actuel contient notamment :

```text
common, magic, rare, epic, legendary, ancient, mythic, soul, phoenix, maakaras
```

Le modèle narratif propose :

```text
Common, Uncommon, Rare, Epic, Legendary, Mythic, Eternal
```

Ces deux listes ne sont pas identiques. Une implémentation future doit choisir entre :

- conserver les clés techniques existantes et ajouter une couche de rareté historique ;
- définir des alias documentés ;
- effectuer une migration testée de version de sauvegarde.

Aucun nom ne doit être changé dans une sauvegarde existante sans décision technique explicite.

## 7. Règles de persistance

- la sauvegarde locale reste versionnée ;
- les anciennes données doivent rester lisibles ;
- un champ absent ne doit pas faire échouer le chargement ;
- la provenance doit être optionnelle pour les objets ordinaires ;
- une contradiction de provenance doit être représentable ;
- le lore ne doit pas contenir de secrets, de jetons ou de données privées ;
- la sauvegarde du lore ne doit pas modifier la sécurité du Command Center.

## 8. Cartographie Gameplay → Fiction

| Élément de gameplay | Lecture lore possible | État |
|---|---|---|
| `CombatDamagePacket` | résonance transmise | métaphore proposée |
| `Poise` | résistance de la structure | correspondance directe |
| `Shatter` | fracture contrôlée | correspondance canonique |
| `Loot` | récupération d’un fragment | correspondance directe |
| `Affix` | propriété historique ou technique | proposition |
| `LegendaryEffect` | règle d’héritage ou souvenir ancien | proposition |
| `Guardian` | compagnon et gardien | intégration progressive |
| `Phoenix` | renaissance et transmission | canon d’intégration |
| `Maakaras` | système ou héritage ancien à définir | origine ouverte |
| `Build` | identité opérationnelle | proposition |
| `Inventory` | musée personnel | proposition |

## 9. Ce que le lore ne doit pas faire

- ne pas modifier une statistique par simple raison narrative ;
- ne pas contourner les tests existants ;
- ne pas imposer une autorité de faction dans le Command Center ;
- ne pas présenter une fonctionnalité fictive comme une fonctionnalité réelle ;
- ne pas ajouter de secrets ou de données de joueur dans une archive ;
- ne pas faire dépendre le jeu d’une ressource externe non prévue ;
- ne pas présenter une simulation comme une archive réelle.

## 10. Séquence d’implémentation recommandée

```text
Exigence
  ↓
Architecture
  ↓
Contrat de données
  ↓
Implémentation
  ↓
Tests
  ↓
Migration de sauvegarde
  ↓
Documentation
  ↓
Intégration du lore
```

Le code existant reste la source de vérité technique. Le lore devient une couche narrative évolutive au-dessus de cette architecture.

> **The Song continues.**
