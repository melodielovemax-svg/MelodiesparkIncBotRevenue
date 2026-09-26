# Melodiespark — 200 Revenue Automation, Wallet, Web3, and Real-Ledger Build Texts

Use these texts as implementation prompts for a coding agent. Never label test funds, points, rewards, pending payments, or simulated data as revenue. Never request or store seed phrases or private keys. All transfers require explicit human approval and an external wallet signature.

## 1. Revenue foundation (1–20)

1. Build a production revenue-ingestion service that accepts only authenticated provider events and rejects fabricated or manually inflated balances.
2. Create a canonical revenue record containing customer, product, payment, currency, gross amount, fees, net amount, timestamp, provider ID, and evidence hash.
3. Enforce the rule REAL CUSTOMER + REAL PRODUCT + REAL PAYMENT + VERIFIED EVIDENCE + AUDIT RECORD before revenue becomes verified.
4. Separate commercial revenue, loyalty points, blockchain assets, refunds, disputes, and test transactions into distinct ledgers.
5. Add idempotency keys so duplicate webhooks never create duplicate revenue.
6. Validate every monetary amount with fixed-precision decimal arithmetic and ISO currency codes.
7. Reject events missing customer, product, payment-provider reference, or verifiable evidence.
8. Create immutable status transitions: received, pending verification, verified, available, restricted, refunded, disputed, and withdrawn.
9. Record gross revenue, processor fees, taxes, refunds, chargebacks, and net revenue independently.
10. Add provenance fields identifying the source platform, account, environment, and ingestion adapter.
11. Create a revenue dashboard that defaults to verified balances and clearly labels pending or unverified amounts.
12. Implement daily reconciliation between internal records and payment-provider settlement reports.
13. Generate mismatch alerts without silently modifying financial records.
14. Build a correction workflow using append-only adjustment entries rather than destructive edits.
15. Require role-based approval for manual evidence review and revenue reclassification.
16. Create searchable evidence links for every verified transaction.
17. Store timestamps in UTC while displaying the user’s selected timezone.
18. Add currency conversion as a separate valuation record with source, rate, and timestamp.
19. Prevent future-dated, negative, malformed, or impossible transaction events from entering the verified ledger.
20. Produce an end-to-end acceptance test proving one real customer, one real product, one real payment, and one audit record.

## 2. Sales and billing automation (21–40)

21. Connect the product catalog to approved payment-provider price identifiers and verify all mappings at startup.
22. Build checkout-session creation with authentication, rate limiting, idempotency, and server-side price validation.
23. Never trust product names, prices, discounts, taxes, or totals supplied by the browser.
24. Process payment success only from signed provider webhooks, never from redirect-page query parameters.
25. Create customer records from verified checkout data while preventing duplicates across email and provider IDs.
26. Implement subscription lifecycle events for activation, renewal, cancellation, failure, pause, and refund.
27. Generate invoices linked to the exact customer, order, payment, tax, and fulfillment evidence.
28. Add discount-code validation with scope, expiry, redemption limits, and audit history.
29. Queue fulfillment only after payment evidence reaches the required verified state.
30. Suspend automated fulfillment when a payment becomes disputed, reversed, or fraudulent.
31. Create retry-safe workers with exponential backoff and dead-letter queues.
32. Add transactional outbox processing so database commits and downstream events remain consistent.
33. Build email receipts from verified transaction data without exposing internal secrets.
34. Generate entitlement records for purchased software or services with revocation support.
35. Track lead source, campaign, conversion, customer acquisition cost, and verified lifetime value.
36. Add affiliate attribution that pays commissions only after settlement and refund windows pass.
37. Require approval before changing commission rates, payout destinations, or high-value pricing.
38. Build abandoned-checkout follow-up that respects consent, unsubscribe rules, and frequency limits.
39. Create revenue forecasts that are clearly labeled projections and never merged with realized revenue.
40. Run checkout, webhook, refund, dispute, and reconciliation tests before enabling production billing.

## 3. Backend operations (41–60)

41. Deploy API services behind TLS with authenticated service-to-service communication.
42. Store secrets in a managed secret store and never commit them to source control or logs.
43. Implement least-privilege database accounts for API, workers, analytics, and migrations.
44. Encrypt sensitive data in transit and at rest with documented key rotation.
45. Add structured logs containing correlation IDs but excluding credentials and personal financial data.
46. Create health, readiness, and liveness endpoints that verify real dependencies safely.
47. Add metrics for event lag, webhook failures, reconciliation mismatches, queue depth, and provider errors.
48. Establish service-level objectives for checkout availability and revenue-event processing latency.
49. Configure automated backups and perform documented restore tests.
50. Use database migrations with forward and rollback plans for every ledger schema change.
51. Prevent concurrent workers from processing the same financial event through durable locks or unique constraints.
52. Add circuit breakers for unstable payment, RPC, pricing, and notification providers.
53. Implement graceful shutdown so in-flight financial work is completed or safely requeued.
54. Create environment separation for development, staging, and production with unmistakable labels.
55. Block test-mode provider keys and test chain IDs from production startup.
56. Scan dependencies, containers, and source code for known vulnerabilities and exposed secrets.
57. Require signed release artifacts and retain build provenance for production deployments.
58. Create a canary deployment plan with automatic rollback on payment or ledger errors.
59. Add feature flags for new financial integrations, defaulting every risky capability to disabled.
60. Produce a runtime evidence bundle containing version, configuration fingerprint, tests, health checks, and deployment timestamp.

## 4. Wallet discovery and synchronization (61–80)

61. Connect wallets through EIP-1193 and require the user to select and approve the account.
62. Never infer, shorten, replace, or silently correct a destination wallet address.
63. Display and require comparison of the first six and last six characters before any signing request.
64. Detect chain changes and account changes immediately, invalidating stale transaction previews.
65. Synchronize native-asset balances using multiple trusted RPC endpoints with quorum checks.
66. Synchronize token balances only from an allowlisted contract registry with verified chain IDs.
67. Record wallet observations as read-only snapshots containing block number, RPC source, and timestamp.
68. Distinguish spendable, locked, staked, pending, bridged, and unverified token balances.
69. Never classify wallet assets as company revenue without verified acquisition and accounting evidence.
70. Add checksum-address validation and reject invalid addresses before preparing transactions.
71. Resolve token decimals and symbols from trusted metadata while storing raw integer amounts.
72. Detect malicious or unknown tokens and hide them from default valuation totals.
73. Build wallet-connect session expiry, revocation, and device-management controls.
74. Create a receive screen with full address, chain, QR code, and copy verification.
75. Create a send preview showing asset, raw amount, fiat estimate, gas, destination, chain, and warnings.
76. Keep transaction construction separate from signing and broadcasting.
77. Require an external signer such as MetaMask; never ingest seed phrases or private keys.
78. Disable automatic transfers, automatic approvals, unlimited token allowances, and background signing.
79. Reconcile wallet observations against confirmed on-chain transactions at finalized block depth.
80. Mark wallet synchronization operational only after account, chain, RPC, token, and reorg tests pass.

## 5. Real blockchain ledger (81–100)

81. Create an append-only blockchain transaction table keyed by chain ID and transaction hash.
82. Store block number, block hash, sender, recipient, nonce, value, gas, status, and confirmation depth.
83. Treat submitted transactions as pending until confirmed by the required finality policy.
84. Detect chain reorganizations and reverse previously derived ledger states through compensating entries.
85. Verify transaction receipts directly against trusted RPC endpoints before marking transfers confirmed.
86. Decode contract events using the exact verified ABI and deployed contract address.
87. Reject logs whose chain, address, topic, or ABI does not match the configured contract registry.
88. Link every on-chain entry to its source transaction and immutable evidence hash.
89. Maintain separate ledgers per blockchain network and never merge testnet assets with mainnet assets.
90. Create a network registry containing chain ID, currency, explorer, RPC health, and finality requirements.
91. Pin every production smart-contract integration to an approved address and code hash.
92. Detect proxy upgrades and freeze processing until the new implementation is reviewed.
93. Index blocks incrementally with durable checkpoints and replay support.
94. Ensure indexer retries are idempotent and cannot duplicate transfers or balances.
95. Compare indexed balances with direct contract calls and flag discrepancies.
96. Add archival evidence for transaction receipts, relevant logs, and verification timestamps.
97. Label fiat values as timestamped estimates from identified pricing sources.
98. Produce chain-specific audit exports without exposing private customer data.
99. Run forked-network tests for success, revert, nonce conflict, gas spike, and reorganization scenarios.
100. Declare the blockchain ledger operational only when live RPC evidence and reconciliation checks succeed.

## 6. Transaction safety and approvals (101–120)

101. Default treasury policy to read-only, approval-required, external-signer-required, and broadcast-disabled.
102. Require explicit user confirmation for the exact asset, amount, network, destination, gas limit, and fee.
103. Generate a transaction intent ID and expire it after a short configurable window.
104. Rebuild the preview when balances, gas, nonce, account, chain, or destination changes.
105. Block transfers exceeding configurable per-transaction and daily limits.
106. Require stronger multi-party approval for high-value or unusual transactions.
107. Add destination allowlists with delayed activation and independent review.
108. Warn on new destinations, smart contracts, bridges, mixers, and high-risk token approvals.
109. Simulate transactions using a trusted node before requesting a signature.
110. Display decoded contract actions instead of opaque calldata whenever possible.
111. Reject unlimited ERC-20 approvals unless the user deliberately overrides a clear warning.
112. Never sign, broadcast, or transfer funds from a background worker without a fresh approved intent.
113. Verify the signed transaction matches the approved intent before broadcasting.
114. Broadcast through a monitored RPC and retain the exact signed transaction hash.
115. Track replacement, cancellation, dropped, reverted, and confirmed transaction states.
116. Create emergency pause controls that stop new transaction preparation and broadcast.
117. Separate transaction proposers, approvers, and auditors using role-based access control.
118. Record every approval decision with actor, timestamp, scope, policy version, and reason.
119. Require post-transaction reconciliation against wallet balances and blockchain receipts.
120. Test transaction controls with wrong-chain, wrong-address, stale-nonce, insufficient-funds, and malicious-calldata cases.

## 7. Reconciliation and accounting (121–140)

121. Build a three-way reconciliation across payment provider, internal revenue ledger, and bank settlement.
122. Build a separate on-chain reconciliation across wallet snapshot, indexed transfers, and RPC balance.
123. Never reconcile commercial revenue and crypto asset appreciation as the same economic event.
124. Use append-only journal entries with balanced debits and credits for accounting exports.
125. Track settlement delays, processor reserves, payout fees, exchange fees, and network gas separately.
126. Link refunds and chargebacks to the original sale without deleting the original record.
127. Create exception queues for missing settlements, duplicate events, value mismatches, and stale confirmations.
128. Require reviewer sign-off before resolving material reconciliation exceptions.
129. Store evidence for each exception decision and resulting adjustment.
130. Generate daily opening balance, activity, closing balance, and variance reports.
131. Reconcile token decimals and raw units before computing human-readable totals.
132. Prevent stale price feeds from being used for current fiat valuation.
133. Preserve original currency amounts when producing converted reports.
134. Mark tax calculations as estimated until validated by the configured tax provider or accountant.
135. Create audit-ready exports with stable identifiers and cryptographic checksums.
136. Add period-close controls that prevent silent edits to closed financial periods.
137. Implement authorized reopening through recorded adjustment entries and approval.
138. Test reconciliation against duplicate webhooks, partial refunds, reorgs, missing payouts, and currency rounding.
139. Report unresolved variances prominently and exclude them from verified available balances.
140. Declare a period reconciled only when all required sources match or approved exceptions are documented.

## 8. Security, compliance, and fraud controls (141–160)

141. Add multi-factor authentication for administrators, approvers, and treasury operators.
142. Use short-lived sessions, secure cookies, CSRF protection, and device-aware risk checks.
143. Rate-limit authentication, checkout, webhook, wallet, and transaction endpoints independently.
144. Validate signed webhooks using raw request bytes, current secrets, and replay protection.
145. Run sanctions, jurisdiction, and identity checks only where legally required and with documented retention.
146. Apply transaction-monitoring rules proportionate to the product, geography, and regulatory obligations.
147. Hold suspicious payments or withdrawals for human review rather than auto-releasing them.
148. Detect account takeover signals such as new devices, impossible travel, and abrupt destination changes.
149. Prevent mass assignment, injection, broken authorization, and insecure direct object references.
150. Use content security policy and wallet-provider isolation to reduce browser injection risk.
151. Maintain a complete inventory of secrets, keys, certificates, contracts, providers, and owners.
152. Rotate compromised credentials immediately and invalidate affected sessions and webhook secrets.
153. Create incident-response playbooks for payment fraud, wallet compromise, RPC corruption, and data breach.
154. Log security events to tamper-evident storage with access monitoring.
155. Minimize personal data collection and define deletion, retention, and legal-hold policies.
156. Add dependency pinning, software bills of materials, and signature verification.
157. Perform threat modeling for checkout, webhooks, workers, wallets, smart contracts, and administrator actions.
158. Conduct smart-contract review and independent audit before any production treasury interaction.
159. Run penetration and authorization tests before enabling production financial capabilities.
160. Keep production launch blocked until critical findings are resolved and documented.

## 9. Observability and autonomous operations (161–180)

161. Create an operations dashboard showing verified revenue flow, queue health, provider status, RPC health, and reconciliation state.
162. Alert on webhook signature failures, processing lag, duplicate spikes, and settlement mismatches.
163. Alert on chain reorgs, RPC divergence, abnormal gas, nonce gaps, and contract-address changes.
164. Use correlation IDs across checkout, payment, fulfillment, ledger, and audit events.
165. Trace every verified revenue record back to its original signed provider event.
166. Trace every wallet balance back to a block number and RPC observation.
167. Implement automatic retry only for safe idempotent operations.
168. Route non-idempotent or ambiguous failures to a human-reviewed exception queue.
169. Add dead-letter replay tooling that previews impact before reprocessing events.
170. Define runbooks for degraded payment providers, failed databases, stalled queues, and unreliable RPC nodes.
171. Fail closed when evidence, identity, chain, price, or policy data cannot be verified.
172. Add maintenance mode that preserves reads while disabling checkout or transaction creation safely.
173. Measure verified revenue throughput separately from attempted, pending, rejected, and simulated events.
174. Forecast capacity for webhook bursts, block indexing, analytics queries, and evidence storage.
175. Use synthetic tests only in labeled non-production accounts and exclude their data from revenue totals.
176. Run scheduled integrity checks over audit hashes, ledger balances, and evidence references.
177. Produce daily signed operational summaries with unresolved risks and blocked gates.
178. Automatically quarantine corrupted or inconsistent events without deleting source evidence.
179. Escalate only actionable anomalies with evidence, impact, and recommended response.
180. Mark automation healthy only when dependencies, queues, evidence, reconciliation, and security controls are healthy.

## 10. Release, governance, and proof (181–200)

181. Define release gates for implemented, tested, verified, audited, approved, deployed, and observed states.
182. Never describe a component as fully operational based only on generated source code.
183. Require passing unit, integration, end-to-end, security, failure-recovery, and reconciliation tests.
184. Generate a deployment manifest containing commit, artifact digest, environment, migrations, and approvers.
185. Preserve a rollback artifact and tested rollback procedure for every financial release.
186. Require change review for ledger rules, payment mappings, wallet policies, contract addresses, and limits.
187. Maintain a policy-as-code repository with versioned approvals and automated enforcement tests.
188. Create a separation-of-duties matrix for developers, operators, finance reviewers, and treasury approvers.
189. Produce evidence that production endpoints, databases, queues, webhooks, and RPC connections are live.
190. Verify that production uses real provider accounts while ensuring secrets never appear in reports.
191. Execute one controlled low-value real transaction only after the owner explicitly approves its exact terms.
192. Capture the payment evidence, ledger entry, fulfillment result, settlement state, and audit chain for that transaction.
193. Execute wallet synchronization in read-only mode and document account, chain, block, and balance evidence.
194. If a blockchain transfer is required, prepare it without signing and present the complete human-readable preview.
195. Require the owner to approve and sign through the external wallet; never automate that consent.
196. Confirm the resulting transaction receipt at the configured finality depth and reconcile the ledger.
197. Publish a launch report listing passed gates, failed gates, unresolved risks, and exact remediation steps.
198. Keep capabilities behind disabled feature flags whenever their evidence gates have not passed.
199. Define “fully activated” as deployed, connected, tested, verified, reconciled, monitored, approved, and evidence-backed.
200. Deliver the final system only with zero fabricated revenue, zero embedded private keys, zero silent transfers, and a complete auditable proof chain.

## Canonical activation contract

The system may display **FULLY OPERATIONAL** only when runtime deployment, provider connectivity, verified real transactions, wallet read-only synchronization, real-chain receipt verification, reconciliation, monitoring, approvals, and audit evidence have all passed. Code generation alone is **IMPLEMENTED**, not **ACTIVATED**.
