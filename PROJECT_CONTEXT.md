# Melodiespark — contexte projet

- **Produit réel :** Melodiespark Command Center et ses composants documentés.
- **Univers fictif :** _Melodiespark: The Long Song_.
- **Principe narratif :** tout ce qui est créé peut devenir un héritage ; tout héritage peut commencer une nouvelle création.
- **État documentaire :** canon narratif version 1.0.0 et package de consolidation `melodiespark/` ; le package n’implémente pas un nouveau runtime.

## 1. Répertoires principaux

| Répertoire | Rôle |
|---|---|
| `MelodiesparkCommandCenter/` | Command Center Node.js, API locale, sécurité, données et vertical slice Godot dans `game/` |
| `PathOfMelodie_15Act_ARPG/` | fondation Godot 4 et campagne de quinze actes |
| `PathOfMelodie_ShatteringCore/` | module Godot de combat et de Shattering |
| `melodiespark-py/` | package Python séparé |
| `lore/` | canon narratif de _The Long Song_ |
| `melodiespark/` | package de consolidation, contrats, GDD, matrice et scaffolding |
| `Melodiespark_Source/` | arbres Git importés, catalogués et non redistribués par défaut |
| `apps/melodie-cli/` | CLI TypeScript `@melodiespark/cli` (npm, pnpm, npx) |
| `python/melodiespark-cli/` | frontend Python `melodiespark-cli` (pip, pipx) |
| `packages/content-catalog/` | contrat partagé : règles de classification et catalogue généré |
| `templates/` | modèles de scaffolding : `node`, `python`, `web3`, `unreal`, `melodiespark-template` |

## 1 bis. Catalogue de contenu et CLI

Un catalogue, deux frontends. Le catalogue enregistre les métadonnées des
6 799 fichiers de `Melodiespark_Source/` ; il n'expose pas leur contenu.

- **Extraction refusée par défaut.** `SECRET` est refusé définitivement, aucun
  drapeau ne le débloque. Une seconde couche analyse le contenu avant toute
  copie.
- **Le même contrat pour les deux langages.** Les règles sont des données
  (`packages/content-catalog/rules/classification-rules.json`), pas du code, et
  un test de parité exécute les deux frontends sur un seul catalogue.
- **Web3 en lecture seule.** Le modèle `web3` ne produit aucun code de
  signature sans consentement explicite.
- **Aucune publication.** Construction et validation locales uniquement.

Points d'entrée : [`BUILD-CATALOG-CLI.md`](BUILD-CATALOG-CLI.md),
[`BUILD_REPORT.md`](BUILD_REPORT.md), [`DECISIONS.md`](DECISIONS.md).

## 2. Produit réel

`MelodiesparkCommandCenter` est une implémentation locale orientée sécurité pour :

- l’identité administrateur ;
- les sessions et l’audit ;
- les brouillons produits ;
- les intégrations de lecture et la réconciliation ;
- les intentions de retrait wallet non custodiales ;
- les workflows bornés et la télémétrie ;
- le jeu Godot embarqué sous `game/`.

Les capacités réelles, limites et statuts réglementaires restent définis par le README, l’architecture et les tests du Command Center. Le canon narratif ne les étend pas implicitement.

## 3. Jeu

Le jeu utilise Godot 4 et possède actuellement :

- des catalogues de skills, runes, réactions, statuts, affixes et archétypes ;
- des runtimes de skill, loot, item, inventaire, équipement, build et économie ;
- le pipeline de combat `DamagePacket`, `Hurtbox3D` et `ShatteringCore` ;
- des gardiens, une ascension Phoenix et des protocoles ;
- une campagne de quinze actes ;
- une sauvegarde locale versionnée.

Le jeu est une vertical slice et une fondation, pas la preuve que toutes les fonctionnalités du lore sont déjà implémentées.

## 4. Canon narratif

Le dossier `lore/` contient :

- le principe fondateur et la frontière réalité/fiction ;
- la cosmologie et la chronologie ;
- les civilisations et les factions ;
- l’arc du joueur ;
- la correspondance avec le code réel ;
- les règles de canon ;
- les mystères ouverts.

Les objets, skills, Guardian, Phoenix, Maakaras et protocoles peuvent recevoir une histoire, mais leur origine cosmique ne doit pas être inventée sans décision narrative explicite.

## 5. Package de consolidation

Le dossier `melodiespark/` contient la spécification unifiée, l’arborescence cible, le GDD, la matrice de fonctions, le contrat OpenAPI, le schéma DB cible et le wrapper PowerShell. Il distingue les capacités existantes des fonctions `planned`, `scaffold`, `paper_only` ou `blocked`.

## 6. Règle de changement

```text
Exigence
  ↓
Architecture
  ↓
Données
  ↓
Tests
  ↓
Persistance
  ↓
Documentation
  ↓
Intégration du lore
```

La documentation lore ne justifie pas, à elle seule, une modification de code.
