# OPENCODE A–Z TRANSFER — MELODIESPARK INC.

**Purpose:** Canonical handoff document for OpenCode or another coding agent to continue the Melodiespark Inc. platform without losing architecture, product, governance, security, Web3, release, evidence, and current website deployment context.

**Operating mode:** Build real, testable, evidence-backed software. Do not invent production success. Preserve existing work. Prefer safe, idempotent automation.

---

# 0. READ THIS FIRST — NON-NEGOTIABLE RULES

1. **Do not fabricate production facts.**
   - No fake customers.
   - No fake revenue.
   - No fake payments.
   - No fake balances.
   - No fake transactions.
   - No fake testimonials, ratings, urgency, contracts, deployments, or audit evidence.
   - Use status values such as:
     - `VERIFIED`
     - `UNVERIFIED`
     - `BLOCKED`
     - `DRAFT`
     - `PENDING_APPROVAL`
     - `FAILED`
     - `COMPLETED`

2. **Golden Path definition**
   - Real customer
   - Real offer/product
   - Real payment
   - Real fulfillment/delivery
   - Real acceptance/result
   - Real evidence/audit record

3. **Secrets**
   - Never print or commit secrets.
   - Never overwrite `.env`.
   - Never store seed phrases or private keys.
   - Never place provider tokens, Stripe secret keys, wallet private keys, or credentials in generated source.
   - `.env.example` must contain placeholders only.

4. **Financial/Web3 controls**
   - Browser wallet / external signer only.
   - Human/user approval required for signing and broadcast.
   - No automated treasury transfers.
   - No autonomous withdrawals.
   - Never request a seed phrase.
   - Never request a private key.
   - Simulate/read/reconcile/draft is allowed.
   - Spending, signing, payouts, withdrawals, and transactions require explicit owner/user confirmation.

5. **Evidence**
   - File presence is not verification.
   - A command returning success is evidence only for the specific command/gate.
   - Release gates must record real outputs, hashes, timestamps, and statuses.

6. **Product claims**
   - “Matrix Quantum Fractal Engine” is a product/workflow-engine name only.
   - Do not imply unlimited compute, impossible performance, or unverifiable capabilities.

7. **Production quality**
   - Prefer complete implementations over demos.
   - Do not silently replace real integration requirements with mock data.
   - If a dependency is missing, mark the gate `BLOCKED` and explain the exact unblock action.

---

# 1. COMPANY / PROGRAM

**Company:** Melodiespark Inc.

**Founder / principal:** Maxime Aubé

**Program objective:** Build one enterprise AI-native platform unifying AI orchestration, developer tooling, model routing, automation, governed revenue operations, Web3/wallet interfaces, product delivery, evidence, identity, legal/governance, and interactive entertainment.

Primary ecosystem components:

- Phoenix / Phoenix Core
- MelodieCLI
- MelodieLLM / LiteLLM Gateway
- BotRevenue
- MetaMello Wallet
- Identity Nexus
- Legal Nexus
- Phoenix Builder / Phoenix Studio
- KAYLA / KIMINI orchestration
- Melodiespark OS / Command Center
- Path of Melodie: Maakara Protocols
- Matrix Quantum Fractal Engine
- Evidence / MERA governance
- Commerce/catalog/product infrastructure
- Web3/rewards/Karma/MA-token research layers
- Developer platform and release automation

---

# 2. CURRENT CANONICAL WORKSPACE

Use this as the current working assumption unless the filesystem proves otherwise:

```text
D:\MelodieCLII
```

Important current paths:

```text
D:\MelodieCLII\Platforms
D:\MelodieCLII\Websites\melodiespark-inc
D:\MelodieCLII\Websites\melodiespark-inc\site
D:\MelodieCLII\Websites\melodiespark-inc\dist
D:\MelodieCLII\Websites\melodiespark-inc\evidence
D:\MelodieCLII\Websites\melodiespark-inc\release
```

The current website factory script is expected at:

```text
D:\MelodieCLII\Platforms\MELODIESPARK-AZ-WEB-RELEASE.ps1
```

Do not assume older roots such as `C:\MelodieCLI` are still canonical for the current website release work. Before modifying older projects, discover what actually exists on disk.

---

# 3. PLATFORM ARCHITECTURE

Treat Melodiespark as one unified operating platform rather than unrelated apps.

## 3.1 Six major planes

### Intent / Identity Plane
- User identity
- Organization identity
- roles/RBAC
- authorization
- consent
- ownership
- approval gates

### Product Plane
- catalog
- product definitions
- variants
- pricing
- entitlement
- licensing
- delivery contracts
- SEO
- structured data
- analytics metadata

### Execution / Phoenix Plane
- planners
- agents
- workflows
- queues
- tool execution
- workers
- runtime policies
- application orchestration
- deployment

### Trust Plane
- evidence ledger
- MERA
- Legal Nexus
- release gates
- hashes
- approvals
- audit trail
- governance

### Commercial / BotRevenue Plane
- consented leads
- offers
- checkout
- payment verification
- fulfillment
- support
- reconciliation
- accounting handoff
- evidence-backed revenue analytics

### Intelligence Plane
- MelodieLLM / LiteLLM Gateway
- model routing
- providers
- policies
- usage
- observability
- retrieval
- agent intelligence

---

# 4. PHOENIX CONTINUUM

Use this lifecycle as the canonical operational flow:

```text
IDEA
→ INTENT
→ PRODUCT CONTRACT
→ PLAN
→ WORK ORDER
→ EXECUTION
→ VALIDATION
→ EVIDENCE
→ RELEASE
→ APPROVAL
→ DEPLOYMENT
→ CATALOG
→ PAYMENT
→ ENTITLEMENT
→ DELIVERY
→ ACCEPTANCE
→ SUPPORT
→ RECONCILIATION
→ TELEMETRY
```

A feature is not “done” merely because code exists. It should progress through the appropriate lifecycle gates.

---

# 5. PRODUCT + SERVICE CATALOG

The website/catalog must be structured, extensible, and able to map into Shopify, Stripe, analytics, SEO, evidence, and fulfillment metadata.

Core public products/services currently include:

## AI / Developer Platform

### Phoenix
AI orchestration, agents, workflows, runtime controls, tools, and application coordination.

### MelodieCLI
Developer command platform for build, test, validation, release, deployment, and operations.

### MelodieLLM Gateway
Provider-neutral model routing, policy, model access, observability, and application integration.

### Phoenix Studio
AI-assisted application/workflow creation environment.

### Developer Platform Services
CLI, monorepo, CI/CD, infrastructure, observability, automation, and integration services.

## Revenue / Commerce

### BotRevenue
Evidence-first revenue operations platform spanning:
- consented leads
- catalog/offers
- checkout
- payment verification
- fulfillment
- support
- reconciliation
- accounting
- evidence-backed analytics
- owner approval for sensitive actions

### Verified Revenue Loop
Product/service concept focused on:
- real customer
- real payment
- verified fulfillment
- evidence
- audit record

### Commerce Catalog OS
Structured catalog/product infrastructure.

### Automation Template Vault
Reusable automation products/templates.

### Developer Command Packs
Packaged developer commands/workflows.

### Enterprise Blueprint Library
Enterprise implementation blueprints.

## Governance / Identity

### Legal Nexus
Governance, policy, approvals, evidence, lifecycle controls.

### Identity Nexus
Identity, authentication/authorization, roles, access, ownership, and trusted user workflows.

## Web3

### MetaMello Wallet
Non-custodial wallet-connected Web3 application interface.

Required behavior:
- connect EIP-1193 browser wallet
- read account
- read chain
- read balance
- request ownership signature
- prepare/simulate transactions
- explicit user wallet confirmation
- broadcast only through external wallet
- track transaction receipt/evidence

### Web3 Application Engineering
Wallet-connected application development.

### Web3 Read-Only Integration Sprint
A legitimate product/service for read-only wallet/chain integration where appropriate.

## Interactive Entertainment

### Path of Melodie: Maakara Protocols
Melodiespark interactive entertainment/game universe.

## Workflow / Research

### Matrix Quantum Fractal Engine
Workflow-engine/product name. Never make literal “unlimited compute” claims.

### Karma / MA Token / Rewards
Research/product-readiness layer.
Keep reputation/Karma separate from financial treasury.
Do not present token minting or rewards as live unless independently verified.

## Professional Services

- AI & Agent Systems
- AI Automation Services
- Web Application Engineering
- Platform Engineering
- Revenue Operations Implementation
- Deployment Services
- Governance Services
- Analytics Command Dashboard
- Web3 Application Engineering
- Integration Services
- Enterprise Architecture / Blueprint Services

---

# 6. CATALOG MASTER-SCHEMA REQUIREMENTS

Every sellable product/service should ultimately support structured fields for:

## Core
- internal product id
- SKU
- name
- short description
- long description
- category
- subcategory
- brand
- status
- version
- tags
- features
- deliverables
- requirements
- support terms
- licensing terms

## Shopify mapping
- product
- variant
- collection
- handle
- metafields
- SEO title
- SEO description
- images
- pricing
- availability

## Stripe mapping
- Stripe Product ID
- Stripe Price ID
- optional Payment Link
- lookup key
- one-time or recurring
- currency
- unit amount
- tax behavior
- tax code
- marketing features
- images
- metadata
- livemode/testmode
- verification status

## GA4 ecommerce
Support:
- `view_item_list`
- `select_item`
- `view_item`
- `add_to_cart`
- `view_cart`
- `begin_checkout`
- `add_payment_info`
- `purchase`
- `refund`

Important item fields:
- item_id/SKU
- item_name
- brand
- categories
- variant
- price
- quantity
- coupon

Transaction fields:
- transaction_id
- currency
- value
- tax
- shipping

## Google Product / Offer structured data
Where relevant:
- name
- image
- description
- SKU
- MPN
- GTIN
- brand
- offer URL
- price
- currency
- availability
- condition
- shipping
- return data

## Governance / evidence
- evidence status
- product approval status
- checkout verification status
- fulfillment verification
- release gate
- evidence references
- timestamps
- hashes
- responsible owner

---

# 7. WEBSITE / WEB3 RELEASE PROJECT

Current website project:

```text
D:\MelodieCLII\Websites\melodiespark-inc
```

Generated structure includes:

```text
melodiespark-inc
├── site
│   ├── index.html
│   ├── 404.html
│   ├── assets
│   │   ├── css
│   │   │   └── main.css
│   │   └── js
│   │       └── app.js
│   ├── data
│   │   └── catalog.json
│   ├── legal
│   │   ├── privacy.html
│   │   └── terms.html
│   ├── robots.txt
│   └── sitemap.xml
├── dist
├── evidence
├── release
├── firebase.json
├── netlify.toml
├── vercel.json
├── staticwebapp.config.json
├── wrangler.jsonc
├── .env.example
└── .gitignore
```

The generated application includes:
- corporate landing page
- product catalog
- services catalog
- platform overview
- developer section
- Web3 portal
- wallet connect
- chain detection
- native balance
- ownership proof signing
- user-authorized EVM transaction request
- SEO
- OpenGraph
- canonical URL
- Schema.org Organization
- sitemap
- robots
- legal placeholders
- responsive design
- deployment provider configs
- SHA-256 release evidence

---

# 8. IMPORTANT WEBSITE BUG ALREADY DISCOVERED

The original generated site used root-relative asset paths:

```text
/assets/css/main.css
/assets/js/app.js
/data/catalog.json
```

When opened directly as:

```text
file:///D:/MelodieCLII/Websites/melodiespark-inc/dist/index.html
```

the page rendered as raw unstyled HTML.

The factory was corrected to use relative paths such as:

```text
./assets/css/main.css
./assets/js/app.js
./data/catalog.json
./legal/privacy.html
./legal/terms.html
```

For reliable dynamic testing, serve the `dist` folder over HTTP:

```powershell
cd D:\MelodieCLII\Websites\melodiespark-inc\dist
python -m http.server 8080
```

Then test:

```text
http://localhost:8080
```

Do not diagnose the raw HTML screenshot as a CSS design failure; it was an asset URL resolution issue.

---

# 9. WEBSITE FACTORY BUGS ALREADY FIXED

## PowerShell parser bug
Bad:

```powershell
throw "Command failed with exit code $code: $pretty"
```

Correct:

```powershell
throw "Command failed with exit code ${code}: $pretty"
```

Reason: PowerShell interprets `$code:` as an invalid variable reference.

## Secret scanner false positive
The original scanner rejected the phrase:

```text
seed phrase
```

even when the site said:

```text
never asks for a seed phrase
```

The scanner must detect **secret-shaped values**, not harmless security documentation.

Scan for:
- PEM private keys
- actual Stripe live keys
- actual assigned provider tokens
- actual assigned private keys
- likely 12/24-word mnemonic values

Do not block ordinary explanatory text.

---

# 10. CURRENT VERIFIED LOCAL RELEASE STATE

The current website factory has achieved:

```text
Build             VERIFIED
StaticValidation  VERIFIED
```

The build created real static output and validated required files.

Previous dry-run state correctly left remote infrastructure unverified:

```text
CloudflareWorkers UNVERIFIED
CloudflarePages   UNVERIFIED
GitHubPages       UNVERIFIED
Netlify           UNVERIFIED
Firebase          UNVERIFIED
AzureSWA          UNVERIFIED
Vercel            UNVERIFIED
CustomDomain      UNVERIFIED
```

Do not mark these VERIFIED until an actual remote deployment and validation succeeds.

---

# 11. GIT STATE

Repository:

```text
D:\MelodieCLII\Websites\melodiespark-inc
```

Initial commit was created and later amended.

Observed current commit from the latest user log:

```text
0958ff10f0e8b49008077c11f7db3d938c6411f5
```

Subject:

```text
release: Melodiespark Inc web platform
```

**Critical issue:** the commit author email was still literally:

```text
YOUR-ACTUAL-GITHUB-EMAIL
```

OpenCode must not push that commit publicly until the Git identity is corrected and the commit is amended again.

Preferred safe approach:

```powershell
$GhUser = gh api user | ConvertFrom-Json
$GitEmail = "$($GhUser.id)+$($GhUser.login)@users.noreply.github.com"

git config --global user.name "Maxime Aube"
git config --global user.email "$GitEmail"

git commit --amend --reset-author --no-edit
git log -1 --format="Commit: %H%nAuthor: %an <%ae>%nDate: %ad%nSubject: %s"
```

Only continue when the author email is no longer a placeholder.

---

# 12. STRIPE STATE

Stripe CLI installation was previously repaired.

Known working state from recent terminal evidence:
- Stripe CLI installed
- version observed: `1.50.10`
- `stripe version` worked
- `stripe login` completed
- CLI was authorized to the Melodiespark Inc. live Stripe context

Important rules:
- Never expose Stripe keys.
- Do not copy CLI auth material into the repository.
- Do not create fake purchases to claim revenue.
- Test mode/sandbox is acceptable for integration testing, but must be labelled test.
- Live payment success is VERIFIED only when a real live payment exists and is independently reconciled.
- Checkout links must only appear when a real public payment link/checkout URL is configured.
- Payment → entitlement → delivery → evidence → reconciliation should be the real flow.

---

# 13. WEB3 NETWORK STATE

A backend endpoint was observed responding at:

```text
http://127.0.0.1:5174/api/web3/networks
```

Observed networks included:

```text
Ethereum           chainId 1
Sepolia            chainId 11155111
Base Sepolia       chainId 84532
Arbitrum Sepolia   chainId 421614
Optimism Sepolia   chainId 11155420
```

At the time of observation, all returned:

```text
configured = False
```

Therefore:
- network enumeration is working
- real RPC configuration remains UNVERIFIED/BLOCKED
- do not claim chain integration is production-ready until RPC health checks succeed

Known broader target networks may include:
- Ethereum
- Sepolia
- Base Sepolia
- Arbitrum Sepolia
- Optimism Sepolia
- Polygon Amoy
- zkSync Sepolia

Always verify actual runtime config instead of assuming.

---

# 14. METAMELLO / WEB3 SECURITY MODEL

The front end may:
- connect wallet
- read accounts
- read chain ID
- read balance
- request a signature
- estimate/simulate
- request a wallet transaction
- watch transaction status

The front end must not:
- capture seed phrase
- capture private key
- silently broadcast
- auto-transfer funds
- auto-withdraw
- auto-sign
- pretend a transaction succeeded before receipt confirmation

Use an explicit state machine:

```text
DRAFT
→ SIMULATED
→ PENDING_APPROVAL
→ WALLET_CONFIRMATION
→ BROADCAST
→ PENDING_RECEIPT
→ CONFIRMED
```

Failure paths:

```text
USER_REJECTED
RPC_FAILED
SIMULATION_FAILED
BROADCAST_FAILED
REVERTED
TIMEOUT
```

Store evidence:
- chain ID
- from
- to
- value
- gas estimate
- tx hash
- receipt block
- status
- timestamps

Never store secrets.

---

# 15. PRIMARY DEPLOYMENT STRATEGY

Preferred current production topology:

```text
Git repository
      ↓
PowerShell release factory
      ↓
Cloudflare Workers
      ↓
melodiespark.com
```

Secondary provider adapters remain useful for mirrors/previews:
- Cloudflare Pages
- GitHub Pages
- Netlify
- Firebase Hosting
- Azure Static Web Apps
- Vercel

Do not point one apex domain simultaneously at unrelated providers.

Preferred domain structure:

```text
melodiespark.com
www.melodiespark.com

app.melodiespark.com
api.melodiespark.com
docs.melodiespark.com
developers.melodiespark.com
store.melodiespark.com
phoenix.melodiespark.com
botrevenue.melodiespark.com
metamello.melodiespark.com
game.melodiespark.com
```

The apex production origin should remain deliberate and singular.

---

# 16. CLOUDFLARE RELEASE FLOW

Before applying production changes:

```powershell
cd D:\MelodieCLII\Websites\melodiespark-inc

npx --yes wrangler login
npx --yes wrangler whoami
```

Validate:
- correct account
- expected project
- `wrangler.jsonc`
- `dist` directory exists
- no secrets embedded
- domain zone exists and is controlled by the user

Test a real deployment:

```powershell
npx --yes wrangler deploy
```

Then validate:
- generated deployment URL responds
- CSS loads
- JS loads
- catalog JSON loads
- legal routes load
- wallet UI loads
- browser console has no critical errors

Only then run the factory with `-Apply`.

Example:

```powershell
cd D:\MelodieCLII\Platforms

.\MELODIESPARK-AZ-WEB-RELEASE.ps1 `
    -Domain "melodiespark.com" `
    -PrimaryProvider CloudflareWorkers `
    -DeployTargets CloudflareWorkers `
    -Apply
```

Expected verified gates only after actual success:

```text
Build              VERIFIED
StaticValidation   VERIFIED
Git                VERIFIED
CloudflareWorkers  VERIFIED
CustomDomain       VERIFIED
```

---

# 17. GITHUB RELEASE FLOW

First verify authentication:

```powershell
gh auth status
```

Resolve the authenticated user:

```powershell
$GhUser = gh api user | ConvertFrom-Json
$Repo   = "$($GhUser.login)/melodiespark-inc"
```

Before creating/pushing:
- fix placeholder Git email
- run secret scan
- inspect `.gitignore`
- ensure no `.env`
- ensure no wallet secrets
- ensure no Stripe secrets

Then:

```powershell
gh repo view $Repo 2>$null

if ($LASTEXITCODE -ne 0) {
    gh repo create $Repo `
        --public `
        --source=. `
        --remote=origin `
        --push
}
else {
    if (-not (git remote get-url origin 2>$null)) {
        git remote add origin "https://github.com/$Repo.git"
    }
    git push -u origin main
}
```

Do not blindly force-push.

---

# 18. MONOREPO DIRECTION

Long-term canonical shape should converge toward:

```text
melodiespark/
├── apps/
│   ├── web/
│   ├── command-center/
│   ├── botrevenue/
│   ├── metamello/
│   ├── phoenix-studio/
│   ├── docs/
│   └── cli/
├── packages/
│   ├── ui/
│   ├── shared/
│   ├── config/
│   ├── auth/
│   ├── evidence/
│   ├── catalog/
│   ├── payments/
│   ├── web3/
│   ├── analytics/
│   └── sdk/
├── services/
│   ├── phoenix/
│   ├── llm-gateway/
│   ├── botrevenue/
│   ├── identity/
│   ├── legal/
│   ├── payments/
│   ├── entitlement/
│   └── evidence/
├── engines/
│   ├── ALPHA/
│   ├── BETA/
│   ├── GAMMA/
│   ├── DELTA/
│   ├── THETA/
│   ├── BRAVO/
│   ├── OMEGA/
│   └── APEX/
├── database/
├── infra/
├── docs/
├── scripts/
├── installers/
├── tests/
└── evidence/
```

Preferred tools:
- pnpm
- Turbo
- TypeScript
- Next.js / React where appropriate
- NestJS/Fastify/Express where appropriate
- PostgreSQL
- Redis
- NATS
- Temporal where useful
- pgvector
- Docker
- GitHub Actions

Do not rewrite working pieces merely to fit this structure. Migrate deliberately.

---

# 19. BOTREVENUE TARGET MODEL

BotRevenue is not “an autonomous money bot.”

It is a governed revenue operations system.

Pipeline:

```text
CONSENTED LEAD
→ QUALIFICATION
→ OFFER
→ CHECKOUT
→ PAYMENT EVENT
→ PAYMENT VERIFICATION
→ ENTITLEMENT
→ FULFILLMENT
→ DELIVERY
→ CUSTOMER RESULT
→ EVIDENCE
→ RECONCILIATION
→ REVENUE ANALYTICS
```

Agents may:
- research
- read
- classify
- reconcile
- draft
- propose
- generate reports
- prepare actions

Sensitive actions require human approval:
- sending messages where approval policy requires it
- spending
- refunds
- payouts
- withdrawals
- contract signing
- publishing
- production release
- treasury movement

---

# 20. EVIDENCE MODEL

Every important gate should emit a machine-readable evidence object.

Example:

```json
{
  "gate": "cloudflare-worker-deployment",
  "status": "VERIFIED",
  "timestamp": "2026-09-09T00:00:00Z",
  "command": "npx wrangler deploy",
  "exitCode": 0,
  "artifacts": [],
  "checks": [
    {
      "name": "homepage-http-200",
      "status": "VERIFIED"
    }
  ],
  "sha256": {},
  "notes": []
}
```

A release manifest should include:
- release ID
- timestamp
- git SHA
- branch
- dirty/clean status
- build status
- test status
- security scan
- artifacts
- SHA-256 hashes
- target provider
- deployment URL
- custom domain
- HTTP verification
- SSL verification
- Web3 verification
- payment verification
- legal review status

---

# 21. RELEASE GATES

## Gate A — Repository
- correct workspace
- correct branch
- clean/understood Git status
- valid Git identity
- no placeholder email
- no secrets

## Gate B — Build
- build completes
- dist exists
- required assets exist
- hashes generated

## Gate C — Static runtime
- HTTP local server
- index loads
- CSS loads
- JS loads
- catalog loads
- mobile layout works
- no critical console error

## Gate D — Web3
- wallet provider detection
- connect flow
- chain ID
- balance
- ownership signature
- transaction simulation
- user confirmation
- receipt tracking
- no secret capture

## Gate E — Stripe
- CLI/auth context
- catalog mapping
- real Product/Price IDs where configured
- webhook endpoint
- test verification
- live verification separately
- reconciliation

## Gate F — GitHub
- repository exists
- commit pushed
- remote verified
- workflow state known

## Gate G — Cloudflare
- login
- project deploy
- worker URL healthy
- custom domain attached
- DNS active
- TLS active

## Gate H — SEO
- title
- description
- canonical
- robots
- sitemap
- structured data
- social metadata

## Gate I — Legal
- privacy text reviewed
- terms reviewed
- Web3 disclosure reviewed
- refund/fulfillment terms reviewed where applicable

## Gate J — Golden Path
- real customer
- real payment
- real fulfillment
- evidence
- reconciliation

Golden Path remains `UNVERIFIED` until all required real-world steps occur.

---

# 22. CURRENT PRIORITY ORDER FOR OPENCODE

## P0 — Protect and inspect
1. Discover filesystem.
2. Confirm actual canonical paths.
3. Run `git status`.
4. Verify `.gitignore`.
5. Verify no secrets.
6. Verify Git identity is not a placeholder.
7. Do not delete or overwrite user work.

## P0 — Website runtime
1. Regenerate with the latest factory.
2. Serve `dist` via HTTP.
3. Verify CSS, JS, catalog.
4. Fix all browser console errors.
5. Verify responsive layout.

## P0 — Git
1. Correct commit identity.
2. Amend commit.
3. Verify SHA.
4. Push only after secret scan.

## P0 — Cloudflare
1. `wrangler whoami`
2. inspect config
3. first real worker deployment
4. HTTP verification
5. domain attachment
6. SSL verification

## P0 — Web3
1. locate backend serving `/api/web3/networks`
2. determine config source
3. configure approved RPC endpoints without exposing credentials
4. health-check networks
5. first Sepolia smoke test
6. verify EIP-1193 front end
7. evidence transaction lifecycle

## P0 — Stripe
1. verify CLI context without leaking credentials
2. inventory real products/prices/payment links
3. map catalog
4. wire public checkout links
5. webhook verification
6. keep test and live evidence separate

## P1
- GitHub Actions
- deployment evidence automation
- GA4 event wiring
- Google Product/Offer schema
- complete product/service pages
- docs site
- developer portal
- API endpoint documentation

## P2
- monorepo convergence
- shared SDK
- identity/RBAC
- Legal Nexus gates
- observability
- Temporal/NATS workflows
- BotRevenue workflow expansion

## P3
- Karma/MA research
- advanced rewards
- experimental orchestration
- noncritical visual enhancements

---

# 23. OPENCODE OPERATING INSTRUCTIONS

OpenCode should behave as an implementation agent, not a storyteller.

For every task:

```text
DISCOVER
→ INSPECT
→ PLAN
→ BACK UP WHEN NEEDED
→ IMPLEMENT
→ FORMAT/LINT
→ BUILD
→ TEST
→ SECURITY CHECK
→ RUNTIME CHECK
→ EVIDENCE
→ REPORT
```

Rules:
- Do not claim a file exists before checking.
- Do not claim a command succeeds before running it.
- Do not claim a deployment is live before HTTP validation.
- Do not claim DNS is correct before resolving it.
- Do not claim SSL is valid before testing HTTPS.
- Do not claim Web3 is configured before RPC health checks.
- Do not claim Stripe is integrated because CLI login works.
- Do not claim revenue because test payments work.
- Do not claim legal compliance from template text.

When blocked:
- state the exact blocker
- state what was verified
- state what remains unverified
- give the minimal unblock command/action

---

# 24. REQUIRED FIRST COMMANDS FOR OPENCODE

Run read-only discovery first:

```powershell
$ErrorActionPreference = "Stop"

Write-Host "=== MELODIESPARK DISCOVERY ===" -ForegroundColor Cyan

$Roots = @(
    "D:\MelodieCLII",
    "D:\MelodieCLII\Platforms",
    "D:\MelodieCLII\Websites\melodiespark-inc"
)

foreach ($Root in $Roots) {
    Write-Host "`n[$Root]" -ForegroundColor Yellow
    if (Test-Path $Root) {
        Get-Item $Root | Select-Object FullName,LastWriteTime
    } else {
        Write-Host "MISSING" -ForegroundColor Red
    }
}

Write-Host "`n=== TOOLCHAIN ===" -ForegroundColor Cyan

$Commands = @(
    "pwsh","git","gh","node","npm","npx","pnpm","python","stripe"
)

foreach ($Command in $Commands) {
    $Resolved = Get-Command $Command -ErrorAction SilentlyContinue
    [pscustomobject]@{
        Command = $Command
        Available = [bool]$Resolved
        Path = if ($Resolved) { $Resolved.Source } else { $null }
    }
} | Format-Table -AutoSize

Write-Host "`n=== WEBSITE GIT ===" -ForegroundColor Cyan
$Web = "D:\MelodieCLII\Websites\melodiespark-inc"

if (Test-Path "$Web\.git") {
    git -C $Web status
    git -C $Web log -1 --format="Commit: %H%nAuthor: %an <%ae>%nSubject: %s"
    git -C $Web remote -v
}
```

Do not mutate anything until discovery results are understood.

---

# 25. WEBSITE VALIDATION COMMANDS

Serve the site:

```powershell
cd D:\MelodieCLII\Websites\melodiespark-inc\dist
python -m http.server 8080
```

In another terminal:

```powershell
Invoke-WebRequest http://127.0.0.1:8080/ -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8080/assets/css/main.css -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8080/assets/js/app.js -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8080/data/catalog.json -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8080/legal/privacy.html -UseBasicParsing
Invoke-WebRequest http://127.0.0.1:8080/legal/terms.html -UseBasicParsing
```

Expected:
- HTTP success
- CSS MIME type reasonable
- JS loads
- JSON parses
- no broken relative links

---

# 26. SECRET-SCAN PRINCIPLE

Do not use simplistic keyword scans that reject safe sentences.

Bad logic:

```text
if file contains "seed phrase" => fail
```

Good logic:
- detect actual secret assignments
- detect key formats
- detect long credential-shaped values
- detect PEM blocks
- detect live payment keys
- detect known token formats
- permit documentation such as “never share your seed phrase”

Never output the matching secret value in logs.

---

# 27. LOCAL / TEST / LIVE ENVIRONMENT SEPARATION

Maintain explicit environment fields:

```text
local
development
test
sandbox
staging
production
```

Stripe:
```text
testmode
livemode
```

Web3:
```text
testnet
mainnet
```

Do not let testnet or Stripe test-mode evidence satisfy production gates.

---

# 28. DOMAIN / DNS MODEL

A “real domain” means the user owns/controls the domain registration/DNS.

PowerShell cannot create legal ownership of an unregistered domain by itself.

For `melodiespark.com`:
- confirm ownership/control
- confirm DNS provider
- confirm Cloudflare zone status if using Cloudflare
- attach Worker custom domain
- verify A/AAAA/CNAME/Worker route as appropriate
- verify HTTPS
- verify redirect behavior
- verify `www`
- verify canonical URLs
- verify sitemap URLs

Never mark `CustomDomain VERIFIED` merely because `wrangler.jsonc` contains the domain string.

---

# 29. QUALITY TARGETS

Website:
- no horizontal overflow
- responsive
- keyboard usable
- semantic HTML
- accessible labels
- visible focus states
- reasonable contrast
- no critical browser errors
- no mixed content
- no dead links

Performance:
- compressed assets where supported
- cache immutable assets
- avoid oversized JS
- avoid unnecessary dependencies
- responsive images
- lazy-load noncritical media

Security:
- CSP when architecture allows
- `X-Content-Type-Options`
- Referrer Policy
- restrictive Permissions Policy
- no secrets client-side
- no unsafe wallet assumptions

SEO:
- canonical
- metadata
- sitemap
- robots
- Organization structured data
- Product/Offer data where truthful and complete

---

# 30. DEFINITION OF DONE FOR CURRENT WEB RELEASE

The current website release is “production complete” only when all applicable gates are evidence-backed:

```text
Repository          VERIFIED
Build               VERIFIED
StaticValidation    VERIFIED
RuntimeSmoke        VERIFIED
SecretScan          VERIFIED
Git                 VERIFIED
GitHub              VERIFIED or intentionally NOT_REQUIRED
CloudflareWorkers   VERIFIED
CustomDomain        VERIFIED
TLS                 VERIFIED
SEO                 VERIFIED
Web3Read            VERIFIED
Web3Sign            VERIFIED
Web3Tx              VERIFIED when explicitly tested
StripeCatalog       VERIFIED
StripeCheckout      VERIFIED
StripeWebhook       VERIFIED
LegalReview         VERIFIED
GoldenPath          VERIFIED only after real customer/payment/delivery/evidence
```

Anything else must remain accurately labelled.

---

# 31. OPEN ITEMS / KNOWN BLOCKERS

At handoff time, OpenCode should assume these remain unresolved until rechecked:

1. Git email may still be a placeholder.
2. GitHub remote/push may not yet be completed.
3. Cloudflare authentication may not yet be completed.
4. Cloudflare Worker deployment may not yet be completed.
5. `melodiespark.com` custom-domain verification may not yet be completed.
6. TLS verification may not yet be completed.
7. Web3 RPC networks were listed but not configured in the latest observed backend output.
8. Stripe CLI login works, but website checkout integration still requires product/link mapping and verification.
9. Privacy/Terms pages are placeholders pending real legal review.
10. Golden Path remains unverified until a real customer/payment/fulfillment/evidence sequence is completed.

Re-check each item; do not inherit status blindly.

---

# 32. FIRST OPENCODE MISSION

Execute this exact mission:

> Continue the Melodiespark Inc. website/Web3 production release from `D:\MelodieCLII`. First inspect the filesystem, Git repository, current release factory, generated `site` and `dist`, provider configs, and evidence. Do not overwrite `.env` or expose credentials. Correct the Git identity if it still contains a placeholder, validate the site through a local HTTP server, run a value-aware secret scan, validate the Web3 frontend and `/api/web3/networks` backend configuration, inspect Stripe catalog/checkout integration without exposing credentials, verify Cloudflare authentication, deploy the Worker only when safe, verify the deployment URL, attach `melodiespark.com` only after confirming domain control, verify HTTPS, and generate evidence for every gate. Preserve VERIFIED/UNVERIFIED/BLOCKED status discipline. Never invent revenue, transactions, customers, production success, or legal approval.

---

# 33. AUTONOMOUS EXECUTION CONTRACT

OpenCode is authorized to:
- inspect files
- search code
- run tests
- run local servers
- edit source code
- create non-secret configuration
- fix build/runtime defects
- generate documentation
- create evidence
- stage/commit code after validation
- prepare deployment commands

OpenCode must request explicit user approval before:
- spending money
- buying a domain
- changing paid plans
- sending/publishing external communications when not already authorized
- signing agreements
- moving treasury funds
- transferring crypto
- withdrawing/paying out funds
- exposing a production service if user approval is required by the current release policy
- destructive deletion of valuable source/data

---

# 34. FINAL REPORT FORMAT FOR OPENCODE

At the end of each major run, output:

```text
MELODIESPARK RELEASE REPORT

Workspace:
Git SHA:
Branch:

VERIFIED
- ...

UNVERIFIED
- ...

BLOCKED
- ...

CHANGED
- file/path
- file/path

TESTS
- command → result

SECURITY
- secret scan
- dependency scan
- wallet/security checks

DEPLOYMENT
- provider
- URL
- custom domain
- TLS

WEB3
- provider
- account detection
- chain
- RPC
- signing
- transaction

STRIPE
- CLI context
- catalog
- checkout
- webhook
- reconciliation

EVIDENCE
- manifest path
- hashes
- timestamps

NEXT
1. ...
2. ...
3. ...
```

---

# 35. GOLDEN RULE

**Build real things, prove what actually works, and never convert an assumption into a VERIFIED production claim.**

