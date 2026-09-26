# Unified content and system grid

This is the practical consolidation of the requested concepts. “Operational” means a tested local path exists; it does not mean a regulated production service has been deployed.

| Domain | Module | User-facing capability | v0.1 state | Evidence/output |
|---|---|---|---|---|
| Identity | Administrator auth | Scrypt login, session, CSRF, audit | Operational locally | `users`, `sessions`, `audit_logs` |
| Commerce | Product drafts | Create structured draft offers | Operational locally | `products` |
| Commerce | Revenue evidence | Per-currency ledger and CSV export | Operational locally; demo labeled | `revenue_events` |
| Payments | Shopify adapter | Read orders, signed webhooks | Configurable, requires server secret | integration runs and ledger |
| Payments | Stripe adapter | Read balances/payouts, signed webhooks | Configurable, requires server secret | integration runs and ledger |
| Wallet | MetaMask connection | EIP-191 challenge verification | Operational with injected wallet | `wallet_bindings` |
| Wallet | Withdrawal intent | Expiring signed authorization record | Operational; no transfer | `withdrawal_intents` |
| Wallet | Native balance | Optional read-only RPC lookup | Configurable | RPC response only |
| Workflow | Safe cycle | Five bounded validation tasks | Operational | `workflow_runs`, `guardian_runs` |
| Gamification | Karma | Internal engagement ledger boundary | Operational as zero-value ledger | `karma_ledger` schema |
| Guardians | Controller registry | 12 Arc Angels + 588 sub-profiles | Configured, not magically active | `guardians`, generated JSON |
| Analytics | Leaderboard | Rank measured successful runs and latency | Operational after runs | API and UI |
| Security | Local posture scan | Config, auth, HTTPS, ledger checks | Operational | scan response and audit |
| Commerce AI | Content/product generation | Human-reviewed draft workflow | Scaffold only | product draft API |
| Marketing | Campaign automation | Not implemented | Planned, requires provider approval | no fake deployment |
| Exchange/trading | Execution engine | Not implemented | Deliberately out of scope | no trading endpoint |
| Casino/gaming | Wagering | Not implemented | Requires separate legal/product review | no wagering endpoint |
| Token economy | MA/Karma conversion | Not implemented | Requires legal/economic design | no mint or conversion path |

## Product quality gate

Before a draft can be published, an operator must verify:

- actual deliverable and acceptance criteria;
- price, tax, refund, and delivery terms;
- privacy and data processing;
- support and escalation path;
- advertising claims;
- export/control restrictions;
- jurisdiction and age requirements;
- human approval and audit record.

## Scale rule

Scale the number of *validated workflows*, not the number of fictional buttons. A new feature is complete only when it has an owner, input contract, output contract, failure behavior, audit event, test, permission model, and rollback plan.
