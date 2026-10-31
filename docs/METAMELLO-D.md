# MetaMello-D — architecture, security and deployment report

**State: DRAFT / PENDING_APPROVAL.** This is a reviewable first application slice, not production readiness.

## Architecture and implemented feature inventory

- **Preserved:** Typer/Rich platform and BotRevenue CLIs, registry, local process probes, JSONL reader, evidence writer, automation policy and existing tests. Installed wheel now includes platform registry data.
- **COMPLETED:** FastAPI same-origin JSON API; static responsive dark/light command center; SQLite schema migration; empty-by-default operational records for products/services, customers, agents, work orders, integrations and governance cases; server-side sessions; admin/viewer authorization; CSRF protection; account login lockout; admin-only team provisioning; append-only hash-linked audit trail; network page using actual local TCP probes; timestamped status and integrity pages.
- **UNVERIFIED:** business records are staff-entered operational drafts, *not* validated product publication, agent execution, customer identity or legal adjudication. Local TCP reachability is not authenticated API availability. Legacy JSONL reader can count self-declared `VERIFIED` events; the web app intentionally does **not** use it as confirmed revenue.
- **BLOCKED:** MCP gateway/provider routing, external API synchronization, reputation/brand monitoring, billing subscriptions, provider-backed reconciliation, sales workflows and real verified-payment ingestion require independent design, credentials, permissions and callback validation. Desktop packaging is DRAFT; the web API is the intended future shared backend. No chart is drawn without meaningful time-series data.
- **DISABLED:** Interac e-Transfer and all financial execution: no transfer, payout, swap, staking, token issuance, mainnet operation or payment confirmation endpoint exists.

### Runtime data flow

`browser (same origin) → FastAPI validation/session/role/CSRF → SQLite records + audit event in one transaction`. Local health diagnostics call fixed loopback TCP endpoints defined in the pre-existing `providers/services.py`; users cannot supply arbitrary probe URLs. No background jobs, external AI calls or fake metrics are started. UI metrics are counts of real local records, with checked timestamps. Financial figures are `null` (unavailable), not invented zeroes.

## Database schema / migrations

`src/melodie_platforms/web/migrations/001_initial.sql` uses `PRAGMA user_version=1` and creates:

| Table | Purpose and constraints |
|---|---|
| `users` | Unique case-insensitive email, scrypt password hash, role CHECK (`admin`, `viewer`) |
| `sessions` | SHA-256 token hashes, user FK, CSRF secret, expiry index |
| `login_attempts` | Per-email failures and 15-minute lockout after five failures |
| `records` | Kind and status CHECK lists, title/description length checks, creator FK and kind index |
| `audit_events` | Canonical JSON payload, previous and current SHA-256 hashes; UPDATE/DELETE triggers abort |

The migration runs at app startup and bootstrap, rejects newer schema versions and is wrapped in an immediate transaction. Write operations append audit events in the same transaction. There is no delete API for records. SQLite is single-instance here: do not run multi-node writers; take protected offsite backups. DB superusers or disk admins can replace the entire file; hash linking is **tamper-evident within the database trust boundary**, not cryptographic immutability against an infrastructure administrator. External anchoring is a future requirement.

## Security assessment

**Implemented:** scrypt salted passwords; random session identifiers with only hashes stored in DB; HttpOnly, SameSite=Strict cookies (Secure by default); eight-hour sessions, logout revocation, CSRF tokens on writes and logout; same-host Origin check for browser mutations; read-only viewer role; input validation and DB CHECK constraints; no permissive CORS; no arbitrary URLs; CSP, no-sniff, no-referrer and frame denial by default; basic JSON request logging without request bodies; explicit policy flags `payments_automatic=false`, `wallet_automatic_broadcast=false`, `evidence_required=true`, `production_release_requires_approval=true`, `secrets_in_source=false`.

**Remaining risk / release gates:** Bootstrap is a one-time environment-only action with no built-in password reset, email invitation or MFA. Admins can create viewer/admin users from PowerShield; initial passwords must be delivered via a secure channel. Lockout is email-based (an attacker could lock another user's account); add distributed IP/device throttling in a trusted ingress. A production ingress must enforce HTTPS, authentication monitoring, rate limits, backups, observability and disaster recovery. Avoid enabling `MMD_COOKIE_SECURE=false` except on local HTTP. `MMD_PREVIEW_EMBED=true` relaxes frame protection only for Arena live preview; never enable it on production. App data is not encrypted at rest by this code. Service availability uses TCP only. No penetration test, accessibility audit, load test, external callback verification or provider security review has been performed. No production-release approval has been granted.

## Deployment and operations

1. Use Python **3.11+**, persistent private disk, one app instance and a TLS-terminating reverse proxy. `pip install .` or install the built wheel. Do not mount a public SQLite directory.
2. Set `MMD_DB_PATH=/private/location/metamello.db` and provide `MMD_ADMIN_EMAIL` and a unique `MMD_ADMIN_PASSWORD` (14–256 chars) through a secret manager. Do not put secrets in source, images, logs or `.env.example`.
3. Run `python -m melodie_platforms.web.bootstrap` **once** before serving. It refuses to overwrite an existing user. Remove `MMD_ADMIN_PASSWORD` from the serving process environment afterward. Schema migration also runs on server startup.
4. Serve `uvicorn melodie_platforms.web.app:app --host 127.0.0.1 --port 8000` behind HTTPS; for a container ingress, bind `0.0.0.0`. Keep `MMD_COOKIE_SECURE=true` (default). For localhost HTTP development only set `MMD_COOKIE_SECURE=false`. Keep `MMD_PREVIEW_EMBED=false` (default) outside Arena preview.
5. Log in with the bootstrap admin credentials. Provision additional accounts in PowerShield; share initial passwords securely. Use `/api/health` for a database liveness probe. Backup the DB with SQLite's backup API, verify restore, protect backup keys and run an external integrity check. Review audit integrity in Evidence Nexus. No deploy to production until separate approval.

## Verification evidence (2026-10-31)

- `pytest -q`: **8 passed**, one upstream Starlette/httpx deprecation warning. Four existing CLI tests plus four API integration tests (auth, CSRF, throttling, roles, empty database, validation, audit triggers, network and frontend assets).
- `ruff check src tests`: **passed**. `node --check src/melodie_platforms/web/static/app.js`: **passed**.
- `python -m build`: source distribution and wheel **built**; wheel contains migration, static assets and bundled CLI registry. Clean wheel install: `platforms version` returned `0.2.0`, `platforms list` loaded 21 bundled entries, and the web app imported. HTTP smoke: `/` and `/api/health` returned 200; unauthenticated `/api/overview` returned 401.
- Browser automation, visual screenshots, full WCAG audit and real integration tests: **BLOCKED / UNVERIFIED**; a live login-page preview is available from the Arena process. No demo account is provisioned.

## Review before expansion

Implement approved provider adapters with signed callback verification, idempotency and reconciliation; design typed relational commerce schemas and provider event constraints; implement user lifecycle and MFA; add browser E2E/a11y tests, continuous integration and deployment manifests; only then evaluate production release.
