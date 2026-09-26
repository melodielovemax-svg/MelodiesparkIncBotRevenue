# Web3 Wallet Gateway

## Lifecycle

Wallet Connection
→ Address Verification
→ Balance Query
→ Transaction Construction
→ Gas Estimation
→ Simulation
→ Policy Check
→ Authorization
→ Broadcast
→ Receipt
→ Confirmation
→ Reconciliation

## Wallet Security

The application must never request:

- seed phrase
- private key

## Transfer Evidence

Required where applicable:

- chain
- sender
- recipient
- asset
- amount
- nonce
- gas
- transaction hash
- receipt
- confirmation
- reconciliation reference

A UI success message is not blockchain evidence.
