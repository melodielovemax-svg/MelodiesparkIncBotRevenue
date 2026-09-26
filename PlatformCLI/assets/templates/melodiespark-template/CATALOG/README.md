# CATALOG

Complete metadata inventory of the source tree. **Metadata only, no content.**

| File | Contents |
|---|---|
| `files.json` | One record per file: path, size, SHA-256, extension, repository, module, category, rule id, flags, denial state |
| `files.sha256` | `sha256sum`-compatible checksum list |
| `repositories.json` | Per-repository provenance: remote, branch, commit, declared vs catalogued file counts |
| `classifications.json` | Rule-by-rule accounting: how many files and bytes each rule caught |
| `exclusions.json` | Everything deny-by-default, with the reason for each denial |

## Populating it

This directory ships with only this README. The catalog files are **not**
pre-seeded, on purpose: a snapshot would be ~4.5 MB, would be stale the instant
the source tree changed, and would be copied into every generated project.

Populate it deliberately:

```bash
melodie catalog --build --out ./CATALOG
```

That writes all five projections here.

```bash
melodie catalog                  # summarize
melodie catalog --repos          # repository provenance
melodie catalog --category SOURCE
```

`melodie verify` fails if a packaged copy and the canonical copy disagree.

## How a file is classified

Classification is rule-driven, and the rules are data, not code, so the
TypeScript and Python frontends cannot disagree about it. See
`packages/content-catalog/rules/classification-rules.json`.

| Category | Meaning | Copyable by default |
|---|---|---|
| `SECRET` | Credential material | **Never.** No flag unlocks it. |
| `SENSITIVE` | Operational or private material | No — needs `--i-have-authorization` |
| `VCS` | `.git` internals | No — provenance only |
| `ARCHIVE` | Zip, tar, pack | No |
| `BINARY` | Compiled artifacts | No |
| `GENERATED` | Machine-generated dumps | No — regenerate instead |
| `SOURCE` | Authored code | Yes |
| `TEST` | Tests and fixtures | Yes |
| `DOCUMENTATION` | Authored prose | Yes |
| `CONFIG` | Build and runtime config | Yes |
| `DATA` | Structured data | Yes |
| `ASSET` | Media and static assets | Yes |
| `OTHER` | Unmatched | Yes |

Two layers of protection, both deny-by-default:

1. **Path and filename patterns.** A new copy of a known secret in a directory
   nobody enumerated is still denied. An enumerated deny list only protects the
   paths someone remembered.
2. **Content scan.** Before any content is copied, it is scanned for
   high-signal credential patterns. A real key pasted into an ordinary `.md`
   file is caught even though the path looks harmless.

## Interpreting this catalog

The catalog proves a file exists at a path with a given hash. It does not prove
the file is correct, safe, current, or that anything it describes is
operational. That distinction is the point of the catalog, not a limitation of
it.
