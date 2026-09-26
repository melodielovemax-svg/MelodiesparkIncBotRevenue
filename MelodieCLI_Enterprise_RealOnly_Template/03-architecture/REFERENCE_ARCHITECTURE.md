# Reference Architecture

## Control Plane

- identity
- RBAC
- policy
- approvals
- configuration
- audit

## Execution Plane

- queues
- bounded workers
- idempotency
- retries
- dead-letter handling

## Commerce Plane

- catalog
- checkout
- payment providers
- orders
- refunds
- reconciliation

## Web3 Plane

- wallet adapters
- chain adapters
- transaction preparation
- gas estimation
- simulation
- authorization
- broadcast
- receipt verification

## Accounting Plane

- append-only ledger
- reconciliation
- evidence references

## Observability Plane

- logs
- metrics
- traces
- alerts

## Security Plane

- secret management
- least privilege
- network controls
- backups
- incident response

## Financial Safety

Irreversible financial actions require authorization.

Bots may prepare transactions.

Policies determine whether transactions may execute.
