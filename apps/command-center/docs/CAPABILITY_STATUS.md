# Capability status contract

This document applies the repository classification contract to the current
Command Center. A capability is `OPERATIONAL` only when the code path and
automated tests provide sufficient evidence. Vision and roadmap documents
cannot establish operational status by themselves.

The consolidated machine-readable register is
[`melodiespark/FEATURE_MATRIX.csv`](../../melodiespark/FEATURE_MATRIX.csv).
Its `status` column uses the same uppercase taxonomy as this document.

## Evidence priority

```text
code → tests → melodiespark/MASTER_SPEC.md → MELODIESPARK.txt → proposals/roadmap
```

The fictional game domain remains separate from Melodiespark INC operational
claims. Status values are intentionally uppercase and must be used unchanged:

`OPERATIONAL` · `SCAFFOLD` · `PLANNED` · `PAPER-ONLY` · `BLOCKED` ·
`FICTIONAL` · `UNVERIFIED`

## Current capability register

| Capability | Status | Code evidence | Test evidence | Limitation |
|---|---|---|---|---|
| Administrator authentication and sessions | `OPERATIONAL` | `src/server.mjs`, `src/security.mjs`, `src/db.mjs` | `tests/api.test.mjs`, `tests/security.test.mjs` | Local Command Center; production identity provider and MFA are not included. |
| CSRF, origin checks, rate limits, and security headers | `OPERATIONAL` | `src/server.mjs`, `src/security.mjs` | `tests/api.test.mjs` | In-process controls require production infrastructure review. |
| Durable execution lifecycle | `OPERATIONAL` | `src/orchestration/execution-service.mjs`, `src/db.mjs`, `db/schema.sql` | `tests/executions.test.mjs` | Delegates only to the existing bounded workflow engine. |
| Execution migration and recovery | `OPERATIONAL` | `src/migrations.mjs`, `src/db.mjs` | `tests/executions.test.mjs` | Recovery is SQLite/local; distributed deployment is not demonstrated. |
| Execution API and readiness endpoint | `OPERATIONAL` | `src/server.mjs` | `tests/executions.test.mjs`, `tests/api.test.mjs` | Authenticated local API; no external API gateway is implied. |
| Execution metrics and structured logs | `OPERATIONAL` | `src/orchestration/execution-service.mjs`, `src/db.mjs` | `tests/executions.test.mjs` | Basic counters and logs only; centralized observability is not implemented. |
| SQLite backup and restore validation | `OPERATIONAL` | `src/db.mjs`, `db/schema.sql` | `tests/executions.test.mjs` | Local file backup; encrypted off-site backup and disaster recovery remain future work. |
| Shopify and Stripe read adapters | `SCAFFOLD` | `src/integrations.mjs` | API and integration tests for configured paths | Provider configuration, HTTPS, credentials, and operational monitoring are required; no autonomous payout or publishing. |
| Wallet challenge and signature verification | `OPERATIONAL` | `src/wallet.mjs`, `src/server.mjs` | `tests/security.test.mjs`, `tests/api.test.mjs` | Non-custodial verification only. |
| Withdrawal authorization intent | `OPERATIONAL` | `src/server.mjs`, `src/security.mjs`, `src/db.mjs` | `tests/security.test.mjs`, `tests/executions.test.mjs` | Signing records authorization evidence; no transaction broadcast or funds transfer. |
| Automated payout or wallet transfer | `BLOCKED` | No transfer endpoint; `financialActionsEnabled: false` | Boundary assertions in API tests | Requires separate compliance, custody, approval, and provider controls. |
| Karma ledger | `OPERATIONAL` | `src/db.mjs`, `src/server.mjs` | `tests/api.test.mjs`, `tests/executions.test.mjs` | Internal, non-transferable, non-monetary metric. |
| Guardians registry and workflow assignment | `OPERATIONAL` | `src/catalog.mjs`, `src/workflows.mjs`, `src/db.mjs` | Workflow and dashboard tests | Profiles and recorded assignments are not autonomous agents. |
| Trading | `PAPER-ONLY` | No live order or exchange execution path | No live trading tests | Real trading is not implemented and must remain disabled. |
| Marketing automation | `PLANNED` | No provider execution module | No operational tests | Human/provider approval and separate policy controls are required. |
| Kubernetes and distributed event bus | `PLANNED` | Documentation/scaffolding only | No deployment tests | Not part of the current runtime. |
| Path of Melodie gameplay systems | `FICTIONAL` | Godot game code and GDD are separate from the business product | Game-specific tests/build checks only | Game mechanics and lore do not describe Melodiespark INC capabilities. |
| Unspecified capabilities from vision documents | `UNVERIFIED` | No sufficient repository evidence | No confirming tests | Must not be described as operational until evidence is added. |

## Required record for new capabilities

Every important new capability should add a row containing:

```text
CAPABILITY
Name:
STATUS:
EVIDENCE
  Code:
  Tests:
  Spec:
  Vision:
JUSTIFICATION:
LIMITATIONS:
```

`Vision` is optional context. `Code` and `Tests` are required for
`OPERATIONAL`. If evidence conflicts, the higher-priority source wins and the
conflict must be documented rather than silently resolved.
