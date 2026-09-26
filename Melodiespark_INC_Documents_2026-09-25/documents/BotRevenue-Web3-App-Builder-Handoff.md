# Melodiespark BotRevenue + MetaMello
## Compliance-first Web3 Application Builder Handoff

**Build status:** DRAFT — architecture and implementation brief; no production revenue, balances, token value, contracts, customers, or transfers may be represented as verified without source evidence.

## Builder mission

Build a production-ready multi-tenant web application for **Melodiespark Inc.** that turns legitimate digital products and human-delivered services into verifiable offers, customer payments, fulfillment evidence, support, accounting records, and approval-controlled payouts. The Web3 module, **MetaMello**, is a separate, read-only-first treasury dashboard. It must never create wallet keys, promise earnings, simulate production balances, automatically trade, mine, send, swap, sign, or transfer assets.

The operating principle is:

> One real customer → one verified payment → one delivered result → one evidence trail.

## Non-negotiable rules

1. Use only source-backed production data. Never populate production UI with fake customers, earnings, wallets, token prices, payment confirmations, contracts, or transaction hashes.
2. Labels are mandatory: `VERIFIED`, `UNVERIFIED`, `DRAFT`, `PENDING_APPROVAL`, `BLOCKED`, `FAILED`, `COMPLETED`.
3. Agents may research, reconcile, draft, classify, and flag anomalies. They cannot send customer messages, sign contracts, create wallet keys, spend money, approve payouts, or initiate blockchain transfers.
4. All outgoing payment or blockchain actions require an authenticated human approver, policy validation, external wallet signature, provider/chain confirmation, and immutable audit evidence.
5. Keep revenue, taxes, customer funds, company funds, and reward/token balances strictly separate.
6. Do not advertise MA Token, Karma Power Points, crypto rewards, exchangeability, price, yield, mining, or profit. Treat them as disabled concepts until legal, tax, securities, KYC/AML, sanctions, custody, and smart-contract reviews are completed.
7. Québec/Canada privacy: collect only necessary data, record consent and purpose, allow access/deletion requests, retain data by policy, and require legal review before launch.

## Product areas

| Area | Purpose | Production gate |
|---|---|---|
| BotRevenue | Offer catalog, lead intake, CRM, payments, delivery, support, KPIs | Payment provider and accounting integration verified |
| Phoenix | Durable orchestration, approvals, retries, evidence artifacts | Workflow tests and audit logging verified |
| Legal Nexus | RBAC, consent, policy acknowledgement, evidence ledger | Legal policy review pending |
| MetaMello | Read-only balances, networks, wallet activity and transaction-risk checks | EIP-1193 connection + RPC validation verified |
| MelodieCLI | Safe operations interface for inspection, drafts, approvals and exports | Command authorization verified |
| Karma / MA Token | Optional future recognition/reward concept | BLOCKED pending legal/compliance readiness |

## Revenue scope

Implement these as normal, legal commercial paths. Every path needs an offer, price, tax setup, scope, refund terms, consent, delivery acceptance and evidence.

1. Digital products: templates, plugins, CLI tools, asset packs, guides, creator packs.
2. SaaS subscriptions: AI workflows, dashboards, team tooling, usage-based plans.
3. Productized services: automation setup, websites, game-development support, audits, consulting.
4. Enterprise implementation, integration, training and support retainers.
5. Marketplace commission only after third-party work is completed and accepted.
6. Disclosed, permitted affiliate/referral programs.
7. Game sales: premium purchase, cosmetics, DLC, soundtrack and creator packs; no deceptive play-to-earn claim.
8. Grants, sponsorships, licensing and partnerships tracked separately from sales revenue.

## Roles and approval matrix

| Action | Customer | Support | Operator | Finance reviewer | Admin | Agent |
|---|---:|---:|---:|---:|---:|---:|
| View own orders/support | Yes | Scoped | Yes | Yes | Yes | Read-only if authorized |
| Draft offer/proposal | No | Yes | Yes | Yes | Yes | Yes |
| Send message/proposal | No | Yes | Yes | No | Yes | No |
| Create refund request | Yes | Yes | Yes | Yes | Yes | Draft only |
| Approve refund/payout | No | No | No | Yes | Yes | No |
| Connect wallet | Own only | No | Own only | Own only | Yes | No |
| Sign/send blockchain transaction | External wallet only | No | External wallet only | External wallet only | External wallet only | No |
| Change policies/RBAC | No | No | No | No | Yes | No |

## Core data model

Use PostgreSQL with tenant IDs on all tenant-owned records, row-level enforcement, UTC timestamps, immutable event IDs, and append-only audit logs.

| Entity | Required fields |
|---|---|
| Tenant | id, legal_name, locale, status, data_region |
| User / Role | id, tenant_id, identity_provider_id, role, MFA status, lifecycle |
| Consent | subject_id, purpose, source, region, granted_at, withdrawn_at, evidence_id |
| Lead | source, consent_id, owner, qualification status, unsubscribe state |
| Offer / SKU | sku, name, version, scope, price, currency, tax code, refund policy, status |
| Quote / Contract | customer, offer, assumptions, approval IDs, signature evidence, status |
| Order | customer, offer, price snapshot, payment status, delivery status |
| Payment / Refund / Dispute | provider IDs, amount, currency, event payload hash, status, evidence ID |
| LedgerAccount | account type: gross revenue, processor fee, tax payable, deferred revenue, refund reserve, operating cash, payable |
| LedgerEntry | journal ID, debit account, credit account, amount, currency, source event, immutable hash |
| Fulfillment | order, milestones, acceptance criteria, artifacts, customer acceptance, status |
| PayoutRequest | payee, validated destination, available balance, approvals, compliance check, provider receipt |
| WalletConnection | owner, address, chain ID, EIP-1193 provider, verified_at, status; never private key |
| ChainTransaction | wallet, network, recipient, value, gas estimate, simulation result, signer, tx hash, receipt, state |
| Evidence | source, owner, timestamp, hash, retention policy, verification status |
| AuditEvent | trace ID, actor, action, before/after hashes, approval ID, status |

## Ledger rules

- Only verified payment-provider webhooks or verified marketplace settlements create receivable/revenue events.
- Incoming payment is not withdrawable until provider settlement state and relevant hold period pass.
- A payment, refund, dispute, chargeback, tax hold, fee and payout each generate balanced double-entry journal entries.
- Dashboard always displays gross, fees, tax reserve, refunds/chargebacks, net revenue, available payout, and pending payout separately.
- Never treat loyalty points or any token as cash, revenue, cash equivalent, or payable balance.

## API design

All endpoints require authenticated tenant context, RBAC, idempotency for mutations, `trace_id`, and a returned evidence/audit reference.

```text
POST   /v1/leads                         # creates only consented lead
POST   /v1/offers                        # admin/operator creates draft offer
POST   /v1/orders                        # creates order from published price snapshot
POST   /v1/payments/webhooks/{provider}  # signature-verified provider event
GET    /v1/ledger/balances               # read-only, source-linked financial view
POST   /v1/fulfillments/{id}/accept      # customer acceptance evidence
POST   /v1/payout-requests               # creates PENDING_APPROVAL request only
POST   /v1/payout-requests/{id}/approve  # finance/admin policy-approved
POST   /v1/wallets/connect               # records EIP-1193 verified address/chain
POST   /v1/chain-transactions/prepare    # validate, estimate gas, simulate; no broadcast
POST   /v1/chain-transactions/{id}/submit-receipt # record signed tx hash, then verify chain receipt
GET    /v1/evidence/{id}                 # authorized evidence access
GET    /v1/audit-events                  # filterable immutable audit trail
```

## Payout and blockchain state machines

```text
Payout: DRAFT → PENDING_APPROVAL → APPROVED → SUBMITTED → PENDING_CONFIRMATION → COMPLETED
                    └→ BLOCKED / FAILED / REVERSED / DISPUTED

Chain:  DRAFT → NETWORK_VALIDATED → RECIPIENT_VALIDATED → SIMULATED → PENDING_EXTERNAL_SIGNATURE
       → HASH_RECORDED → PENDING_CONFIRMATION → COMPLETED
       └→ BLOCKED / FAILED / REPLACED / REVERTED
```

Do not expose a submit/broadcast action until all prerequisite state transitions are satisfied. The external signer is the only component that signs. A transaction is `COMPLETED` only after a chain receipt meets the configured confirmation threshold.

## MetaMello dashboard

Create these screens:

1. **Treasury overview** — connected accounts, supported networks, balances, latest verified activity, policy state, risk alerts. Read-only by default.
2. **Wallet connection** — EIP-1193 provider detection, account + chain validation, privacy notice, explicit connection approval; no seed phrase or private-key field.
3. **Transaction review** — selected network, recipient checks, allowlist status, amount, gas estimate, simulation output, risks, policy result, required approvers, external signature handoff.
4. **Activity and evidence** — tx hashes, receipts, confirmations, payment settlement records, exported evidence package.
5. **Policy center** — allowlisted networks, recipient rules, limits, required confirmations, emergency disable. Admin-only.

Initial policy values:

```yaml
treasury:
  read_only: true
  allow_broadcast: false
  allow_transfers: false
  require_approval: true
  require_external_signer: true
  max_transaction_value: 0
  supported_networks: []
```

## BotRevenue dashboard

- **Overview:** verified revenue, pending settlements, refund/chargeback exposure, fulfillment completion, evidence coverage.
- **Offers:** SKUs, price versions, terms, availability, release notes.
- **Leads & CRM:** consent source, opt-out state, owner, pipeline stage; never enable cold outreach without consent policy.
- **Orders & fulfillment:** purchase event, deliverables, milestones, acceptance, support status.
- **Finance:** ledger journals, reconciliation exceptions, payout queue, tax reserves.
- **Evidence & audit:** filters by event, actor, tenant, status, provider, trace ID.
- **Workflow operations:** Phoenix runs, inputs, approvals, retries, errors, dead-letter items. Simulation must be visually marked `SIMULATION` and never mix with production records.

## Workflow engine requirements

- Durable workflow IDs, idempotency keys, deterministic state transitions, retry limits, deadlines, cancellation and compensation behavior.
- Human approvals are discrete records: approver, action digest, timestamp, decision, expiry, reason and evidence hash.
- Sensitive actions stop safely if approval, policy, recipient, balance, chain, provider signature or evidence is absent.
- Every agent tool call includes tenant context, least-privilege capability, data classification, trace ID and audit event.
- Dead-letter queue items require a human triage outcome before replay.

## MelodieCLI contract

```bash
melodie revenue status --evidence
melodie revenue reconcile --provider stripe --dry-run
melodie offer create --draft offer.yaml
melodie order inspect ORDER_ID
melodie payout request --payee PAYEE_ID --amount AMOUNT --currency CAD
melodie payout approve PAYOUT_ID             # finance/admin, MFA and policy required
melodie wallet inspect --address ADDRESS --network NETWORK
melodie chain prepare --to ADDRESS --value AMOUNT --network NETWORK
melodie chain verify-receipt --tx HASH --network NETWORK
melodie evidence export --trace TRACE_ID
```

Commands that alter money, contracts, messages, or blockchain state must require a human identity, explicit confirmation, policy pass, and audit record. Default all CLI commands to read-only/dry-run when practical.

## Security baseline

- OAuth/OIDC with verified identity, MFA for privileged roles, short-lived sessions, and session revocation.
- Secrets in a managed secret store; never display, log, replace, or commit `.env` secrets.
- Signed payment webhooks, nonce/replay protection, idempotency keys, request schema validation, rate limits, WAF and CSRF protections.
- Encryption in transit and at rest; tenant isolation; least privilege; structured audit logs; dependency/SBOM scans; backups and restore drills.
- EIP-1193 only for wallet interaction. Validate chain ID, selected address, balance source, destination checksum, gas estimate, transaction simulation, final hash and receipt.
- No wallet key generation or storage in the app. No embedded seed phrase field. No background signing.

## Compliance gates (Canada / Québec — legal review required)

Before public launch, obtain qualified legal/accounting review for privacy, consumer protection, tax registration/remittance, marketing consent, contracts, refunds, employment/contractor classification, payment-provider terms, and records retention. Before any token or crypto function, also require analysis for securities/derivatives, money services, FINTRAC/KYC/AML, sanctions, custody, provincial/Canadian rules, cross-border data, smart-contract audit, tax reporting and user disclosure.

Status today:

| Gate | Status |
|---|---|
| Real-data-only policy | DRAFT |
| Payment provider integration | UNVERIFIED |
| Legal policy pack reviewed | BLOCKED |
| Payout controls | DRAFT |
| EIP-1193 validation | UNVERIFIED |
| Blockchain broadcasting | DISABLED / BLOCKED |
| MA Token implementation | BLOCKED |

## 90-day MVP sequence

**Days 1–15 — foundation:** tenant/RBAC, consent, offer catalog, audit/evidence ledger, design system, status-label components, staging environment.

**Days 16–30 — sell and deliver:** checkout/payment webhook integration, order and fulfillment flows, invoice/refund/dispute records, customer portal and service acceptance.

**Days 31–45 — finance:** double-entry ledger, reconciliation, verified KPI dashboard, payout-request workflow and finance approval queue. No automated payouts.

**Days 46–60 — operations:** Phoenix workflow durability, observability, CLI read-only commands, support desk, backup/restore and security testing.

**Days 61–75 — treasury read-only:** MetaMello wallet connection, supported-network validation, activity view, transaction preparation/risk check, receipt verification.

**Days 76–90 — launch evidence:** accessibility, privacy/security review, provider test evidence, incident runbook, one real customer/purchase/delivery evidence package. Keep chain broadcast disabled unless each gate is formally cleared.

## Builder acceptance tests

1. A non-consented lead cannot enter outreach automation.
2. A dashboard revenue number traces to a signature-verified provider event and ledger journal.
3. An agent cannot send messages, approve a payout, or broadcast a transaction.
4. An invalid, wrong-chain, unallowlisted or malformed recipient blocks transaction preparation.
5. A chain transfer cannot reach `COMPLETED` without external-signature hash and confirmed receipt.
6. A failed/pending/reversed/disputed payment or payout remains visibly distinct from completed revenue.
7. A user can retrieve their consent, data-export and deletion-request status.
8. Every privileged action creates a tamper-evident audit/evidence record.
9. Test/simulation records are isolated and visibly labeled; production UI has no synthetic data.
10. The Golden Path produces an evidence bundle for one paid order and accepted delivery.

## Explicit exclusions for MVP

- Automated earnings, mining, trading, swaps, transfers, mass sales bots, autonomous contract signing, or mass messaging.
- Claims of customer acquisition, income, wallet balance, token value, exchangeability or transaction success without verified evidence.
- Private-key/seed-phrase collection or storage.
- Token issuance, reward redemption, crypto custody, or any live blockchain transfer until the stated legal and technical gates are cleared.

## Build instruction

Generate clean, modular, production-oriented source code and documentation. Start with a staged implementation plan and a file tree. Build the core revenue system before Web3. Use feature flags to keep every restricted capability disabled. For each completed module, output: changed files, tests run, evidence created, current status label, open risks, and the next smallest verifiable milestone.
