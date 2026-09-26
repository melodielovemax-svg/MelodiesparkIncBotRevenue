# MELODIESPARK: THE LONG SONG — ARC DU JEU

- **Statut :** canon narratif et intégration de game design
- **Version :** 1.0.0
- **Documents liés :** `LORE_CANON.md`, `LORE_TIMELINE.md`, `LORE_SYSTEM_MAPPING.md`
- **Nature :** conception fictionnelle et intégration progressive

## 1. Principe

Le jeu commence comme un action RPG lisible : explorer, combattre, récupérer, améliorer et construire. La profondeur de l’histoire doit ensuite révéler que ces actions participent à une continuité plus vaste que la survie.

Le joueur ne reçoit pas toute la vérité au début. Il la découvre par des objets, des dialogues, des ruines, des contradictions, des gardiens, des skills et des choix.

## 2. Transformation du rôle du joueur

```text
UNKNOWN
   ↓
SURVIVOR
   ↓
EXPLORER
   ↓
HUNTER
   ↓
KEEPER
   ↓
BUILDER
   ↓
CREATOR
```

- **Survivor :** le personnage cherche à survivre dans un monde immédiat.
- **Explorer :** il accepte que le monde ne soit pas entièrement visible.
- **Hunter :** il traque des sources, des créatures et des fragments de mémoire.
- **Keeper :** il comprend que détruire une archive détruit aussi une possibilité.
- **Builder :** il combine les héritages plutôt que de les collectionner.
- **Creator :** il produit une nouvelle forme à laisser aux générations suivantes.

## 3. Les huit arcs

### Arc I — Awakening

- **Promesse :** le monde paraît relativement classique.
- **Gameplay :** déplacement, attaque de base, résistance, mort et récupération.
- **Révélation :** le joueur remarque des objets et des structures qui ne semblent pas appartenir à l’époque actuelle.
- **Question :** pourquoi tant de choses sont brisées ?

### Arc II — Fragments

- **Promesse :** chaque objet peut avoir une histoire.
- **Gameplay :** inventaire, équipement, butin, analyse comparative et premier Shattering.
- **Révélation :** certains objets ne sont pas seulement rares ; ils viennent de plusieurs époques.
- **Question :** qui a fabriqué ou utilisé ces objets ?

### Arc III — The Archives

- **Promesse :** les objets ouvrent des chemins de connaissance.
- **Gameplay :** compétences liées à la résonance et à la mémoire, quêtes de provenance, dialogue et inspection.
- **Révélation :** les Archivists ont voulu conserver une civilisation entière.
- **Question :** peut-on conserver quelque chose sans le changer ?

### Arc IV — The Fracture

- **Promesse :** le combat devient une forme de fouille contrôlée.
- **Gameplay :** `DamagePacket → Hurtbox3D → Poise → Shatter → Target death → LootRuntime`. `Break` reste un état narratif ou mécanique futur.
- **Révélation :** le Shattering Core expose des fragments de mémoire après la rupture.
- **Question :** une destruction peut-elle révéler quelque chose sans l’effacer ?

### Arc V — The Civilizations

- **Promesse :** plusieurs interprétations de l’histoire coexistent.
- **Gameplay :** factions, routes de dialogue, choix de coopérer ou non, gardiens, réactivation de bâtiments et systèmes de connaissance.
- **Révélation :** les fragments de la Fracture ne sont pas tous hostiles.
- **Question :** quelle civilisation a le droit de définir l’héritage ?

### Arc VI — The Choice

- **Promesse :** le joueur construit une philosophie, pas seulement un personnage.
- **Gameplay :** orientation de faction, routes de build, choix de transformations et gestion des conséquences.
- **Révélation :** les philosophies sont des outils puissants, mais elles ont chacune un coût.
- **Question :** que doit transmettre la prochaine génération ?

### Arc VII — The Garden

- **Promesse :** la survie cesse d’être le seul objectif.
- **Gameplay :** création, artisanat, jardins, musique, jeux, architecture, mondes partagés et gestion non violente de ressources.
- **Révélation :** les cités et les Gardens ne sont pas seulement des lieux ; ce sont des infrastructures de continuité.
- **Question :** peut-on construire un monde qui ne condamne pas les différences ?

### Arc VIII — The Long Song

- **Promesse :** la fin ouvre une nouvelle continuité, elle ne ferme pas l’histoire.
- **Gameplay :** confrontation finale, reconstruction d’un monde, transmission d’un héritage et création d’un premier nouvel cycle.
- **Révélation :** le joueur n’est pas le dernier ; il est l’un des auteurs de la suite.
- **Question :** quelle note la civilisation suivante ajoutera-t-elle ?

## 4. Intégration de la campagne de quinze actes

La campagne existante est conservée comme **canon d’intégration**. Son placement dans l’ère de Reconstruction est une proposition narrative, pas une réécriture du code.

| Actes | Cadre narratif proposé | Fonction de gameplay |
|---|---|---|
| 1–3 | Awakening et Fragments | survie, gardien, butin et premiers objets |
| 4–6 | premières reconstructions et civilisations | feu, glace, corruption, musique et routes de dialogue |
| 7–9 | Resonance, archives et Shattered Age | Resonance, Gardiens et mémoire exposée |
| 10–12 | Phoenix Prison, Maakaras Protocols et Fracture | ascension, protocoles et révélations sur les systèmes |
| 13–15 | Paradise Reborn, Last Ascension et Phoenix Eternal | reconstruction, choix et ouverture de la longue chanson |

Les noms, boss, régions et thèmes déjà présents dans `game/scripts/campaign/acts.gd` restent prioritaires pour la continuité du jeu. Ce tableau ne remplace pas cette liste.

## 5. Le compagnon Guardian

Le Guardian peut commencer comme une fonction de gameplay : il protège, applique une aura et apporte une aide limitée au joueur.

Son évolution narrative peut ensuite lui donner :

- une origine ;
- une mémoire propre ;
- une opinion sur la conservation ;
- une possibilité de transformation ;
- une histoire qui le place dans l’héritage du joueur.

Les profils Guardian et Arc-Angel déjà présents dans le runtime restent des mécanismes de jeu. Leur origine cosmique doit être ajoutée progressivement, sans réécrire d’un coup les profils existants.

## 6. Les objets

Chaque objet visible par le joueur peut avoir deux niveaux de lecture :

1. **Gameplay :** ce que l’objet permet de faire maintenant.
2. **Lore :** ce que l’objet a vécu et ce qu’il pourrait devenir.

Un objet n’a pas besoin d’être puissant pour être important. Un objet puissant peut être récent ; un objet humble peut être ancien.

Les objets doivent pouvoir ouvrir :

- une quête ;
- un dialogue ;
- une vision ;
- une zone ;
- une recette ;
- une branche de skill ;
- une question, sans réponse définitive.

## 7. Le Shattering

Le Shattering ne doit pas toujours être représenté comme une récompense gratuite. L’idéal est un système de pression avec des conséquences :

```text
Structure
  ↓
Dégâts de poise
  ↓
Fenêtre de shatter
  ↓
Break
  ↓
Butin ou fragment de mémoire
  ↓
Interprétation du joueur
```

Le joueur peut choisir de frapper pour obtenir une ressource, de préserver l’objet, de dialoguer avec l’entité ou de transformer la méthode de combat.

## 8. L’inventaire comme musée

L’inventaire doit commencer par être fonctionnel. Il peut ensuite devenir une collection de :

- objets dynamiques ;
- objets fonctionnels ;
- fragments de mémoire ;
- dons et reliques ;
- objets dont l’origine est incertaine.

Un objet rare ne doit pas être automatiquement détruit par le joueur. Les systèmes de conservation, de réparation, de don et de transmission devront évoluer avec le temps.

## 9. Économie et valeur

Un objet peut avoir plusieurs valeurs :

- **gameplay :** puissance et utilité ;
- **historique :** âge et importance ;
- **artistique :** forme et symbolisme ;
- **artisanale :** méthode de création ;
- **narrative :** histoire qu’il porte.

La puissance brute ne doit pas être le seul indicateur de valeur. Les effets de progression, la valeur d’échange et la valeur de transmission doivent être distincts.

## 10. Quêtes

Une quête peut :

- demander de récupérer un objet ;
- comparer deux versions d’une histoire ;
- réparer un protocole ;
- choisir une faction ;
- suivre une fréquence ;
- accompagner un survivant ;
- refuser de détruire une archive ;
- créer une nouvelle variation.

Les quêtes doivent conserver les conséquences des choix du joueur, mais ne doivent pas supposer que le joueur est le seul personnage important de l’histoire.

## 11. Le vrai endgame

Le vrai endgame n’est pas « tuer le boss final ». Il est de devenir capable de créer un héritage que l’on ne possède pas entièrement.

Le joueur peut :

- reconstruire un lieu ;
- transmettre une compétence ;
- enregistrer une mélodie ;
- libérer un fragment de mémoire ;
- modifier une archive avec consentement ;
- créer une Garden ;
- commencer une nouvelle civilisation ;
- laisser une question ouverte.

## 12. L’antagoniste de la Fixation

Le dernier antagoniste représente l’idée que toute transformation détruit quelque chose. Son identité précise reste ouverte.

> « Si rien ne change, rien ne peut être perdu. »

La réponse du joueur est :

> « Mais si rien ne change, rien ne peut être créé. »

La résolution ne doit pas être une simple exécution. Elle doit rendre visible le choix entre l’immobilité et la transformation, puis montrer les conséquences de ce choix.

## 13. Fin et continuité

Après la résolution :

- le monde ne disparaît pas ;
- le joueur ne perd pas ses acquis ;
- les objets ne deviennent pas tous des archives de données ;
- la Long Song reçoit une nouvelle variation ;
- une nouvelle variation du jeu peut partir de cet héritage.

Le générique est une invitation à transmettre, pas une preuve que l’héritage est terminé.

## 14. Règles de game design narratif

1. Le gameplay doit rester compréhensible sans connaître le lore.
2. Le lore doit enrichir le gameplay sans être obligatoire pour comprendre une boucle.
3. Les objets, skills et bâtiments doivent conserver leurs contraintes mécaniques.
4. Une révélation doit créer une nouvelle question, pas fermer tout l’univers.
5. Les personnages secondaires peuvent avoir des objectifs propres.
6. Le joueur peut refuser une interprétation extensive sans perdre l’accès au jeu.
7. Toute fonctionnalité narrative doit avoir un coût, une limite ou un risque.
8. L’héritage est plus important que la possession.

> **The Song continues.**
