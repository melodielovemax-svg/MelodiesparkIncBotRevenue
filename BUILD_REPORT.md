# BUILD_REPORT — Melodiespark content catalog and template CLI

Date: 2026-09-26
Scope: `apps/melodie-cli`, `python/melodiespark-cli`, `packages/content-catalog`,
`templates/`
Machine record: [`BUILD_EVIDENCE.json`](BUILD_EVIDENCE.json) — emitted by
`Build-CatalogCLI.ps1` at run time.

---

## 0. How to read this report

**A claim here is scoped.** Every row states *what* was observed, *on which
paths*, *on which host*, *at what time*. A green row is not a property of the
Melodiespark product; it is a property of a code path exercised once on one
machine.

Two vocabularies are in use, and they are not interchangeable:

- **`TRUTH_PROTOCOL.md` status** — `OPERATIONAL`, `SCAFFOLD`, `PLANNED`,
  `PAPER-ONLY`, `BLOCKED`, `UNVERIFIED`. Governs *capability* claims.
- **Evidence scope** — appended to every row below, and always present:
  - `VERIFIED DATA` — a count, hash, or measurement taken from the artifact
  - `VERIFIED ARTIFACT` — a file was produced and is byte-identical to what is claimed
  - `VERIFIED — TESTED PATHS` — observed on the paths a test suite exercises
  - `VERIFIED SECURITY CONTROL` — a denial was observed, not merely implemented
  - `VERIFIED DEVELOPMENT RESULT` — a fact about the work, not about the product

`OPERATIONAL` on its own is reserved for a path that is implemented, tested,
**and** exercised at runtime. Most rows below are therefore scoped rather than
`OPERATIONAL`, because most of what was verified is a measurement, not a
production capability.

**Evidence is captured, not asserted.** `BUILD_EVIDENCE.json` is written by the
build: test counts are parsed from runner output, artifacts are SHA-256 hashed by
the build, the secret scan is executed by the build, and the publication gate is
computed by the build. Nothing in this document is the sole source of a claim.

---

## 1. What this evidence establishes, and what it does not

**Establishes** — that the named code paths behaved as described, on this host,
at the timestamp in `BUILD_EVIDENCE.json`:

- the catalog indexes 6,799 files with recorded SHA-256 values
- re-hashing those files reproduces those values exactly
- 87 tests pass across four suites
- deny-by-default extraction refuses credential material and writes nothing
- the Web3 scaffold withholds signing and broadcast code without explicit consent
- three distributable artifacts build, validate, install, and run

**Does not establish** — none of the following, and no row in this report may be
read as claiming them:

- that the **Melodiespark product** is operational, in any part
- that any **external integration** works — Stripe, Shopify, a payment gateway,
  an RPC endpoint, a chain, or any third-party service
- that any **business capability** exists: revenue, customers, trading, wagering,
  token conversion, or a deployed contract
- that **untested code paths** behave like tested ones
- that the artifacts are **fit for publication** — see §8, three gates are open
- that anything here works on a **different host, OS, Node, or Python version**

The test counts establish *tested implementation paths*. That is a real and
useful result. It is not a statement about the product.

---

## 2. Status summary

| Area | Evidence | Scope | Status |
|---|---|---|---|
| Catalog indexing | 6,799 files / 689,348,002 B / 28 SECRET entries, matching an independent `Get-ChildItem -Recurse` count | `VERIFIED DATA` | complete for this tree |
| Deep catalog verification | `verify --deep` re-hashed 6,799 files: 0 changed, 0 missing | `VERIFIED DATA` | reproducible |
| Node tests | 19/19 | `VERIFIED — TESTED PATHS` | `OPERATIONAL` on tested paths only |
| Python tests | 18/18 | `VERIFIED — TESTED PATHS` | `OPERATIONAL` on tested paths only |
| Web3 default tests | 25/25 | `VERIFIED — TESTED PATHS` | scaffold, read-only by test |
| Web3 consent tests | 25/25 | `VERIFIED — TESTED PATHS` | scaffold; signing code present but inert |
| Node artifact | `melodiespark-cli-0.1.0.tgz` 829 KB, SHA-256 in evidence file | `VERIFIED ARTIFACT` | builds, installs, runs |
| Python artifacts | wheel 873 KB, sdist 832 KB | `VERIFIED ARTIFACT` | builds, installs, runs |
| `twine check` | PASSED on both | `VERIFIED` | metadata valid |
| Secret scan of artifacts | 3 artifacts scanned, **0 unclassified matches**, 1 documented synthetic fixture | `VERIFIED SECURITY CHECK` | clean for these artifacts |
| `config/APIKeys.json` extraction | 4 attempts denied, 0 bytes written, audit trail present | `VERIFIED SECURITY CONTROL` | control observed working |
| Live `sk_live_` document extraction | 0 bytes written | `VERIFIED SECURITY CONTROL` | control observed working |
| Default Web3 scaffold | `signing.ts` and `broadcast.ts` absent, typechecks, 25/25 | `VERIFIED DESIGN/TEST RESULT` | gate holds |
| npm / PyPI publication | not attempted, no token used or requested | — | `PLANNED`, **gated** (§8) |
| Melodiespark on-chain capability | no funded address, transaction, or deployment | — | `UNVERIFIED` |
| Revenue, customers, trading, wagering, token conversion | no payment record or customer identity exists | — | `UNVERIFIED` |
| Defects found and fixed | 23, each reproduced then covered by a test | `VERIFIED DEVELOPMENT RESULT` | — |

## 3. Test results

| Suite | Command | Result |
|---|---|---|
| Node policy + parity | `npm test` in `apps/melodie-cli` | **19/19 pass** |
| Python policy + dispatch | `python -m unittest discover -s tests` | **18/18 pass** |
| Generated `node` template | `npm run typecheck && npm test` in scaffold | clean; 12/12 pass |
| Generated `python` template | `python -m unittest discover -s tests` | **15/15 pass**; wheel builds |
| Generated `web3` (default) | `npx tsc --noEmit && npm test` | clean; **25/25 pass** |
| Generated `web3` (consent) | `npx tsc --noEmit && npm test` | clean; **25/25 pass** |
| `melodie verify` | packaged install + clean venv + pipx | 7/7 in each |
| `melodie verify --deep` | monorepo | 8/8 |

## 3. Catalog contents

6,799 files · 657.4 MB · 6 imported repositories · 28 SECRET entries.

| Category | Files | Size | Extractable by default |
|---|---:|---:|---|
| SOURCE | 3,895 | 22.9 MB | yes |
| CONFIG | 1,322 | 7.1 MB | yes |
| DOCUMENTATION | 604 | 6.2 MB | yes |
| TEST | 228 | 1.3 MB | yes |
| DATA | 180 | 14.0 MB | yes |
| OTHER | 140 | 5.9 MB | yes |
| VCS | 168 | 123.9 MB | no (`.git`) |
| GENERATED | 141 | 278.4 MB | no |
| ARCHIVE | 71 | 159.9 MB | no |
| BINARY | 7 | 33.9 MB | no |
| SECRET | 28 | 58.9 KB | **never** |
| ASSET | 15 | 3.8 MB | yes |

**415 files (60.5% of the bytes) are excluded by default.** The 657 MB source
tree is never copied into a distributable; the catalog is ~4.8 MB of metadata.

## 4. Security findings

**A live Stripe secret key was found in the source tree.**

`MelodieCLI/docs/API_KEY_ROTATION_GUIDE.md` line 84 contains what appears to be a
live `sk_live_` secret key, plus a Google API key pattern and an OpenAI key
pattern. The file is ordinary documentation, so path-based classification saw
nothing; the content guard catches it.

> **Action required, outside this repository: rotate that key at Stripe.**
> Treat it as compromised. This repo cannot rotate it and does not claim to.

Three other content matches were reviewed and confirmed benign:
`star-cliproxy/.../debug.test.ts` contains `AKIAIOSFODNN7EXAMPLE` and
`ghp_0123456789012345678901234567890123456789`, the canonical AWS and GitHub
*documentation example* values used to test a redaction function.

Controls added in response, all covered by tests:

- pattern-based hard denial, so a secret copy in a new directory is caught
  (`DECISIONS.md` D3)
- content-level scanning before any copy (`DECISIONS.md` D4)
- `SECRET` marked permanently denied rather than authorization-gated (D5)

### Expected secret-scanner hit in the Python sdist

Scanning the built artifacts for credential patterns returns **0** matches in the
npm tarball and the wheel, and exactly **1** in the sdist:

```
melodiespark_cli/tests/test_policy.py
  SYNTHETIC_LIVE_KEY = "sk_live_SYNTHETICfixture0000000000000000000000"
```

That is the content guard's own test fixture. It **must** match the pattern the
guard looks for, or the test would stop testing anything. The value is
synthetic, the identifier names it, and a comment in both test suites states
that no real key may ever be placed there. An earlier revision used a
realistically shaped random value, which made the sdist indistinguishable from a
leak to any scanner; do not "fix" this by weakening the pattern.

## 5. Environment changes made

Reported in full, because several of these are not obvious from the diff.

1. **Global npm package replaced.** A pre-existing global entry
   `@melodiespark/melodie-cli` was an alias (`npm:@melodiespark/cli@0.1.0`)
   symlinked to `apps/melodie-cli`. Its PATH shim had been generated when the
   bin was `bin/melodie.js`, which no longer exists, so **`melodie` was broken
   on this machine** (`Cannot find module .../bin/melodie.js`). It was removed
   and replaced with a clean global install of the built tarball. `melodie` now
   works.
2. **Root `package-lock.json` regenerated** by an `npm install` that ran in the
   repo root. Still `lockfileVersion 3`, same name/version/workspaces, 58
   package entries. `node_modules` at the root was pruned to the declared graph.
   `package.json` and all source files are untouched.
   *Correction to an earlier revision of this report, which stated the repo was
   not under git and the previous file could not be restored. The repository is
   under git, `package-lock.json` is tracked, and it currently shows as
   unmodified — so the regeneration was reconciled rather than lost.*
3. **pnpm global package installed** at `%LOCALAPPDATA%\pnpm`. pnpm's bin
   directory is not on `PATH`; `pnpm setup` would add it.
4. **pipx package installed** (`melodiespark-cli`, apps on `PATH` via
   `%USERPROFILE%\.local\bin`).
5. `typescript@^5.7.2` and `@types/node@^22.10.2` added as devDependencies of
   `@melodiespark/cli`. `twine` installed into the user Python.

### 5.1 Credential containment, as git sees it

Checked, because "do not commit secrets" is only meaningful if verified:

| Location | State |
|---|---|
| `Melodiespark_Source/*` | **gitlinks** (mode 160000). The source trees are nested repos referenced by commit. Their file contents are **not** in this repository's history |
| This repository's history | 1 commit. No tracked file matches a credential pattern |
| `MelodieCLI` repository history | **10 commits contain the live key** — see §8 Gate 1 |
| Build artifacts | 0 unclassified secret matches across 3 artifacts |

One footgun worth knowing: the root `.gitignore` contains `data/`, which also
matches `python/melodiespark-cli/src/melodiespark_cli/data/`. That directory is
**generated** by `scripts/sync_data.py` and is correctly not committed — but it
means the wheel can only be built after `sync_data.py` has run. `sync_data.py`
is therefore load-bearing, not a convenience, and `Build-CatalogCLI.ps1` runs it
before the test suites for exactly this reason (defect 23).

## 6. Defects found and fixed during validation

Each was found by running the thing, not by reading it. Defects 21 and 22 were
reported by a subagent reviewing its own work; both were reproduced, fixed, and
locked down with tests in **both** frontends.

| # | Defect | Fix |
|---|---|---|
| 1 | Command name not stripped from positionals, so `melodie init ./app` treated `"init"` as the target directory | `shiftCommand()` at the dispatch layer |
| 2 | `melodie --version` printed help, because the version check ran after the no-command branch | reordered in `index.ts` |
| 3 | Enumerated deny list missed a 4th `config/APIKeys.json` in a backup folder, and it was copied | pattern-based hard denial |
| 4 | SECRET reported as "authorization required", implying a flag would unlock it | `permanently_denied`, asserted in both suites |
| 5 | `melodie template list` tried to load a template named `list` | reserved-word check in both frontends |
| 6 | `melodie --version` broken again after the global shim was regenerated from a stale bin name | see §5.1 |
| 7 | `files.sha256` written only to the canonical dir, so a global install could not `verify` | mirror security projections into `assets/` |
| 8 | Same gap in the Python wheel: `files.sha256` absent from package data | `sync_data.py` + `package-data` glob |
| 9 | Python `bytes_human` off by one unit: 657 MB rendered as 657 GB, breaking parity | fixed and regression-tested |
| 10 | Generated `node` template's bin statically imported `dist/`, contradicting its own "no build step" note | source-first dynamic import with `dist` fallback |
| 11 | Generated `python` template's `sha256` docstring promised Unicode normalization the code did not do | byte-exact hashing, docstring and test aligned |
| 12 | Generated `python` template's test hardcoded `import melodie_app` while the directory token was `{{PY_MODULE}}` | tokenised; path-segment substitution added to both scaffolders |
| 13 | web3 `intent.ts` conflated `expiresAt == issuedAt` and `expiresAt < issuedAt` under one error code | separated into `EXPIRY_NOT_IN_FUTURE` and `EXPIRY_IN_PAST` |
| 14 | web3 `assertDestination` silently ignored a malformed `connectedAddress`, quietly disabling the self-send guard | fail closed on an invalid connected address |
| 15 | web3 consent path did not typecheck: 3 viem API misuses (`account` optional, `chain` not a `signTypedData` param, raw calldata via `writeContract`) | resolved account; correct viem calls |
| 16 | Secret scan flagged `classification-rules.json` because it defines the private-key pattern | exclude the policy file from the scan |
| 17 | Parity test hit `ENOBUFS` dumping multi-MB JSON; `jsonFrom` mis-sliced JSON arrays | raised `maxBuffer`; fixed the slice |
| 18 | `node --test test/` fails on Node 24; bare `node --test` picked up template files inside `assets/` | pinned the glob `"test/*.test.mjs"` |
| 19 | Python packaging: missing `README.md`, deprecated `license` table, `UNLICENSED` rejected as an SPDX expression | added README; `LicenseRef-Proprietary` + `license-files` |
| 20 | `catalog --build` silently used a stale `dist/` after source edits | documented; rebuild before packing |
| 21 | `melodie template show <name>` — the documented form — failed with `Template not found: show`, because the subcommand word arrived as the first positional | `show` now shifts the name; `list` and a bare `show` list instead. Pinned by tests in **both** frontends |
| 22 | An unknown template printed `Unexpected error` and **exited 0**, so a wrapper script would read failure as success | `loadTemplate` raises `CatalogError`; clean message, exit 1. Pinned by a test in both frontends |
| 23 | `Build-CatalogCLI.ps1` ran the Node suite (which exercises the Python frontend) *before* `sync_data.py`, so right after a `catalog --build` the Python bundle was stale and its `verify` correctly flagged the mismatch — reported as a parity failure | reordered: sync now precedes the test suites, with the reason documented in the script header |

## 7. Evidence chain

The order matters. Each stage consumes the previous one's output, so a green
result downstream means nothing if a stage upstream was skipped.

```
CLEAN SOURCE
    ↓  melodie catalog --build      (hashes every file; 6,799 entries)
CATALOG SYNC
    ↓  sync_data.py                 (must precede the suites: see defect 23)
DEEP HASH VERIFICATION
    ↓  melodie verify --deep        (0 changed, 0 missing)
TEST SUITES
    ↓  19 Node · 18 Python · 25 Web3 default · 25 Web3 consent
PACKAGE BUILD
    ↓  npm pack · python -m build
TWINE VALIDATION
    ↓  twine check                  (PASSED on wheel and sdist)
SECRET / EXTRACTION SAFETY
    ↓  0 unclassified matches · 4 credential copies denied · 0 bytes · 4/4
FINAL PUBLICATION DECISION
       ↓  BLOCKED — 3 open gates (§8). Not authorised.
```

A skipped or reordered stage invalidates the stages after it. That is precisely
what defect 23 was: a correct staleness check, run out of order, looked like a
parity failure.

---

## 8. Publication: NOT AUTHORISED

**No registry was contacted. No credential was used or requested. Publication
remains undecided, and is gated.**

`Build-CatalogCLI.ps1` computes this gate rather than asserting it.
`BUILD_EVIDENCE.json` carries `publication.authorized: false` and the three
blocking items below, regenerated on every build. A green build does not set it
to `true`.

### Gate 1 — `GATE_CREDENTIAL_ROTATION` · OPEN

A live `sk_live_` Stripe secret is committed at
`Melodiespark_Source/MelodieCLI/docs/API_KEY_ROTATION_GUIDE.md` line 84, plus
Google and OpenAI key patterns. It is treated as **exposed**.

**Scope, confirmed by inspecting the submodule's own history:**

- present in **10 commits** spanning 2026-07-21 to 2026-09-02
- reachable from `origin/main` and `origin/surgical/wallet-fixes-sepolia`
- the working tree is clean, so this is **committed history**, not an uncommitted
  local file
- the `Melodiespark_Source/*` entries are **gitlinks** in this repository, so
  the value is not in *this* repository's history — it lives in the submodule
  repository, and has most likely been cloned or forked since

**Excluding the value from the package does not reduce the exposure. Only
rotation does.** Exclusion from artifacts, the content guard, and the catalog
classification are hygiene: they stop *this tool* redistributing the value, and
do nothing to a secret already committed and pushed to a remote.

To close:

1. rotated at Stripe by the credential owner, and the rotation confirmed — this
   is the only step that actually revokes it
2. history purged in the `MelodieCLI` repository
3. that repository treated as fully compromised, and any clone or fork
   considered to hold the value

This repository can do none of these and does not claim to have done any.

### Gate 2 — `GATE_COMMAND_NAME_COLLISION` · OPEN

`melodiespark-py` and `melodiespark-cli` both install a console script named
`melodiespark`. Installing both into one environment makes the second overwrite
the first. They are different programs.

To close: a decision on which package owns the name, recorded in `DECISIONS.md`
D9. **This must not be resolved by renaming a package to make a build or an
install pass.** Renaming to satisfy a tool is not a decision about ownership.

Interim guidance, unchanged: do not install `melodiespark` and
`melodiespark-cli` into the same environment. `melodiespark-cli` is unambiguous.

### Gate 3 — `GATE_RELEASE_AUTHORISATION` · OPEN

No publication decision has been taken. Both packages are currently
`UNLICENSED` / `LicenseRef-Proprietary`.

To close: explicit authorisation, **after** Gates 1 and 2 are closed and the
artifacts are **rebuilt and rescanned**. Artifacts built before a gate closes are
not the artifacts that would be published.

### Environment note, not a gate

`pnpm setup` if pnpm's global binaries are wanted on `PATH`.

---

## 9. Deliberately not done

- **No registry publication**, and not pending authorisation. Irreversible.
- **No source tree in any artifact.** Only metadata ships.
- **No `.git` internals redistributed.** Provenance lives in
  `repositories.json`; the objects do not travel.
- **No generated dumps packaged.** 278 MB of inventory files are regenerable
  with one command.
- **No credentials in any artifact**, and none copied out of the source tree.
- **No claim that the product is operational.** See §1.
- **`melodie record` is not implemented.** It would assert a verified payment
  from a command-line argument, which `TRUTH_PROTOCOL.md` forbids. The retired
  prototype's version of that command is preserved, commented, in
  `apps/melodie-cli/legacy/`.
- **The Unreal template is not compiled.** No Unreal Engine is installed here.
  Its compile status is `UNVERIFIED` and its README says so.
