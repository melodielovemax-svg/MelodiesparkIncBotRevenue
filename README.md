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

## MetaMello-D web command center (review build)

This repository now also includes a **database-backed web application**. It does not replace the CLI.
It starts with an empty database. Finance and external provider execution are disabled; no
customers, transactions or revenue are seeded. See [implementation plan](docs/IMPLEMENTATION-PLAN.md)
and [delivery and deployment guide](docs/METAMELLO-D.md) for architecture, boundaries and tests.

```bash
python3 -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
export MMD_DB_PATH=./var/metamello.db
export MMD_ADMIN_EMAIL=admin@example.com
export MMD_ADMIN_PASSWORD='use-a-unique-password-of-at-least-14-characters'
python -m melodie_platforms.web.bootstrap
unset MMD_ADMIN_PASSWORD
uvicorn melodie_platforms.web.app:app --host 127.0.0.1 --port 8000
```

Open http://127.0.0.1:8000. For **local HTTP only**, set `MMD_COOKIE_SECURE=false` before starting
Uvicorn; keep it `true` behind HTTPS. Do not commit credentials or the local database.
Run `pytest`, `ruff check src tests`, and `python -m build` before reviewing a release.
