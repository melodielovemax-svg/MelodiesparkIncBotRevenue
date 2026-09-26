# DOCS

Approved documentation. **Empty until an operator populates it.**

## What belongs here

Documentation you have reviewed and are willing to stand behind:

- architecture and design decisions
- runbooks and operational procedures
- API references
- user-facing guides

## What does not belong here

- **Generated inventory dumps.** `MelodieCLI_FILES.csv`, `MELODIECLI-TREE.txt`
  and friends are classified `GENERATED` and excluded. They are ~230 MB of
  noise that goes stale immediately. Regenerate what you need with
  `melodie catalog`.
- **Anything containing a credential.** A document with a live key in it is an
  incident, not documentation. The content guard will refuse to extract it;
  if you find one, rotate the key.
- **Marketing claims dressed as documentation.** A claim without a named source
  is not a document. See `TRUTH_PROTOCOL.md`.

## Populating it

```bash
melodie extract "docs/architecture.md" --out ./DOCS
melodie inspect --category DOCUMENTATION --limit 50    # see what exists
```

`melodie extract` writes its audit trail next to the destination, so
`DOCS/extract-audit.jsonl` records exactly which document was copied, when, and
by whom.
