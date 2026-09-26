# Contrat de base de données

L’extension de schéma cible est [`schema.sql`](schema.sql). Elle est destinée à PostgreSQL 16+ et couvre l’orchestration, l’inbox/outbox et le socle du paper trading. Elle représente une direction de migration, pas un schéma complet ni une migration appliquée automatiquement.

## Règles

- ne stocker aucune clé privée, aucun secret fournisseur et aucun identifiant brut ;
- stocker uniquement le hash des jetons de session, de bail d’exécution ou de confirmation, jamais leur valeur ;
- utiliser des montants monétaires entiers ou numériques contrôlés ;
- rendre les événements externes idempotents ;
- séparer inbox, outbox, audit et télémétrie entre le schéma cible et le schéma de référence ;
- garder les actions financières et le trading dans des domaines séparés ;
- tester les migrations sur une base vide et sur une copie compatible ;
- prévoir les droits requis pour `CREATE EXTENSION pgcrypto` ;
- tester la restauration avant de déclarer la production.

## Relation avec le runtime actuel

Le runtime local utilise encore :

- `MelodiesparkCommandCenter/db/schema.sql` pour SQLite ;
- `MelodiesparkCommandCenter/db/postgresql.sql` comme référence PostgreSQL existante.

L’extension cible ne remplace pas ces fichiers. Elle doit être décomposée en migrations versionnées avant application.

## Validation du bootstrap

Au 2026-09-24, `schema.sql` a été validé sur PostgreSQL 16 :

- sur une base vide ;
- une seconde fois sur la même base pour vérifier son idempotence ;
- après `MelodiesparkCommandCenter/db/postgresql.sql`, puis une seconde fois.

Cette validation ne remplace pas une migration de mise à niveau ni un test sur une sauvegarde réelle.

## Écarts avec le runtime actuel

Au moment de l’audit, `MelodiesparkCommandCenter/db/schema.sql` contient les tables SQLite `executions` et `execution_transitions`, et la migration applicative `0.1.0 → 0.2.0` ajoute `execution_metrics`. `MelodiesparkCommandCenter/db/postgresql.sql` ne contient pas ces tables. Par ailleurs, la migration applicative ne recrée pas `executions` et `execution_transitions` pour une base 0.1 qui ne les contient pas encore. Ces deux écarts restent à corriger dans le runtime ; ils ne sont pas masqués par le bootstrap cible.
