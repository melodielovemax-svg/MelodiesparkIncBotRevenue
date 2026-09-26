# Arborescence cible

Cette arborescence décrit la cible de migration. Certains répertoires de services et d’infrastructure n’existent pas encore ; ils ne doivent pas être interprétés comme des implémentations. Les implémentations existantes restent dans leurs dépôts actuels jusqu’à l’approbation d’une migration composant par composant.

```text
melodiespark/
├── apps/
│   ├── web/
│   └── game/
├── services/
│   ├── api/
│   ├── auth/
│   ├── revenue/
│   ├── commerce/
│   ├── trading/
│   ├── wallet/
│   ├── blockchain/
│   ├── karma/
│   ├── guardian/
│   ├── analytics/
│   ├── notification/
│   └── compliance/
├── workers/
│   ├── revenue-worker/
│   ├── sync-worker/
│   ├── analytics-worker/
│   ├── guardian-worker/
│   └── notification-worker/
├── automation/
│   └── powershell/
│       ├── QuantumMatrix.ps1
│       ├── Setup.ps1
│       ├── Start.ps1
│       ├── Stop.ps1
│       ├── Health.ps1
│       ├── Backup.ps1
│       └── Deploy.ps1
├── packages/
│   ├── types/
│   ├── config/
│   ├── database/
│   ├── logging/
│   ├── security/
│   ├── blockchain/
│   └── ui/
├── infrastructure/
│   ├── docker/
│   ├── kubernetes/
│   ├── helm/
│   ├── nginx/
│   └── terraform/
├── database/
│   ├── schema.sql
│   ├── migrations/
│   ├── seeds/
│   └── schemas/
├── docs/
│   ├── IMPLEMENTATION_STATUS.md
│   ├── architecture/
│   ├── api/
│   ├── security/
│   ├── compliance/
│   ├── operations/
│   └── gdd/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── security/
├── MASTER_SPEC.md
├── ARCHITECTURE.md
├── GDD.md
├── FEATURE_MATRIX.csv
├── QuantumMatrix.ps1
└── README.md
```
