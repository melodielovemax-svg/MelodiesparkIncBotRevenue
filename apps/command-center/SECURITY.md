# Security policy

## Important incident action

If a live Stripe key, PayPal secret, bank credential, wallet seed phrase, private key, password, identity document, or other secret has been pasted into a chat, issue, prompt, log, screenshot, or source file:

1. revoke it at the provider immediately;
2. create a replacement with the narrowest possible permissions;
3. review provider access logs and payment events;
4. rotate dependent credentials and sessions;
5. remove the secret from history and artifacts where possible;
6. document the incident.

Do not test or reuse a key that may be exposed.

## Implemented controls

- Scrypt password hashes with per-password salts.
- Random, HTTP-only, SameSite session cookies.
- Deterministic per-session CSRF tokens checked on mutations.
- Same-origin checks and JSON content-type enforcement.
- Request body size limits and fixed-host integration adapters.
- Rate limits for login, wallet, webhook, and write actions.
- Security headers including CSP, frame denial, referrer policy, and permissions policy.
- Idempotent external revenue identifiers.
- HMAC verification for Shopify webhooks.
- Timestamped HMAC verification for Stripe webhooks.
- Server-side-only integration credentials.
- Audit events for authentication, exports, workflow runs, wallet verification, and intent signing.
- No private-key or seed-phrase fields in the application.
- No automatic trade, swap, token mint, fiat payout, or wallet transfer path.

## Trust boundaries

- The browser wallet is untrusted until a challenge signature is verified.
- External API responses are untrusted and are normalized before insertion.
- Demo records are never labeled as live revenue.
- A signed withdrawal intent is authorization evidence, not a blockchain transaction.
- Karma is an internal application metric, not a token or investment.

## Reporting

Do not open a public issue containing secrets or personal data. Report suspected vulnerabilities privately to the project owner using a secure channel, with:

- affected version;
- reproduction steps using synthetic data;
- impact;
- suggested mitigation.

## Production requirements

Before exposing this application to other users, add a real identity provider, MFA, managed secret storage, PostgreSQL, HTTPS termination, rate-limit infrastructure, dependency scanning, SAST/DAST, centralized logs, backups, restore tests, privacy workflows, KYC/AML controls where applicable, and independent security review.
