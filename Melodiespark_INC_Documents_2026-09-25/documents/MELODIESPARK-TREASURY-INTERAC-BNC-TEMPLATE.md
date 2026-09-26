# Melodiespark Inc. — Verified Treasury, MetaMask & Interac/BNC Settlement Template

Version: 1.0  
Mode: production architecture; fail-closed; human-approved settlement  
Jurisdiction target: Canada / Québec

## 1. Purpose

This template defines a real-money treasury workflow for Melodiespark Inc. It synchronizes verified commercial revenue into an auditable double-entry ledger, observes supported blockchain wallets, prepares compliant crypto-to-CAD conversion through an approved Canadian off-ramp, and guides an authorized operator through an Interac e-Transfer or linked-bank withdrawal whose destination is a verified BNC account.

It does **not** turn testnet assets, local Anvil balances, points, karma, rewards, estimates, invoices, or pending payments into revenue. It does **not** send cryptocurrency to a bank account number. It does **not** store banking credentials, wallet private keys, seed phrases, Interac answers, or exchange API secrets.

## 2. Non-negotiable invariants

1. Real revenue = real customer + delivered product/service + settled payment + verified ownership + evidence + audit record.
2. Commercial revenue, karma/rewards, and blockchain assets remain separate economies.
3. A wallet balance is an asset observation, not automatically revenue.
4. MetaMask is an external signer. The system never requests or stores its seed phrase or private key.
5. Every transfer, swap, sale, and withdrawal requires a fresh human approval tied to an exact quote, amount, destination, network, fee, and expiry.
6. `bnc.ca` is only the bank website/domain. It is not an Interac recipient identifier.
7. A BNC payout is eligible only through:
   - an off-ramp account already linked and verified to the corporation's BNC account; or
   - an Interac recipient email/mobile number independently verified by the operator.
8. No payout status becomes `SETTLED` until provider evidence and bank-side confirmation reconcile.
9. Any missing, mismatched, expired, unsupported, or ambiguous datum stops the workflow.

## 3. End-to-end workflow

| Stage | Required input | Validation | Output | Approval |
|---|---|---|---|---|
| Revenue intake | Provider transaction | Settled, owned, non-disputed, delivered | Evidence bundle | No |
| Classification | Source and purpose | Commercial vs reward vs blockchain | Ledger classification | Reviewer |
| Ledger posting | Balanced journal | Debits equal credits; idempotency key unique | Posted journal | Reviewer |
| Wallet sync | Public `0x…` address + chain | Checksum, chain ID, RPC quorum, confirmations | Read-only balances | No |
| Transfer proposal | Asset, amount, destination | Ownership, liquidity, fees, policy | Unsigned proposal | Treasury approver |
| MetaMask signing | Exact transaction | Chain, address, amount, calldata, gas recheck | Tx hash | User in MetaMask |
| Confirmations | Tx hash | Receipt success and confirmation threshold | Confirmed deposit | No |
| CAD conversion | Exchange quote | Regulated provider, quote expiry, fee/slippage | CAD proceeds | User/provider |
| Payout preparation | Linked BNC account or verified Interac recipient | Legal name match, limits, cooling period | Payout preview | Treasury approver |
| Provider confirmation | Exact payout summary | MFA and provider confirmation | Provider reference | User |
| Reconciliation | Provider + bank evidence | Amount, currency, reference, timestamps | Settled journal | Reviewer |

## 4. Project sections

```text
melodiespark-treasury/
  apps/
    treasury-console/       # interactive review and approval UI
    reconciliation-worker/  # confirmations and settlement matching
  services/
    revenue-evidence/       # payment-provider evidence ingestion
    ledger/                 # immutable double-entry journals
    wallet-observer/        # read-only EVM RPC adapter
    transaction-builder/    # unsigned EIP-1559 proposals
    offramp-router/         # approved exchange/provider adapters
    payout-orchestrator/    # Interac or linked-bank handoff
    audit/                  # append-only event/hash chain
  packages/
    domain/                 # money, assets, chains, identities, statuses
    policy/                 # limits, roles, approval rules
    schemas/                # JSON Schema / Zod contracts
    security/               # secret references, signatures, redaction
  evidence/
    revenue/ blockchain/ conversion/ payout/ reconciliation/
  migrations/ tests/ runbooks/ reports/
```

## 5. Canonical state machines

### Revenue

`OBSERVED → EVIDENCE_PENDING → VERIFIED → LEDGER_POSTED`

Terminal exceptions: `REJECTED`, `DISPUTED`, `REVERSED`.

### Blockchain transfer

`DRAFT → POLICY_CHECKED → APPROVAL_REQUIRED → APPROVED → SIGNATURE_REQUIRED → BROADCAST → CONFIRMING → CONFIRMED`

Terminal exceptions: `EXPIRED`, `REJECTED`, `FAILED`, `REPLACED`.

### Fiat payout

`INELIGIBLE → ELIGIBLE → QUOTED → APPROVAL_REQUIRED → PROVIDER_CONFIRMATION_REQUIRED → SUBMITTED → PROCESSING → SETTLED → RECONCILED`

Terminal exceptions: `EXPIRED`, `REJECTED`, `RETURNED`, `CANCELLED`, `FAILED`, `MANUAL_REVIEW`.

## 6. Core ledger accounts

| Code | Account | Type |
|---|---|---|
| 1000 | CAD operating bank | Asset |
| 1100 | Exchange CAD balance | Asset |
| 1200 | Crypto treasury at cost | Asset |
| 1210 | Crypto clearing | Asset |
| 1300 | Payment processor clearing | Asset |
| 2000 | Customer refunds payable | Liability |
| 2100 | Tax payable | Liability |
| 4000 | Product revenue | Revenue |
| 4010 | Service revenue | Revenue |
| 5000 | Processor fees | Expense |
| 5010 | Network/gas fees | Expense |
| 5020 | Conversion/off-ramp fees | Expense |
| 7000 | Realized crypto gain/loss | Gain/Loss |

Every journal contains `journal_id`, `idempotency_key`, `occurred_at`, `source_type`, `source_id`, `currency_or_asset`, balanced lines, evidence hashes, preparer, approver, and immutable audit reference.

## 7. Required configuration (secret references only)

```yaml
organization:
  legal_name: Melodiespark Inc.
  jurisdiction: CA-QC
treasury:
  operating_currency: CAD
  require_human_approval: true
  allow_automatic_transfer: false
  allow_private_key_storage: false
wallet:
  public_address: SET_AT_RUNTIME
  allowed_chain_ids: [1, 8453, 42161]
  signer: metamask
offramp:
  provider: SELECT_APPROVED_CANADIAN_PROVIDER
  credential_secret_reference: secret://treasury/offramp
  require_legal_name_match: true
payout:
  method: SELECT_LINKED_BANK_OR_INTERAC
  recipient_reference: secret://treasury/payout-recipient
  bank_label: BNC
  require_mfa: true
  require_final_click_by_user: true
```

Never place the recipient email/mobile number, bank account identifiers, API keys, or login data in source control, `.env.example`, reports, screenshots, URLs, or logs.

## 8. Interactive payout screen

The final screen must display:

- Provider and authenticated legal account name
- Source asset and confirmed available amount
- CAD sale quote, spread, fees, taxes/withholding fields, and expiry
- Net CAD available for withdrawal
- Payout method: linked BNC bank account or Interac e-Transfer
- Masked recipient identifier and independently verified recipient name
- Provider and daily limits; estimated settlement time
- Exact journal entries that will be created
- Evidence that will be retained
- A checkbox confirming the operator verified the recipient in the official provider interface
- A typed confirmation phrase: `APPROVE CAD <exact-net-amount>`
- A final handoff button: **Open official provider confirmation**

The application must not imitate the provider's login page or collect BNC credentials. The final confirmation occurs on the provider's official authenticated interface with MFA.

## 9. Approval policy

```json
{
  "policyVersion": "1.0",
  "defaultAction": "DENY",
  "privateKeyCustody": "FORBIDDEN",
  "automaticBroadcast": false,
  "automaticFiatPayout": false,
  "minimumApprovals": 1,
  "requireSecondApproverAboveCad": 5000,
  "requireFreshQuoteSeconds": 60,
  "requireRecipientCoolingPeriodHours": 24,
  "requireWalletAddressChecksum": true,
  "requireFirstAndLastSixAddressCheck": true,
  "requireProviderMfa": true,
  "requireBankSettlementEvidence": true
}
```

Production limits must be chosen by the corporation and provider; the example threshold is not authorization to transfer.

## 10. Evidence bundle

Each settlement produces a redacted bundle containing:

1. Revenue source transaction and ownership verification
2. Delivery/fulfilment evidence
3. Original ledger journal and approvals
4. Wallet address, chain ID, asset contract, decimals, and balance observation
5. Unsigned transaction digest and MetaMask-signed transaction hash
6. Blockchain receipt and confirmations
7. Off-ramp deposit reference and CAD conversion execution report
8. Fee and quote evidence
9. Masked payout destination, approval, provider payout reference, and status history
10. Bank-side settlement evidence
11. Reconciliation journal and cryptographic hashes

## 11. API boundary

| Method | Route | Effect |
|---|---|---|
| GET | `/revenue/eligible` | Read verified settled revenue |
| POST | `/revenue/:id/classify` | Reviewer classification |
| GET | `/wallets/:address/balances` | Read-only chain observation |
| POST | `/transfers/proposals` | Create unsigned proposal |
| POST | `/transfers/:id/approve` | Record scoped approval |
| POST | `/transfers/:id/receipt` | Record externally broadcast tx hash |
| POST | `/offramp/quotes` | Obtain expiring conversion quote |
| POST | `/payouts/previews` | Produce masked payout preview |
| POST | `/payouts/:id/approve` | Record approval; no money movement |
| POST | `/payouts/:id/handoff` | Open official provider confirmation |
| GET | `/payouts/:id/status` | Read provider status |
| POST | `/reconciliation/:id/run` | Match provider and bank evidence |

All mutation routes require authenticated role checks, CSRF protection, idempotency keys, request signatures where supported, structured redaction, and an append-only audit event.

## 12. Acceptance gates

- [ ] Corporate identity and off-ramp account verified
- [ ] BNC destination linked or Interac recipient independently verified
- [ ] MetaMask public address and each allowed chain verified
- [ ] No secrets or sensitive recipient data in repository/history/logs
- [ ] Revenue eligibility rejects testnet, rewards, pending, disputed, reversed, and simulated records
- [ ] Ledger journals balance and are idempotent
- [ ] RPC disagreement and chain mismatch fail closed
- [ ] MetaMask signing shows exact address, chain, asset, amount, calldata, and gas
- [ ] Off-ramp quote expiry and slippage controls tested
- [ ] New-recipient cooling period enforced
- [ ] Approval replay, tampering, and stale-session tests pass
- [ ] Provider failure, returned e-Transfer, and reorg recovery tested
- [ ] Bank settlement reconciliation tested with redacted evidence
- [ ] Independent security, accounting, and legal/compliance review completed
- [ ] Production release explicitly approved

## 13. Safe commissioning sequence

1. Configure sandbox/read-only provider access and public wallet addresses.
2. Import historical transactions without transfer permissions.
3. Reconcile balances and classify commercial revenue.
4. Run unit, integration, security, and failure-recovery tests.
5. Execute a provider-approved low-value production transaction with explicit approval.
6. Verify blockchain receipt, CAD conversion, payout receipt, and BNC settlement independently.
7. Reconcile the ledger; archive the redacted evidence bundle.
8. Increase limits only after review. Never enable unattended withdrawals.

## 14. Operator warning

Do not proceed when a recipient identifier is new, the displayed name differs, MFA behaves unexpectedly, a wallet/network is mismatched, a quote changed, a provider asks for a seed phrase, or evidence is incomplete. Cancel the operation, preserve the audit trail, and contact the provider or BNC using independently obtained official contact information.

