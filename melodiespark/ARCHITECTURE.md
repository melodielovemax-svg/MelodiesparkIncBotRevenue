# MELODIESPARK — ARCHITECTURE UNIFIÉE

- **Version :** 0.1.0
- **Statut :** architecture cible et état vérifié
- **Runtime actuel :** `MelodiesparkCommandCenter` Node.js + SQLite local
- **Cible de migration :** services séparés, PostgreSQL, Redis et infrastructure déclarative

> La structure de services ci-dessous est une cible de production. Le code actuel est un monolithe Node.js fonctionnel et doit être découpé progressivement, sans réécriture totale de type « big bang ».

## 1. Vue d’ensemble

```text
                         MELODIESPARK INC
                                │
                ┌───────────────┴───────────────┐
                │                               │
           PLATEFORME MÉTIER               PATH OF MELODIE
                │                               │
      ┌─────────┼─────────┐           ┌─────────┼─────────┐
      │         │         │           │         │         │
    REVENUS  COMMERCE  ANALYTIQUE    COMBAT    ÂME      BUTIN
      │         │         │           │       CORE       │
      └─────────┼─────────┘            │         │         │
                │                     GUARDIANS KARMA ASCENSION
                │
               WALLET
                │
           COUCHE WEB3
                │
          SIGNATURE UTILISATEUR + AUDIT

        NOYAU D’AUTOMATISATION
        tâches bornées, workers, santé et preuves
```

## 2. Couches

### 2.1 Présentation

- dashboard web ;
- interfaces Revenus, Wallet, Guardians, Karma, Santé du système et Administration ;
- rendu des statuts et des preuves ;
- aucune autorité de paiement, de trading ou de signature.

### 2.2 Passerelle API

- validation des entrées ;
- routage ;
- authentification et sessions ;
- CSRF ;
- limites de débit ;
- identifiants de requête ;
- en-têtes de sécurité ;
- frontière entre le frontend et les services.

### 2.3 Services de domaine

Chaque service possède :

- un modèle de domaine ;
- des cas d’usage ;
- des ports d’intégration ;
- des règles d’autorisation ;
- des événements ;
- des tests.

### 2.4 Données

- SQLite pour le local ;
- PostgreSQL pour le déploiement géré ;
- Redis pour le cache et la file seulement si le besoin est mesuré ;
- stockage objet pour les pièces justificatives ;
- sauvegardes chiffrées ;
- audit append-only ou dépôt d’audit séparé.

### 2.5 Adaptateurs d’intégration

Les intégrations externes sont côté serveur et bornées :

- Shopify ;
- Stripe ;
- référence de prix publique ;
- RPC Ethereum en lecture seule ;
- fournisseurs futurs de marché sous revue.

Les secrets restent dans un gestionnaire de secrets et ne sont jamais envoyés au frontend.

### 2.6 Moteur de tâches

Le moteur reçoit des définitions de tâches versionnées. Il :

- valide les entrées ;
- planifie les dépendances ;
- acquiert un bail d’exécution ;
- exécute avec timeout ;
- capture le résultat ;
- applique une politique de nouvelles tentatives ;
- publie un événement ;
- met à jour l’audit et les métriques.

### 2.7 Frontière Web3

La signature EIP-191 prouve le contrôle d’une adresse ou approuve un message canonique. Elle ne constitue pas automatiquement une transaction on-chain.

## 3. Frontières de confiance

```text
Navigateur / client de jeu
        │ entrée non fiable
        ▼
Passerelle + authentification + CSRF
        │
        ├── Domaine produit / revenus
        ├── Domaine d’autorisation wallet
        ├── Domaine de télémétrie du jeu
        └── Domaine d’orchestration des tâches
                 │
                 ▼
       Base de données / file / adaptateurs
                 │
                 ▼
          Audit et métriques
```

Règles :

- le client ne décide pas des rôles ;
- le client ne décide pas du prix final ;
- le client ne reçoit pas de clé privée ;
- le client ne reçoit aucun accès au gestionnaire de secrets ;
- le worker ne reçoit pas les secrets inutiles ;
- la lecture blockchain ne déclenche pas de transaction.

## 4. Profils de déploiement

### Profil local

- Node.js 22.5+ ;
- SQLite ;
- dashboard statique ;
- flux de travail bornés ;
- Guardians déterministes ;
- wallet en lecture seule ou intention signée selon la configuration ;
- pas de Kubernetes ;
- pas de Redis obligatoire.

### Profil de préproduction

- PostgreSQL géré ;
- HTTPS ;
- migrations contrôlées ;
- worker et planificateur séparés ;
- observabilité centralisée ;
- gestionnaire de secrets ;
- webhooks et intégrations sandbox ;
- tests de restauration.

### Profil production financier

Ce profil n’est pas activé par défaut. Il nécessite une revue séparée pour :

- identité et MFA ;
- conformité et sanctions ;
- KYC/AML si applicable ;
- limites et moteur de risque ;
- revue humaine ;
- réconciliation ;
- un service de conservation ou un fournisseur explicitement autorisé ;
- audit indépendant ;
- réponse aux incidents.

## 5. Flux de données principal

```text
Action utilisateur
  → Validation par la passerelle
  → Authentification et autorisation
  → Commande de domaine
  → Transaction de base de données
  → Événement outbox
  → Worker
  → Lecture par adaptateur / action bornée
  → Preuve
  → Audit
  → Métriques et dashboard
```

Les webhooks suivent le chemin :

```text
Événement fournisseur
  → Capture du corps brut
  → Vérification de la signature
  → Contrôle de rejeu et d’idempotence
  → Normalisation
  → Preuve et registre
  → Audit
```

## 6. Cycle de tâches

```text
DÉMARRAGE
  ↓
CONTRÔLE DE SANTÉ
  ↓
FILE DE TÂCHES
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
CYCLE SUIVANT
```

Un cycle ne doit pas :

- dépasser son timeout global ;
- lancer une action financière non approuvée ;
- réessayer indéfiniment ;
- masquer une erreur ;
- écrire un secret dans les journaux ;
- continuer sans signal d’arrêt.

Le runtime local contient en plus un scaffold `/api/v1/executions` qui persiste un état et déclenche le workflow sûr à partir d’une intention de retrait signée. Malgré le nom `execution`, il ne construit ni ne diffuse aucune transaction et ne déplace aucun fonds. Son annulation ne constitue pas un arrêt physique du runner. Son statut reste `scaffold` tant que la migration 0.1→0.2 et la parité PostgreSQL ne sont pas corrigées.

## 7. Guardians

Les profils de 600 Guardians sont une matrice de configuration déterministe. Ils ne sont pas :

- des personnes ;
- des employés ;
- des comptes bancaires ;
- des agents autonomes ;
- des sources de revenu.

Un profil Guardian est opérationnel lorsqu’il reçoit une tâche concrète, respecte ses contrôles d’autorisation, produit un résultat mesurable et l’enregistre dans le cycle d’audit.

## 8. Frontière de trading

Le premier périmètre est :

```text
données de marché
  → portefeuille de simulation
  → évaluation de la stratégie
  → décision de risque
  → ordre de simulation
  → audit
```

L’adaptateur de change et l’exécution réelle restent `out_of_scope` pour v0.1. Une extension future exige l’approbation des éléments suivants :

- un fournisseur explicitement approuvé ;
- des identifiants qui ne sont jamais exposés au frontend ;
- une stratégie versionnée ;
- un moteur de risque testé ;
- une autorisation humaine ;
- une journalisation complète ;
- une revue juridique et de conformité.

## 9. Frontières de persistance

- Tables opérationnelles : consultation et mutation contrôlée.
- Registre : append-only ou contraintes d’idempotence.
- Audit : append-only, accès restreint.
- Télémétrie : pseudonymisée et limitée.
- Secrets : références uniquement.
- Webhooks bruts : validation avant stockage.
- Sauvegardes de jeu : versionnées indépendamment des enregistrements financiers.

## 10. Stratégie de migration

1. Geler les contrats API existants.
2. Ajouter des identifiants de corrélation et des événements de domaine.
3. Extraire les services par domaine sans changer les routes publiques.
4. Introduire PostgreSQL derrière une frontière de dépôt.
5. Ajouter Redis uniquement pour un besoin mesuré.
6. Ajouter les workers et la file.
7. Ajouter l’observabilité et les sauvegardes.
8. Introduire le frontend cible.
9. Faire une phase paper-only pour le trading.
10. Ne jamais faire de basculement big bang.

## 11. Contrats

- API : [`docs/api/openapi.yaml`](docs/api/openapi.yaml) ;
- DB : [`database/schema.sql`](database/schema.sql) ;
- gameplay : [`GDD.md`](GDD.md) ;
- statuts : [`FEATURE_MATRIX.csv`](FEATURE_MATRIX.csv) ;
- opérations : [`docs/operations/README.md`](docs/operations/README.md).

> **The Song continues.**
