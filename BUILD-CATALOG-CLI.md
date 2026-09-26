# Melodiespark — build and validation

Builds and validates the content catalog and the two CLI frontends. Every step
is local. **Nothing is published to any registry.**

## Layout

```
apps/melodie-cli/          @melodiespark/cli      npm / pnpm / npx
python/melodiespark-cli/   melodiespark-cli       pip / pipx
packages/content-catalog/  shared contract        rules + generated catalog
templates/                 5 scaffolding templates
```

One catalog, two frontends. The TypeScript CLI builds the catalog; the Python
CLI reads it. Neither re-implements the extraction rules. A parity test runs
both against one catalog and asserts they agree.

## Run everything

```powershell
pwsh -File .\Build-CatalogCLI.ps1
```

Or step by step:

```powershell
# 1. catalog every file in Melodiespark_Source (hashes 657 MB, ~50 s)
node apps/melodie-cli/bin/melodie.mjs catalog --build

# 2. sync shared assets into the Python package BEFORE testing.
#    The Node suite exercises the Python frontend, whose verify compares its
#    bundled catalog against the canonical one byte for byte. Testing first
#    makes a correct staleness check report as a parity failure.
python python/melodiespark-cli/scripts/sync_data.py

# 3. install, typecheck, then run the 19 Node tests (12 policy + 7 parity)
npm --prefix apps/melodie-cli install
npm --prefix apps/melodie-cli run build
npm --prefix apps/melodie-cli test

# 4. run the 18 Python policy + dispatch tests
$env:PYTHONPATH = "$PWD\python\melodiespark-cli\src"
python -m unittest discover -s python/melodiespark-cli/tests

# 5. build and check the Python distributions
python -m build --outdir python/melodiespark-cli/dist python/melodiespark-cli
python -m twine check python/melodiespark-cli/dist/*

# 6. integrity: 7 checks, or 8 with --deep (re-hashes all 6,799 files)
node apps/melodie-cli/bin/melodie.mjs verify
node apps/melodie-cli/bin/melodie.mjs verify --deep

# 7. pack the Node CLI
npm --prefix apps/melodie-cli pack
```

`melodie verify --deep` takes about 45 seconds. It re-hashes every catalogued
file and compares against the recorded value.

## Installing the built packages locally

```powershell
# Node
npm  install -g .\apps\melodie-cli\melodiespark-cli-0.1.0.tgz
pnpm add     -g .\apps\melodie-cli\melodiespark-cli-0.1.0.tgz
npx  -p .\apps\melodie-cli\melodiespark-cli-0.1.0.tgz melodie --version

# Python
pip  install .\python\melodiespark-cli\dist\melodiespark_cli-0.1.0-py3-none-any.whl
pipx install --force .\python\melodiespark-cli\dist\melodiespark_cli-0.1.0-py3-none-any.whl
```

`pnpm add -g` needs pnpm's bin directory on `PATH`; run `pnpm setup` once.

## Smoke test both frontends

```powershell
melodie          catalog; inspect; template list; init; verify; status
melodiespark-cli catalog; inspect; template list; init; verify; status
```

The two must agree. If they disagree, that is a bug in the shared contract
loader, not a formatting difference.

## Verify a scaffolded template actually works

```powershell
melodie init $env:TEMP\probe --template node   --force
npm --prefix $env:TEMP\probe install
npm --prefix $env:TEMP\probe run typecheck
npm --prefix $env:TEMP\probe test

melodie init $env:TEMP\probe --template python --force
python -m unittest discover -s $env:TEMP\probe\tests

# the default web3 scaffold must build with the signing modules absent
melodie init $env:TEMP\probe --template web3 --force
npm --prefix $env:TEMP\probe install
npm --prefix $env:TEMP\probe run typecheck
npm --prefix $env:TEMP\probe test
```

## Safety properties to re-check after any change

- `melodie extract "config/APIKeys.json"` writes **0 files** and denies 4.
- `melodie extract "API_KEY_ROTATION_GUIDE"` writes **0 files** (content guard).
- `melodie init --template web3` produces **no** `src/wallet/signing.ts`.
- `melodie inspect --category SECRET` reports `PERMANENTLY DENIED` for all 28.
- `melodie verify` reports no secret filenames and no private key material.

## Read next

- `BUILD_REPORT.md` — what was validated, what failed, what changed on this machine
- `BUILD_EVIDENCE.json` — machine record emitted by the build: test counts, artifact SHA-256s, secret scan, publication gate
- `DECISIONS.md` — decision record, including contradictions and open questions
- `templates/README.md` — the template contract
- `apps/melodie-cli/README.md` — CLI usage
- `python/melodiespark-cli/README.md` — Python frontend usage

## Publishing

**Not authorised.** Three gates are open, and they are computed by the build
rather than asserted by a document: credential rotation, the `melodiespark`
command-name collision, and an explicit release decision. Artifacts must be
rebuilt and rescanned once the first two close. See `BUILD_REPORT.md` §8.

## What a passing build does not mean

It does not mean the Melodiespark product is operational, that any external
integration works, or that untested paths behave like tested ones. Test counts
establish **tested implementation paths on one host**, and nothing broader.
`BUILD_REPORT.md` §1 states the boundary explicitly.
