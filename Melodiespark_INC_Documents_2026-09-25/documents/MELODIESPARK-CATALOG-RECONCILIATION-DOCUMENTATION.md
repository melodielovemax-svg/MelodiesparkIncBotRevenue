# Melodiespark Inc — Full Catalog Reconciliation

Generated: 2026-09-08

## Inventory recovered

- Historical catalog rows: **283**
- Unique stable handles/slugs: **254**
- Rows participating in duplicate-handle history: **57**
- Directly priced rows: **164**
- Contact Sales rows: **119**
- Source-reported Stripe baseline: **283 Products / 300 Prices**

The historical source is intentionally preserved row-for-row. Duplicate handles are not deleted from the documentation because they represent catalog history. Stripe reconciliation must deduplicate by stable handle/Product ID and treat distinct legitimate price configurations as multiple Prices rather than creating duplicate Products.

## Stripe reconciliation status

The current connected Melodiespark Inc live account was inspected before generating this package.

The canonical 100-item Product/Service import is already present in live Stripe with stable metadata such as:
- `melodiespark_handle`
- `sku`
- `offer_type`
- `category`
- `delivery_type`
- `source_status`

Draft offers remain inactive rather than being silently published. A spot verification of `Phoenix CLI Pro` confirmed its inactive live Product has an inactive CAD 99.00 one-time Price with lookup key `melodiespark_phoenix-cli-pro_cad_9900_once`.

**No duplicate Stripe Products were created during this reconciliation.**

## Pricing preservation

Pricing-model distribution:
- contact_sales: 119
- one_time: 38
- recurring: 126

Currencies:
- CAD: 136
- USD: 28

Recurring/other intervals:
- month: 92
- one-time/contact: 157
- year: 34

Rules:
1. Existing Stripe IDs and active/inactive state remain authoritative.
2. `Contact Sales` never receives an invented Price.
3. Draft/inactive catalog rows are not automatically published.
4. Price changes create/reconcile Stripe Price objects; historical orders are never rewritten.
5. Live checkout should only expose active Products with active real Prices that pass publishing gates.
6. Revenue is verified from Stripe payment evidence, not clicks or redirects.

## Generated files

- `MELODIESPARK-FULL-HISTORICAL-CATALOG-283.csv` — all 283 historical rows.
- `FREE-WEBSITE-BUILDERS-CLI-MATRIX-2026-09-08.csv` — current free/free-tier builder and deployment matrix.
- `MELODIESPARK-STRIPE-IDEMPOTENT-RECONCILE.ps1` — safe local reconciliation helper; dry-run by default.
