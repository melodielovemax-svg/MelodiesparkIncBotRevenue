# API contract

Base URL: `http://127.0.0.1:4173` in local development.

All API responses are JSON unless noted. Mutating requests require `Content-Type: application/json`, an administrator session, and `X-CSRF-Token` unless the endpoint is a signed webhook.

## Public/read endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/health` | Local liveness and version |
| GET | `/api/readiness` | Non-sensitive process, database, migration, and execution readiness |
| GET | `/api/config` | Non-secret runtime capabilities |
| GET | `/api/auth/status` | Setup/auth state; returns a derived CSRF token for an existing session |
| GET | `/api/catalog` | Currency, token, and chain reference catalog |
| GET | `/api/architecture` | Layer and boundary description |
| GET | `/api/dashboard` | Aggregated demo/ledger/workflow state; auth may be required in production |
| GET | `/api/revenue` | Paginated evidence and per-currency summary |
| GET | `/api/guardians` | Configured guardian registry |
| GET | `/api/leaderboard` | Measured workflow performance only |
| GET | `/api/workflows` | Safe cycle history |
| GET | `/api/products` | Draft catalog |
| GET | `/api/karma` | Internal points boundary |
| GET | `/api/integrations/status` | Redacted integration readiness |
| GET | `/api/v1/executions` | Authenticated execution list for the current account |
| GET | `/api/v1/executions/:id` | Authenticated execution state and transition history |
| GET | `/api/v1/execution-metrics` | Administrator-only aggregate execution outcomes |
| GET | `/api/market/prices` | Cached public USD reference prices |
| GET | `/api/wallet/challenge` | Short-lived EIP-191 challenge for an address |

## Authentication

### `POST /api/auth/login`

```json
{
  "email": "admin@example.invalid",
  "password": "a password configured locally"
}
```

Response includes a masked user object, CSRF token, and an HttpOnly session cookie.

### `POST /api/auth/logout`

Requires the session cookie and CSRF token.

## Wallet verification

### `GET /api/wallet/challenge?address=0x...&chainId=1`

Returns an ID, nonce, canonical human-readable message, hex message, and expiry. The message explicitly says it does not authorize a transaction.

### `POST /api/wallet/verify`

```json
{
  "challengeId": "uuid",
  "signature": "0x..."
}
```

The server verifies the signature against the stored challenge. If an administrator session exists, the address is bound to that account.

## Withdrawal authorization intent

### `POST /api/withdrawal-intents`

```json
{
  "chainId": 1,
  "amountEth": "0.01",
  "destination": "0x..."
}
```

The destination must already be connected and signature-verified for the authenticated account. The response contains a canonical message and `hexMessage`. It does not contain a transaction payload.

### `POST /api/withdrawal-intents/:id/sign`

```json
{
  "signature": "0x..."
}
```

The server verifies the signature and sets the record to `signature_verified_pending_review`. It never broadcasts a transaction.

### `GET /api/withdrawals`

Administrator-only review list. No payout provider is enabled in v0.1.

## Workflow and integration mutations

- `POST /api/workflows/run` — runs five local checks.
- `POST /api/integrations/sync` — performs configured read-only syncs; does not place orders or transfers.
- `GET /api/security/scan` — local configuration and workflow checks.
- `POST /api/products/drafts` — creates a local draft only.
- `GET /api/revenue/export.csv` — administrator CSV export with formula-injection protection.

## Durable bounded executions

`POST /api/v1/executions` creates an execution from an existing
`signature_verified_pending_review` withdrawal authorization intent. The intent
must belong to the authenticated account and must not be expired. The response
is queued while the existing `SafeWorkflowEngine` performs its bounded,
read-only cycle.

```json
{
  "authorizationIntentId": "intent-uuid"
}
```

The lifecycle is persisted as `proposed → authorized → queued → running →
succeeded | failed | cancelled`. Re-submitting the same intent is idempotent
and returns the original execution. `POST /api/v1/executions/:id/cancel` can
cancel queued or running work; a completed runner result is never converted
into a side effect. Process recovery marks interrupted running executions as
failed and resumes queued executions. The bounded runner timeout is controlled
by `EXECUTION_TIMEOUT_MS` and is clamped to 1–300 seconds. Execution responses contain no
authorization signature, integration credential, or private key.

## Signed webhooks

Webhooks are disabled unless `ALLOW_REMOTE_WEBHOOKS=true` and the corresponding secret is configured.

- `POST /api/webhooks/shopify`
- `POST /api/webhooks/stripe`

Shopify uses `X-Shopify-Hmac-Sha256` over the raw request body. Stripe uses the timestamped `Stripe-Signature` scheme. Invalid, missing, or expired signatures are rejected.

## Error shape

```json
{
  "error": {
    "code": "CSRF_INVALID",
    "message": "The security token is missing or invalid.",
    "requestId": "uuid"
  }
}
```

Do not log request bodies containing credentials, signatures, or personal information.

`/api/readiness` returns `200` only when the process is alive, SQLite is
available, schema version `0.2.0` is current, and execution admission is
active. During graceful shutdown it returns `503` with `execution: "draining"`;
it never includes credentials, signatures, authorization payloads, or runner
results.
