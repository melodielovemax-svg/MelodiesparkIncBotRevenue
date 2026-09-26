# MELODIESPARK INC — BASE44 MASTER TRANSFER DIRECTIVE

Version: 2026.08.30-Ultimate-1  
Owner: Melodiespark INC  
Primary market: Canada  
Default currency: CAD  
Target: production-ready commercial landing page with Stripe Checkout, a complete catalog, measurable growth engine, and evidence-first revenue reporting.

---

## 0. BASE44 EXECUTION COMMAND

Build the complete application described in this file. Treat every requirement as acceptance criteria. Do not replace functioning components with mockups. Do not claim sales, customers, traffic, balances, or revenue unless supported by Stripe or analytics evidence. Never expose a Stripe secret key in browser code, page source, logs, screenshots, or client-visible environment variables.

The application name is **Melodiespark Growth Commerce OS**. It is a premium, responsive, conversion-focused storefront for Melodiespark INC products and professional services. It must combine a high-quality landing page, searchable catalog, Stripe-hosted secure checkout, lead capture, ethical acquisition workflows, conversion analytics, and an administration dashboard.

If Base44 cannot implement a requested server-side capability, create the UI and data contract, mark the capability `BLOCKED_REQUIRES_SERVER_RUNTIME`, and provide exact setup instructions. Never silently simulate a payment, webhook, email, customer, order, or revenue event.

---

## 1. NON-NEGOTIABLE OPERATING RULES

1. Commercial revenue requires a real customer, real product, successful live Stripe payment, verifiable Stripe object, and auditable record.
2. Test payments are labeled `TEST` and excluded from commercial revenue totals.
3. Stripe secret keys and webhook signing secrets are server-only.
4. No private keys, seed phrases, banking credentials, or payout instructions are collected by the website.
5. No automatic transfers, withdrawals, payouts, cryptocurrency trades, or wallet transactions.
6. No fake visitors, bot traffic, click farms, spam, unsolicited bulk messaging, fabricated testimonials, fake scarcity, or invented performance claims.
7. Admin finance views are read-only unless an explicit human approval step is implemented.
8. Prices shown in the UI must come from the verified catalog/Stripe mapping, never from user-controlled query parameters.
9. Every webhook is signature-verified, idempotent, timestamped, and logged.
10. The application must remain useful if analytics, email, or CRM integrations are unavailable.

---

## 2. EXPERIENCE AND VISUAL DIRECTION

Create a modern dark premium interface: near-black navy background, violet-to-cyan energy gradients, subtle glass surfaces, bright accessible typography, restrained motion, and strong visual hierarchy. The design should feel like a fusion of a creator studio, enterprise AI control plane, and trustworthy fintech console.

Requirements:

- Mobile-first layout; perfect at 360, 768, 1024, and 1440 pixels.
- WCAG 2.2 AA color contrast, keyboard navigation, visible focus, semantic landmarks, reduced-motion support, form labels, useful error messages, and alt text.
- Performance budget: LCP under 2.5 seconds, CLS under 0.1, INP under 200 ms on a representative production build.
- No autoplay audio, intrusive popups, cursor hijacking, or excessive animation.
- Sticky navigation: Products, Services, Solutions, Pricing, Results, Resources, FAQ, Contact, Sign In.
- Primary CTA: **Explore Solutions**. Secondary CTA: **Book a Strategy Session**.
- Persistent cart/checkout summary only if multiple-item Stripe Checkout is implemented safely; otherwise each offer uses a direct checkout CTA.

---

## 3. SITE MAP

Build these routes:

| Route | Purpose |
|---|---|
| `/` | Conversion landing page |
| `/products` | Filterable complete catalog |
| `/products/[slug]` | Product detail and checkout CTA |
| `/services` | Professional services and engagements |
| `/solutions/creators` | Creator growth solution |
| `/solutions/business` | Business automation solution |
| `/solutions/enterprise` | Enterprise platform solution |
| `/pricing` | Pricing comparison and FAQs |
| `/resources` | Guides, lead magnets, case-study framework |
| `/contact` | Qualified lead form |
| `/book` | Strategy-session request |
| `/checkout/success` | Stripe-confirmed success view |
| `/checkout/cancel` | Checkout cancellation recovery |
| `/legal/terms` | Terms placeholder requiring legal review |
| `/legal/privacy` | Privacy placeholder requiring legal review |
| `/legal/refunds` | Refund policy placeholder requiring legal review |
| `/admin` | Protected operations dashboard |
| `/admin/catalog` | Catalog and Stripe mapping status |
| `/admin/orders` | Read-only orders and fulfilment status |
| `/admin/growth` | Funnel, campaign, SEO, and experiment dashboard |
| `/admin/evidence` | Webhook/audit evidence viewer |

---

## 4. HOMEPAGE COMPOSITION

1. Announcement bar: “Build, launch, and grow with one connected operating system.”
2. Hero headline: “Turn ambitious ideas into products people can buy.”
3. Hero subcopy: “Melodiespark combines creator operations, AI-ready software, automation, Web3 tooling, and growth strategy in one commercial ecosystem.”
4. CTA pair with short trust line: secure checkout powered by Stripe; CAD pricing; human-reviewed delivery.
5. Category navigator with Creator OS, Growth, AI & Automation, Developer Tools, Web3, Implementation, Support, Enterprise, Training.
6. Featured products grid driven by catalog data.
7. “How it works”: Choose solution → Secure checkout or consultation → Confirmed scope → Delivery and evidence.
8. Outcomes section using only defensible capability statements, never invented metrics.
9. Platform architecture strip: Strategy, Build, Commerce, Growth, Evidence.
10. Pricing bands and popular offers.
11. Services engagement process and explicit scope-control language.
12. Lead magnet signup with consent checkbox.
13. FAQ covering delivery, subscriptions, cancellation, refunds, taxes, support, Stripe, and data protection.
14. Final CTA and complete footer.

---

## 5. COMPLETE 74-OFFER CATALOG

All prices below are commercial drafts in CAD and require owner review before live activation. `ONE` means one-time. `MO` means monthly. `YR` means yearly. Create catalog records first; connect a Stripe Product and Price only after validation. For professional services, show “Starting at” unless the service has a fixed written scope.

| # | SKU | Offer | Category | Billing | CAD |
|---:|---|---|---|---|---:|
| 1 | MS-COS-001 | Creator OS Starter | Creator OS | ONE | 49 |
| 2 | MS-COS-002 | Creator OS Pro | Creator OS | ONE | 149 |
| 3 | MS-COS-003 | Creator OS Team | Creator OS | ONE | 399 |
| 4 | MS-INT-001 | Media Intelligence | Intelligence | MO | 49 |
| 5 | MS-GRO-001 | Growth Analytics Pro | Analytics | MO | 99 |
| 6 | MS-CON-001 | Content Engine | Content | MO | 79 |
| 7 | MS-LAU-001 | Digital Product Launch Blueprint | Launch | ONE | 99 |
| 8 | MS-BRA-001 | Brand System Kit | Brand | ONE | 129 |
| 9 | MS-AUT-001 | Automation Blueprint Pack | Automation | ONE | 179 |
| 10 | MS-WEB3-001 | Web3 Application Starter | Web3 | ONE | 249 |
| 11 | MS-FIN-001 | Treasury Evidence Toolkit | Fintech | ONE | 199 |
| 12 | MS-DEV-001 | MelodieCLI Developer Kit | Developer Tools | ONE | 149 |
| 13 | MS-CNS-001 | Platform Architecture Review | Consulting | ONE | 499 |
| 14 | MS-CNS-002 | Repository Evidence Audit | Consulting | ONE | 349 |
| 15 | MS-IMP-001 | Stripe Catalog Setup | Implementation | ONE | 299 |
| 16 | MS-IMP-002 | Conversion Landing Page Build | Implementation | ONE | 799 |
| 17 | MS-IMP-003 | Production MVP Build | Implementation | ONE | 2,499 |
| 18 | MS-IMP-004 | Business Automation Implementation | Implementation | ONE | 1,499 |
| 19 | MS-SUP-001 | Platform Support Basic | Support | MO | 149 |
| 20 | MS-SUP-002 | Platform Support Pro | Support | MO | 399 |
| 21 | MS-ADV-001 | Fractional CTO Advisory | Advisory | MO | 2,499 |
| 22 | MS-ENT-001 | Enterprise Platform License | Enterprise | YR | 12,000 |
| 23 | MS-TRN-001 | Strategy Workshop — Half Day | Training | ONE | 1,499 |
| 24 | MS-TRN-002 | Team Enablement Training | Training | ONE | 2,999 |
| 25 | MS-COS-004 | Creator Command Center Templates | Creator OS | ONE | 89 |
| 26 | MS-COS-005 | Production Calendar System | Creator OS | ONE | 59 |
| 27 | MS-COS-006 | Sponsorship Operations Kit | Creator OS | ONE | 119 |
| 28 | MS-COS-007 | Creator Revenue Dashboard | Creator OS | ONE | 149 |
| 29 | MS-COS-008 | Multi-Channel Publishing System | Creator OS | ONE | 179 |
| 30 | MS-GRO-002 | Audience Growth Playbook | Growth | ONE | 79 |
| 31 | MS-GRO-003 | Conversion Funnel Blueprint | Growth | ONE | 129 |
| 32 | MS-GRO-004 | SEO Content Cluster Kit | Growth | ONE | 99 |
| 33 | MS-GRO-005 | Launch Campaign Calendar | Growth | ONE | 69 |
| 34 | MS-GRO-006 | Affiliate Program Blueprint | Growth | ONE | 149 |
| 35 | MS-GRO-007 | Lifecycle Email Blueprint | Growth | ONE | 119 |
| 36 | MS-GRO-008 | Growth Experiment Library | Growth | ONE | 89 |
| 37 | MS-GRO-009 | Traffic Intelligence Dashboard | Growth | MO | 129 |
| 38 | MS-GRO-010 | Conversion Optimization Review | Growth | ONE | 399 |
| 39 | MS-AI-001 | AI Workflow Starter Pack | AI | ONE | 149 |
| 40 | MS-AI-002 | Agent Orchestration Blueprint | AI | ONE | 299 |
| 41 | MS-AI-003 | Secure LLM Gateway Blueprint | AI | ONE | 249 |
| 42 | MS-AI-004 | Prompt Operations Library | AI | ONE | 99 |
| 43 | MS-AI-005 | AI Evaluation and Evidence Kit | AI | ONE | 199 |
| 44 | MS-AI-006 | Model Routing Architecture Review | AI | ONE | 599 |
| 45 | MS-AI-007 | AI Automation Care Plan | AI | MO | 299 |
| 46 | MS-DEV-002 | SaaS Starter Architecture | Developer Tools | ONE | 249 |
| 47 | MS-DEV-003 | API Governance Toolkit | Developer Tools | ONE | 179 |
| 48 | MS-DEV-004 | Monorepo Foundation Kit | Developer Tools | ONE | 199 |
| 49 | MS-DEV-005 | Observability Starter Kit | Developer Tools | ONE | 149 |
| 50 | MS-DEV-006 | Release Gate Toolkit | Developer Tools | ONE | 129 |
| 51 | MS-DEV-007 | Security Baseline Toolkit | Developer Tools | ONE | 199 |
| 52 | MS-DEV-008 | Database Migration Pack | Developer Tools | ONE | 149 |
| 53 | MS-WEB3-002 | Wallet Connection UI Kit | Web3 | ONE | 179 |
| 54 | MS-WEB3-003 | Read-Only Blockchain Ledger | Web3 | ONE | 249 |
| 55 | MS-WEB3-004 | Smart Contract Evidence Review | Web3 | ONE | 499 |
| 56 | MS-WEB3-005 | Testnet Deployment Workshop | Web3 | ONE | 799 |
| 57 | MS-WEB3-006 | Token Utility Design Workshop | Web3 | ONE | 999 |
| 58 | MS-IMP-005 | Stripe Checkout Integration | Implementation | ONE | 699 |
| 59 | MS-IMP-006 | Stripe Webhook Integration | Implementation | ONE | 799 |
| 60 | MS-IMP-007 | Analytics and Consent Setup | Implementation | ONE | 599 |
| 61 | MS-IMP-008 | Technical SEO Implementation | Implementation | ONE | 699 |
| 62 | MS-IMP-009 | Email Automation Setup | Implementation | ONE | 799 |
| 63 | MS-IMP-010 | CRM Pipeline Setup | Implementation | ONE | 899 |
| 64 | MS-IMP-011 | Performance Optimization Sprint | Implementation | ONE | 999 |
| 65 | MS-SUP-003 | Platform Support Enterprise | Support | MO | 999 |
| 66 | MS-SUP-004 | Growth Operations Retainer | Support | MO | 1,499 |
| 67 | MS-ADV-002 | Product Strategy Advisory | Advisory | MO | 999 |
| 68 | MS-ADV-003 | Creator Growth Advisory | Advisory | MO | 799 |
| 69 | MS-ENT-002 | Enterprise Discovery Sprint | Enterprise | ONE | 4,999 |
| 70 | MS-ENT-003 | Enterprise Implementation Program | Enterprise | ONE | 14,999 |
| 71 | MS-TRN-003 | AI Operations Workshop | Training | ONE | 1,999 |
| 72 | MS-TRN-004 | Growth Systems Workshop | Training | ONE | 1,499 |
| 73 | MS-TRN-005 | Secure Web3 Foundations Training | Training | ONE | 1,999 |
| 74 | MS-TRN-006 | Executive Platform Briefing | Training | ONE | 2,499 |

For every offer store: SKU, slug, name, short description, full description, category, billing type, CAD amount in cents, Stripe product ID, Stripe price ID, active status, featured flag, delivery method, delivery estimate, fulfilment checklist, support tier, tax code placeholder, image, SEO title, SEO description, related offers, terms version, created timestamp, updated timestamp, and catalog version.

---

## 6. STRIPE PAYMENT ARCHITECTURE

### Environment variables

Server-only:

```text
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_ACCOUNT_ID=acct_1T8VgiDw7QhJ1vWD
APP_BASE_URL=
ADMIN_EMAIL=
```

Client-safe only when required:

```text
PUBLIC_STRIPE_PUBLISHABLE_KEY=
PUBLIC_ANALYTICS_ID=
```

Never put `STRIPE_SECRET_KEY` or `STRIPE_WEBHOOK_SECRET` in a client-prefixed variable.

### Checkout flow

1. Buyer selects an active catalog offer.
2. Client submits only the internal SKU and quantity to a server endpoint.
3. Server resolves the verified Stripe Price ID from its trusted catalog mapping.
4. Server creates a Stripe Checkout Session with the appropriate one-time or subscription mode.
5. Add metadata: SKU, catalog version, internal order ID, source, campaign, and evidence classification.
6. Redirect to Stripe-hosted Checkout.
7. Never mark an order paid from the success-page redirect alone.
8. Mark paid only after a verified `checkout.session.completed` or appropriate invoice event.

### Required server endpoints

- `POST /api/checkout/session`
- `POST /api/stripe/webhook`
- `GET /api/catalog`
- `POST /api/leads`
- `POST /api/contact`
- `POST /api/newsletter/subscribe`
- `GET /api/orders/[publicReference]`
- Protected admin catalog-sync and health endpoints.

### Required Stripe events

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.refunded`
- `charge.dispute.created`

Webhook processing must preserve the raw body for signature verification, reject invalid signatures, store each Stripe event ID uniquely, tolerate retries, and separate live from test mode.

### Order state model

`DRAFT → CHECKOUT_CREATED → PAYMENT_PENDING → PAID → FULFILMENT_PENDING → FULFILLED`

Exceptional states: `PAYMENT_FAILED`, `CANCELLED`, `REFUNDED`, `PARTIALLY_REFUNDED`, `DISPUTED`, `MANUAL_REVIEW`.

Revenue dashboards count only live, succeeded, non-refunded amounts and must separately display gross sales, discounts, refunds, disputes, Stripe fees when available, taxes, and net proceeds. Do not label Stripe balance as bank balance.

---

## 7. ETHICAL GROWTH AND TRAFFIC ENGINE

Build a durable acquisition system, not an artificial traffic bot.

### Channel engine

| Channel | Capabilities |
|---|---|
| SEO | Keyword clusters, landing pages, metadata, schema markup, internal links, sitemap, robots, canonical URLs |
| Content | Editorial calendar, content briefs, CTA mapping, repurposing workflow, update reminders |
| Email | Consent-based capture, lead magnet, welcome sequence, nurture, launch, re-engagement, unsubscribe |
| Social | UTM builder, campaign calendar, post variants, channel attribution; no automatic spam |
| Partnerships | Affiliate/partner applications, referral codes, terms, attribution, approval workflow |
| Paid | Campaign/creative records, budget guardrails, UTM governance, landing page variants; no autonomous spending |
| Community | Event, workshop, webinar, and resource promotion workflows |
| Conversion | A/B test registry, CTA tests, offer tests, form-friction analysis, checkout funnel reporting |

### Funnel stages

`Visitor → Engaged visitor → Lead → Qualified lead → Checkout started → Paid customer → Fulfilled customer → Repeat customer → Advocate`

Track stage-entry timestamps, allowed source/medium/campaign, landing page, consent state, experiment assignment, and last meaningful action. Do not fingerprint users or bypass browser privacy controls.

### Growth dashboard

Display sessions, engaged sessions, source mix, landing-page conversion, lead conversion, checkout-start rate, checkout completion, paid conversion, average order value, recurring revenue, refund rate, repeat purchase rate, funnel drop-off, top products, top content, campaign results, and data freshness. Every metric must show date range, environment, definition, source, and last updated time.

### Growth automation

Automations may generate drafts, tasks, briefs, segments, and alerts. Human approval is required before publishing content, launching paid campaigns, changing budgets, emailing a new segment, changing prices, or activating a Stripe product. Rate-limit forms, add bot protection, and maintain suppression/unsubscribe lists.

---

## 8. DATA MODEL

Create entities for:

- `CatalogProduct`
- `CatalogPrice`
- `StripeMapping`
- `CheckoutAttempt`
- `Order`
- `OrderLine`
- `CustomerReference`
- `FulfilmentTask`
- `StripeEvent`
- `AuditEvent`
- `Lead`
- `ConsentRecord`
- `Campaign`
- `Channel`
- `ContentAsset`
- `LandingPage`
- `Experiment`
- `ExperimentVariant`
- `AnalyticsEvent`
- `AttributionTouch`
- `Partner`
- `Referral`
- `SupportRequest`

Every sensitive entity needs role-based access, created/updated timestamps, an immutable external-reference field where applicable, and environment separation. Store only the minimum customer data necessary for operations.

---

## 9. ADMIN CONTROL PLANE

Protect admin routes with authentication and least-privilege roles: Owner, Catalog Manager, Growth Manager, Support, Analyst, Auditor. Finance fields are read-only for all automated agents.

Admin widgets:

- Stripe mode and connectivity status.
- Catalog totals: mapped, unmapped, active, archived, pricing mismatch.
- Webhook health: latest verified event, failures, retries, signature failures.
- Orders requiring fulfilment or review.
- Growth funnel with filters.
- Campaign performance and UTM integrity.
- Experiment status with minimum sample warning.
- Consent and unsubscribe health.
- Evidence ledger with event ID, object ID, timestamp, environment, classification, and processing result.
- Release checklist and blockers.

Never expose full Stripe keys, webhook secrets, payment method details, or unnecessary personal data.

---

## 10. SEO, CONTENT, AND STRUCTURED DATA

- Unique title and description per page.
- Product, Service, Organization, BreadcrumbList, FAQPage, Article, and WebSite schema where truthful and applicable.
- XML sitemap, canonical URLs, robots configuration, Open Graph, Twitter cards, favicon, app icon, and social share art placeholders.
- Category hubs with substantial useful copy, comparison tables, buyer-fit guidance, deliverables, exclusions, and FAQ.
- Avoid doorway pages, keyword stuffing, invisible text, scraped copy, and mass low-value pages.
- Resource templates: ultimate guide, implementation checklist, comparison, glossary, case study, workshop recap, release note.

---

## 11. CONVERSION COPY RULES

Use confident, concrete language. Describe deliverables and buyer outcomes without guaranteeing income, traffic, ranking, blockchain returns, or business results. Replace vague superlatives with proof-oriented specificity. Every service page must include: ideal buyer, problem, scope, deliverables, process, timeline estimate, client responsibilities, exclusions, price basis, CTA, FAQ, and legal-review notice where needed.

Suggested primary value proposition:

> Melodiespark gives creators and ambitious teams the systems to plan, build, sell, measure, and improve digital products—without losing control of evidence, security, or customer experience.

---

## 12. SECURITY AND PRIVACY

- Server-side secrets only; rotate exposed secrets immediately.
- HTTPS only in production.
- Content Security Policy, secure cookies, CSRF protection where applicable, strict input validation, output encoding, safe redirects, and rate limits.
- Stripe webhook signature verification against the raw request body.
- Dependency and secret scanning in CI.
- Audit admin changes and catalog activations.
- Data-retention policy and deletion workflow.
- Consent records include purpose, policy version, timestamp, and source.
- No storing raw card data; Stripe-hosted Checkout handles payment details.
- Québec/Canada legal and tax configuration requires qualified professional review before production launch.

---

## 13. DELIVERY AND FULFILMENT

After verified payment:

1. Create order evidence from the Stripe event.
2. Determine offer delivery type.
3. For digital goods, issue a time-limited authenticated delivery link if supported.
4. For services, create an onboarding task and send a scoped intake request.
5. For subscriptions, provision entitlement only while subscription status permits.
6. Log fulfilment actions and failures.
7. Never email secrets or permanent unrestricted download URLs.

---

## 14. TESTING MATRIX

Automate or document tests for:

- Catalog schema and unique SKU validation.
- No missing Stripe mapping for active paid offers.
- Correct one-time versus subscription Checkout mode.
- Test key cannot be treated as live and vice versa.
- Successful checkout, cancelled checkout, failed payment, delayed payment, duplicate webhook, invalid signature, refund, dispute, subscription update, and subscription cancellation.
- No success redirect can mark an order paid.
- Accessibility keyboard path and screen-reader landmarks.
- Responsive layouts at required breakpoints.
- SEO metadata and structured-data validity.
- Form validation, consent, rate limiting, unsubscribe, and suppression.
- Analytics event deduplication and environment separation.
- Admin authorization and protected data redaction.
- Performance budget and broken-link checks.

---

## 15. RELEASE GATES

Do not label the application production-ready until all gates pass:

| Gate | Required evidence |
|---|---|
| Catalog | 74 unique SKUs, reviewed descriptions/prices, valid mappings |
| Stripe test | End-to-end test Checkout and verified webhook |
| Fulfilment | Successful test delivery/onboarding workflow |
| Security | Secret isolation, webhook verification, authorization tests |
| Legal | Owner-approved Terms, Privacy, Refund, tax configuration |
| Analytics | Consent-aware events and verified funnel definitions |
| Accessibility | WCAG AA audit or documented exception plan |
| Performance | Production measurement within budgets |
| Live readiness | Live keys configured server-side and one controlled smoke purchase |
| Evidence | Audit record linking customer, product, payment, order, and fulfilment |

Status vocabulary is restricted to: `DEFINED`, `IMPLEMENTED`, `TESTED`, `VERIFIED`, `AUDITED`, `RELEASED`, or `BLOCKED`. Never infer a higher status from design text alone.

---

## 16. BASE44 BUILD SEQUENCE

1. Create design system, global navigation, footer, and route shell.
2. Create the full catalog data model and seed all 74 draft offers.
3. Build catalog, filtering, search, product details, pricing comparison, and service pages.
4. Build lead capture, contact, booking request, consent, and admin lead views.
5. Implement server-side Stripe Checkout and trusted SKU-to-Price resolution.
6. Implement webhook verification, idempotent event storage, order state machine, and fulfilment queue.
7. Build success/cancel experiences using verified order state.
8. Build SEO, resource center, schema markup, sitemap, and metadata.
9. Build analytics taxonomy, UTM governance, funnel dashboard, and experiment registry.
10. Build admin security, catalog health, order evidence, webhook health, and release gates.
11. Run test-mode acceptance suite and generate a gap report.
12. Stop before live activation and present the owner with exact blockers, evidence, and the controlled release checklist.

---

## 17. FINAL BASE44 OUTPUT REQUIRED

Return:

1. Working application preview.
2. Route and component inventory.
3. Database/entity schema.
4. Complete 74-offer seeded catalog.
5. Environment-variable checklist with secret/client classification.
6. Stripe Product/Price mapping table.
7. Test-mode Checkout and webhook evidence.
8. Analytics event dictionary and funnel definitions.
9. SEO/content inventory.
10. Security, privacy, legal, accessibility, and performance gap report.
11. Release-gate matrix with evidence links.
12. Exact next action to reach one real customer → one real product → one verified live payment → one fulfilled order.

End of master transfer directive.
