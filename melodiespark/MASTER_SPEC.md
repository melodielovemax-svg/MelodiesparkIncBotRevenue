# MELODIESPARK INC — SPÉCIFICATION DE L’ÉCOSYSTÈME NUMÉRIQUE UNIFIÉ

- **Document :** spécification maîtresse
- **Version :** 0.1.0
- **Statut :** spécification de production et plan de consolidation
- **Source narrative :** snapshot fourni de `MELODIESPARK.txt`
- **Source technique :** `MelodiesparkCommandCenter` et ses tests
- **Nature :** document de conception, non contrat financier

## 1. Définition

Melodiespark est un écosystème numérique qui peut réunir :

- une plateforme SaaS de contrôle et d’observabilité ;
- un catalogue et un flux e-commerce contrôlables ;
- un portail de revenus fondé sur des preuves et une réconciliation ;
- une couche wallet/Web3 limitée à la lecture, à la vérification et aux intentions signées ;
- une couche d’automatisation bornée et auditée ;
- le jeu _Path of Melodie_ ;
- des workflows de Guardians, de Karma et de tâches.

Cette définition ne signifie pas que chaque composant est terminé, connecté ou autorisé en production.

## 2. Frontières strictes

### 2.1 Produit réel

Le produit réel comprend uniquement les capacités vérifiées dans le code, les tests et la documentation opérationnelle.

### 2.2 Jeu

Le jeu comprend les règles, catalogues, runtimes et artefacts de _Path of Melodie_. Les lots de progression et les objets de jeu ne deviennent pas des actifs financiers par association de nom.

### 2.3 Web3

La couche Web3 peut connecter un wallet, vérifier une signature, lire un solde et enregistrer une intention. Elle ne doit jamais :

- accepter une clé privée de serveur ;
- forcer une signature ;
- diffuser une transaction sans contrat explicite ;
- promettre un retrait automatique ;
- transformer un score de jeu en actif.

### 2.4 Simulation et métaphore

Les termes comme `Infinite Quantum Matrix`, les milliards de Guardians, les cycles infinis et l’optimisation exponentielle sont des métaphores ou des objectifs de simulation. Ils ne constituent pas une preuve de capacité physique, de revenu garanti ou d’activité autonome.

## 3. Six niveaux de documentation

1. **Vision** — ce que Melodiespark veut devenir.
2. **Produit** — ce que les utilisateurs peuvent réellement faire.
3. **Architecture** — comment les couches sont séparées.
4. **Implémentation** — comment les packages sont construits.
5. **Opérations** — comment le système est exécuté et surveillé.
6. **Feuille de route** — ce qui est opérationnel, planifié ou bloqué.

Chaque fonction doit être classée selon ces six niveaux.

## 4. Quatre grands domaines

```text
PLATEFORME MÉTIER
├── Identité et gouvernance
├── Commerce et revenus
├── Analytique et dashboard
└── Adaptateurs d’intégration

NOYAU D’AUTOMATISATION
├── Orchestration PowerShell
├── Définitions de tâches
├── Workers et files
├── Contrôles de santé
└── Audit et métriques

COUCHE WEB3
├── Vérification de wallet
├── Portefeuille en lecture seule
├── Intentions d’autorisation
├── Signatures utilisateur
└── Preuves de transaction

PATH OF MELODIE
├── Combat et Shattering
├── Loot et inventaire
├── Soul Core
├── Guardians et Karma
├── Ascension
├── Monde et fin de jeu
└── Télémétrie du jeu
```

Les domaines ne doivent pas partager des responsabilités sensibles sans contrat explicite.

## 5. État vérifié au 2026-09-24

| Domaine | État vérifié |
|---|---|
| API et dashboard | Node.js local et dashboard statique |
| Authentification | sessions serveur, mot de passe scrypt, CSRF et RBAC local |
| Revenus | registre, résumé, import d’événements et synchronisation configurable |
| Shopify / Stripe | adaptateurs de lecture et webhooks signés si configurés |
| Wallet | challenge EIP-191, vérification de signature et liaisons |
| Retrait | intention de signature et revue ; aucun broadcast ni transfert automatique |
| Workflows | cycles bornés avec cinq contrôles de validation |
| Exécutions locales | scaffold `/api/v1/executions` lié aux intentions signées ; workflow local sans transaction ni fonds, tests verts mais migration 0.1→0.2 et PostgreSQL non alignés |
| Guardians | 600 profils déterministes ; aucun agent autonome |
| Karma | registre interne sans valeur monétaire |
| Base de données | SQLite local ; schéma PostgreSQL de référence |
| Jeu | slice vertical Godot et fondations de progression |
| Trading | aucun compte, ordre ni moteur de risque ; seul un point d’entrée de prix de référence existe |
| Redis | non implémenté dans le runtime actuel |
| Kubernetes | cible d’infrastructure, non déploiement actuel |
| MA | solde local inerte dans `EconomyRuntime`, sans intégration externe ni conversion |

## 6. Modèle de domaine cible

Les entités ci-dessous décrivent la consolidation visée. Leur présence dans ce document ne signifie pas qu’une table ou une implémentation correspondante existe déjà.

### 6.1 Identity

Entités :

- `User` ;
- `Role` ;
- `Session` ;
- `MfaPolicy` ;
- `AuditEvent` ;
- `ComplianceCase`.

Invariant : les permissions sont vérifiées côté serveur. Le frontend ne constitue jamais une frontière de sécurité.

### 6.2 Revenue

Entités :

- `RevenueEvent` ;
- `RevenueLedgerEntry` ;
- `OrderEvidence` ;
- `ReconciliationRun` ;
- `ProductDraft` ;
- `CurrencySummary`.

Invariant : les montants monétaires sont stockés en unités mineures entières. Un événement externe est dédupliqué par source et identifiant externe.

### 6.3 Wallet

Entités :

- `WalletChallenge` ;
- `WalletBinding` ;
- `PortfolioSnapshot` ;
- `TransactionIntent` ;
- `TransactionEvidence` ;
- `WithdrawalReview`.

Invariant : une intention signée n’est pas une transaction exécutée.

### 6.4 Moteur de tâches

Entités :

- `TaskDefinition` ;
- `TaskRun` ;
- `TaskDependency` ;
- `WorkerLease` ;
- `RetryPolicy` ;
- `TaskEvent` ;
- `CycleRun` ;
- `CycleEvent` ;
- `LocalExecution` ;
- `ExecutionTransition`.

Invariant : une tâche finie possède un statut, un début, une fin, une latence, un résultat et une trace d’audit. Une `LocalExecution` n’est pas une transaction : elle ne peut ni diffuser un payload on-chain, ni déplacer des fonds, ni déclencher un payout.

### 6.5 Guardians

Entités :

- `GuardianProfile` ;
- `GuardianAssignment` ;
- `GuardianRun` ;
- `GuardianEvolution` ;
- `SoulCore` ;
- `KarmaLedgerEntry`.

Invariant : un profil configuré n’est pas un agent autonome. Un Guardian est opérationnel uniquement lorsqu’une tâche réelle lui est assignée et validée.

### 6.6 Trading

Entités :

- `MarketDataSnapshot` ;
- `PaperAccount` ;
- `PaperOrder` ;
- `PaperPosition` ;
- `RiskDecision` ;
- `ExchangeAdapterStatus`.

Invariant : le premier périmètre est `paper_only`. L’exécution réelle reste hors périmètre tant que les exigences de sécurité, conformité, risque et revue humaine ne sont pas définies et approuvées.

### 6.7 Path of Melodie

Entités :

- `Character` ;
- `Combatant` ;
- `SkillDefinition` ;
- `DamagePacket` ;
- `ShatterState` ;
- `ItemInstance` ;
- `Inventory` ;
- `Build` ;
- `GuardianProfile` ;
- `SoulCore` ;
- `AscensionState` ;
- `WorldState` ;
- `GameTelemetryEvent`.

Invariant : le lore est une couche narrative. Il ne remplace pas les contrats de runtime, les tests ou la persistance.

## 7. Organisation des packages cibles

```text
apps/
├── web/                  # frontend Next.js cible
└── game/                 # client Godot ou intégration de jeu

services/
├── api/                  # gateway HTTP
├── auth/                 # identité, sessions, RBAC, MFA
├── revenue/              # registre et réconciliation
├── commerce/             # produits, commandes, brouillons
├── trading/              # risque, paper trading, adaptateurs futurs
├── wallet/               # challenges, liaisons et intentions
├── blockchain/           # RPC en lecture seule
├── karma/                # registre interne
├── guardian/             # profils et affectations
├── analytics/            # métriques et télémétrie
├── notification/         # notifications non critiques
└── compliance/           # dossiers, revues et politiques

workers/
├── revenue-worker/
├── sync-worker/
├── analytics-worker/
├── guardian-worker/
└── notification-worker/

packages/
├── types/
├── config/
├── database/
├── logging/
├── security/
├── blockchain/
└── ui/

automation/powershell/
infrastructure/
database/
docs/
tests/
```

Le runtime actuel est un monolithe Node.js. Cette arborescence est une cible de migration, pas une déclaration que les microservices existent déjà.

## 8. Moteur de tâches et génération de tâches

Le nombre de tâches ne doit pas être matérialisé artificiellement en millions de lignes statiques.

Trois niveaux sont autorisés :

### 8.1 Tâches atomiques

Une tâche possède un ID stable, un type, une entrée, une sortie, une dépendance, un timeout, une politique de nouvelles tentatives et un événement d’audit.

### 8.2 Modèles

Un modèle produit des tâches spécialisées à partir de paramètres contrôlés.

### 8.3 Combinaisons

Les combinaisons sont calculées, validées et échantillonnées. Elles ne deviennent des artefacts persistés que lorsqu’elles ont un propriétaire, une version et un test.

### 8.4 Contrat minimal

```json
{
  "id": "task.revenue.sync",
  "version": 1,
  "owner": "revenue",
  "inputSchema": "schemas/revenue-sync-input.json",
  "outputSchema": "schemas/revenue-sync-output.json",
  "timeoutSeconds": 120,
  "maxRetries": 3,
  "sideEffects": "read_only",
  "requiresApproval": false
}
```

Une tâche `financial`, `trading`, `withdrawal` ou `contract_deployment` doit avoir `requiresApproval: true` et un controle humain explicite.

## 9. Orchestration PowerShell

`QuantumMatrix.ps1` est un orchestrateur borné. Il ne fabrique pas de revenu et ne revendique aucune capacité quantique.

États :

```text
ARRÊTÉ
  ↓
DÉMARRAGE
  ↓
CONTRÔLE_DE_SANTÉ
  ↓
FILE_DE_TÂCHES
  ↓
WORKERS
  ↓
RÉSULTATS
  ↓
AUDIT
  ↓
MÉTRIQUES
  ↓
DASHBOARD
  ↓
CYCLE_SUIVANT
```

Le mode continu actuel respecte un intervalle minimum et s’arrête sur `SIGINT`. Les limites de nouvelles tentatives, les timeouts par tâche et l’arrêt d’urgence global restent des améliorations cibles ; ils ne sont pas simulés par le wrapper. Les détails sont dans [`QuantumMatrix.ps1`](QuantumMatrix.ps1).

## 10. Contrat API

Le contrat HTTP de référence est [`docs/api/openapi.yaml`](docs/api/openapi.yaml). Il décrit les routes déjà présentes et leurs limites :

- lectures publiques bornées ;
- mutations authentifiées avec CSRF ;
- webhooks signés ;
- vérification wallet sans transfert ;
- absence de payout automatique ;
- télémétrie et audit séparés.

## 11. Contrat de base de données

L’extension de schéma cible est [`database/schema.sql`](database/schema.sql). Elle couvre l’orchestration, l’inbox/outbox et le socle du paper trading ; elle n’est ni un schéma complet du runtime ni une migration appliquée automatiquement. Une migration versionnée doit :

1. être versionnée ;
2. préserver les données existantes ;
3. accepter les anciennes sauvegardes ;
4. distinguer les tables de lecture, d’audit et d’événements ;
5. ne jamais stocker de clé privée dans l’application.

## 12. Matrice des fonctions

[`FEATURE_MATRIX.csv`](FEATURE_MATRIX.csv) est la source de statut des fonctions. Une fonction n’est jamais « terminée » parce qu’elle apparaît dans cette table.

Statuts autorisés :

- `operational_local` ;
- `configurable` ;
- `scaffold` ;
- `planned` ;
- `paper_only` ;
- `blocked` ;
- `out_of_scope`.

## 13. Plan de production

### Phase 0 — Normalisation

- établir la source de vérité ;
- séparer réel, jeu, Web3 et simulation ;
- figer les contrats API ;
- documenter les modèles de données ;
- créer la matrice des fonctions.

### Phase 1 — Fondations

- frontend ;
- passerelle API ;
- PostgreSQL ;
- Redis si nécessaire ;
- authentification, sessions, RBAC et MFA ;
- audit et observabilité ;
- CI/CD et tests.

### Phase 2 — Revenus

- Stripe et Shopify ;
- ingestion signée ;
- idempotence ;
- registre ;
- réconciliation ;
- dashboard et exports.

### Phase 3 — Wallet

- connexion et challenge ;
- vérification de signature ;
- lecture du portefeuille ;
- intention de transaction ;
- revue humaine ;
- preuve de transaction uniquement après intégration approuvée.

### Phase 4 — Automatisation

- moteur de tâches ;
- workers ;
- file ;
- planificateur ;
- contrôles de santé ;
- sauvegardes chiffrées ;
- arrêt d’urgence global.

### Phase 5 — Trading

- données de marché en lecture seule ;
- paper trading ;
- moteur de risque ;
- masquage des secrets dans les tests ;
- audit ;
- aucune exécution réelle avant approbation.

### Phase 6 — Path of Melodie

- personnage ;
- combat ;
- loot ;
- Soul Core ;
- Guardians ;
- Karma ;
- Ascension ;
- monde ;
- fin de jeu ;
- télémétrie pseudonymisée.

### Phase 7 — Infrastructure

- Docker ;
- CI/CD ;
- Kubernetes lorsque le besoin est démontré ;
- surveillance ;
- sauvegarde et restauration ;
- reprise après incident.

## 14. Critères de qualité

Une fonction est complète seulement si elle possède :

- un propriétaire ;
- un contrat d’entrée et de sortie ;
- un comportement d’échec ;
- une autorisation ;
- un événement d’audit ;
- un test ;
- une stratégie de nouvelles tentatives ;
- une stratégie de retour arrière ;
- une documentation ;
- une vérification de sécurité ;
- un statut honnête dans la matrice.

## 15. Objectifs exclus

- pas de revenu garanti ;
- pas de signature invisible ;
- pas de clé privée sur le serveur ;
- pas de trading automatique non approuvé ;
- pas de smart contract signé automatiquement ;
- pas de conversion automatique Karma/MA ;
- pas de billions d’agents actifs ;
- pas de boucle infinie non bornée ;
- pas d’interface de fonction présentée comme opérationnelle lorsqu’elle n’est qu’une coquille.

## 16. Décisions de cette version

1. Le package `melodiespark/` est une cible de consolidation, pas un remplacement automatique des dépôts existants.
2. Le runtime Node.js actuel reste la référence de comportement.
3. Le dashboard actuel reste statique jusqu’à la décision de migration frontend.
4. Le jeu Godot reste séparé des services financiers.
5. `EconomyRuntime` contient un solde MA local inerte, mais aucune intégration MA externe ni conversion n’est activée.
6. Les Guardians sont des profils de tâches déterministes, pas des personnes ou agents autonomes.
7. Le trading réel est hors périmètre tant que les contrôles requis ne sont pas satisfaits.
8. Le lore est une couche narrative séparée du produit réel.

## 17. Procédure de changement

```text
Exigence
  ↓
Matrice des fonctions
  ↓
Modèle de domaine
  ↓
Contrat API
  ↓
Migration DB
  ↓
Implémentation
  ↓
Tests
  ↓
Documentation
  ↓
Déploiement
  ↓
Surveillance
```

Toute évolution doit mettre à jour les documents concernés et conserver l’état réel dans `FEATURE_MATRIX.csv`.

> **The Song continues.**
