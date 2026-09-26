# Decision record — Melodiespark content catalog and template CLI

Scope: `apps/melodie-cli`, `python/melodiespark-cli`, `packages/content-catalog`,
`templates/`.

`AGENTS.md` requires that a contradiction be documented rather than resolved
silently. This file is that record. Each entry states what was decided, why, and
what evidence supports it.

---

## D1 — Catalog everything, copy nothing by default

**Decision.** All 6,799 files under `Melodiespark_Source` are catalogued with
full metadata (path, size, SHA-256, extension, repository, module, category,
rule id, flags, denial state). No file content is copied into any distributable
unless an operator explicitly requests it through `melodie extract`.

**Why.** The goal was "all content". Selecting a subset of what to copy requires
a judgement about what counts as code, and that judgement silently drops things.
Indexing everything preserves complete provenance and defers only the copy
decision, which is the reversible one.

**Evidence.** `melodie catalog` reports 6,799 files / 657.4 MB, matching an
independent `Get-ChildItem -Recurse` count taken before the catalog existed.

---

## D2 — The old `melodie` prototype was retired, not extended

**Decision.** `apps/melodie-cli/bin/melodie.js` was moved to
`apps/melodie-cli/legacy/prototype-melodie.js`, excluded from `package.json`
`files`, and is never executed. It is not referenced by `bin`, by the test
suite, or by any script.

**Why.** Two functions in it contradicted `TRUTH_PROTOCOL.md` and
`apps/command-center/docs/CONTENT-GRID.md`:

| Prototype behaviour | Contradiction |
|---|---|
| `recordVerifiedPayment()` wrote a ledger row with `status: 'VERIFIED'` from CLI arguments, with no gateway confirmation, no customer identity, and no external source of truth | `TRUTH_PROTOCOL.md` Rule 3 requires a payment-processor record before a business claim may be called verified. Business status must derive from `revenue_events` and integration runs, not from a command-line argument |
| `awardKarma()` credited `karma` and minted `ma` at a hardcoded `0.001` rate | `CONTENT-GRID.md` lists "MA/Karma conversion" as **not implemented**, requiring legal/economic design, with "no mint or conversion path". The prototype implemented exactly the path that must not exist |

It also hardcoded `ROOT = 'C:\Melodie'`, so it was not cross-platform.

**Consequence.** The replacement CLI ships `melodie status` (evidence-based
capability reporting) and deliberately ships **no** `record` command. There is
no supported way to assert a verified payment from the command line, by design.

---

## D3 — Hard denial is pattern-based, not path-based

**Decision.** Credential denial is driven by
`absolutely_denied_basename_patterns` in
`packages/content-catalog/rules/classification-rules.json`. The enumerated
`absolutely_denied_paths` list is retained as a supplementary, audit-confirmed
record.

**Why.** The first implementation used an exact-path deny list derived from a
manual audit. Testing it exposed the failure mode: extraction of
`config/APIKeys.json` denied 3 files and **allowed a 4th** at
`MelodieCLI/migration-backup/BotRevenue-20260721-020620/BotRevenue-Ultimate/config/APIKeys.json`,
because that copy was in a directory the manual audit had not enumerated. An
enumerated deny list only protects the paths someone remembered.

**Evidence.** Reproduced by running `melodie extract "config/APIKeys.json"`
before and after the change. After the change, all 4 entries are `SECRET` and
permanently denied. Locked in by
`test/policy.test.mjs::test('credential files are permanently denied, not merely gated')`
and the Python equivalent.

---

## D4 — A content-level guard was added after finding a live key in documentation

**Decision.** Before any content is copied, it is scanned against
`content_sensitive_patterns` from the shared rules file. A match downgrades the
entry to denied-by-default and requires the authorization flag. It is not a
permanent deny, because documentation legitimately shows example keys.

**Why.** A content scan of all extractable files found
`MelodieCLI/docs/API_KEY_ROTATION_GUIDE.md` (14.7 KB) containing what appears to
be a **live Stripe secret key** on line 84, plus a Google API key pattern and an
OpenAI key pattern. Path-based classification saw an ordinary `.md` file. Three
other matches were confirmed benign: `debug.test.ts` contains
`AKIAIOSFODNN7EXAMPLE` and `ghp_0123...`, which are the canonical AWS and GitHub
*documentation example* values used to test a redaction function.

**Open action for the operator.** The `sk_live_` value should be treated as
compromised and **rotated at Stripe**, independent of anything in this repo. This
repository cannot rotate it and does not claim to have done so.

**Evidence.** `melodie extract API_KEY_ROTATION_GUIDE` now denies with
`Content scan found likely credential material [CS001_STRIPE_LIVE_SECRET(CRITICAL)@L84, ...]`
and copies 0 files. Locked in by
`test/policy.test.mjs::test('content guard detects a live key in an otherwise ordinary doc')`.

---

## D5 — `SECRET` is permanently denied, not authorization-gated

**Decision.** The `SECRET` category carries `permanently_denied: true` and
`authorization_required: false`.

**Why.** An earlier version reported SECRET entries as "authorization required",
which was factually wrong and dangerous: it implied that
`--i-have-authorization` would unlock them. It does not. The distinction is now
explicit in the catalog, in both frontends, and in `melodie inspect` output
(`PERMANENTLY DENIED - no flag unlocks this`).

---

## D6 — One catalog, two frontends; the Python side does not rebuild it

**Decision.** `@melodiespark/cli` (TypeScript) builds the catalog. The Python
package reads the same `content-catalog.json` and the same
`classification-rules.json`, and implements no independent extraction rules.
Both ship the same `template.json` manifests and the same template files.

**Why.** Two independent implementations of a security policy will drift, and
drift in the permissive direction is silent. `parity.test.mjs` executes both
frontends against one catalog and asserts they agree on summary counts, per-
category counts, per-query counts, template sets, and the set of failing
`verify` checks. If Python is unavailable the test reports `SKIPPED` rather than
passing.

**Known limitation, accepted.** Catalog construction is Node-only. A user who
installs only the Python package cannot rebuild the catalog; they must run
`melodie catalog --build` once from a checkout. A wheel built today ships the
catalog as package data, so this only matters for a stale catalog.

---

## D7 — Web3 template: read-only by default, signing behind an explicit flag

**Decision.** The `web3` template emits a read-only application. Files that can
sign or broadcast are listed in `consent_gated_files` and withheld unless the
operator passes `--i-understand-this-signs-transactions`. The generated app
prints its posture at startup.

**Why.** `AGENTS.md` §5 forbids enabling financial transfer, transaction
signing, or automatic on-chain action by default. A flag whose full name states
the consequence is auditable in shell history and in CI logs, which a terser
name would not be.

**Consequence.** Presence of the Web3 template is not a claim that Web3
functionality is operational in Melodiespark. `melodie status` reports it
`UNVERIFIED` at the BUSINESS layer with that evidence.

---

## D8 — Nothing was published to any registry

**Decision.** No npm publish, no PyPI upload, no registry credentials were used
or requested. Validation is local: `npm pack`, `pnpm pack`, install-from-
tarball, `npx <tarball>`, `python -m build`, `twine check`, install into a fresh
venv, and `pipx install` from the built wheel.

**Why.** Publication is irreversible and was explicitly scoped out. Local
validation exercises the same packaging machinery without creating a public
artifact that cannot be withdrawn.

**Status vocabulary.** Local build: `OPERATIONAL` (see `BUILD_REPORT.md`).
npm publication: `PLANNED`. PyPI publication: `PLANNED`.

---

## D9 — Console script name collision is real and unresolved

**Decision, with a flagged conflict.** The Python package declares **both**
`melodiespark-cli` and `melodiespark` as console scripts. The existing
`melodiespark-py` package also declares `melodiespark`.

**The conflict.** Installing both into one environment makes the second install
overwrite the first one's `melodiespark` shim. They are different programs.

**Not resolved here**, because resolving it means choosing which package owns
the `melodiespark` name, which is a product decision. Options:

1. `melodiespark-cli` keeps only `melodiespark-cli`; `melodiespark-py` keeps `melodiespark`.
2. `melodiespark-py` is renamed or deprecated, and this package takes `melodiespark`.
3. Both keep their names and `melodiespark` is dropped from one of them.

Until that is decided, **do not install `melodiespark` and `melodiespark-cli`
into the same environment.** `melodiespark-cli` is unambiguous and safe.
