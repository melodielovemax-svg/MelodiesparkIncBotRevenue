# PUBLISHING

Packaging and release configuration. **Empty until an operator populates it.**

## Current state

**Nothing has been published to any public registry.** No npm release, no PyPI
release, no registry credentials were used or requested.

| Target | Status | Evidence |
|---|---|---|
| npm pack / install-from-tarball / npx | `OPERATIONAL` | see `BUILD_REPORT.md` |
| pnpm pack | `OPERATIONAL` | see `BUILD_REPORT.md` |
| Python wheel + sdist | `OPERATIONAL` | see `BUILD_REPORT.md` |
| pip / pipx install | `OPERATIONAL` | see `BUILD_REPORT.md` |
| npm registry publication | `PLANNED` | not attempted, no token supplied |
| PyPI publication | `PLANNED` | not attempted, no token supplied |

Local build success is not publication, and publication is not adoption.

## Before publishing anything

1. **Rotate the credentials found in the source tree.** A live Stripe secret key
   was observed in a documentation file and has been catalogued as
   `SENSITIVE`/content-flagged. The repository cannot rotate it. Do that first,
   independently of any release decision.
2. **Decide the `melodiespark` command name.** Two Python packages currently
   claim it. Installing both into one environment makes the second overwrite the
   first. See `DECISIONS.md` D9.
3. **Run the full local validation** and keep the output. Do not publish from a
   machine where the checks were skipped.
4. **Write the release note as a status table**, with evidence per row. No
   adjectives.

## Commands

```bash
# Node
cd apps/melodie-cli
npm pack                       # produces melodiespark-cli-0.1.0.tgz
pnpm pack
npm install -g ./melodiespark-cli-0.1.0.tgz
npx ./melodiespark-cli-0.1.0.tgz --help

# Python
cd python/melodiespark-cli
python scripts/sync_data.py    # copy catalog + rules + templates into the wheel
python -m build
twine check dist/*
pip install ./dist/melodiespark_cli-0.1.0-py3-none-any.whl
pipx install ./dist/melodiespark_cli-0.1.0-py3-none-any.whl
```

## What must never ship

- Credential material. The content guard refuses it at extraction time; keep
  that check in the release pipeline rather than trusting it once.
- The 657 MB source tree. The catalog is 4.5 MB of metadata; the content is
  never packaged.
- Generated inventory dumps. Regenerate on demand.
- `.git` internals. Provenance is recorded in `repositories.json`; the objects
  are not redistributed.
- Any claim that a scaffolded project is built, tested, secure, or operational.

## Token handling

Registry tokens are never committed, never written to a `.env` that is not
gitignored, and never passed on a command line where they land in shell history
or a CI log. Use the platform's secret store. If a token is ever exposed,
rotate it and treat the artifact that contained it as compromised.
