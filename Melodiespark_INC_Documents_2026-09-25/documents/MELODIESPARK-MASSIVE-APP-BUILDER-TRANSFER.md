
# MELODIESPARK INC — MASSIVE APP-BUILDER TRANSFER FILE
## Production Commerce OS / Stripe Catalogue / Landing Pages / Admin / Analytics / SEO / Mobile / Deployment

**Transfer mode:** Paste this complete file into an AI app builder or coding agent as the primary implementation specification.

**Primary objective:** Build a professional, production-oriented Melodiespark Inc commerce application around the existing Stripe catalogue. Preserve Stripe as the authoritative source for purchasable product/price identifiers and never fabricate prices, customers, payments, orders, subscriptions, revenue, blockchain activity, or deployment evidence.

---

## 0. NON-NEGOTIABLE OPERATING RULES

1. Do not create fake revenue, fake orders, fake customers, fake blockchain transactions, fake payment confirmations, or fake deployment success.
2. Treat Stripe Products and Prices as the source of truth for checkout.
3. Never expose Stripe secret keys in browser code, generated HTML, logs, telemetry, screenshots, or client bundles.
4. Any checkout price shown as purchasable must resolve server-side to an allowed Stripe Price ID.
5. If an offer is "Contact Sales", do not invent a numeric price.
6. Use verified webhook events for post-payment order state.
7. Keep currencies separated in analytics unless a documented FX conversion layer is deliberately added.
8. Every sync, webhook, import, fulfilment action, and admin mutation must be idempotent.
9. Every admin write must create an audit entry with actor, timestamp, entity, before-state hash, after-state hash, and action.
10. Fail closed when required secrets, mappings, permissions, signatures, or validation are missing.

---

## 1. TARGET PRODUCT

Create a unified full-stack web application named **Melodiespark Commerce OS** with:

- public premium marketing site;
- complete searchable products and services catalogue;
- dynamic product/service landing pages;
- real Stripe Checkout buttons;
- recurring subscription support;
- multi-price and multi-currency display;
- Contact Sales flows;
- customer account portal;
- admin catalogue CMS;
- pricing rules manager;
- order and subscription management;
- Stripe catalogue synchronization;
- verified revenue ledger;
- commerce analytics;
- price-change detection;
- SEO management;
- mobile-first responsive UX;
- automated validation and deployment gates.

The app should feel like a premium enterprise AI/software/Web3 company rather than a generic template.

---

## 2. PREFERRED STACK

Use the app builder's strongest production-supported stack. Prefer:

- Next.js App Router or equivalent SSR framework
- TypeScript
- React
- PostgreSQL
- Prisma or Drizzle
- Stripe official SDK
- secure server routes / server actions
- object storage for catalogue images
- role-based authentication
- Tailwind or equivalent design system
- charting library for analytics
- Zod or equivalent runtime validation
- Playwright for end-to-end tests
- Vitest/Jest for unit/integration tests

If the builder uses another stack, preserve the architecture and security properties rather than forcing these exact technologies.

---

## 3. INFORMATION ARCHITECTURE

Public routes:

- `/`
- `/products`
- `/services`
- `/pricing`
- `/category/[slug]`
- `/product/[slug]`
- `/service/[slug]`
- `/search`
- `/contact-sales`
- `/account`
- `/account/orders`
- `/account/subscriptions`
- `/account/billing`
- `/legal/terms`
- `/legal/privacy`

Admin routes:

- `/admin`
- `/admin/dashboard`
- `/admin/catalogue`
- `/admin/catalogue/[id]`
- `/admin/pricing`
- `/admin/price-changes`
- `/admin/orders`
- `/admin/subscriptions`
- `/admin/customers`
- `/admin/discounts`
- `/admin/images`
- `/admin/seo`
- `/admin/categories`
- `/admin/sync`
- `/admin/webhooks`
- `/admin/audit`
- `/admin/health`
- `/admin/settings`

---

## 4. HOMEPAGE

Build a premium homepage with:

### Hero
**Headline:** Build, automate, monetize, and operate your digital business from one intelligent platform.

**Subheadline:** Melodiespark Inc unifies AI applications, developer infrastructure, automation, commerce, Web3 tooling, enterprise services, and operational software into one connected ecosystem.

Primary CTAs:
- Explore Products
- Explore Services
- View Pricing
- Contact Sales

### Homepage content blocks
- Featured products
- Featured services
- AI & Automation
- Developer Tools
- Infrastructure
- Commerce
- Web3
- Enterprise
- Consulting
- Why Melodiespark
- Platform capabilities
- Customer journey
- Security and reliability
- Integrations
- CTA band
- FAQ
- Footer catalogue links

Every featured card must be data-driven from the catalogue CMS.

---

## 5. CATALOGUE MODEL

Create normalized entities for:

### Product
- id
- stripeProductId
- slug
- name
- shortDescription
- longDescription
- status
- visibility
- featured
- itemType
- categoryId
- subcategory
- sku
- keywords
- capabilities
- useCases
- audience
- requirements
- deliverables
- supportLevel
- fulfilmentType
- imagePrimary
- imageGallery
- seoTitle
- seoDescription
- canonicalUrl
- ogImage
- schemaType
- createdAt
- updatedAt
- lastStripeSyncAt

### Price
- id
- stripePriceId
- productId
- active
- currency
- unitAmount
- billingType
- interval
- intervalCount
- usageType
- tiersMode
- transformQuantity
- nickname
- lookupKey
- metadata
- createdAt
- updatedAt
- lastStripeSyncAt

### Category
- id
- slug
- name
- description
- heroCopy
- seoTitle
- seoDescription
- featured
- sortOrder

### PriceChange
- id
- productId
- stripePriceId
- oldAmount
- newAmount
- currency
- oldInterval
- newInterval
- detectedAt
- reviewedAt
- reviewedBy
- status

### Order
- id
- stripeCheckoutSessionId
- stripePaymentIntentId
- stripeCustomerId
- customerId
- currency
- amountSubtotal
- amountDiscount
- amountTax
- amountTotal
- paymentStatus
- fulfilmentStatus
- createdAt
- paidAt
- refundedAt

### OrderItem
- id
- orderId
- productId
- stripeProductId
- stripePriceId
- quantity
- unitAmount
- amountTotal
- currency

### Subscription
- id
- stripeSubscriptionId
- stripeCustomerId
- customerId
- productId
- stripePriceId
- status
- currency
- currentPeriodStart
- currentPeriodEnd
- cancelAtPeriodEnd
- canceledAt

### VerifiedRevenueEntry
- id
- orderId
- stripeEventId
- stripeCheckoutSessionId
- stripePaymentIntentId
- currency
- grossAmount
- netAmountIfAvailable
- eventType
- verifiedAt
- source

### AuditEvent
- id
- actorId
- actorRole
- action
- entityType
- entityId
- beforeHash
- afterHash
- metadata
- createdAt

---

## 6. STRIPE CATALOGUE SYNCHRONIZATION

Build a secure server-side synchronization engine.

Required behavior:

1. Pull Stripe Products.
2. Pull all active and inactive Prices with pagination.
3. Upsert by immutable Stripe IDs.
4. Never duplicate products because names changed.
5. Never duplicate prices because display labels changed.
6. Preserve internally managed content fields where Stripe does not provide equivalent content.
7. Detect Stripe-side price changes by comparing active price sets and amounts.
8. Store a synchronization run record.
9. Record counts: fetched, created, updated, unchanged, deactivated, errors.
10. Make sync rerunnable.
11. Add dry-run mode.
12. Add manual admin trigger.
13. Add scheduled sync capability.
14. Show synchronization health.
15. Never delete historical order references.

Create a sync preview screen before destructive changes.

---

## 7. REAL CHECKOUT

For every purchasable catalogue item:

- resolve product slug to internal product;
- resolve selected option to an allowlisted Stripe Price ID;
- create Checkout Session on server;
- pass only Stripe Price ID and quantity to Stripe;
- never accept a client-submitted unit amount as authoritative;
- support one-time and recurring modes;
- support promotion codes only when enabled;
- configure success and cancel URLs;
- attach internal product/order correlation metadata;
- use Stripe customer identity where available;
- display clear currency and billing interval before redirect;
- create no verified revenue entry until confirmed by trusted Stripe event.

CTA states:
- Buy Now
- Subscribe
- Choose Plan
- Contact Sales
- Unavailable

---

## 8. PRICING RULES MANAGER

Create `/admin/pricing`.

Capabilities:

- inspect every Stripe price;
- distinguish one-time / monthly / yearly / usage / tiered;
- create internal merchandising rules without modifying Stripe amounts;
- display monthly/yearly switchers only when real matching prices exist;
- mark default price;
- rank prices;
- set customer-facing labels;
- set badges such as Popular / Enterprise / Best Value;
- configure allowed promotion behavior;
- identify orphan prices;
- identify products with zero active prices;
- show price history;
- review detected changes.

Any operation that actually creates or changes a Stripe Price must happen server-side and must not overwrite a historical Stripe Price that should remain immutable. Prefer creating a new Stripe Price and deactivating the old one where Stripe semantics require it.

---

## 9. DISCOUNTS

Build discount administration supporting:

- coupons;
- promotion codes;
- percentage discounts;
- fixed-amount discounts;
- eligible products;
- currency constraints;
- first-time-customer rules;
- redemption limits;
- expiration;
- minimum order amount if supported by implementation;
- active/inactive state.

Display discounts only when they are verifiably applicable.

---

## 10. ADMIN CATALOGUE CMS

Create `/admin/catalogue`.

Table columns:
- image
- name
- type
- category
- SKU
- Stripe Product ID
- active price count
- default displayed price
- currency
- publish status
- checkout health
- last sync
- updated

Admin editing:
- names
- descriptions
- marketing copy
- categories
- tags
- images
- SEO
- visibility
- featured state
- sort order
- merchandising labels

Stripe-bound identifiers should be protected from casual editing.

Publishing workflow:

`Draft → Imported → Stripe Matched → Price Verified → Landing Page Ready → Checkout Verified → Published → Archived`

Prevent publication when required gates fail.

---

## 11. PRODUCT DETAIL PAGE

Every `/product/[slug]` page must contain:

- breadcrumb
- category
- title
- short value proposition
- hero visual
- pricing card
- billing interval
- currency
- real CTA
- full description
- key capabilities
- outcomes
- use cases
- ideal customer
- technical details
- delivery/fulfilment information
- support information
- related products
- related services
- FAQ
- final CTA
- SEO metadata
- structured data

Do not show fabricated ratings, reviews, customer logos, usage counts, revenue, or adoption numbers.

---

## 12. SERVICE DETAIL PAGE

Every `/service/[slug]` page must contain:

- service positioning
- scope
- outcomes
- deliverables
- process
- timeline only if sourced/configured
- prerequisites
- engagement model
- real price if purchasable
- Contact Sales when not directly purchasable
- FAQ
- related software
- related services
- lead form with the selected service prefilled

---

## 13. CONTACT SALES

Create a qualified-lead workflow.

Fields:
- name
- email
- company
- role
- team size
- country
- requested product/service
- budget range
- timeline
- use case
- message
- consent

Store the exact catalogue item requested and preserve attribution parameters.

Admin lead status:
- New
- Qualified
- Contacted
- Discovery
- Proposal
- Won
- Lost
- Archived

Do not mark a lead as revenue.

---

## 14. CUSTOMER ACCOUNT

Authenticated customers should be able to see:

- orders
- receipts
- purchased items
- payment status
- fulfilment status
- active subscriptions
- upcoming renewal information provided by Stripe
- invoices
- billing portal link
- downloadable licensed assets where applicable
- support/contact options

Never expose other customers' data.

---

## 15. ORDER MANAGEMENT

Create `/admin/orders`.

Show:
- internal order ID
- customer
- Stripe customer
- Checkout Session
- Payment Intent
- products
- quantities
- subtotal
- discounts
- tax
- total
- currency
- payment state
- fulfilment state
- timestamps
- refund information
- source attribution

Fulfilment statuses:
- Pending
- Paid
- Provisioning
- Ready
- Delivered
- Failed
- Refunded
- Canceled

Payment and fulfilment are separate state machines.

---

## 16. WEBHOOK ENGINE

Implement verified Stripe webhooks.

Handle at minimum:
- checkout.session.completed
- payment_intent.succeeded
- payment_intent.payment_failed
- charge.refunded or equivalent refund events
- invoice.paid
- invoice.payment_failed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

Rules:
- verify signature before parsing as trusted;
- persist Stripe event ID;
- reject duplicate processing;
- return appropriate HTTP response;
- log structured error without secrets;
- support replay;
- do not count unverified payloads as revenue.

---

## 17. VERIFIED REVENUE LEDGER

Revenue is counted only from verified payment evidence.

For each ledger record persist:
- Stripe Event ID
- Checkout Session ID
- Payment Intent or Invoice ID
- Customer ID
- Product ID
- Price ID
- amount
- currency
- verification timestamp
- event type
- order reference

Never use:
- button clicks
- page views
- checkout redirects
- abandoned Checkout Sessions
- failed Payment Intents
- draft invoices
as revenue.

---

## 18. ANALYTICS DASHBOARD

Create `/admin/dashboard` with:

Top KPI cards:
- total catalogue items
- published items
- active Stripe products
- active Stripe prices
- products missing prices
- active subscriptions
- verified payments
- verified revenue by currency
- MRR by currency
- price changes awaiting review

Charts:
- verified revenue over time
- checkout conversion funnel
- sales by product
- subscriptions by plan
- revenue by category
- orders by status
- price changes over time

Never combine CAD and USD into one monetary total without an explicit FX methodology.

---

## 19. MRR CALCULATION

MRR must be calculated from active recurring subscriptions.

Normalize:
- monthly amount → monthly amount
- yearly amount → yearly amount / 12
- multi-month intervals → interval amount / interval months

Exclude:
- canceled subscriptions outside active period
- incomplete subscriptions
- one-time purchases
- failed invoices
- trial amounts unless actually billed
- unsupported/unknown billing structures until explicitly handled

Show MRR separately per currency.

---

## 20. PRICE CHANGE DETECTION

Detect:
- new prices
- deactivated prices
- amount changes represented by replacement price
- currency changes
- interval changes
- pricing-type changes

Admin review queue must show:
- product
- old value
- new value
- effective timestamp
- impacted landing pages
- impacted default selections
- review status

Never silently rewrite past orders.

---

## 21. SEARCH

Build fast search across:
- product name
- service name
- description
- SKU
- category
- tags
- keywords
- capability
- use case
- pricing type

Search UX:
- debounced
- typo-tolerant if available
- keyboard accessible
- mobile optimized
- no-results recommendations
- URL-query persistence

---

## 22. FILTERS

Support:
- Products
- Services
- AI
- Automation
- Developer Tools
- Infrastructure
- Commerce
- Web3
- Enterprise
- Consulting
- CAD
- USD
- Monthly
- Yearly
- One-time
- Contact Sales
- Featured
- New
- Available

Filter state should be shareable in the URL.

---

## 23. SEO SYSTEM

For every public entity produce:

- title
- meta description
- canonical URL
- Open Graph title
- Open Graph description
- Open Graph image
- Twitter/X card metadata
- JSON-LD where appropriate
- breadcrumb schema
- sitemap inclusion
- robots policy
- clean slug
- internal links

Do not add Product structured-data fields that are not supported by real catalogue data.

---

## 24. CATEGORY LANDING PAGES

Generate SEO-ready category pages with:
- category hero
- description
- featured items
- complete item grid
- filters
- FAQs
- related categories
- comparison links
- internal links

Categories should be CMS-managed.

---

## 25. RELATED PRODUCTS ENGINE

Use deterministic ranking based on:
- shared category
- shared tags
- complementary capability
- product/service pairing
- pricing tier
- manually curated overrides

Do not claim personalized recommendations unless actual user signals are being used with appropriate consent.

---

## 26. MOBILE-FIRST EXPERIENCE

Requirements:
- 320px+ layouts
- touch-friendly controls
- sticky mobile CTA on product pages
- filter drawer
- responsive search
- no horizontal overflow
- readable price typography
- compact product cards
- accessible menus
- optimized images
- performance-aware animation
- fast route transitions
- preserved checkout clarity

Test common phone widths and tablets.

---

## 27. DESIGN SYSTEM

Visual direction:
- premium
- futuristic
- enterprise
- restrained
- high contrast
- sophisticated gradients
- obsidian/dark foundation
- bright accent energy
- strong typography
- subtle motion
- crisp dashboard surfaces

Components:
- Header
- MegaMenu
- Hero
- ProductCard
- ServiceCard
- PriceCard
- FilterBar
- SearchBox
- CategoryPill
- ComparisonTable
- KPI card
- ChartCard
- StatusBadge
- DataTable
- AuditTimeline
- EmptyState
- ErrorState
- Skeleton
- Toast
- Modal
- Drawer
- Pagination
- Footer

Maintain WCAG-aware contrast and keyboard navigation.

---

## 28. SECURITY

Mandatory:
- server-only Stripe secret
- signed webhook verification
- RBAC
- authenticated admin routes
- CSRF protection where required
- secure cookies
- input validation
- output encoding
- rate limits for sensitive endpoints
- no secret logging
- least privilege
- audit logging
- safe file upload validation
- MIME/type checks
- image size limits
- environment validation at startup
- production error redaction

Admin roles:
- Owner
- Admin
- Catalogue Manager
- Finance Viewer
- Support
- Read Only

Finance Viewer should not automatically gain mutation rights.

---

## 29. ENVIRONMENT VARIABLES

Define environment schema without embedding real secrets:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `DATABASE_URL`
- `AUTH_SECRET`
- `APP_URL`
- storage credentials as required
- email provider credentials as required
- analytics configuration as required

Provide `.env.example` containing placeholders only.

---

## 30. API / SERVER OPERATIONS

Create production-quality operations equivalent to:

- `GET /api/catalogue`
- `GET /api/catalogue/[slug]`
- `POST /api/checkout`
- `POST /api/contact-sales`
- `POST /api/stripe/webhook`
- `POST /api/admin/stripe/sync`
- `GET /api/admin/stripe/sync/[id]`
- `GET /api/admin/dashboard`
- `GET /api/admin/price-changes`
- `POST /api/admin/price-changes/[id]/review`
- `GET /api/account/orders`
- `GET /api/account/subscriptions`
- `POST /api/account/billing-portal`

Validate all inputs and enforce permissions server-side.

---

## 31. OBSERVABILITY

Implement:
- structured request logs
- error tracking
- sync run logs
- webhook processing logs
- checkout creation metrics
- webhook failure metrics
- database health
- deployment health endpoint
- audit events
- correlation IDs

Never log full payment credentials, secret keys, private customer data unnecessarily, or raw webhook secrets.

---

## 32. HEALTH DASHBOARD

Create `/admin/health` with checks:

- database reachable
- Stripe API reachable
- Stripe key configured
- webhook secret configured
- last Stripe sync
- last successful webhook
- products without prices
- products without images
- products without SEO
- duplicate slug
- duplicate SKU
- invalid Stripe mappings
- broken internal links
- checkout validation status
- build version
- deployment environment

Use `Healthy`, `Warning`, `Blocked`, `Unknown`.

---

## 33. INVENTORY HEALTH RULES

Generate issues for:
- Missing Price
- Missing Image
- Missing Description
- Missing SEO
- Duplicate SKU
- Duplicate Slug
- Stripe Product Missing
- Stripe Price Missing
- Inactive Default Price
- Contact Sales Missing Form
- Checkout Not Verified
- Webhook Not Verified
- Orphan Price
- Invalid Currency
- Invalid Billing Interval
- Unpublished But Featured
- Broken Related Product

---

## 34. ADMIN PUBLISHING GATES

A directly purchasable product cannot reach `Published` unless:
- Stripe product mapped
- at least one active real price mapped
- display price matches selected Stripe price
- checkout session creation passes test
- success/cancel routing configured
- webhook endpoint configured
- name/description present
- image present or explicit approved image-less state
- SEO title/description present
- slug unique
- mobile layout passes
- no blocking inventory-health error

A Contact Sales item follows a different gate and does not require a Stripe price.

---

## 35. TESTING

Unit tests:
- currency formatting
- interval normalization
- MRR normalization
- catalogue validation
- publish gates
- permission checks
- webhook idempotency helpers

Integration tests:
- Stripe sync mapping
- checkout session request validation
- webhook signature verification
- order persistence
- subscription persistence
- revenue ledger rules

E2E:
- homepage
- products
- services
- search
- filters
- product page
- service page
- Contact Sales
- admin login
- catalogue editing
- checkout initiation using test-mode fixture where appropriate
- responsive navigation

Production validation must distinguish Stripe test evidence from Stripe live evidence.

---

## 36. DEPLOYMENT GATE

Before production deployment:

1. Typecheck passes.
2. Lint passes.
3. Tests pass.
4. Production build passes.
5. Database migrations are reviewed.
6. Required environment variables are present.
7. No secrets are committed.
8. Stripe webhook endpoint is configured for target environment.
9. Catalogue sync completes.
10. Broken mapping count is zero for published purchasable products.
11. Health dashboard has no blocking conditions.
12. Smoke tests pass.
13. Rollback instructions exist.

Do not report deployment as successful until the deployment target returns a healthy response.

---

## 37. 30 CORE BUILD DIRECTIVES

1. Connect Stripe Live Checkout.
2. Build Pricing Rules Manager.
3. Build Product Admin CMS.
4. Build Revenue Dashboard.
5. Build Mobile Commerce UX.
6. Add Stripe Catalogue Synchronization.
7. Add Price Change Detection.
8. Add Multi-Price Products.
9. Add Discount Management.
10. Add Subscription Management.
11. Add Product Image Management.
12. Add Complete Catalogue Search.
13. Add Advanced Catalogue Filters.
14. Add Category Landing Pages.
15. Add Dynamic Product Landing Pages.
16. Add Featured Product Controls.
17. Add Contact Sales Workflow.
18. Add Customer Accounts.
19. Add Order Management.
20. Add Stripe Webhook Engine.
21. Add Verified Revenue Ledger.
22. Add Monthly Recurring Revenue Analytics.
23. Add Commerce Analytics Funnel.
24. Add Product Performance Dashboard.
25. Add Inventory Health Dashboard.
26. Add SEO Management System.
27. Add Related Products Engine.
28. Add Global Pricing Page.
29. Add Admin Publishing Workflow.
30. Add Production Commerce Validation.

---

## 38. 50 ADDITIONAL BUILDABLE MODULES

31. Add saved catalogue views.
32. Add admin bulk editing.
33. Add CSV import/export for non-secret merchandising data.
34. Add catalogue change diff viewer.
35. Add revision history.
36. Add rollback for CMS-only content changes.
37. Add product cloning without cloning Stripe IDs.
38. Add collection pages.
39. Add bundles represented safely without fabricating Stripe prices.
40. Add customer segmentation.
41. Add UTM attribution.
42. Add lead-source attribution.
43. Add referral attribution.
44. Add campaign landing pages.
45. Add compare-products workflow.
46. Add recently viewed items.
47. Add favorites/wishlist.
48. Add admin notes.
49. Add fulfilment notes.
50. Add internal product ownership.
51. Add launch date field.
52. Add archive scheduling.
53. Add merchandising schedules.
54. Add banner management.
55. Add announcement bar.
56. Add FAQ CMS.
57. Add testimonial CMS with verification flag.
58. Add case-study CMS.
59. Add integrations directory.
60. Add documentation links.
61. Add changelog pages.
62. Add release notes.
63. Add customer support links.
64. Add entitlement records.
65. Add license delivery records.
66. Add downloadable asset controls.
67. Add signed download URLs.
68. Add email receipt workflow.
69. Add fulfilment email workflow.
70. Add failed-payment alerts.
71. Add admin notification center.
72. Add webhook dead-letter queue.
73. Add webhook replay console.
74. Add sync retry console.
75. Add data retention controls.
76. Add privacy request workflow.
77. Add cookie consent integration.
78. Add accessibility audit.
79. Add performance budget.
80. Add Core Web Vitals monitoring.

---

## 39. DATA INTEGRITY INVARIANTS

- Stripe Product ID is never reassigned to a different internal product.
- Stripe Price ID is immutable once referenced by an order.
- Historical orders preserve original amount/currency references.
- Product slugs are unique.
- SKUs are unique when used.
- Every verified revenue record references trusted payment evidence.
- Every admin mutation is attributable.
- Every webhook event is processed at most once logically.
- Every sync operation is safely rerunnable.
- Publication never bypasses blocking validation.

---

## 40. USER EXPERIENCE DETAILS

Catalogue cards must show:
- image
- name
- category
- short description
- real pricing summary
- billing cadence
- badges
- CTA

Product grids:
- desktop 3–4 columns depending viewport
- tablet 2 columns
- mobile 1 column
- stable card heights where practical
- skeleton loading
- empty states
- accessible focus states

Pricing display:
- `$49 CAD / month`
- `$999 USD one-time`
- `Contact Sales`

Never display ambiguous values like `$49` without currency/context when multiple currencies exist.

---

## 41. ADMIN DASHBOARD LAYOUT

Top row:
- Catalogue Items
- Published
- Active Prices
- Active Subscriptions

Second row:
- Verified Revenue CAD
- Verified Revenue USD
- MRR CAD
- MRR USD

Third row:
- Revenue timeline
- Funnel

Fourth row:
- Top products
- Recent verified orders

Fifth row:
- Price-change queue
- Inventory-health warnings

Sixth row:
- Recent sync runs
- Webhook health

---

## 42. LANDING-PAGE COPY SYSTEM

For each product generate copy from factual catalogue fields using this structure:

- Problem
- Solution
- Core value
- Capabilities
- Who it is for
- Outcomes
- How it works
- Integrations
- Pricing
- FAQ
- CTA

Do not fabricate benchmarks, customer outcomes, integrations, certifications, guarantees, SLAs, or adoption metrics that are not provided.

---

## 43. ACCEPTANCE CRITERIA

The application is not complete until:

- catalogue data renders from persistent storage;
- Stripe synchronization is functional;
- real Stripe IDs are mapped server-side;
- no secret key appears in browser source;
- every published purchasable item has working checkout creation;
- Contact Sales items do not receive invented prices;
- webhook signatures are verified;
- duplicate events are idempotent;
- order records exist after trusted payment events;
- verified revenue derives only from trusted payment evidence;
- subscriptions populate correctly;
- MRR excludes one-time payments;
- currencies are separated;
- admin editing works;
- audit history works;
- price changes are detectable;
- search and filters work;
- mobile layouts work;
- SEO metadata is populated;
- build/test/deployment gates pass;
- health dashboard reports production state accurately.

---

## 44. IMPLEMENTATION ORDER

Phase 1 — Foundation:
database, auth, catalogue entities, categories, base design system.

Phase 2 — Stripe:
Stripe server client, catalogue sync, product/price mapping, checkout.

Phase 3 — Payment truth:
webhooks, orders, subscriptions, verified revenue ledger.

Phase 4 — Admin:
catalogue CMS, pricing manager, price-change review, health.

Phase 5 — Storefront:
home, products, services, details, search, filters, pricing.

Phase 6 — Analytics:
revenue, MRR, funnel, performance, inventory health.

Phase 7 — Growth:
SEO, category pages, related products, attribution, Contact Sales.

Phase 8 — Production:
tests, accessibility, performance, observability, deployment validation.

---

## 45. APP-BUILDER EXECUTION INSTRUCTION

Do not merely generate mock screens.

Implement the actual application structure, database schema, server operations, authentication boundaries, Stripe integration points, checkout endpoints, webhook endpoint, admin pages, validation logic, tests, and deployment configuration supported by the selected platform.

When credentials are unavailable:
- build the integration fully;
- expose a secure environment-variable setup screen or deployment setting;
- mark the connection as `NOT CONFIGURED`;
- do not simulate connection success.

When external deployment is unavailable:
- complete the build artifacts and production configuration;
- report deployment as `NOT DEPLOYED`;
- do not invent a URL.

---

## 46. COMPLETION REPORT FORMAT

At the end of implementation, output:

- Build status
- Production build status
- Database status
- Stripe connection status
- Catalogue sync status
- Products imported
- Prices imported
- Checkout status
- Webhook status
- Order verification status
- Subscription status
- Verified revenue status
- Admin CMS status
- Analytics status
- Mobile status
- SEO status
- Test status
- Deployment status
- Blocking issues
- Exact next action

Use `VERIFIED`, `PASS`, `WARNING`, `BLOCKED`, `NOT CONFIGURED`, or `NOT DEPLOYED`.

---

## 47. SOURCE CONTEXT CARRIED INTO THIS TRANSFER

The supplied source material describes a previous transfer package for a Melodiespark Inc Products & Services catalogue and reports 283 Stripe Live Products / 300 Prices. It explicitly calls for preserving mixed commercial models such as monthly CAD subscriptions, one-time purchases, yearly USD pricing, and Contact Sales rather than inventing prices.

The source also establishes a 30-module build direction centered on Stripe Checkout, pricing rules, admin CMS, revenue dashboard, mobile commerce, catalogue synchronization, price change detection, multi-price products, discounts, subscription management, images, search, filters, category pages, dynamic landing pages, featured controls, Contact Sales, accounts, orders, webhooks, verified revenue, MRR, funnel analytics, product analytics, inventory health, SEO, related products, global pricing, publishing workflow, and production validation.

---

## 48. ORIGINAL SOURCE MATERIAL — PRESERVED APPENDIX

The following is the user's supplied source context, retained as an appendix so an app builder can inspect the original wording if useful.

```text
svg

svg

Pasted text(20260831-205540).txt

Document

powershell without talking fix 

'''
'''

'''
# MELODIESPARK — OPEN TOP 15 APP BUILDERS
# PowerShell 7+ / Windows / Brave preferred

$Builders = @(
    "https://lovable.dev",
    "https://bolt.new",
    "https://replit.com",
    "https://v0.dev",
    "https://firebase.studio",
    "https://aistudio.google.com",
    "https://base44.com",
    "https://www.create.xyz",
    "https://databutton.com",
    "https://softgen.ai",
    "https://bubble.io",
    "https://flutterflow.io",
    "https://webflow.com",
    "https://www.softr.io",
    "https://www.appsmith.com"
)

$BraveCandidates = @(
    "$env:ProgramFiles\BraveSoftware\Brave-Browser\Application\brave.exe",
    "${env:ProgramFiles(x86)}\BraveSoftware\Brave-Browser\Application\brave.exe",
    "$env:LOCALAPPDATA\BraveSoftware\Brave-Browser\Application\brave.exe"
)

$Brave = $BraveCandidates |
    Where-Object { Test-Path $_ } |
    Select-Object -First 1

Write-Host ""
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host " MELODIESPARK — TOP 15 APP BUILDERS" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

$i = 0

foreach ($Url in $Builders) {

    $i++

    Write-Host "[$i/15] Opening $Url" -ForegroundColor Green

    if ($Brave) {
        Start-Process -FilePath $Brave -ArgumentList "--new-tab", $Url
    }
    else {
        Start-Process $Url
    }

    Start-Sleep -Milliseconds 350
}

Write-Host ""
Write-Host "[+] ALL 15 APP BUILDERS OPENED" -ForegroundColor Green
'''

svg

svg

Pasted markdown(20260831-212443).md

File

Generate a transfer file to app builder to fully create profesional expert landing pages products stripe catalogue 

Created the complete app-builder transfer package using your full attached catalogue as the authoritative inventory. The source identifies the catalogue as Melodiespark Inc Products & Services and reports 283 Stripe Live Products / 300 Prices.  It also preserves mixed catalogue models such as monthly CAD subscriptions, one-time purchases, yearly USD pricing, and Contact Sales entries rather than inventing prices.  

svgDownload the complete App Builder + Stripe Live transfer file

The package is about **127,000 characters** and includes the complete catalogue plus instructions for professional landing pages, `/products`, `/services`, category/search/filter UX, individual SEO pages, server-side Stripe Live integration, Checkout, Contact Sales, webhooks, verified-order states, analytics, admin catalogue validation, security, responsive design, deployment, and acceptance testing. svg

svgMELODIESPARK-APP-BUILDER-TRANSFER-STRIPE-LIVE.mdDocumentOpen file

svg

generate 30 buildable related Connect my Stripe account so each catalogue item has a real checkout button that charges the listed price. Build a pricing rules page so I can set tiered pricing, discounts and recurring plans for each product. Add an admin page where I can edit product names, prices, descriptions and images without touching code. Add a dashboard showing how many catalogue items are live, which prices have changed, and total monthly revenue. Restyle the catalogue for mobile so product cards, category filters and search work smoothly on phones.

Here are **30 buildable implementation directives** you can paste directly into your app builder. They extend your existing catalogue into a real commerce/admin platform while keeping Stripe as the payment source of truth.

1. **Connect Stripe Live Checkout** — Connect my Stripe account server-side and map every catalogue item to its real Stripe Product and Price IDs. Add Buy Now or Subscribe buttons that create secure Stripe Checkout Sessions using only server-validated prices. 
2. **Build Pricing Rules Manager** — Create `/admin/pricing` where I can configure one-time, monthly, yearly, usage-based, tiered, volume and graduated pricing without editing code. 
3. **Build Product Admin CMS** — Create `/admin/catalogue` where authorized admins can edit product names, descriptions, categories, SEO metadata, images, visibility and featured status. 
4. **Build Revenue Dashboard** — Create `/admin/dashboard` showing total catalogue items, live products, inactive products, active prices, subscriptions, verified monthly recurring revenue, payments and recent Stripe activity. Revenue must come from verified Stripe records only. 
5. **Build Mobile Commerce UX** — Fully optimize catalogue cards, filters, search, navigation, pricing displays, checkout CTAs and product detail pages for phones and tablets. 
6. **Add Stripe Catalogue Synchronization** — Build an idempotent sync engine that imports Stripe Products and Prices, matches them to internal SKUs/slugs, detects differences and never creates duplicates unnecessarily. 
7. **Add Price Change Detection** — Track old versus current Stripe prices and show changed prices in an admin review queue with timestamp, previous value, new value, currency and billing interval. 
8. **Add Multi-Price Products** — Allow one product to legitimately have CAD/USD, monthly/yearly and one-time price options with a selectable pricing component on the product page. 
9. **Add Discount Management** — Create an admin interface for Stripe coupons, promotion codes, fixed discounts, percentage discounts, redemption limits, expiration dates and eligible products. 
10. **Add Subscription Management** — Build customer subscription controls for viewing plan, billing interval, renewal status and secure access to Stripe Customer Portal for upgrades, downgrades or cancellation. 
11. **Add Product Image Management** — Let admins upload, reorder, replace and remove product images, automatically generate responsive image variants and show optimized galleries on landing pages. 
12. **Add Complete Catalogue Search** — Build instant search across product name, service name, description, SKU, category, keywords and pricing type with typo-tolerant results. 
13. **Add Advanced Catalogue Filters** — Filter by Products, Services, AI, Automation, Web3, Developer Tools, Enterprise, Consulting, CAD, USD, monthly, yearly, one-time and Contact Sales. 
14. **Add Category Landing Pages** — Generate SEO-ready `/category/[slug]` pages with category introductions, featured products, filters, related categories and internal links. 
15. **Add Dynamic Product Landing Pages** — Generate `/product/[slug]` and `/service/[slug]` from catalogue data with hero, description, pricing, capabilities, related offerings, FAQ and checkout/contact CTA. 
16. **Add Featured Product Controls** — Let admins manually feature products or automatically select them according to sales, conversion, recency or strategic priority without changing the underlying Stripe catalogue. 
17. **Add Contact Sales Workflow** — For items without a purchasable price, display Contact Sales instead of inventing a price and create qualified leads containing the requested catalogue item. 
18. **Add Customer Accounts** — Build secure customer authentication with order history, purchased products, active subscriptions, invoices, receipts and account preferences. 
19. **Add Order Management** — Create `/admin/orders` showing Stripe Checkout Session, Payment Intent, customer, item, amount, currency, payment status, fulfilment status and timestamps. 
20. **Add Stripe Webhook Engine** — Verify Stripe webhook signatures and process successful checkout, payment, refund, invoice and subscription lifecycle events through idempotent handlers. 
21. **Add Verified Revenue Ledger** — Record revenue only after a verified Stripe event and maintain immutable references to Stripe event, Checkout Session, Payment Intent, Product and Price IDs. 
22. **Add Monthly Recurring Revenue Analytics** — Calculate MRR from active recurring subscriptions rather than checkout clicks, page views or unverified redirects; separate CAD and USD when necessary. 
23. **Add Commerce Analytics Funnel** — Track catalogue views → product views → checkout starts → Stripe redirects → verified purchases and calculate conversion rates without counting failed or abandoned checkout as revenue. 
24. **Add Product Performance Dashboard** — Rank catalogue items by verified sales, subscriptions, revenue, checkout conversion and engagement while providing filters by period and currency. 
25. **Add Inventory Health Dashboard** — Show Missing Price, Missing Image, Missing Description, Duplicate SKU, Duplicate Slug, Stripe Mismatch, Inactive Product and Checkout Not Verified warnings. 
26. **Add SEO Management System** — Give every item editable SEO title, description, canonical URL, OpenGraph image, structured Product/Service data, breadcrumbs and automatic sitemap inclusion. 
27. **Add Related Products Engine** — Automatically recommend related Melodiespark offerings by category, tags, complementary capabilities and pricing tier while allowing admins to override recommendations. 
28. **Add Global Pricing Page** — Build `/pricing` with searchable comparison tables for subscriptions, one-time products, professional services and enterprise offerings with monthly/yearly toggles where real prices exist. 
29. **Add Admin Publishing Workflow** — Implement Draft → Imported → Stripe Matched → Price Verified → Landing Page Ready → Checkout Verified → Published → Archived statuses, preventing incomplete products from being accidentally published. 
30. **Add Production Commerce Validation** — Before deployment automatically test catalogue routes, mobile layouts, broken links, Product↔Price mappings, Stripe Checkout creation, webhook verification, environment variables, duplicate SKUs/slugs, SEO metadata and production build success. 

Your current catalogue already spans AI/app-builder products, infrastructure, Web3, enterprise tooling and recurring/one-time offerings—for example Phoenix Builder Pro, MelodieSpark App Builder Gold, Deployment Fabric and Release Gate Engine—so these 30 modules can be implemented around one reusable catalogue architecture rather than as separate websites. 

The strongest build order is **Stripe sync → catalogue database → admin CMS → pricing engine → Checkout → webhooks → verified orders/revenue → dashboard → mobile/SEO → deployment validation**.

svg

svg

svg

svg
```
