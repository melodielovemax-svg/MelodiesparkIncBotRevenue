# MetaMello-D implementation plan (review baseline)

## Source inspection — 2026-10-31

The 35 tracked files form a Python `src/` package (Typer, Rich, Pydantic; Hatch build), with CLI commands, an automation policy registry, local tool/service probes, JSONL BotRevenue reader and evidence snapshots. Four pytest tests cover version, registry, policy and automation. No web server, database, authentication, frontend, migrations or deployed integrations exist. `docs/ARCHITECTURE-AZ.md`, `RELEASE.md` and `SECURITY.md` describe intent, not implemented services. The CLI and Git history must remain intact. The existing ledger counts self-described `VERIFIED` events without provider validation: it must never be treated as confirmed revenue in the new UI.

## Implementation sequence

1. Preserve CLI entry points; extend policy with explicit immutable safety flags.
2. Add a self-contained FastAPI + SQLite web slice: versioned migration, admin bootstrap, session auth + CSRF, role-based write permissions, constrained resource records, append-only hash-linked audit events, API validation and errors.
3. Deliver a responsive accessible command center that loads actual API data; draft catalog, CRM, agents, work orders, governance cases and integrations; live local network probes; disabled financial and unconfigured provider views. No sample business records or invented metrics.
4. Add backend integration and browser smoke tests; run existing tests, package build, lint and HTTP smoke. Record remaining gaps and deployment requirements.
5. Commit and push only `arena/d510effd-melodiesparkincbotrevenue`; open PR for review.

## Boundaries

No autonomous payments, transfers, swaps, staking, token issuance, mainnet operations or external model calls. Interac remains a disabled adapter contract. MCP/provider routing, reputation data, reconciliation, subscription billing, verified payments and desktop packaging require credentials, provider review and separate implementation. SQLite is a single-instance first deployment target, not a multi-node financial ledger. An append-only database trigger and hash chain are tamper-evident only within a trusted database boundary; backups and external anchoring are still needed.

## Verification criteria

Clean install on supported Python, migration and bootstrap, unauthenticated rejection, CSRF/role checks, input constraints, no fabricated business data, audit immutability, API/UI smoke, existing CLI tests and build. Production release remains PENDING_APPROVAL.
