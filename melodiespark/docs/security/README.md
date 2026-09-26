# Sécurité

## Règles non négociables

- pas de clé privée dans l’application ;
- pas de secret dans le frontend ;
- pas de signature invisible ;
- pas de payout automatique par défaut ;
- pas de signature automatique de smart contract ;
- CSRF sur les mutations ;
- limitation de débit ;
- audit append-only pour la cible ; le runtime local enregistre les événements mais n’impose pas cette propriété au niveau SQLite ;
- validation de webhook avant normalisation ;
- validation de chaîne, token, destination, montant et expiration pour le wallet ;
- tests des chemins d’échec pour chaque point d’entrée sensible.

## Secrets

Les références de secrets sont autorisées dans la configuration et la base. Les valeurs réelles restent dans un gestionnaire de secrets ou une variable d’environnement protégée.
