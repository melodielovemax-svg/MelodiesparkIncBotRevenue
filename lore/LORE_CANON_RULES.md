# MELODIESPARK: THE LONG SONG — RÈGLES DU CANON

- **Statut :** règles de gouvernance narrative
- **Version :** 1.0.0
- **Document maître :** `LORE_CANON.md`
- **Portée :** développement du lore, game design et intégration des agents

## 1. Principe de gouvernance

Le canon protège la continuité, pas l’immobilité. Une règle doit permettre d’ajouter une création sans rendre les anciens héritages illisibles.

```text
Canon
  ↓
Jeu
  ↓
Actions du joueur
  ↓
Nouvelles découvertes
  ↓
Nouvelles histoires
  ↓
Nouveau canon
  ↺
```

## 2. Règles fondamentales

### Rule 001 — Reality Boundary

Aucun élément fictif ne doit être présenté comme un fait réel concernant Melodiespark INC, ses produits, ses équipes, ses utilisateurs ou ses opérations.

### Rule 002 — Code First

Une fonctionnalité existante ne doit pas être cassée uniquement pour satisfaire le lore. Le code et les tests restent la référence de comportement.

### Rule 003 — Documentation Before Contradiction

Une nouvelle histoire ne doit pas contredire un élément canonique sans documenter la contradiction, sa raison et sa zone d’impact.

### Rule 004 — Mystery Preservation

Tout ne doit pas être expliqué. Certains mystères doivent rester ouverts pour permettre des extensions, des DLC, des quêtes et des chapitres futurs.

### Rule 005 — Multiple Perspectives

Une civilisation peut avoir une interprétation différente d’un événement. Une archive peut être authentique et biaisée en même temps.

### Rule 006 — Legacy

Toute grande création peut devenir un héritage. La valeur d’un objet ou d’une connaissance peut dépasser sa puissance actuelle.

### Rule 007 — Creation

Tout héritage peut devenir le commencement d’une nouvelle création. La conservation n’est pas une fin.

### Rule 008 — No Automatic Antagonism

Les factions, civilisations et créatures ne sont pas classées comme bonnes ou mauvaises par leur seule existence. Un conflit doit avoir des objectifs, des méthodes et des coûts.

### Rule 009 — Player Agency

Le joueur peut influencer l’héritage sans être le seul auteur de l’histoire. Les personnages secondaires, les Gardiens et les civilisations doivent conserver leur propre volonté.

### Rule 010 — No Lore-Led Technical Rewrite

Une extension narrative ne doit pas modifier le runtime sans exigence, architecture, tests, persistance et documentation technique.

### Rule 011 — Progressive Disclosure

Le joueur ne doit pas recevoir toute la chronologie d’un coup. Une révélation doit créer une nouvelle question ou une nouvelle interprétation.

### Rule 012 — Provenance Uncertainty

Une origine, un âge, un créateur ou une signification peut être inconnu, contesté ou non confirmé. Le jeu ne doit pas fabriquer une certitude pour remplir un champ.

### Rule 013 — Technical Honesty

Un élément non implémenté doit être décrit comme planifié, proposé ou non disponible. Une simulation ne doit pas être présentée comme un service réel.

### Rule 014 — Product Boundary

Le Command Center et le jeu restent des produits distincts. Le lore peut les relater thématiquement, mais ne doit pas mélanger une route API, une compétence de jeu et une promesse financière.

### Rule 015 — Safety Before Fiction

La fiction ne justifie ni une action financière automatique, ni une garde de clé privée, ni une promesse de rendement, ni une suppression de contrôle humain.

### Rule 016 — Inheritance Can Change

Un héritage doit pouvoir être transmis, réinterprété et transformé. La continuité ne signifie pas que l’original doit rester figé.

### Rule 017 — Cost of Creation

Créer, transmettre ou modifier doit avoir un coût, une limite ou une conséquence. Cela évite qu’une création devienne une solution universelle.

### Rule 018 — Mystery and Mechanics Coexist

Un objet, une skill ou une créature peut fonctionner mécaniquement même si son origine reste inconnue. Le gameplay ne doit pas dépendre d’une réponse narrative immédiate.

### Rule 019 — Naming Stability

Les noms déjà visibles dans le jeu, les catalogues et les actes sont conservés. Toute proposition de renommage exige une décision documentée et une stratégie de compatibilité.

### Rule 020 — Revision Is Not Erasure

Une correction de canon ne doit pas effacer silencieusement les anciennes interprétations. Les changements importants doivent être tracés dans une section de révision.

## 3. Priorité en cas de conflit

### 3.1 Conflit technique

```text
Code existant
  ↓
Tests existants
  ↓
Architecture
  ↓
Exigences produit
  ↓
Game design
  ↓
Lore
```

Le code existant n’est pas nécessairement correct, mais il ne doit pas être cassé silencieusement. Une évolution passe par une décision technique.

### 3.2 Conflit narratif

```text
LORE_CANON_RULES.md
  ↓
LORE_CANON.md
  ↓
LORE_SYSTEM_MAPPING.md
  ↓
LORE_CIVILIZATIONS.md
  ↓
LORE_FACTIONS.md
  ↓
LORE_GAME_ARC.md
  ↓
Propositions
```

Les mystères ouverts ne sont pas des erreurs à corriger immédiatement.

### 3.3 Conflit réalité/fiction

La réalité produit prévaut sur la fiction. Un document technique vérifié ne doit jamais être corrigé pour rendre le lore plus cohérent.

## 4. Ajouter une fonctionnalité lore

Une proposition doit répondre à ces questions :

1. Qu’est-ce que cela crée ?
2. Qu’est-ce que cela préserve ?
3. Qu’est-ce que cela transforme ?
4. Qu’est-ce que cela transmet ?
5. Quelle contrainte empêche la fonctionnalité de résoudre tous les problèmes ?
6. Quel système technique existant est concerné ?
7. Quel test vérifiera la compatibilité ?

Si une fonctionnalité ne répond à aucune question, elle peut rester une idée de gameplay, mais elle n’est pas automatiquement canonique.

## 5. Ajouter un objet

- donner une identité de gameplay claire ;
- laisser la provenance inconnue si nécessaire ;
- distinguer valeur de gameplay et valeur historique ;
- prévoir une histoire qui peut être incomplète ;
- ne pas utiliser la puissance comme preuve d’ancienneté ;
- vérifier la compatibilité de sauvegarde avant de modifier `ItemInstance`.

## 6. Ajouter une faction

- définir une philosophie, pas seulement une couleur ;
- donner un objectif, une méthode et un coût ;
- préciser une origine historique ;
- créer au moins un désaccord interne ;
- éviter un alignement simple bien/mal ;
- relier la faction à une expérience de jeu seulement si elle affecte une décision.

## 7. Ajouter une civilisation

- choisir une époque et une place dans la chronologie ;
- définir sa manière de créer, transmettre et échouer ;
- préciser ses technologies, son architecture, sa musique et ses ruines ;
- prévoir une transformation ou une disparition ;
- laisser au moins un mystère ;
- vérifier que la civilisation ne sert pas uniquement de boss ou de décor.

## 8. Ajouter un mystère

Le mystère doit être :

- précis ;
- relié à un élément déjà canonique ;
- assez ouvert pour permettre plusieurs réponses ;
- protégé contre une réponse arbitraire trop précoce ;
- relié à une conséquence future possible.

## 9. Workflow des agents

```text
Exigence
  ↓
Architecture
  ↓
Contrat de données
  ↓
Implémentation
  ↓
Test
  ↓
Documentation
  ↓
Intégration du lore
  ↓
Revue
```

Un agent ne doit pas modifier le code simplement parce qu’une possibilité lore a été trouvée. Il doit d’abord documenter l’exigence et son impact.

## 10. Checklist de publication

- [ ] La frontière réalité/fiction est respectée.
- [ ] Le comportement existant est préservé ou est explicitement versionné.
- [ ] Les tests sont identifiés.
- [ ] La persistance est prévue.
- [ ] Les objets et les noms utilisent des identifiants stables.
- [ ] Les mystères existants ne sont pas résolus sans raison.
- [ ] Les conséquences gameplay et narratives sont séparées.
- [ ] Les données personnelles et les secrets sont exclus.
- [ ] Le document concerné a été mis à jour.
- [ ] La décision est réversible ou documentée.

> **The Song continues.**
