# Public site inventory

The project includes a safe scanner that performs one unauthenticated public `GET` per configured URL and inventories visible links. It does not attempt login, exploit testing, private endpoint discovery, credential testing, or high-rate crawling.

Run:

```powershell
node scripts/scan-public-sites.mjs
```

Reports are written to `reports/public-site-scan.json` and `reports/public-site-scan.md`.

## Initial public inventory

| URL | Initial result | Visible theme/routes |
|---|---|---|
| `app-scanner-plus--melodiesparkmax.replit.app` | 404 during initial check | unavailable at root |
| `melodie-spark-nexus.base44.app` | public page loaded | products, dashboard, apotheosis, karma, fortress, compliance, quantum, revenue, architecture pages |
| `melodiespark-ecosystem--demigodmelodeat.replit.app` | 404 during initial check | unavailable at root |
| `melodie-wealth-flow.base44.app` | public page loaded | guardians, portfolio, products, karma, settings, revenue, leaderboard, command, corporation, wallet, megagrid |
| `melodiespark.base44.app` | public page loaded | music creator overview, modules, matrix, analytics, ecosystem, production pages |
| `sparkmelodie.base44.app` | public page loaded | music/AI storefront, cart, checkout, orders, admin |
| `melodiesparkinc.base44.app` | public page loaded | dashboard, products, karma, wallet, guardians, system grid |
| `melodieinc.base44.app/revenue-hub` | public page loaded | revenue hub, guardians, portfolio, karma, products, wallet, architecture |
| `quantummelodie.base44.app/wallet` | public page loaded | wallet, security, revenue, leaderboard, Stripe, authorization pages |
| `revenue-sync-module--melodiesparkmax.replit.app` | 404 during initial check | unavailable at root |

## Consolidation findings

- Several applications expose overlapping concepts: revenue, guardians, Karma, products, wallet, and architecture.
- Public route presence does not prove that authentication, payment capture, webhook verification, or persistence works.
- The music storefront and the financial/operations dashboards should be separate bounded products with a shared identity/event contract, not one unbounded page collection.
- Use one source of truth for product IDs, order IDs, ledger event IDs, wallet bindings, and audit events.
- Do not attempt to “inject” code into third-party sites. Use documented APIs, OAuth, webhooks, and server-side adapters.
- A production consolidation needs authenticated testing in each application, data classification, migration plans, and rollback procedures.

## Missing evidence to collect during an authorized audit

- API schemas and authentication requirements.
- Webhook signatures and replay/idempotency behavior.
- Data retention and deletion workflows.
- Which environments contain real versus demo records.
- Whether any financial action is custodial, user-signed, or provider-executed.
- Deployment owner, incident contact, dependency inventory, and backup restore evidence.
