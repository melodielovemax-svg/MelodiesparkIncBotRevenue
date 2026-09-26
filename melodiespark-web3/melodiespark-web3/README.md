# MelodieOS Revenue Nexus — Web3 Control Plane

A dependency-free browser application inspired by the supplied MelodieOS Revenue Nexus control-plane design.

## What is operational in this baseline

- Responsive dark control-plane UI.
- Navigation for Overview, Revenue Loops, Products & Services, Karma Network, Wallet Treasury, Builder Studio, and Verification & Audit.
- EIP-1193 browser-wallet connection (`window.ethereum`).
- Live wallet account, chain ID, and native ETH balance read through the connected wallet provider.
- User-initiated message signing for a verification proof.
- Local activity/audit events for wallet connection and verification actions.
- Explicit safety states that prevent the UI from inventing revenue, karma, payment, or business activity.
- Transaction execution intentionally disabled until a real contract/address, network, allowlist, limits, simulation and confirmation flow are configured.

## What is NOT claimed

This repository does not establish that Melodiespark INC has customers, revenue, payment processing, a production treasury, a deployed smart contract, or a live impact ledger. Those require external evidence and verification.

## Run

### Simplest
Open `index.html` in a modern browser. For wallet extensions, a local HTTP server is recommended.

### PowerShell

```powershell
cd C:\path\to\melodiespark-web3
py -m http.server 4173
```

Then open `http://127.0.0.1:4173` and connect a browser wallet.

## Production next steps

1. Add a real backend API with authentication and role-based access control.
2. Add verified payment connectors and reconciliation jobs.
3. Add an indexed chain data service instead of relying only on browser RPC.
4. Add smart-contract addresses and audited ABIs per supported network.
5. Add transaction simulation, allowlists, spending limits, nonce/receipt checks and multisig policy.
6. Add persistent append-only audit storage.
7. Add automated tests and runtime evidence before changing capability states to OPERATIONAL.
8. Deploy behind TLS, secure headers, secrets management and monitoring.

The wallet layer is deliberately based on standard browser-provider behavior. Wagmi and Viem are also suitable production TypeScript options for a React implementation. See the official documentation for current APIs.
