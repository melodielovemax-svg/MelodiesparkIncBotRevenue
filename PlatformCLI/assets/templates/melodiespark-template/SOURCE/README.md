# SOURCE

**Intentionally empty.**

File content is never copied into a template by default. This directory is the
destination for content that an operator has explicitly decided to extract.

Populate it with `melodie extract`, which is deny-by-default:

```bash
# inspect metadata first; this never reads file content
melodie inspect --category SOURCE --limit 100

# decide, without writing anything
melodie extract "path/to/file.ts" --out ./SOURCE --dry-run

# copy
melodie extract "path/to/file.ts" --out ./SOURCE
```

## What will be refused

- **Credential material** — permanently denied. No flag unlocks it. Not even
  `--i-have-authorization`.
- **`.git` internals, archives, binaries, generated dumps** — denied by
  default; require `--i-have-authorization`.
- **Any file whose content matches a high-signal credential pattern** — denied
  by default even when the path looks like ordinary documentation.

A denial is not a failure of the tool. It is the tool working.

## The audit trail

Every decision, allowed or denied, appends one JSONL record to
`SOURCE/extract-audit.jsonl`:

```json
{"ts":"...","actor":"you","action":"EXTRACT_DENIED","target":"...","outcome":"DENIED",
 "bytes":0,"authorization":false,"reason":"...","content_signals":[],"catalog":"..."}
```

`actor` comes from `MELODIESPARK_ACTOR`, else `USERNAME`, else `USER`. Set it
explicitly in CI so the trail names a principal rather than a build account.

This file is append-only. Do not edit it; edit the policy in
`classification-rules.json` instead, where the change is reviewable.
