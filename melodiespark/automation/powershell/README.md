# Automatisation PowerShell

Les wrappers contrôlés sont :

- `QuantumMatrix.ps1` — orchestration et état ;
- `Setup.ps1` — initialisation locale ;
- `Start.ps1` — démarrage du Command Center ;
- `Stop.ps1` — arrêt d’un serveur Node vérifié ;
- `Health.ps1` — cycles de validation ;
- `Backup.ps1` — copie locale de la base SQLite avec manifeste SHA-256 ;
- `Deploy.ps1` — validation locale uniquement ; aucun déploiement distant implicite.

## Garde-fous

- PowerShell 7 et Node.js 22.5 ou plus récent sont vérifiés lorsque Node est requis ;
- les actions à effet de bord honorent `-WhatIf` et `-Confirm` ;
- l’arrêt refuse tout PID qui n’est pas exactement un processus `node.exe` lancé sur le `src/server.mjs` de la racine indiquée ;
- la racine et les chemins sont traités comme des littéraux ;
- le mode continu est interrompu par `SIGINT` et conserve un intervalle minimal de 30 secondes ;
- `Backup.ps1` ne copie pas `.env`, les secrets ou les clés privées ;
- `Deploy.ps1` refuse un déploiement staging ou production sans approbation et ne constitue pas un pipeline CI/CD.

Le runner Node ne fournit pas encore de timeout par tâche, de limite de nouvelles tentatives ni d’arrêt d’urgence global.