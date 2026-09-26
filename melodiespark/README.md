# Melodiespark — Package de production unifié

Ce dossier est le package de consolidation de la vision Melodiespark.

> **Melodiespark INC** est le produit réel. **_Melodiespark: The Long Song_** est l’univers fictif du jeu. Les métaphores, projections et concepts d’observation ne doivent pas être présentés comme des capacités opérationnelles ou financières.

## Source de consolidation

Le fichier physique `MELODIESPARK.txt` n’était pas présent dans `C:\melodie` au moment de la consolidation. Le snapshot fourni dans la conversation a donc été utilisé comme source de travail. Les affirmations techniques ont été confrontées au code existant de `MelodiesparkCommandCenter`.

## État du package

Ce package est une **spécification de production et une structure de migration**, pas une promesse que toutes les fonctions sont terminées. Les wrappers PowerShell et les contrats sont ajoutés sans réécrire le runtime existant.

- **Document maître :** [`MASTER_SPEC.md`](MASTER_SPEC.md)
- **Architecture :** [`ARCHITECTURE.md`](ARCHITECTURE.md)
- **GDD :** [`GDD.md`](GDD.md)
- **Matrice :** [`FEATURE_MATRIX.csv`](FEATURE_MATRIX.csv)
- **Contrat API :** [`docs/api/openapi.yaml`](docs/api/openapi.yaml)
- **Extension de base de données cible :** [`database/schema.sql`](database/schema.sql)
- **Moteur d’orchestration :** [`QuantumMatrix.ps1`](QuantumMatrix.ps1)
- **Wrappers opérationnels :** `automation/powershell/` (`Setup`, `Start`, `Stop`, `Health`, `Backup`, `Deploy`)

## Règles de statut

- `operational_local` : existe et possède un chemin local vérifiable.
- `configurable` : nécessite une configuration ou une intégration externe.
- `scaffold` : structure prévue, sans comportement métier complet.
- `planned` : spécifié mais pas implémenté.
- `paper_only` : simulation sans exécution financière.
- `blocked` : nécessite une décision de sécurité, juridique ou technique.
- `out_of_scope` : ne doit pas être implémenté sous la forme demandée.

## Référence au code existant

L’implémentation de référence actuelle se trouve dans `C:\melodie\MelodiesparkCommandCenter` :

- API Node.js et dashboard statique ;
- SQLite local et schéma PostgreSQL de référence ;
- sessions, CSRF, RBAC et audit ;
- registre et intégrations de lecture ;
- vérification EIP-191 et intentions de retrait sans transfert ;
- flux de travail bornés ;
- scaffold d’exécutions locales non financières lié à une intention signée ;
- profils déterministes de 600 Guardians ;
- slice vertical Godot dans `game/`.

## Arborescence

```text
melodiespark/
├── apps/
│   ├── web/
│   └── game/
├── services/
├── workers/
├── automation/powershell/
├── packages/
├── infrastructure/
├── database/
├── docs/
├── tests/
├── MASTER_SPEC.md
├── ARCHITECTURE.md
├── GDD.md
├── FEATURE_MATRIX.csv
└── QuantumMatrix.ps1
```

Les répertoires représentent les domaines cibles. Les implémentations existantes restent dans leurs dépôts d’origine jusqu’à une migration explicite.

## Principe de génération

```text
SPÉCIFICATION
   ↓
MODÈLE DE DOMAINE
   ↓
CONTRAT API
   ↓
MODÈLE DE BASE DE DONNÉES
   ↓
SERVICE
   ↓
WORKER
   ↓
INTERFACE
   ↓
TEST
   ↓
DÉPLOIEMENT
   ↓
SURVEILLANCE
```

Ne pas générer des millions de lignes statiques. Les tâches à grande échelle doivent être des modèles, des paramètres ou des combinaisons vérifiables.
