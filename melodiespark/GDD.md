# PATH OF MELODIE — DOCUMENT DE CONCEPTION DE JEU

- **Version :** 0.1.0
- **Statut :** GDD de consolidation
- **Genre cible :** ARPG dark fantasy en ligne
- **État actuel :** slice vertical Godot et fondations de progression
- **Source technique :** `MelodiesparkCommandCenter/game` et `PathOfMelodie_15Act_ARPG`

## 1. Vision

> **Créer une âme qui évolue avec les choix du joueur.**

Le monde de Path of Melodie est un monde de ruines, de mémoires, de gardiens et de transformations. Le joueur commence par survivre et se termine par la capacité de créer, transmettre ou réécrire un héritage.

Le lore de _The Long Song_ est la couche narrative. Il ne remplace pas le combat, les données, la persistance ou les tests.

## 2. Fantasy central

Le joueur est un Héritier qui :

- explore des fragments de civilisations ;
- combat des créatures et des gardiens ;
- récupère des objets qui ont une histoire ;
- transforme des compétences en styles de jeu ;
- développe un Soul Core ;
- choisit un Guardian et des factions ;
- construit une identité de build ;
- participe à la reconstruction ou à la transformation du monde.

## 3. Les cinq piliers

1. **Creation** — créer une forme nouvelle.
2. **Discovery** — découvrir un héritage.
3. **Transformation** — modifier plutôt que seulement consommer.
4. **Memory** — conserver et transmettre.
5. **Legacy** — laisser une trace aux générations futures.

## 4. Boucle principale

```text
COMBAT
  ↓
LOOT + XP
  ↓
SOUL CORE
  ↓
KARMA
  ↓
GUARDIAN ARC-ANGEL
  ↓
ASCENSION
  ↓
POWER POINTS
  ↓
REWARDS
  ↓
NOUVEAU BUILD
  ↺
```

Cette boucle est une intention de conception de jeu. Chaque maillon doit avoir une condition, un coût et une conséquence vérifiables.

## 5. Personnage

Le personnage possède potentiellement :

- un Soul Core ;
- une Melodie ;
- un Guardian ;
- du Karma ;
- une réputation ;
- une lignée d’Ascension ;
- des souvenirs ;
- des pouvoirs personnalisés.

L’état actuel du code ne garantit pas encore la persistance complète de chacun de ces éléments. Les ajouts doivent être versionnés.

## 6. Systèmes

### 6.1 Combat

```text
Skill
  → Hitbox
  → DamagePacket
  → Hurtbox3D
  → Armor / HP / Poise
  → Shatter
  → Death
  → Loot
```

`CombatShatteringCore` est un composant technique. Il ne faut pas inventer un état `Break` dans le code sans contrat et test.

### 6.2 Loot et objets

- LootRuntime génère les instances ;
- ItemInstance porte l’identité de jeu ;
- InventoryRuntime gère la possession ;
- EquipmentRuntime gère les emplacements ;
- BuildRuntime calcule l’identité opérationnelle.

La provenance du lore est une évolution future et ne doit pas modifier silencieusement les caractéristiques actuelles.

### 6.3 Soul Core

Le Soul Core possède cinq piliers dans le runtime :

- POWER ;
- SOUL ;
- MELODIE ;
- KARMA ;
- ASCENSION.

Ces piliers sont des systèmes de progression de jeu. Ils ne sont pas des actifs financiers.

### 6.4 Guardians

Les profils Guardian, Arc-Angel et Sub-Guardian sont des profils de tâches ou de progression. Ils ne sont pas des agents autonomes dans le produit réel.

### 6.5 Karma

Karma est un registre interne de progression et de réputation. Il est non transférable dans la version actuelle et ne possède pas de valeur monétaire.

### 6.6 Ascension

Les sept rangs de l’Ascension sont :

```text
Soulborn
  ↓
Awakened
  ↓
Guardian
  ↓
Seraph
  ↓
Arc-Angel
  ↓
Phoenix
  ↓
Phoenix Eternal
```

Les rangs sont une mécanique existante. Leur signification cosmique peut évoluer, mais leurs effets de gameplay ne doivent pas être supprimés ou renommés sans migration.

## 7. Monde principal

Le monde principal est **Maakaras**. Le catalogue de campagne contient quinze actes et sept libellés de région récurrents :

1. Aurelion ;
2. Nethervale ;
3. Elysara ;
4. Pyra ;
5. Nivalis ;
6. Varkaan ;
7. The Veil.

Les actes 14 et 15 utilisent en plus les libellés `All Realms` et `Maakaras Core` ; ce ne sont donc pas deux régions supplémentaires dans un catalogue fermé de sept. La campagne est exécutable sous forme procédurale, mais le slice vertical ne construit pas quinze scénarios distincts. Le placement de cette campagne dans la chronologie de _The Long Song_ est une proposition narrative, pas une migration du code.

## 8. Structure de campagne

1. Ashes of Aurelion ;
2. The Broken Guardian ;
3. Cathedral of Lost Souls ;
4. Pyra, Land of Fire ;
5. The Frozen Oath ;
6. The Corrupted Choir ;
7. The Seven Gates ;
8. War of the Arc-Angels ;
9. The Soul Sea ;
10. The Phoenix Prison ;
11. Return of the First Soul ;
12. The Maakaras Protocols ;
13. Paradise Reborn ;
14. The Last Ascension ;
15. Phoenix Eternal.

Les noms, boss, régions et thèmes sont repris du code et des documents existants. Toute évolution doit préserver la compatibilité de ces identifiants.

## 9. Économie du jeu

| Ressource | Usage | Valeur externe |
|---|---|---|
| Gold | commerce courant | aucune |
| Shards | artisanat et affixes | aucune |
| Soul Essence | Soul Core | aucune |
| Karma Points | progression communautaire | aucune |
| Power Points | Ascension | aucune |
| Items | équipement et inventaire | non définie |
| MA | solde local inerte, sans intégration externe | non activée |

Règle : aucune conversion automatique entre ces ressources. Une intégration MA future doit être spécifiée, revue et séparée du jeu.

## 10. Autorité en ligne

La version cible en ligne doit définir :

- un combat dont le serveur fait autorité ;
- un serveur de matchmaking ;
- la persistance ;
- l’anti-triche ;
- la validation des récompenses ;
- la limitation des événements ;
- le contrôle des bots ;
- une politique de reprise ;
- la gestion des comptes et de la vie privée.

Le client Godot actuel ne constitue pas encore un serveur de jeu en ligne faisant autorité.

## 11. Monde et fin de jeu

Le monde peut évoluer par :

- régions ;
- cycles ;
- factions ;
- reconstruction ;
- Resonance ;
- Gardens ;
- héritage transmis.

La véritable fin de jeu est la capacité de créer et de transmettre, pas seulement la destruction du boss le plus puissant. La résolution finale doit ouvrir une nouvelle variation au lieu de fermer toute continuité.

## 12. Contenu en ligne minimum

Avant de déclarer le jeu en ligne :

- compte et session persistante ;
- sauvegarde versionnée ;
- synchronisation de progression ;
- combat serveur ;
- loot serveur ;
- inventaire serveur ;
- événements idempotents ;
- télémétrie pseudonymisée ;
- modération et signalement ;
- retour arrière et récupération ;
- tests de charge et de reprise.

## 13. Sécurité et limites

- aucune promesse de gain financier dans le jeu ;
- aucune conversion Karma/MA automatique ;
- aucune signature wallet depuis une fonction de jeu non approuvée ;
- aucune collecte de clé privée ;
- les succès et récompenses sont des objets de jeu jusqu’à décision contraire ;
- les données de télémétrie sont limitées et documentées.

## 14. Priorités de développement

### P0 — Stabiliser la fondation

- garder les catalogues et runtimes existants ;
- tester le combat et le Shattering ;
- vérifier les sauvegardes ;
- documenter les contrats ;
- garder le jeu séparé des services financiers.

### P1 — Enrichir le jeu

- inventaire et inspection du loot ;
- provenance du lore progressive ;
- quêtes ;
- factions ;
- arc de compagnon Guardian ;
- état de Garden ;
- historique de build.

### P2 — Préparer le multijoueur

- serveur faisant autorité ;
- matchmaking ;
- persistance ;
- anti-triche ;
- observabilité ;
- reprise après incident.

### P3 — Étendre la continuité

- événements de résonance ;
- protocole de Garden ;
- héritage transmissible ;
- nouvelles civilisations ;
- nouvelles ères ;
- événements en ligne.

## 15. Définition de terminé pour une fonction de jeu

Une fonction est complète si elle possède :

- un objectif de joueur ;
- un contrat de données ;
- un comportement d’échec ;
- un test ;
- une compatibilité de sauvegarde ;
- un effet visible ;
- une conséquence narrative claire ;
- une limite de coût ou de puissance.

> **The Song continues.**
