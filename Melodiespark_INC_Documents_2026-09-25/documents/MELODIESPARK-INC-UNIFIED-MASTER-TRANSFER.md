# MELODIESPARK INC. — UNIFIED MASTER TRANSFER

## Authority and objective

Canonical source root: C:\MelodieCLI  
Source authority: Git and actual repository files  
Evidence authority: MERA, build/test logs, hashes, provider receipts, and signed approvals  
Commercial proof: one real customer + one real product + one verified payment + fulfillment proof + audit record  
Current commercial proof: UNVERIFIED — revenue must display as zero until the proof exists.

This transfer unifies the useful project data, generated specifications, coding results, products, prompts, and recent execution history into one build directive. Preserve existing code, Git history, secrets, .env files, wallet keys, and configuration. Do not delete or merge source trees until an inventory and duplicate report exists.

## Truth rules

Use: DRAFT, IMPLEMENTED, TESTED, VERIFIED, AUDITED, RELEASED, UNVERIFIED, BLOCKED, FAILED.

- File presence is not completion.
- No invented customer, sale, contract, payment, wallet balance, transaction hash, production deployment, game release, or performance result.
- Agents can read, draft, test, analyze, and propose. Sending, signing, spending, transfers, swaps, broadcasting transactions, and approval actions require an authorized human.
- Web3 and treasury are testnet/read-only first. Mainnet and funds movement remain blocked until separately verified.

## Current verified and blocked state

| Domain | Status | Evidence summary |
|---|---|---|
| pnpm/Turbo monorepo | IMPLEMENTED | root platform structure exists |
| Phoenix kernel | VERIFIED build | typecheck/build pass reported; tests mostly pass |
| Database migration | VERIFIED gate | BotRevenue acceptance database gate recorded |
| Catalog/Stripe | IMPLEMENTED test mode | catalog/payment links exist; no real paid customer evidence |
| BotRevenue | IMPLEMENTED partial | catalog/CRM stronger than payment/reconciliation/fulfillment proof |
| MetaMello | IMPLEMENTED partial | wallet/reader work exists; transfers policy-gated |
| Treasury transfer | BLOCKED | no verified transferable revenue; external signer/approval required |
| Path editor build | VERIFIED | UE editor C++ build evidence |
| Path automation tests | VERIFIED | latest cycle evidence |
| Path runtime smoke | FAILED | repair required |
| Path shipping build | VERIFIED | latest cycle evidence |
| Path cook/stage/package | FAILED_OR_INCOMPLETE | release blocked |

## Unified ecosystem components

### 1. Platform Kernel

Shared types, configuration, validation, tenancy, service registry, policy primitives, error contracts, audit/event envelope, trace/correlation IDs, and canonical TypeScript/testing rules.

### 2. Phoenix, KAYLA, and KIMINI

Durable workflows, NATS event contracts, idempotency, retries, dead-letter queues, cancellation, approval queues, evidence bundles, agent evaluation, tool allowlists, and capacity-managed worker pools.

### 3. MelodieCLI

Command groups: doctor, evidence, inventory, project, build, test, release, catalog, customer, finance reader, agent, workflow, wallet reader, game, workstation.

Class every command as READ, DRAFT, PROPOSE, EXECUTE, SEND_MESSAGE, SIGN_CONTRACT, SPEND, or TRANSFER. Last four classes are human-approval gated.

### 4. MelodieLiteLLM and MelodieLLM

LiteLLM gateway, provider registry, model router, privacy tiers, budgets, fallback, usage metrics, traces, virtual key controls, OIDC user identity, chat workspace, files/artifacts, prompt safety, output validation, and evaluator gates.

### 5. BotRevenue and commerce

Catalog, offers, prices, leads, consent, quotes, SOW drafts, orders, invoices, webhook payment events, refunds, disputes, fulfillment, support, analytics, and evidence links.

Payment source of truth: signed provider webhook, not browser redirect. Revenue flow: payment event -> idempotent reconciliation -> journal entry -> fulfillment/acceptance evidence -> dashboard.

### 6. MERA, Legal Nexus, Identity Nexus

Organizations, users, roles, RBAC, consent, privacy requests, policy versioning, audit logs, evidence hashes, retention, risk register, release gates, incident runbooks. Québec/Canada policies are DRAFT until counsel approval.

### 7. MetaMello and Web3

EIP-1193 connection, account/chain validation, balance/history read, simulation, approval, external signer, receipt confirmation, evidence export.

Test networks: Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy, zkSync Sepolia.

Default treasury: READ_ONLY true; approval/external signer required; broadcast/transfers false; value limit zero; no allowlists by default.

### 8. Phoenix Builder and interfaces

Next.js storefront, customer portal, founder command center, dashboards, prompt-driven app builder, documentation surfaces. Brand: obsidian, gold, cyan, violet, accessible and evidence-first. No fake metrics.

### 9. Path of Melodie: Maakara Protocols

UE 5.8 project: C:\MelodieCLI\PathOfMelodie\PathOfMelodie.uproject. Vertical slice: hero, zone, enemy family, boss, quest, loot, progression, save/settings, release evidence. The 30,000 generated briefs/modules are not proof of completed imported art.

## Product portfolio

Use current catalog rows as DRAFT source material, never as proof that an offer is live. Prioritize:

1. PhoenixForge CLI, command packs, repo intelligence.
2. MelodieLiteLLM gateway, model router, prompt studio, agent evaluation.
3. Secure Tool Gateway, MERA, Identity Nexus, Legal Nexus.
4. Platform Kernel, Event Infra Nexus, Observability, Release Gate, Deployment Fabric.
5. Phoenix Builder, Studio, Web3 App Starter.
6. MetaMello Wallet Suite, Treasury Reader, Treasury Policy, Web3 Evidence Reconciler.
7. BotRevenue Growth OS, Catalog OS, Verified Revenue Loop, analytics.
8. Implementation services: Stripe catalog, architecture review, deployment, LLM setup, security review, repo modernization, web3 reader, game workflow.

## Target repository shape

~~~
apps: web, admin, cli, melodie-llm, extension, phoenix-builder, game-launcher
packages: shared, config, types, identity, consent, evidence, audit, compliance,
          catalog, ledger, billing, agent-runtime, model-router, tool-gateway,
          workflow-contracts, wallet-reader, game-contracts, ui
services: phoenix-engine, api-gateway, auth-service, webhook-router,
          payment-reconciler, event-bus, memory-service, indexer, notifier
infra: docker, github-actions, terraform
docs: architecture, runbooks, legal-draft, evidence, product, game
~~~

## Mandatory build order

### Phase 0 — baseline

1. Resolve canonical Git repo and exact commit.
2. Inventory packages, apps, services, schemas, workflows, scripts, UE projects, and environment templates.
3. Run secret, SBOM, license, dependency, duplicate, and dead-code scans.
4. Create evidence manifest with command, timestamp, exit code, paths, hashes, status.

### Phase 1 — runnable platform

1. One root package manager/lockfile/TypeScript/test configuration.
2. Build/test Kernel, Phoenix, shared contracts, CLI, API from a clean checkout.
3. Canonical tenant, identity, RBAC, event, and evidence contracts.
4. Connect NATS to durable workflows.
5. Health checks and cross-service trace IDs.

### Phase 2 — Golden Path

1. One approved sellable offer with real fulfillment.
2. Consent-first discovery intake.
3. Quote/SOW draft and human approval.
4. Stripe test checkout and signed webhook.
5. Payment reconciliation and double-entry journal.
6. Delivery/acceptance evidence.
7. Customer app first run event: FIRSTRUNCOMPLETED.

### Phase 3 — hardening

CI lint, types, unit/integration/e2e, secrets/dependencies, accessibility, staging smoke, rollback, evidence dashboard, risk/incident/backup runbooks.

### Phase 4 — bounded Web3 and game

Testnet wallet reader and review first. Repair game runtime smoke, then cook, stage, package, installer, artifact verification. Mainnet requires separate legal/security/operating evidence.

## Release proof gates

| Claim | Required evidence |
|---|---|
| Customer | consent and verified customer record |
| Revenue | provider payment, reconciled ledger, no overriding refund/chargeback |
| Delivery | artifact/access record and acceptance evidence |
| Payout | approvals, recipient validation, external signature, provider/chain receipt |
| Wallet transaction | matching hash, receipt, confirmations |
| Deployment | versioned artifact, health/smoke test, approval |
| Game release | build, test, runtime, cook, stage, package, installer, manifest |

## Sources consolidated

- Melodiespark Enterprise Integrated Blueprint Evidence Audit Roadmap
- Melodiespark Devin A-Z Master Transfer
- Melodiespark App Builder Transfer Stripe Live
- Melodiespark INC Master Products Services 100 catalog
- Melodiespark OpenCode A-Z Master Transfer
- Path of Melodie build/release reports and factory transfer materials

## Coding agent starting instruction

Create reports/unified-baseline first. Do not start bulk code generation, catalog publication, outreach, payment activation, transfer flow, mainnet configuration, or deployment until the baseline report exists.

Every change must record change ID, scope, status, command, exit code, artifacts, evidence hash, approval requirement, and rollback procedure. End each run with completed changes, failures, blockers, unverified claims, next 10 dependency-ordered actions, and exact evidence paths.
