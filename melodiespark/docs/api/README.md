# API contract

Le contrat OpenAPI de référence est [`openapi.yaml`](openapi.yaml).

## Règles

- Les mutations authentifiées requièrent une session et `X-CSRF-Token`.
- Les webhooks sont désactivés par défaut et doivent être signés.
- Les challenges wallet expirent et sont à usage unique.
- Une signature de retrait crée une intention ; elle ne diffuse pas de transaction.
- `/api/v1/executions` est un scaffold local qui lance seulement le workflow de validation sûr ; malgré son nom, il ne représente pas une transaction.
- Les réponses d’erreur ne doivent jamais inclure de secret, de corps brut sensible ou de signature complète dans les journaux.
- Les points d’entrée de trading, de payout et de smart contract ne sont pas inclus comme capacités actives.

## Évolution

Toute route nouvelle doit avoir :

- un propriétaire ;
- un contrat d’entrée et de sortie ;
- une politique d’autorisation ;
- une stratégie d’idempotence ;
- un test d’erreur ;
- un événement d’audit ;
- une politique de limitation de débit ;
- un statut dans `FEATURE_MATRIX.csv`.
