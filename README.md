# Melodiespark Inc.

Unified AI-native enterprise platform.

## Content catalog and template CLI

One catalog, two frontends. Every file under `Melodiespark_Source/` is
catalogued with full metadata — 6,799 files, 657 MB. **No file content is
copied into any distributable unless an operator explicitly asks.**

```powershell
pwsh -File .\Build-CatalogCLI.ps1        # build + validate everything, locally
```

The build writes `BUILD_EVIDENCE.json`: test counts parsed from runner output,
artifact SHA-256s, the secret scan result, and the computed publication gate.
Claims are recorded there, not asserted in prose.

```bash
melodie catalog            # summarize          melodie inspect <path>   # metadata only
melodie extract <path>     # deny by default   melodie init <dir> -t web3
melodie verify --deep      # integrity + leak scan          melodie status
```

```bash
pip install melodiespark-cli     # or pipx install melodiespark-cli
melodiespark-cli status           # same catalog, same templates, same policy
```

| Read | For |
|---|---|
| [`BUILD-CATALOG-CLI.md`](BUILD-CATALOG-CLI.md) | how to build, install, and smoke-test |
| [`BUILD_REPORT.md`](BUILD_REPORT.md) | what was validated, what failed, what changed on this machine |
| [`DECISIONS.md`](DECISIONS.md) | decision record, including open questions |
| [`templates/README.md`](templates/README.md) | the template contract |
| [`AGENTS.md`](AGENTS.md) | rules for agents |
| [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md) | workspace overview |
| [`TRUTH_PROTOCOL.md`](TRUTH_PROTOCOL.md) | how evidence determines status |

## Two things that need attention

1. **A live Stripe secret key was found** in
   `Melodiespark_Source/MelodieCLI/docs/API_KEY_ROTATION_GUIDE.md`. Treat it as
   exposed and rotate it at Stripe. Excluding it from packages does not reduce
   the exposure; only rotation does. This repository cannot do that.
2. **Publication is not authorised.** Three gates are open, computed by the
   build and recorded in `BUILD_EVIDENCE.json`: credential rotation, the
   `melodiespark` command-name collision, and an explicit release decision. A
   green build does not open any of them.

A passing build and test count establish the **tested implementation paths** on
one host. They do not establish that the Melodiespark product, or any external
integration, is operational. See `BUILD_REPORT.md` §1.

## Product vs fiction

Melodiespark INC is the real product. _Melodiespark: The Long Song_ is the
fictional setting of a game. The lore may guide design and data evolution. It
does not describe the history, operations, revenue, security posture, or
capabilities of the real company, and no document here implies that it does.
