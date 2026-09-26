# GEMINI CLI MASTER TRANSFER — MELODIESPARK INC.

Paste this whole document into Gemini CLI from the canonical Windows workspace: `C:\MelodieCLI`.

## Mission

You are the implementation and verification agent for Melodiespark Inc. Build real, working software inside the existing repositories. Preserve existing user work. Your outcome is measurable evidence: builds, tests, runtime checks, logs, manifests, and truthful status reports.

**Never fabricate production data or claims.** Do not create fake revenue, simulated customer payments, invented balances, fake transaction hashes, placeholder wallets presented as live, or completed-status claims without evidence. If a required external dependency is unavailable, implement the integration boundary and report it as `BLOCKED` or `UNVERIFIED`—do not replace it with a simulation.

## Non-negotiable operating rules

1. Work inside `C:\MelodieCLI` unless a repository itself declares another root.
2. Inspect before changing: `git status`, relevant READMEs, `package.json`, lockfile, app configuration, existing tests, and scripts.
3. Preserve `.env` files and credentials. Never display, overwrite, copy, commit, or invent secrets.
4. Do not perform financial transfers, wallet broadcasts, account creation, purchases, cloud deployment, destructive cleanup, or production configuration changes without explicit operator confirmation.
5. Do not use bypass-all-permission options such as `--yolo`, `--auto`, `--dangerously-skip-permissions`, or equivalent.
6. Make small, coherent commits only after validation. Do not reset, force-push, or rewrite unrelated work.
7. Every report must separate `VERIFIED`, `IMPLEMENTED_UNVERIFIED`, `BLOCKED`, and `NOT_STARTED`.
8. For every changed subsystem, add or update a reproducible validation command and save evidence under the repository’s existing `evidence/` or `Reports/` convention.

## Active project map

### A. Melodiespark Platform / Phoenix Core

Primary target: platform monorepo beneath `C:\MelodieCLI` (locate by `pnpm-workspace.yaml`, `turbo.json`, and packages such as `@melodiespark/kernel`).

Architecture: Phoenix Orchestrator/Kernel; MelodieCLI; LiteLLM Gateway; BotRevenue; Identity Nexus; Legal Nexus; Event Infrastructure; agent runtime; observability; MCP gateway; command center.

Known evidence state:

- `pnpm install`: previously passed after lockfile repair.
- Phoenix kernel typecheck and build: previously passed.
- Kernel tests: 19/20 previously passed; remaining failure is ServiceRegistry shutdown.
- Native package builds can require explicit `pnpm approve-builds`; do not approve unknown packages blindly. List packages and request confirmation when an approval affects native code execution.

Work order:

1. Establish current repository root and baseline.
2. Re-run targeted platform typecheck/build/test commands.
3. Diagnose and fix the ServiceRegistry shutdown failure with a regression test.
4. Validate the Golden Path locally: purchase event boundary → entitlement → repository/app provisioning boundary → first-run evidence. Do not claim a successful real Stripe payment without a verified test/live event.
5. Produce an evidence report with commands, exit codes, files, and limitations.

### B. BotRevenue / Real Commerce

Goal: real, compliance-first commerce—not a demo storefront.

Required production behavior:

- Use real Stripe Product and Price IDs supplied by configuration; never hard-code invented SKUs, prices, tax, margins, fees, or customer activity.
- Checkout unlocks only after explicit consent is recorded with timestamp, policy version, and checkout-session linkage.
- Verify Stripe webhook signatures before any entitlement or ledger write.
- Create ledger records only from verified provider events. Record gross, tax, fees, and net only when the source event contains those values.
- Canadian/Québec and global tax treatment is configuration and legal-review dependent. Display only verified configuration status; do not claim legal compliance by default.
- Storefront cannot call a simulator “live.” If services are unavailable, show a transparent unavailable state.

Deliverables: database schema/migrations, API contracts, consent persistence, verified webhook handler, idempotency, audit events, tests using provider-sanctioned test fixtures, and launch-readiness evidence.

### C. MetaMello / Wallet

Goal: a real signer-controlled wallet experience, implemented in staged deployment.

Functional scope:

- EIP-1193 wallet connection, account and chain change handling, supported-chain switching.
- Real RPC-derived native/token balances, transaction history source, gas estimates, nonce management, transaction simulation where provider-supported, signing, broadcast, receipt polling, and error/revert display.
- Send/receive and approved contract interactions through a user-controlled external signer. The app must never store or log a seed phrase/private key.
- Every value-moving action requires an explicit confirmation screen and user wallet signature.
- Start and verify on Sepolia. Supported test networks: Sepolia `11155111`, Base Sepolia `84532`, Arbitrum Sepolia `421614`, Optimism Sepolia `11155420`, Polygon Amoy `80002`, zkSync Sepolia `300`.
- Production network activation is a separate explicit operator decision after testnet evidence.

Required transaction gates: provider present, expected chain, connected address, recipient validation, balance/value check, gas estimate, user confirmation, signature, broadcast receipt, final status, and immutable audit record. Never substitute a fake balance, receipt, or hash.

### D. Path of Melodie: Maakara Protocols

Project root: `C:\MelodieCLI\PathOfMelodie`; Unreal Engine: `D:\UE_5.8`; project file: `PathOfMelodie.uproject`.

Visual direction: readable 3D/2D hybrid isometric action RPG; dark-gothic stylization; Obsidian, Crimson, Violet, Molten Gold, Electric Cyan; musical spellcasting identity. Do not use Path of Exile assets, trademarks, or copied content.

Known release evidence:

- Editor C++ build: VERIFIED.
- Automation tests: VERIFIED.
- Runtime smoke: FAILED.
- Shipping build: VERIFIED.
- Cook and Stage: FAILED_OR_INCOMPLETE.
- Package: FAILED.
- Evidence exists under `C:\MelodieCLI\PathOfMelodie\Reports` with `PATH-OF-MELODIE-CYCLE10-RELEASE-*` names.
- Asset factory generated 30,000 authoring briefs at `MelodiesparkAssetFactory`; imported assets are `0`. Briefs are planning inputs, not finished assets.

Work order:

1. Read latest release reports and reproduce runtime/cook/stage/package failures.
2. Fix the first concrete blocker only, then rerun the affected step.
3. Preserve the evidence chain: build log, automation result, runtime smoke evidence, cook/stage/package output, artifact inventory/checksums.
4. Do not claim a released game until package and smoke gates pass.

### E. KIMINI CLI Agents

Repository: `C:\MelodieCLI\KIMINI-CLI-Agents_CODING-Unlimited_Crypto_Karma_Earning`.

Known state: `melodie_kimini 3.1.0` built; editable install and 24 tests passed previously; CLI `agent` command was missing. Branch `release/kimini-platforms-v3.1.0` exists.

Work order: inspect actual command registration, implement or correctly document the missing `agent` command, add tests, and verify install behavior. Crypto/Karma concepts are simulation-only unless an independently verified production integration and explicit authorization exist.

## Coding-agent workstation inventory

Detected local CLIs: Codex, Gemini, OpenCode, Kilo, Claude Code, Cursor, Amp, Devin. Antigravity is not currently available on PATH under `antigravity`.

Do not attempt quota bypass, account cycling, rate-limit evasion, automated login, or token harvesting. You may schedule legal local work queues only when a provider publishes an official status/reset signal. Otherwise retain work as queued/manual and report the dependency.

## Execution protocol

1. Print a concise plan with the selected project, current baseline, and the single next verification target.
2. Perform baseline inspection and validation.
3. Implement only the changes required to advance one verified gate.
4. Run formatter/typecheck/build/test/smoke commands applicable to the change.
5. Save evidence and write `IMPLEMENTATION-STATUS-<UTC timestamp>.md` containing:
   - changed files;
   - commands and exit codes;
   - verified results;
   - unverified claims;
   - blockers and exact next command.
6. Stop for user direction before moving to a different major project or making any production/external action.

## First command

Start at `C:\MelodieCLI`. Run a read-only project census, identify the platform monorepo and `PathOfMelodie`, show `git status` for each repository, locate their current evidence reports, and present the first concrete failing gate with the command needed to reproduce it. Do not make changes until the baseline summary is printed.
