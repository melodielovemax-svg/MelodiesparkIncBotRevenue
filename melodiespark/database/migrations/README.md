# Database migrations

Les migrations doivent être ordonnées, testées sur une base vide, réexécutées pour vérifier leur idempotence et testées sur une copie compatible. Le bootstrap `../schema.sql` n’est pas appliqué automatiquement et ne met pas à niveau un schéma arbitraire.
