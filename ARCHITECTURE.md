# Melodiespark — architecture de référence

Ce document est une vue de haut niveau. L’architecture détaillée et les contrats existants restent dans les documents du Command Center.

## 1. Deux domaines séparés

```text
REAL PRODUCT
Melodiespark Command Center
├── Identity and security
├── API and bounded workflows
├── Data and audit
└── Godot game directory

FICTIONAL NARRATIVE
Melodiespark: The Long Song
├── Canon
├── Timeline
├── Civilizations
├── Factions
├── Game arc
└── Open threads
```

Le lore est une couche de conception et de documentation. Il ne doit pas contourner les frontières du produit réel.

## 2. Command Center

`MelodiesparkCommandCenter` possède ses propres règles pour :

- l’identité et les sessions ;
- les autorisations et CSRF ;
- les routes API ;
- les intégrations et webhooks ;
- l’audit ;
- les intentions wallet et l’absence de transfert automatique ;
- les workflows bornés ;
- la persistance.

Voir :

- `MelodiesparkCommandCenter/docs/ARCHITECTURE.md` ;
- `MelodiesparkCommandCenter/docs/ARCHITECTURE_MASTER.md` ;
- `MelodiesparkCommandCenter/docs/CONTENT-GRID.md` ;
- `MelodiesparkCommandCenter/README.md`.

## 3. Jeu Godot

Le jeu est une application Godot 4 distincte, actuellement placée dans `MelodiesparkCommandCenter/game`, avec des fondations supplémentaires dans `PathOfMelodie_15Act_ARPG`.

Pipeline de référence :

```text
Catalogues
   ↓
SkillRuntime
   ↓
CombatDamagePacket
   ↓
CombatHurtbox3D
   ↓
CombatShatteringCore
   ↓
Death / LootRuntime
   ↓
ItemInstance
   ↓
InventoryRuntime
   ↓
EquipmentRuntime
   ↓
BuildRuntime
```

Cette chaîne décrit le chemin de gameplay. Le lore peut lui donner un sens, mais ne doit pas prétendre qu’un état ou une mémoire est implémenté s’il ne l’est pas.

## 4. Persistance

Le jeu utilise une sauvegarde locale versionnée. La documentation lore propose une extension progressive de la provenance, avec migration et tests. Toute évolution doit préserver les sauvegardes existantes et ne pas mélanger les données fictives avec des secrets ou des données privées.

## 5. Pont entre produit et fiction

Le pont autorisé est conceptuel :

- les noms et thèmes peuvent être partagés ;
- le jeu peut découvrir des principes anciens ;
- Melodiespark INC ne doit pas être présenté comme l’auteur secret de l’univers ;
- les fonctionnalités fictives ne doivent pas devenir des promesses produit ;
- l’économie du jeu ne devient pas un actif financier par association thématique.

## 6. Priorité des changements

Pour une évolution technique :

1. lire l’architecture et les tests concernés ;
2. préserver les contrats existants ;
3. définir les données minimales nécessaires ;
4. tester le chemin nominal et les anciens formats ;
5. documenter le changement ;
6. considérer le lore seulement après stabilisation technique.

## 7. Package de consolidation

Le package de production est décrit dans [`melodiespark/MASTER_SPEC.md`](melodiespark/MASTER_SPEC.md), avec :

- [`melodiespark/ARCHITECTURE.md`](melodiespark/ARCHITECTURE.md) ;
- [`melodiespark/GDD.md`](melodiespark/GDD.md) ;
- [`melodiespark/FEATURE_MATRIX.csv`](melodiespark/FEATURE_MATRIX.csv) ;
- [`melodiespark/QuantumMatrix.ps1`](melodiespark/QuantumMatrix.ps1) ;
- [`melodiespark/docs/api/openapi.yaml`](melodiespark/docs/api/openapi.yaml) ;
- [`melodiespark/database/schema.sql`](melodiespark/database/schema.sql).

Ce package est une cible de migration. Il ne remplace pas le runtime existant dans `MelodiesparkCommandCenter`.

## 8. Source narrative

Le point d’entrée narratif est [`lore/README.md`](lore/README.md). Le document fondateur est [`lore/LORE_CANON.md`](lore/LORE_CANON.md).
