# MelodiesparkIncBotRevenue

## Melodiespark Inc. A-Z Platform CLI

Unified command infrastructure for:

- Melodiespark Platform CLI
- Melodie CLI discovery and routing
- BotRevenue Automation CLI
- coding-agent discovery
- npm / pnpm / npx
- Python / pip / pipx
- Ollama
- LiteLLM
- local service diagnostics
- workspace inventory
- evidence snapshots
- release auditing
- automation governance

## Install locally

    python -m pip install -e .

## Platform CLI

    platforms version
    platforms list
    platforms doctor
    platforms doctor --json
    platforms status
    platforms workspace
    platforms packages
    platforms services
    platforms botrevenue
    platforms automation
    platforms evidence

## BotRevenue CLI

    botrevenue status
    botrevenue evidence
    botrevenue golden-path
    botrevenue policy-show

## Coding Agent Routing

    platforms codex --help
    platforms claude --help
    platforms gemini --help
    platforms cline --help
    platforms opencode --help
    platforms kilo --help
    platforms devin --help
    platforms agy --help

## BotRevenue Golden Path

catalog -> checkout -> verified payment -> fulfillment -> entitlement -> evidence

Checkout creation is not revenue.

Production revenue remains UNVERIFIED unless supported by real evidence.

## Financial Safety

- treasury_broadcast = DISABLED
- server_private_keys = FALSE
- autonomous_spending = DISABLED
- autonomous_transfers = DISABLED
- autonomous_payouts = DISABLED
- human_approval_required = TRUE
- external_signer_required = TRUE

## Canonical Workspace

D:\MelodieCLII

## Evidence Taxonomy

- VERIFIED
- UNVERIFIED
- BLOCKED
- DRAFT
- PENDING_APPROVAL
- FAILED
- COMPLETED
- DISABLED
