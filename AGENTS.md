# Instructions pour les agents

Ce dépôt regroupe plusieurs artefacts Melodiespark. Lire ce fichier ne remplace pas les instructions spécifiques d’un dépôt ou d’un outil.

## 1. Frontière critique

- **Melodiespark INC** désigne le produit réel et ses systèmes techniques documentés.
- **_Melodiespark: The Long Song_** est l’univers fictif du jeu.
- Le lore peut guider le game design et l’évolution des données, mais ne décrit pas l’histoire, les opérations, les revenus, la sécurité ou les capacités réelles de Melodiespark INC.
- Ne jamais présenter une fonctionnalité fictive, une simulation ou une archive de jeu comme une fonctionnalité produit disponible.

## 2. Priorité des sources

### Pour le comportement technique

1. code existant ;
2. tests existants ;
3. architecture documentée ;
4. exigences produit approuvées ;
5. game design ;
6. lore.

### Pour la continuité narrative

1. `lore/LORE_CANON_RULES.md` ;
2. `lore/LORE_CANON.md` ;
3. les documents spécialisés dans `lore/` ;
4. le canon déjà présent dans le jeu ;
5. les propositions futures.

Les règles de priorité ne doivent pas servir à réécrire brutalement une architecture existante.

## 3. Règles de travail

- Inspecter les fichiers concernés avant de modifier quoi que ce soit.
- Préserver les tests, les contrats d’API, la persistance et les frontières de sécurité.
- Ajouter des exigences et des tests avant une extension de données importante.
- Ne pas renommer les raretés, les classes ou les saves sans migration et documentation.
- Ne pas ajouter de secrets, de données personnelles ou de promesses financières dans le lore.
- Les textes fictifs doivent distinguer clairement : fait réel, canon, proposition et mystère ouvert.
- Pour une contradiction, documenter la décision au lieu de modifier silencieusement le canon.

## 4. Documents d’entrée

- `PROJECT_CONTEXT.md` — vue d’ensemble et emplacements.
- `ARCHITECTURE.md` — frontières et responsabilités.
- `lore/README.md` — index du canon narratif.
- `lore/LORE_CANON_RULES.md` — règles de continuité.
- `lore/LORE_SYSTEM_MAPPING.md` — correspondance avec le code.
- `lore/LORE_OPEN_THREADS.md` — mystères à ne pas résoudre arbitrairement.
- `melodiespark/MASTER_SPEC.md` — spécification unifiée produit, automation, Web3 et jeu.
- `melodiespark/FEATURE_MATRIX.csv` — statut réel des fonctions.
- `melodiespark/QuantumMatrix.ps1` — wrapper d’orchestration borné.
- `apps/command-center/docs/CLI_EXTENSION.md` — documentation des extensions CLI.

## 5. Sécurité et honnêteté

- Ne jamais committer de secrets ou de données privées.
- Ne pas activer de transfert financier, de signature de transaction ou d'action automatique par défaut.
- Ne pas présenter une intégration comme live sans preuves et tests.
- Décrire clairement tout élément non implémenté, expérimental ou fictif.
