# Ledger Specification

The ledger records evidence.

The ledger does not create revenue.

## Minimum Event

- event_id
- event_type
- occurred_at
- source_system
- external_reference
- asset
- amount
- currency
- debit_account
- credit_account
- authorization_reference
- reconciliation_status
- evidence_reference

## Rules

- append-only
- idempotent
- immutable event IDs
- compensating entries for corrections
- reconciliation against source systems
