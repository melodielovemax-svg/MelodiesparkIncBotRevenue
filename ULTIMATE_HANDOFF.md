# ULTIMATE HANDOFF — Melodiespark: The Long Song

## État

- **Canon narratif :** version 1.0.0
- **Type de changement :** documentation et scaffolding de migration
- **Runtime existant :** non réécrit par ce package
- **Tests :** 15 tests du Command Center réussis ; les futurs changements doivent rester testés selon leur dépôt.

## Principe

> Tout ce qui est créé peut devenir un héritage. Tout héritage peut devenir le commencement d’une nouvelle création.

Melodiespark INC est le produit réel. _The Long Song_ est l’univers fictif du jeu. Le produit peut s’inspirer du canon sans présenter la fiction comme une histoire ou une capacité réelle de Melodiespark INC.

## Points d’entrée

1. [`AGENTS.md`](AGENTS.md) — règles pour les agents.
2. [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) — vue d’ensemble du workspace.
3. [`ARCHITECTURE.md`](ARCHITECTURE.md) — frontières produit/fiction et pipelines.
4. [`lore/README.md`](lore/README.md) — index du canon.
5. [`lore/LORE_CANON.md`](lore/LORE_CANON.md) — canon fondateur.
6. [`lore/LORE_SYSTEM_MAPPING.md`](lore/LORE_SYSTEM_MAPPING.md) — correspondance avec le code réel.
7. [`lore/LORE_CANON_RULES.md`](lore/LORE_CANON_RULES.md) — règles de gouvernance.
8. [`lore/LORE_OPEN_THREADS.md`](lore/LORE_OPEN_THREADS.md) — mystères ouverts.

## Package de consolidation

- [`melodiespark/README.md`](melodiespark/README.md) — index du package.
- [`melodiespark/MASTER_SPEC.md`](melodiespark/MASTER_SPEC.md) — spécification maître.
- [`melodiespark/ARCHITECTURE.md`](melodiespark/ARCHITECTURE.md) — architecture cible.
- [`melodiespark/GDD.md`](melodiespark/GDD.md) — GDD Path of Melodie.
- [`melodiespark/FEATURE_MATRIX.csv`](melodiespark/FEATURE_MATRIX.csv) — statuts des fonctions.
- [`melodiespark/QuantumMatrix.ps1`](melodiespark/QuantumMatrix.ps1) — wrapper PowerShell.
- [`melodiespark/docs/api/openapi.yaml`](melodiespark/docs/api/openapi.yaml) — contrat API.
- [`melodiespark/database/schema.sql`](melodiespark/database/schema.sql) — schéma DB cible.

Le fichier physique `MELODIESPARK.txt` n’était pas présent dans le workspace ; le snapshot fourni dans la conversation a servi de source narrative. Le code existant a été utilisé pour vérifier les affirmations techniques.

## Décisions importantes

- Le code existant et ses tests restent la référence technique.
- La sauvegarde locale du jeu est actuellement en version 4.
- `ItemInstance` possède actuellement `id`, `definition_id`, `name`, `rarity`, `affixes` et `legendary_effect`.
- Les champs de provenance lore ne sont pas encore implémentés.
- La boucle de combat documentée est `DamagePacket → Hurtbox3D → Poise → Shatter → Mort → Loot` ; `Break` reste une évolution future.
- Les quinze actes, Phoenix, Guardian, Arc-Angel et Maakaras sont conservés comme canon d’intégration, mais leurs origines cosmiques restent ouvertes.
- Les mystères listés dans `LORE_OPEN_THREADS.md` ne doivent pas être résolus arbitrairement.

## Suite recommandée

1. Valider l’arc des quinze actes et son placement dans la Reconstruction.
2. Définir des identifiants stables pour les ères, civilisations et provenance.
3. Rédiger les exigences d’une extension lore de `ItemInstance`.
4. Concevoir une migration de sauvegarde compatible avec la version 4.
5. Tester le nouveau contrat avant d’exposer une histoire dans l’interface.

> **The Song continues.**
