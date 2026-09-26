# MelodieCLI Enterprise Real-Only Template

## Governing Principle

Evidence determines status; sophistication does not.

## Real Business

The following statuses are permitted:

- OPERATIONAL
- SCAFFOLD
- PLANNED
- PAPER-ONLY
- BLOCKED
- UNVERIFIED

## Fiction

Narrative and worldbuilding are explicitly:

- FICTIONAL

Fiction cannot establish:

- customers
- revenue
- transactions
- market demand
- partnerships
- blockchain activity
- legal authorization
- production readiness

## No Synthetic Business Evidence

The system must never present generated or seeded data as real:

- customers
- orders
- revenue
- balances
- transactions
- transaction hashes
- receipts
- reviews
- market demand

Test fixtures may exist only inside explicitly identified test environments.

## Web3 Evidence

A wallet UI is not evidence of a wallet balance.

A transaction button is not evidence of a transaction.

A transaction becomes externally verifiable only after the relevant lifecycle has occurred:

prepare
→ estimate
→ simulate
→ authorize
→ broadcast
→ receipt
→ confirmation
→ reconciliation

## Revenue Evidence

Revenue requires an actual external transaction and corresponding provider/accounting evidence.

## Bot Scaling

A worker target such as 80,000 represents logical workload capacity.

It does not mean spawning 80,000 uncontrolled operating-system processes.

## Security

Never place the following in source code:

- seed phrases
- private keys
- API secrets
- payment credentials
- authentication tokens
