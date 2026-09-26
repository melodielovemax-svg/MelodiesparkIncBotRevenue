# MELODIESPARK INC. — TOTAL ECOSYSTEM BUILD PROMPT TEMPLATE

This is the complete reusable build prompt synthesized from the attached material. Fill `{{PLACEHOLDERS}}`, then give the entire block to a coding, architecture, or app-builder agent.

```text
MELODIESPARK INC. — TOTAL ENTERPRISE ECOSYSTEM GENERATION REQUEST
Version: {{VERSION}}
Date: {{DATE}}
Founder / final approval authority: {{FOUNDER_NAME}}
Company jurisdiction: Québec, Canada
Canonical project root: {{PROJECT_ROOT}}
Workspace organization root: {{ORGANIZATION_ROOT}}
Evidence root: {{EVIDENCE_ROOT}}
Current phase: {{CURRENT_PHASE}}

# 1. CORE MISSION

Build the complete Melodiespark Inc. ecosystem as a professional, clean, modern, enterprise-grade product factory and digital civilization platform. The ecosystem unifies:

- MelodieCLI: principal developer, operations, project, evidence, and app-builder CLI.
- Phoenix / Phoenix Core: durable orchestration kernel for workflows, approvals, agents, tasks, retries, audit events, and safe execution.
- MelodieLiteLLM: multi-model AI gateway, model routing, keys, budgets, provider controls, observability, and chat workspace.
- BotRevenue: a compliant revenue-operations product for offers, products, leads, consent, checkout, fulfillment, support, invoices, refunds, and analytics.
- Legal Nexus: identity, RBAC, evidence ledger, policy documents, approvals, privacy, audit, compliance, and release governance.
- MetaMello: a read-only-first Web3 wallet, treasury, transaction review, and portfolio dashboard.
- Karma Power Point / MA Token readiness: positive-contribution recognition with anti-abuse, verification, disputes, and future-gated tokenization readiness.
- Phoenix Builder / Studio: website builder, SaaS builder, dashboard builder, CLI builder, agent builder, and deployment factory.
- Path of Melodie: Maakara Protocols: dark-gothic, stylized isometric action RPG vertical-slice and content-production pipeline.
- KAYLA / KIMINI: governed agent orchestration, coding assistance, task execution, evidence collection, and human approval queues.

The goal is not a fake demo. Build a system that can progress through verified milestones:

real offer → consented prospect → approved quote → verified payment → delivered result → acceptance evidence → support/refund record → reconciled ledger.

Use no fake revenue, fabricated customers, fabricated transaction hashes, fake earnings popups, fake contracts, invented wallet balances, or claims that automation guarantees revenue.

# 2. BRAND, VISUAL, AND PRODUCT DIRECTION

Create a premium, clean, high-trust visual identity:

- Palette: Obsidian #0B0F14, Electric Cyan #22D3EE, Violet #7C3AED, Molten Gold #F5A524, graphite neutrals, white.
- Product aesthetic: futuristic, sophisticated, readable, secure; no fake screenshots or misleading counters.
- UI typography: Inter; JetBrains Mono for CLI/code.
- Motion: subtle, accessible, respects reduced motion.
- Dashboard: left navigation, command-center workspace, evidence/right-detail panel, clear status pills, real empty/loading/error states.
- Game: 3D/2D hybrid isometric, dark-gothic fantasy, obsidian/crimson/violet/molten-gold/electric-cyan palette, musical spellcasting, combat readability.

# 3. TRUTH, SAFETY, AND EXECUTION CONSTITUTION

Use exactly these status labels everywhere:
VERIFIED | UNVERIFIED | BLOCKED | DRAFT | PENDING_APPROVAL | FAILED | COMPLETED.

Mandatory rules:
1. File presence is not proof. Tests, provider responses, signed receipts, build logs, approvals, and artifact hashes are evidence.
2. No payment, revenue, contract, fulfillment, wallet balance, token balance, swap, transfer, transaction, deployment, or compliance claim is real until source evidence is verified.
3. Agents may READ, DRAFT, PROPOSE, classify, analyze, test, and prepare evidence. They may not independently send messages, sign agreements, spend funds, approve payouts, create/sign/broadcast transactions, or modify treasury policy.
4. External communication requires a human-approved draft and consent record. Financial/Web3 actions require explicit human approval, policy validation, external signer as applicable, and provider/chain confirmation.
5. Preserve repositories, credentials, .env files, wallet keys, seed phrases, API keys, and user data. Never expose, replace, invent, or log secrets.
6. Never delete, relocate, mass-rename, or reorganize files before an inventory, duplicate report, reversible plan, and explicit confirmation list.
7. “Quantum Fractal Matrix,” “Guardian,” “Arc Angel,” and “Sacred Geometry” are product names only. Translate them into measurable workflows, queues, workers, policies, observability, quality checks, performance budgets, and stop conditions.
8. Do not claim cryptocurrency mining, automatic earnings, automatic contracts, or automatic conversion of points into crypto. These remain BLOCKED without a separately compliant, approved implementation and real evidence.

# 4. REQUIRED SYSTEMS AND MODULES

Generate a coherent monorepo using {{PACKAGE_MANAGER}}, {{RUNTIME}}, TypeScript, Next.js, React, PostgreSQL, Redis, NATS, Docker Compose, durable workflows, Prisma-or-Drizzle, and secure environment configuration.

Required top-level structure:

apps/
  web/                         # Storefront, customer portal, command center
  admin/                       # founder, finance, compliance approvals
  melodie-cli/                 # principal TypeScript CLI
  extension/                   # MetaMello browser extension
  phoenix-builder/             # visual app/site/dashboard builder
  game-launcher/               # Path of Melodie launcher/support tools
packages/
  shared/ ui/ catalog/ identity/ consent/ evidence/ audit/ ledger/
  compliance/ agent-runtime/ model-router/ wallet-reader/
  workflow-contracts/ game-contracts/
services/
  phoenix-engine/ webhook-router/ payment-reconciler/ indexer/
  notifier/ evidence-worker/ support-worker/
infra/
  docker/ terraform/ github-actions/
docs/
  architecture/ legal-draft/ runbooks/ product/ evidence/ game/

For every module generate: purpose, owner, public interface, input/output types, data classification, dependencies, health checks, logs/metrics/traces, failure states, tests, acceptance criteria, evidence artifacts, and rollback behavior.

# 5. MELODIECLI REQUIREMENTS

Design MelodieCLI as the unified command interface. Provide a command tree, help text, input/output schema, exit code, dry-run, approval behavior, audit event, evidence output, and tests for each group:

- doctor / health / evidence / inventory / backup-plan / restore-check
- project init / inspect / plan / build / test / release / rollback
- catalog list / validate / publish-request / retire-request
- offer create-draft / quote-draft / sow-draft / delivery-check
- customer inspect / consent verify / deletion-request
- revenue dashboard / payment inspect / reconcile / refund-request
- ledger accounts / entries / verify / export
- support ticket / triage / knowledge-base
- agent list / inspect / run-draft / approval-queue / evidence-export
- model route / evaluate / budget / provider-status
- phoenix workflow list / start-request / pause / retry / cancel / traces
- wallet connect / balances / activity / simulate / transfer-request
- treasury policy / recipient-request / network-request / approval-status
- game build / test / package-check / asset-factory / vertical-slice-status
- workstation inventory / cleanup-plan / performance-report

Class every command as READ, DRAFT, PROPOSE, EXECUTE, SEND_MESSAGE, SIGN_CONTRACT, SPEND, or TRANSFER. SEND_MESSAGE, SIGN_CONTRACT, SPEND, and TRANSFER are blocked without a verified human approval token and satisfied policy conditions.

# 6. MELODIELITELLM AND AI WORKSPACE

Build MelodieLLM Chat Workspace:

- Google OAuth 2.0 / OIDC sign-in using openid, email, profile only.
- Create/link accounts only after verified provider identity; record provider ID, verified email, consent timestamp, login audit event.
- Chat workspace: streaming, Markdown, syntax-highlighted code, copy/regenerate/edit.
- Sidebar: New Chat, search, folders/projects, history, pinned chats.
- Composer: multiline prompts, files/images, model selector, send/stop; voice excluded from MVP.
- Right panel: artifacts, sources, tool activity, files, run state, evidence links.
- Routing: task class, data tier PUBLIC/INTERNAL/PII/SENSITIVE, budget cap, provider allowlist, fallback, evaluator score, redaction, prompt/output hash, cost, latency, trace ID.
- Injection defence: untrusted-content isolation, schema validation, tool authorization, evidence/citation requirements, safe tool allowlists.

Never put OAuth/model-provider secrets in UI, logs, source control, or documents.

# 7. BOTREVENUE: PRODUCTS, SALES, AND FULFILLMENT

Build BotRevenue as a compliant, human-supervised sales-operations platform, not an autonomous revenue promise.

Generate:
1. A catalog for digital products, SaaS plans, productized services, enterprise services, game products, licensing, sponsorship, grants, and disclosed referral programs.
2. Twenty immediately legitimate Melodiespark offers. For each: customer profile, problem, scope, deliverables, exclusions, price range CAD/USD, delivery time, capacity, client responsibilities, acceptance criteria, support, refund terms, proof of completion, risks, prohibited claims.
3. Customer discovery: ICPs, interview scripts, evidence capture, pain scoring, paid-pilot and product-market-fit gates.
4. Lead operations: consent-first forms, source attribution, deduplication, region, preferences, opt-in nurture, unsubscribe, do-not-contact enforcement, frequency caps, human-reviewed scoring.
5. Sales: discovery intake, approved quotes, proposal drafting, SOW drafting, authorized signatures, orders, invoices, receipts, dispute/chargeback/refund handling.
6. Fulfillment: intake, scope approval, tasks, milestones, client communications, quality gates, delivery evidence, customer acceptance, support, post-project review.
7. Stripe-first storefront: normalized products/prices, server checkout sessions, verified webhook signatures, idempotency, reconciliation, no paid state from browser redirect alone.
8. KPI dashboard: consented leads, qualified opportunities, quotes, verified payments, fulfilled orders, refunds, chargebacks, delivery time, satisfaction, support load, runway, and evidence links. Never mix projections with verified revenue.

# 8. FINANCE, EVIDENCE LEDGER, AND WITHDRAWALS

Implement an evidence-led double-entry finance model.

Permitted inbound sources only:
- verified payment-provider webhook;
- reviewed marketplace settlement;
- manual bank reconciliation supported by statement evidence and two human approvals.

Required entities:
account, journal_entry, journal_line, payment_event, invoice, refund, dispute, chargeback, tax_reserve, payout_request, payout_approval, recipient_allowlist, evidence_artifact, audit_event.

Required account separation:
- customer funds; operating cash; tax reserve; refund reserve; chargeback reserve; recognized revenue; processing fees; payable balance.

Produce payout state machine:
PENDING_APPROVAL → APPROVED_H1 → APPROVED_H2 → AWAITING_EXTERNAL_SIGNATURE → PENDING → CONFIRMED | FAILED | REJECTED | HELD | REVERSED.

For each transition specify actor, permission, validation, evidence, journal treatment, notification, timeout, retry rule, and audit record. A payout is CONFIRMED only after verified provider or on-chain receipt.

# 9. METAMELLO WEB3 / TREASURY

Build MetaMello as a secure read-only wallet and treasury dashboard:

- balances, assets, networks, activity, risk warnings, receipts, evidence export, portfolio history;
- Buy, Swap, Send, Receive, Add Funds, Activity, Networks, Security, Settings, plus centred Karma/Impact experience;
- no enabled financial action by default;
- EIP-1193 connection, chain/account validation, balance read, gas estimate, simulation, human confirmation, external hardware signing, receipt matching, confirmations, explorer reference, audit bundle;
- testnet-first: Sepolia, Base Sepolia, Arbitrum Sepolia, Optimism Sepolia, Polygon Amoy, zkSync Sepolia;
- mainnet disabled pending legal, KYC/AML/sanctions, custody, audit, policy, allowlist, and founder approval evidence.

Default treasury policy:
READ_ONLY=true
REQUIRE_APPROVAL=true
REQUIRE_EXTERNAL_SIGNER=true
ALLOW_BROADCAST=false
ALLOW_TRANSFERS=false
MAX_TRANSACTION_VALUE=0
ALLOWLISTED_RECIPIENTS=[]
ALLOWLISTED_NETWORKS=[]
REQUIRE_DUAL_APPROVAL=true
REQUIRE_TX_SIMULATION=true
REQUIRE_RECEIPT_HASH=true

Define button states:
default → loading → validation → blocked → simulation → confirm → awaiting_signature → pending → confirmed | failed | rejected | retry.

# 10. KARMA POWER POINT, IMPACT, AND MA TOKEN READINESS

Create verified positive-contribution recognition:

- categories: environmental, community, accessibility, learning, testing, moderation, content, verified service delivery;
- task evidence, duplicate detection, reviewer approval, quality score, anti-fraud, rate limits, identity/sybil resistance, appeals, suspension, reversal, public audit status;
- KPP is recognition only: not money, not mining, not a security, not a deposit, no promise of value;
- Ascension and Genesis Artifacts: non-transferable prestige with hard caps and anti-inflation design;
- separate BLOCKED Tokenization Readiness listing legal counsel, tax, securities analysis, KYC/AML, sanctions, custody, smart-contract audit, disclosure, regional availability, and founder approval.

# 11. PHOENIX / KAYLA / KIMINI AGENT FACTORY

Design safe scalable automation. Do not create or claim 80,000 income bots. Instead define capacity-managed worker pools with quotas, tenant boundaries, concurrency, queue limits, budgets, idempotency, retry policies, DLQ, review queues, and stop conditions.

Roles: evidence collector, product researcher, offer/proposal drafter, CRM assistant, support triage, finance reader/reconciler, wallet reader, release assistant, game asset-brief generator, workstation inventory assistant.

For every agent define capabilities, prohibited actions, tool permissions, data tier, approval requirements, evaluation checks, trace schema, and recovery.

# 12. PHOENIX BUILDER / APP BUILDER / DEPLOYMENT FACTORY

Build governed project generation for websites, landing pages, dashboards, portals, SaaS, CLI extensions, chat workspaces, game-support tools, and internal workflows.

Each generated project includes architecture, repo template, secret-free environment template, README, local setup, tests, lint/type checks, CI, deployment plan, security and accessibility checklist, evidence manifest, release checklist, rollback plan, owner/approval metadata.

Deployment path: local → staging → production. Production requires passing gates and human approval. Never automatically deploy everywhere.

# 13. LEGAL NEXUS, PRIVACY, AND GOVERNANCE

Generate DRAFT — COUNSEL REVIEW REQUIRED versions of:

- Québec/Canada privacy notice (Law 25 / PIPEDA placeholders);
- terms of service; acceptable-use policy; refund/cancellation policy;
- data retention; accessibility statement; vendor due diligence;
- incident/breach response; Web3/financial disclosures;
- customer consent language; audit/evidence retention;
- contract/SOW approval and signature policy.

Include English/French content architecture. Do not assert legal compliance until a qualified reviewer approves the exact policy version.

# 14. WORKSTATION, PROJECT ORGANIZATION, AND PERFORMANCE

Generate a safe Windows workstation-maintenance component:

- inventory configured project roots, disk, CPU/RAM/GPU, build tools, Node/Python/.NET/Unreal, project health;
- identify duplicates and propose—not execute—consolidation;
- reversible cleanup plan with exact paths, size estimates, owner, confirmation;
- never touch credentials, wallet data, repos, project folders, or Windows files without approval;
- conservative hardware-based recommendations; no fake hardware emulation, overclocking, security disabling, cache wiping, or destructive registry changes;
- support {{PROJECT_ROOT}}, {{ORGANIZATION_ROOT}}, and {{REVENUE_DATA_ROOT}} only after paths are confirmed.

# 15. PATH OF MELODIE: MAAKARA PROTOCOLS

Create Unreal Engine {{UNREAL_VERSION}} game vertical-slice and content factory:

- one hero, one zone, one enemy family, one boss, one quest loop, one loot loop, one progression loop, menu/settings, acceptance tests;
- content pipeline: concept brief, licensing/source record, naming convention, import validation, LOD/performance budget, review, packaging evidence;
- combat: isometric action, musical spellcasting, boss protocols, accessibility, controller/keyboard, save/load, privacy-safe telemetry;
- game economy: fun-first, non-crypto-dependent progression/cosmetics/crafting, sinks, anti-inflation, anti-cheat, player protection;
- release gates: editor build, automation tests, runtime smoke, shipping build, cook, stage, package, artifact inventory, package hash, rollback.

Never mark the game release VERIFIED without evidence for each gate.

# 16. REQUIRED OUTPUTS

Produce all deliverables in this order:

1. Executive overview/product narrative.
2. VERIFIED / UNVERIFIED / BLOCKED evidence audit using only inputs.
3. Enterprise system-context architecture and module map.
4. Repository tree and ownership matrix.
5. Database domain model, ERD, migrations, indexes, retention, tenancy isolation, audit strategy.
6. API catalogue: auth, RBAC, validation, idempotency, rate limit, errors, side effects, evidence, approval gates.
7. MelodieCLI reference: examples, dry runs, exit codes, policy checks.
8. UI/UX: storefront, customer portal, command center, MetaMello, MelodieLLM, Phoenix Builder.
9. Component inventory/design-system tokens.
10. BotRevenue catalog: 20 offers plus product/SaaS/service/enterprise/game/licensing/referral templates.
11. Customer journey: discovery → consent → quote → payment → fulfillment → acceptance → support → refund/dispute → ledger.
12. Finance/ledger/payout model and all state machines.
13. MetaMello technical specification, testnet-only first release.
14. KPP/Ascension/Genesis Artifact specification and tokenization readiness.
15. Phoenix workflow/events/workers/retry-DLQ/approval queue/observability.
16. AI governance/model routing/injection defence/evals/cost controls.
17. Legal Nexus DRAFT pack, review flow, risk register.
18. Workstation organization plan and non-destructive PowerShell specification; do not execute it.
19. Path of Melodie vertical-slice roadmap and asset-factory plan.
20. CI/CD, testing, security scan, staging, release, rollback, evidence.
21. 90-day roadmap: 0–30, 31–60, 61–90; owner, dependencies, acceptance, evidence, status, stop/go.
22. Exactly 1,000 unique backlog items: ID, item, domain, priority P0–P3, status, owner, dependency, acceptance, evidence, approval. Cover revenue, product, catalog, SaaS, services, finance, compliance, engineering, security, agents, Phoenix, MetaMello, blockchain, game, support, operations.
23. Evidence-only launch checklist.
24. Remain BLOCKED register for legal approval, consent, provider configuration, live payment, external signing, contract audit, mainnet activation, or founder decision.
25. Top 25 implementation tasks in dependency order.

# 17. OUTPUT FORMAT

- Begin major sections with VERIFIED, UNVERIFIED, BLOCKED, or DRAFT.
- Use Markdown tables; use Mermaid only when a multi-step/branch relationship is clearer.
- Cite each factual claim to supplied evidence; otherwise state UNVERIFIED — evidence required.
- Include no secret, private key, seed phrase, payment credential, personal customer data, or invented live data.
- If output length is limited, deliver numbered continuation parts; do not replace detailed deliverables with vague summaries.
- End with Founder Approval Queue, Missing Evidence, Immediate P0 Tasks, and What Remains Blocked.

Now generate the complete architecture and build plan.
```

## Replace before use

| Placeholder | Required value |
|---|---|
| `{{FOUNDER_NAME}}` | Authorized final approver |
| `{{PROJECT_ROOT}}` | Canonical source repository path |
| `{{ORGANIZATION_ROOT}}` | Confirmed project organization directory |
| `{{EVIDENCE_ROOT}}` | Evidence artifacts directory |
| `{{REVENUE_DATA_ROOT}}` | Confirmed finance/evidence directory—not a revenue claim |
| `{{PACKAGE_MANAGER}}` / `{{RUNTIME}}` | e.g. pnpm and Node version |
| `{{UNREAL_VERSION}}` | Installed Unreal version |
| `{{CURRENT_PHASE}}` | Current project phase |

Do not fill a placeholder with invented production facts.
