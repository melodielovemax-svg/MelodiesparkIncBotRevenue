# @melodiespark/cli

Content catalog and template CLI for the Melodiespark source tree.

```
npm install -g @melodiespark/cli     # or: pnpm add -g @melodiespark/cli
npx @melodiespark/cli                # no install
```

Python frontend, same catalog, same templates, same policy:

```
pip install melodiespark-cli          # or: pipx install melodiespark-cli
```

## The one rule

> **The catalog says a file exists. It does not expose its contents.**

Every file in the source tree is recorded with full metadata — path, size,
SHA-256, category, rule, denial state. No file content is copied anywhere unless
an operator explicitly asks, and the CLI refuses by default.

## Commands

| Command | Purpose |
|---|---|
| `melodie catalog` | Summarize the catalog. `--build` rebuilds it. |
| `melodie inspect <path…>` | Query catalog metadata. Never prints file contents. |
| `melodie extract <path…>` | Copy content. **Deny by default.** Every decision is audited. |
| `melodie template [name]` | List and describe scaffolding templates. |
| `melodie init <dir> -t <name>` | Scaffold a project. |
| `melodie verify` | Catalog integrity plus a secret-leak scan. `--deep` re-hashes the source. |
| `melodie status` | Capability status, with evidence, per `TRUTH_PROTOCOL.md`. |

The Python frontend exposes the same seven commands under `melodiespark-cli`.

## Deny by default

```bash
melodie inspect --category SOURCE          # see what exists
melodie extract "src/index.ts" --dry-run  # decide, write nothing
melodie extract "src/index.ts" --out ./SOURCE
```

Two independent layers, both deny-by-default:

1. **Path and filename patterns.** A copy of a known secret in a directory
   nobody enumerated is still denied. An enumerated deny list only protects the
   paths someone remembered.
2. **Content scan.** Before content is copied, it is scanned for high-signal
   credential patterns. A live key pasted into an ordinary `.md` file is caught
   even though the path looks harmless.

`SECRET` is **permanently** denied. `--i-have-authorization` does not unlock it,
and `melodie inspect` says so explicitly rather than implying a flag would help.

Every decision appends a record to `extract-audit.jsonl`:

```json
{"ts":"…","actor":"you","action":"EXTRACT_DENIED","target":"…","outcome":"DENIED",
 "bytes":0,"authorization":false,"reason":"…","content_signals":[],"catalog":"…"}
```

## Templates

| Template | Targets | What it generates |
|---|---|---|
| `node` | npm, pnpm, npx | Zero-dependency TypeScript library + CLI package |
| `python` | pip, pipx | Zero-dependency `src/`-layout library + CLI package |
| `web3` | npm, pnpm, npx | Read-only wallet + unsigned withdrawal intents |
| `unreal` | Unreal Engine 5 | Minimal runtime module plugin |
| `melodiespark-template` | all | The reference CATALOG/SOURCE/DOCS/TESTS/WEB3/ARCHITECTURE/PUBLISHING layout |

```bash
melodie template list
melodie template show web3
melodie template show web3 --files
melodie init ./my-app --template node
```

`show` and `list` are subcommand words, not template names. `template <name>` and
`template show <name>` both describe one template; a bare `show` lists.

Every scaffold receives a `MELODIESPARK_SCAFFOLD.json` stamp, so a generated
project can never be mistaken for a hand-authored one.

### The Web3 gate

The `web3` template emits a **read-only** application. Two files that can sign
or broadcast are withheld unless you pass the flag:

```bash
melodie init ./my-app --template web3                                        # read-only
melodie init ./my-app --template web3 --i-understand-this-signs-transactions  # + signing
```

The flag name is the warning. It is recorded in shell history and CI logs on
purpose. The generated app prints its own posture:

```
Web3 mode: READ-ONLY
Signing: DISABLED
Broadcasting: DISABLED
Custody: NONE
Private keys: NOT GENERATED
```

## One catalog, two frontends

The TypeScript CLI builds the catalog. The Python CLI reads the same
`content-catalog.json` and the same `classification-rules.json`, and implements
no independent extraction rules.

`test/parity.test.mjs` runs both frontends against one catalog and asserts they
agree on summary counts, per-category counts, per-query counts, template sets,
and the set of failing `verify` checks. If Python is unavailable the test reports
`SKIPPED` rather than passing.

Classification rules are **data**, not code, so the two frontends cannot drift
apart by accident.

## Environment

| Variable | Effect |
|---|---|
| `MELODIESPARK_CATALOG` | Path to a catalog file |
| `MELODIESPARK_RULES` | Path to classification rules |
| `MELODIESPARK_TEMPLATES` | Path to the templates directory |
| `MELODIESPARK_SOURCE` | Source root override |
| `MELODIESPARK_ACTOR` | Actor recorded in the audit log |
| `NO_COLOR` | Disable ANSI colour |

Resolution order is always: explicit flag → environment → monorepo → assets
bundled inside the installed package.

## Development

```bash
npm install
npm run build          # tsc -> dist/
npm test               # 19 tests: policy, plus Node/Python parity
node bin/melodie.mjs catalog --build
node bin/melodie.mjs verify --deep
```

The CLI runs from `src/*.ts` with no build step on Node 22.18+ / 23.6+, which
strip types natively. `npm run build` produces `dist/` for older runtimes and for
the published tarball.

## Status

Packaging is validated locally: `npm pack`, `pnpm pack`, global install from the
tarball, `npx <tarball>`, and the Python wheel via `pip` and `pipx`. See
`BUILD_REPORT.md`.

**Nothing has been published to npm or PyPI.** No registry credentials were used
or requested. Local build success is not publication.

The presence of this CLI, a template, or a scaffold is not evidence that any
described capability is built, tested, secure, or operational.
