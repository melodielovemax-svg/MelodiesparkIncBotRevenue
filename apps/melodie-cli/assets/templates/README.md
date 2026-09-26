# Templates

Scaffolding templates for `melodie init <dir> --template <name>`. The same
templates are used by the Python frontend (`melodiespark-cli init`), because
both read the same `template.json` manifests from this directory.

| Template | Kind | Targets | Purpose |
|---|---|---|---|
| `node` | `node` | npm, pnpm, npx | Zero-dependency TypeScript library + CLI package |
| `python` | `python` | pip, pipx | Zero-dependency `src/`-layout library + CLI package |
| `web3` | `web3` | npm, pnpm, npx | Read-only wallet + non-custodial withdrawal intent |
| `unreal` | `unreal` | - | Minimal Unreal Engine plugin scaffold |
| `melodiespark-template` | `monorepo` | - | The assembled reference template layout |

## The contract

Each template directory contains a `template.json` manifest:

```jsonc
{
  "name": "node",
  "version": "1.0.0",
  "description": "one-line description",
  "kind": "node",
  "targets": ["npm", "pnpm", "npx"],
  "install": { "npm": "npm install" },
  "run":     { "help": "my-app --help" },
  "variables": { "CLI_BIN": "my-app" },
  "consent_gated_files": [],
  "web3": null,
  "files": ["package.json", "src/index.ts"],
  "notes": ["..."]
}
```

### File emission rules

- A file named `something.tmpl` has its `.tmpl` suffix stripped on emission, and
  `{{TOKEN}}` placeholders are substituted.
- A file **without** `.tmpl` is copied verbatim.
- `template.json` is never emitted.
- When an emitted file's name ends in `.json`, substituted values are JSON
  escaped automatically. Write `"name": "{{PACKAGE_NAME}}"` including the
  quotes; do not pre-escape.

### Substitution tokens

| Token | Default | Meaning |
|---|---|---|
| `TEMPLATE` | template name | |
| `TEMPLATE_VERSION` | manifest version | |
| `TEMPLATE_KIND` | manifest kind | |
| `PACKAGE_NAME` | target directory name | |
| `PACKAGE_VERSION` | `0.1.0` | |
| `DESCRIPTION` | manifest description | |
| `AUTHOR` | `Melodiespark` | |
| `LICENSE` | `UNLICENSED` | |
| `YEAR` | current year | |
| `GENERATED_AT` | ISO 8601 UTC | |
| `CLI_BIN` | `melodie-app` | binary/command name |
| `PY_MODULE` | slugified dir name | Python module name |
| `CONSENT_FLAG` | `i-understand-this-signs-transactions` | |

A template may override any default via the top-level `variables` object. CLI
overrides (`--name`, `--description`, `--bin`) win over template variables.

### Consent-gated files

Files listed in `consent_gated_files` are **withheld** unless the operator
passes the template's consent flag (`web3.consent_flag`, default
`--i-understand-this-signs-transactions`). A withheld file must not be
statically imported by any always-emitted file, or the default scaffold will not
build. Feature-detect with a dynamic `import()` inside `try`/`catch` instead.

## Rules every template must follow

1. **No secrets.** No API keys, tokens, populated `.env` files, private keys,
   mnemonics, or wallet private keys. `.env.example` files must have empty
   values.
2. **No invented facts.** No revenue, customers, transaction counts, TVL, audit
   claims, or certifications. Placeholder addresses must be obviously fake and
   labelled as such.
3. **A `Status: SCAFFOLD` section** in the README, stating that generation is not
   evidence the project is built, tested, secure, or operational.
4. **Zero runtime dependencies** where practical, so the scaffold installs
   anywhere. Declare them in `package.json` / `pyproject.toml` if not.
5. **Actually runnable.** Templates are validated by scaffolding and running
   them, not by inspection.
6. **Mainnet is never a default chain.** Testnet only, with RPC supplied by the
   operator.

## Verification

```bash
# list and inspect
melodie template list
melodie template show web3

# scaffold and prove it builds
melodie init /tmp/probe --template node && (cd /tmp/probe && npm test && npx tsc --noEmit)
melodie init /tmp/probe --template python && (cd /tmp/probe && python -m build)

# the web3 default scaffold must build WITHOUT the consent flag
melodie init /tmp/probe --template web3 && (cd /tmp/probe && npx tsc --noEmit && npm test)
```

Every scaffold also receives a `MELODIESPARK_SCAFFOLD.json` provenance stamp so
a generated project can never be mistaken for a hand-authored one.
