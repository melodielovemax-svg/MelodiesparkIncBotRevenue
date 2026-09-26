# Architecture and trust boundaries

## Layers

1. **Presentation** — accessible static dashboard. It can display records and request user actions; it has no custody or payout authority.
2. **Application API** — validates sessions, CSRF, input sizes, wallet signatures, integration responses, and workflow boundaries.
3. **Data** — SQLite for local operation; PostgreSQL schema is provided for a managed deployment. Revenue is stored as integer minor units with a currency code.
4. **Integration adapters** — fixed-host server-side calls for Shopify, Stripe, CoinGecko reference prices, and an optional Ethereum RPC. Secrets remain server-side.
5. **Wallet boundary** — EIP-191 challenge verification and expiring canonical authorization messages. No private keys are accepted.
6. **Governance** — product drafts, manual review states, audit events, and feature gates.

## Data flow

```text
Provider event or local user action
  → validate origin/signature
  → normalize and deduplicate
  → append evidence
  → aggregate by currency
  → render dashboard
  → human decision
```

## Guardian model

The 600 profiles are deterministic configuration records. They are not autonomous legal entities, employees, bank accounts, or sources of revenue. A profile becomes “ranked” only after a real safe workflow run records success and latency.

## Financial boundary

A withdrawal request has two distinct concepts:

- **Authorization intent:** a signed message proving the connected account approved a defined request.
- **On-chain transaction:** a separately built, reviewed, funded transaction payload signed by the user or an authorized provider.

v0.1 implements only the first. A future payout service would need custody or an explicit provider integration, chain/token allowlists, fee/gas handling, sanctions screening, KYC/AML, reconciliation, limits, cancellation, and independent review.

## Why the “quantum” visualization is not a security feature

The polygon/pyramid/orbit visual is a metaphor for workflow coordination. It does not provide quantum speed, guaranteed performance, magical revenue, or additional authorization. Real performance comes from bounded queues, caching, indexing, observability, and measured workload limits.
