# WEB3

**A pointer, not an implementation. This directory is empty on purpose.**

No wallet code ships in this layout. That is the safe default, not an omission.

## Generate a read-only Web3 application

```bash
melodie init ./WEB3/app --template web3
```

The default output is read-only. It will:

- connect to an injected EIP-1193 wallet (MetaMask and compatible)
- read chain id, block number, and balance
- build and print an **unsigned** withdrawal intent for a human to inspect

and it will **not**, under any circumstance, without explicit operator consent:

- generate, store, import or request a private key
- hold custody of any value
- sign anything
- broadcast anything
- run on a scheduled or autonomous basis

The generated application prints its own posture on startup:

```
Web3 mode: READ-ONLY
Signing: DISABLED
Broadcasting: DISABLED
Custody: NONE
Private keys: NOT GENERATED
```

## Enabling signing code

```bash
melodie init ./WEB3/app --template web3 --i-understand-this-signs-transactions
```

This writes two extra modules: `src/wallet/signing.ts` and
`src/wallet/broadcast.ts`. Read both before keeping them. They are inert until
called, and calling them is your decision, in your code, at your call site.

The flag name is the warning. It is recorded in shell history and CI logs on
purpose.

## What this is not

The presence of this directory is **not** a claim that Melodiespark has working
Web3 functionality. It is a pointer to a template that generates a read-only
application. `melodie status` reports Melodiespark's own on-chain capability as
`UNVERIFIED` at the BUSINESS layer, and that is the honest status.

## The withdrawal intent

The intent builder is the interesting part, and it is deliberately inert. It
produces a typed, expiring, canonically serialised payload with a display
digest. It does not sign it. The user takes the payload into their own wallet
and signs it there.

That matches the product's own boundary: *"Withdrawal intent | Expiring signed
authorization record | Operational; no transfer"*
(`apps/command-center/docs/CONTENT-GRID.md`).
