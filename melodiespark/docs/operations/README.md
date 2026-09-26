# Opérations

Le package cible une exploitation locale d’abord, la préproduction ensuite, et une production financière uniquement après revue indépendante.

## Runbooks requis avant staging et production

- contrôle de santé ;
- démarrage et arrêt contrôlé ;
- synchronisation en lecture seule ;
- rotation des secrets ;
- sauvegarde chiffrée ;
- restauration testée ;
- incident webhook ;
- incident wallet ;
- désactivation d’un indicateur de fonctionnalité ;
- arrêt d’urgence global.

## Démarrage local

Utiliser le wrapper :

```powershell
.\QuantumMatrix.ps1 -Action Health
.\QuantumMatrix.ps1 -Action Cycle -Cycles 3
.\QuantumMatrix.ps1 -Action Continuous -IntervalSeconds 300
```

Le wrapper `Backup.ps1` ne copie que la base SQLite et produit un manifeste SHA-256. Il ne copie pas `.env`, les secrets ou les clés privées. Pour une base ouverte et écrite en continu, utiliser l’API de sauvegarde SQLite ou arrêter le service. Le wrapper `Deploy.ps1` ne déploie rien à distance : il refuse staging et production sans approbation et ne remplace pas une pipeline CI/CD revue.
