# État d’implémentation

Ce document distingue la cible consolidée de l’implémentation vérifiée dans `MelodiesparkCommandCenter` au 2026-09-24.

| Domaine | État actuel | État cible |
|---|---|---|
| Command Center | Monolithe Node.js avec SQLite local | Extraction de services sans modifier les contrats publics |
| Interface web | Dashboard statique | Application Next.js ou équivalente |
| Base de données | SQLite local et schéma PostgreSQL de référence | Migrations PostgreSQL et sauvegardes testées par restauration |
| Moteur de tâches | Cinq contrôles locaux et scaffold d’exécutions non financières ; tests verts, mais migration 0.1→0.2 et PostgreSQL non alignés | Définitions versionnées, file, workers et reprise fiable |
| Guardians | 600 profils déterministes | Affectation contrôlée à des tâches mesurables |
| Revenus | Adaptateurs de lecture, registre et webhooks signés | Réconciliation fournisseurs et exports audités |
| Wallet | Vérification EIP-191 et intentions signées | Prestataire de payout revu, uniquement après approbation explicite |
| Trading | Aucun compte, ordre ou moteur de risque ; prix de référence seul | Paper trading d’abord ; exécution réelle hors périmètre |
| Jeu | Slice vertical Godot avec progression procédurale | Fondations d’un jeu en ligne faisant autorité, plus tard |
| Infrastructure | Scripts locaux, sauvegarde SQLite avec manifeste SHA-256 et Docker Compose | CI/CD et infrastructure cloud selon un besoin mesuré |
| Lore | Documentation du canon | Intégration progressive des données sans réécriture du runtime |
