"""Command-line interface for the Melodiespark content catalog.

A thin compatibility frontend. It answers the same questions as the TypeScript
CLI, from the same catalog, with the same policy - but it does not duplicate
the catalog builder. Building the catalog is the TypeScript CLI's job:

    melodie catalog --build

Command surface, identical to the TypeScript CLI:

    catalog   summarize the catalog
    inspect   query catalog metadata (never prints file contents)
    extract   copy content, deny-by-default, with an audit trail
    template  list and describe templates
    init      scaffold a project from a template
    verify    prove catalog integrity and scan for secret leakage
    status    report real capability state
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import shutil
import sys
from pathlib import Path
from typing import Any

from . import __version__
from .audit import append_audit
from .catalog import Catalog, FileEntry, load_catalog
from .classifier import Classifier
from .content_guard import scan_content
from .contract import CatalogError, load_rules
from .output import (
    blue,
    bold,
    bytes_human,
    cyan,
    dim,
    fail,
    green,
    heading,
    line,
    red,
    status_color,
    table,
    warn,
    yellow,
)
from .paths import resolve_paths
from .templates import (
    SIGNING_CONSENT_FLAG,
    Template,
    build_variables,
    list_templates,
    render,
)

PROGRAM = "melodiespark-cli"

#: Subcommand words for `template`.
_LIST_WORD = "list"
_SHOW_WORD = "show"


# ---------------------------------------------------------------------------
# catalog
# ---------------------------------------------------------------------------


def cmd_catalog(args: argparse.Namespace) -> int:
    paths = resolve_paths(catalog=args.catalog)
    catalog = load_catalog(paths.catalog_path)

    if args.repos:
        _print_repositories(catalog)
        return 0

    if args.category:
        entries = catalog.by_category(args.category)
        heading(f"Category {args.category.upper()} ({len(entries)} files)")
        table(
            [
                [e.path, bytes_human(e.bytes), green("yes") if e.extractable else red("no"), e.rule_id]
                for e in entries[:200]
            ],
            ["PATH", "SIZE", "EXTRACTABLE", "RULE"],
        )
        if len(entries) > 200:
            line(dim(f"... {len(entries) - 200} more. Use --json for the full list."))
        return 0

    if args.json:
        line(json.dumps(catalog.summary, indent=2))
        return 0

    _print_summary(catalog, paths.source_root)
    return 0


def _print_summary(catalog: Catalog, source_root: Path) -> None:
    summary = catalog.summary
    heading("Content catalog")
    line(f"  source        {catalog.source_root or source_root}")
    line(f"  generated     {catalog.generated_at}")
    line(f"  files         {summary.get('file_count', 0)}")
    line(f"  total size    {bytes_human(summary.get('total_bytes', 0))}")
    line(f"  extractable   {summary.get('file_count', 0) - summary.get('excluded_count', 0)}")
    line(f"  excluded      {yellow(str(summary.get('excluded_count', 0)))}")
    line(f"  secrets found {red(str(summary.get('secret_count', 0)))} {dim('(metadata only, never copied)')}")

    heading("By category")
    rows = sorted(
        (
            [category, str(tally.get("count", 0)), bytes_human(tally.get("bytes", 0))]
            for category, tally in summary.get("by_category", {}).items()
        ),
        key=lambda row: int(row[1]),
        reverse=True,
    )
    table(rows, ["CATEGORY", "FILES", "SIZE"])


def _print_repositories(catalog: Catalog) -> None:
    heading("Repositories")
    rows = [
        [
            repo.get("name", ""),
            str(repo.get("catalogued_count", 0)),
            str(repo.get("declared_file_count") or "-"),
            repo.get("branch") or "-",
            str(repo.get("commit") or "-")[:8],
            bytes_human(repo.get("bytes", 0)),
        ]
        for repo in catalog.repositories
    ]
    table(rows, ["REPOSITORY", "CATALOGUED", "DECLARED", "BRANCH", "COMMIT", "SIZE"])
    line()
    line(dim("Declared counts come from SOURCE_INVENTORY.json and may predate later local additions."))


# ---------------------------------------------------------------------------
# inspect
# ---------------------------------------------------------------------------


def _print_entry(entry: FileEntry, index: int, total: int) -> None:
    heading(f"[{index}/{total}] {entry.path}")
    if entry.extractable:
        denial = green("none")
    elif entry.permanently_denied:
        denial = red("PERMANENTLY DENIED - no flag unlocks this")
    elif entry.authorization_required:
        denial = yellow("authorization required")
    else:
        denial = yellow("denied by default")

    table(
        [
            ["category", f"{entry.category} {green('[extractable]') if entry.extractable else red('[excluded]')}"],
            ["size", f"{entry.bytes} B ({bytes_human(entry.bytes)})"],
            ["sha256", entry.sha256],
            ["extension", entry.extension or "(none)"],
            ["repository", entry.repository],
            ["module", entry.module or "-"],
            ["rule", f"{entry.rule_id} - {entry.reason}"],
            ["flags", ", ".join(entry.flags) or "-"],
            ["denial", denial],
            ["sensitive", red("yes") if entry.sensitive else "no"],
            ["generated", "yes" if entry.generated else "no"],
            ["binary", "yes" if entry.binary else "no"],
            ["archive", "yes" if entry.archive else "no"],
            ["vcs metadata", "yes (provenance only)" if entry.vcs_metadata else "no"],
            ["modified", entry.modified_utc or "-"],
        ]
    )


def cmd_inspect(args: argparse.Namespace) -> int:
    paths = resolve_paths(catalog=args.catalog)
    catalog = load_catalog(paths.catalog_path)

    if args.paths:
        results: list[FileEntry] = []
        seen: set[str] = set()
        for query in args.paths:
            for entry in catalog.search(query):
                if entry.path not in seen:
                    seen.add(entry.path)
                    results.append(entry)
    else:
        results = list(catalog.files)

    if args.repo:
        results = [e for e in results if e.repository.lower() == args.repo.lower()]
    if args.category:
        results = [e for e in results if e.category == args.category.upper()]
    if args.flag:
        results = [e for e in results if args.flag in e.flags]

    if args.json:
        line(
            json.dumps(
                {
                    "count": len(results),
                    "files": [
                        {
                            "path": e.path,
                            "bytes": e.bytes,
                            "sha256": e.sha256,
                            "category": e.category,
                            "rule_id": e.rule_id,
                            "flags": e.flags,
                            "sensitive": e.sensitive,
                            "permanently_denied": e.permanently_denied,
                            "extractable": e.extractable,
                            "authorization_required": e.authorization_required,
                        }
                        for e in results
                    ],
                },
                indent=2,
            )
        )
        return 0

    if not results:
        line(yellow("No catalog entries matched."))
        line(dim("Try: melodie-cli catalog --category SOURCE   or   melodie-cli inspect wallet"))
        return 0

    limit = max(1, args.limit)
    shown = results[:limit]
    detail_mode = bool(args.paths) or bool(args.repo) or bool(args.category) or bool(args.flag)

    if detail_mode:
        for position, entry in enumerate(shown, start=1):
            _print_entry(entry, position, len(shown))
    else:
        heading(f"Catalog entries ({len(results)})")
        table(
            [[e.path, e.category, bytes_human(e.bytes), "yes" if e.extractable else "no"] for e in shown],
            ["PATH", "CATEGORY", "SIZE", "EXTRACTABLE"],
        )

    if len(results) > len(shown):
        line()
        line(dim(f"{len(results) - len(shown)} more entries. Raise --limit or use --json."))
    return 0


# ---------------------------------------------------------------------------
# extract
# ---------------------------------------------------------------------------


def cmd_extract(args: argparse.Namespace) -> int:
    paths = resolve_paths(catalog=args.catalog)
    catalog = load_catalog(paths.catalog_path)
    rules = load_rules(paths.rules_path)
    policy = rules.extraction_policy
    authorized = bool(args.i_have_authorization)
    out_dir = Path(args.out).resolve()

    if not args.paths and not args.repo and not args.category:
        fail("Specify at least one path, or use --repo/--category to select entries.")
        line(dim('Example: melodiespark-cli extract "src/index.py" --repo melodiespark-platform --out ./SOURCE'))
        return 1

    selected: list[FileEntry] = []
    seen: set[str] = set()
    for query in args.paths or []:
        for entry in catalog.search(query):
            if entry.path not in seen:
                seen.add(entry.path)
                selected.append(entry)
    for entry in catalog.by_repository(args.repo) if args.repo else []:
        if entry.path not in seen:
            seen.add(entry.path)
            selected.append(entry)
    for entry in catalog.by_category(args.category) if args.category else []:
        if entry.path not in seen:
            seen.add(entry.path)
            selected.append(entry)

    if not selected:
        warn(f"No catalog entries matched {', '.join(args.paths or [])}.")
        return 0

    heading("Extraction policy")
    line(f"  default            {policy.get('default', 'DENY')}")
    line(f"  authorization flag {rules.authorization_flag}")
    line(f"  supplied           {yellow('yes') if authorized else green('no')}")
    line(f"  mode               {cyan('DRY RUN - nothing will be written') if args.dry_run else 'COPY'}")
    line(f"  destination        {out_dir}")

    decisions: list[tuple[FileEntry, bool, str, list[str]]] = []
    for entry in selected:
        # Permanently denied content is refused before anything else, and no
        # flag can unlock it.
        if entry.permanently_denied or entry.category == "SECRET":
            decisions.append(
                (
                    entry,
                    False,
                    "Permanently denied (SECRET). It is catalogued for provenance and never copied.",
                    [],
                )
            )
            continue

        source_abs = paths.source_root / Path(entry.path)
        findings = scan_content(source_abs, rules) if source_abs.is_file() else []
        signals = [f.render() for f in findings]

        if findings:
            joined = ", ".join(signals)
            if not authorized:
                decisions.append(
                    (
                        entry,
                        False,
                        f"Content scan found likely credential material [{joined}]. "
                        f"Copying requires {rules.authorization_flag}.",
                        signals,
                    )
                )
            else:
                decisions.append(
                    (
                        entry,
                        True,
                        f"Authorized despite content findings [{joined}]. Operator accepts the risk.",
                        signals,
                    )
                )
            continue

        if entry.sensitive and not authorized:
            decisions.append((entry, False, f"SENSITIVE material requires {rules.authorization_flag}.", []))
        elif not entry.extractable and not authorized:
            decisions.append(
                (
                    entry,
                    False,
                    f"Category {entry.category} is not copyable by default. Requires {rules.authorization_flag}.",
                    [],
                )
            )
        else:
            reason = "Category is copyable."
            if not entry.extractable:
                reason = f"Authorized extraction of {entry.category} material under operator responsibility."
            decisions.append((entry, True, reason, []))

    heading("Plan")
    table(
        [
            [e.path, e.category, bytes_human(e.bytes), green("COPY") if ok else red("DENY")]
            for e, ok, _, _ in decisions[:60]
        ],
        ["PATH", "CATEGORY", "SIZE", "DECISION"],
    )
    if len(decisions) > 60:
        line(dim(f"... {len(decisions) - 60} more rows."))

    allowed = [d for d in decisions if d[1]]
    denied = [d for d in decisions if not d[1]]
    line()
    line(f"  copy  {green(str(len(allowed)))}")
    line(f"  deny  {red(str(len(denied)))}")

    log_path = out_dir / "extract-audit.jsonl"
    written = 0
    written_bytes = 0
    for entry, ok, reason, signals in decisions:
        source_abs = paths.source_root / Path(entry.path)
        copied = False
        if ok and not args.dry_run and source_abs.is_file():
            target_abs = out_dir / Path(entry.path)
            target_abs.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(source_abs, target_abs)
            written += 1
            written_bytes += entry.bytes
            copied = True
        append_audit(
            log_path,
            {
                "action": "EXTRACT" if ok else "EXTRACT_DENIED",
                "target": entry.path,
                "outcome": "ALLOWED" if ok else "DENIED",
                "bytes": entry.bytes if copied else 0,
                "authorization": authorized,
                "reason": reason,
                "content_signals": signals,
                "catalog": str(paths.catalog_path),
            },
        )

    heading("Dry run complete" if args.dry_run else "Extraction complete")
    line(f"  files written   {written}")
    line(f"  bytes written   {bytes_human(written_bytes)}")
    line(f"  denied          {len(denied)}")
    line(f"  audit log       {log_path}")
    if denied:
        line()
        line(dim("Denied entries are recorded with their reason in the audit log."))
    line()
    line(bold("Extraction copies files. It does not validate, test, or operate them."))
    return 0


# ---------------------------------------------------------------------------
# template / init
# ---------------------------------------------------------------------------


def cmd_template(args: argparse.Namespace) -> int:
    paths = resolve_paths()
    templates = list_templates(paths.templates_dir)

    # `list` is a subcommand word meaning "show me every template", never a
    # template name. `show` is a prefix that takes the name as its argument, so
    # both `template <name>` and `template show <name>` describe one template.
    name = args.name
    if name == _SHOW_WORD:
        # `show` with no name lists, matching the TypeScript frontend, rather
        # than reporting a template called "show".
        name = args.name_arg
    list_requested = name is None or name == _LIST_WORD or args.name == _LIST_WORD

    if list_requested:
        if args.json:
            line(json.dumps([t.__dict__ | {"root": str(t.root)} for t in templates], indent=2, default=str))
            return 0
        heading(f"Templates ({len(templates)})")
        if not templates:
            line(yellow("No templates found."))
            line(dim(f"Searched: {paths.templates_dir}"))
            return 0
        table(
            [[t.name, t.kind, ", ".join(t.targets), t.description] for t in templates],
            ["NAME", "KIND", "TARGETS", "DESCRIPTION"],
        )
        line()
        line(dim("Detail:  melodiespark-cli template show <name>      Scaffold:  melodiespark-cli init <dir> -t <name>"))
        return 0

    match = next((t for t in templates if t.name == name), None)
    if match is None:
        fail(f"Unknown template: {name}")
        line(dim("List templates with: melodiespark-cli template list"))
        return 1

    if args.files:
        files = sorted(
            str(p.relative_to(match.root)).replace("\\", "/")  # type: ignore[arg-type]
            for p in match.root.rglob("*")  # type: ignore[union-attr]
            if p.is_file()
        )
        if args.json:
            line(json.dumps({"name": match.name, "files": files}, indent=2))
            return 0
        heading(f"Files in template {match.name} ({len(files)})")
        for entry in files:
            gated = entry in match.consent_gated_files
            line(f"  {yellow('[consent-gated] ') if gated else ''}{entry}")
        return 0

    heading(f"Template {match.name} v{match.version}")
    line(f"  kind        {match.kind}")
    line(f"  targets     {', '.join(match.targets)}")
    line(f"  description {match.description}")
    line(f"  root        {match.root}")

    heading("Install")
    table([[k, v] for k, v in match.install.items()], ["TARGET", "COMMAND"])
    heading("Run")
    table([[k, v] for k, v in match.run.items()], ["EXAMPLE", "COMMAND"])

    if match.web3:
        heading("Web3 safety posture")
        table([[k, str(v)] for k, v in match.web3.items()], ["PROPERTY", "VALUE"])
        if match.consent_gated_files:
            line()
            line(yellow("Consent-gated files (never emitted without the consent flag):"))
            for entry in match.consent_gated_files:
                line(f"  {entry}")
    return 0


def cmd_init(args: argparse.Namespace) -> int:
    paths = resolve_paths()
    templates = list_templates(paths.templates_dir)

    if not args.directory or not args.template:
        fail("Usage: melodiespark-cli init <directory> --template <name>")
        line(dim("List templates with: melodiespark-cli template"))
        return 1

    match = next((t for t in templates if t.name == args.template), None)
    if match is None:
        fail(f"Unknown template: {args.template}")
        line(dim(f"Available: {', '.join(t.name for t in templates)}"))
        return 1

    target_dir = Path(args.directory).resolve()
    if target_dir.exists() and any(target_dir.iterdir()) and not args.force:
        fail(f"{target_dir} is not empty. Re-run with --force to write into it.")
        return 1

    consent_flag = match.web3_flag()
    consent = bool(getattr(args, consent_flag.replace("-", "_"), False))

    overrides: dict[str, str] = {}
    if args.name:
        overrides["PACKAGE_NAME"] = args.name
    if args.description:
        overrides["DESCRIPTION"] = args.description
    if args.bin:
        overrides["CLI_BIN"] = args.bin

    variables = build_variables(match, target_dir, overrides)
    gated = set(match.consent_gated_files)
    blocked = sorted(gated) if not consent else []

    heading("Scaffolding")
    line(f"  template     {match.name} v{match.version}")
    line(f"  destination  {target_dir}")
    line(f"  kind         {match.kind}")

    if match.web3:
        heading("Web3 safety posture")
        table(
            [
                ["mode", str(match.web3.get("mode", ""))],
                [
                    "signing",
                    yellow("CONSENT GIVEN")
                    if consent and match.web3.get("signing") == "CONSENT_GATED"
                    else str(match.web3.get("signing", "")),
                ],
                ["broadcasting", str(match.web3.get("broadcasting", ""))],
                ["custody", str(match.web3.get("custody", ""))],
                ["private keys", str(match.web3.get("private_keys", ""))],
            ],
            ["PROPERTY", "VALUE"],
        )
        if blocked:
            line()
            warn(f"{len(blocked)} consent-gated file(s) will NOT be written:")
            for entry in blocked:
                line(f"  {entry}")
            line()
            line(dim(f"To include them you must pass --{consent_flag} and take full"))
            line(dim("responsibility for the signing and broadcasting code it produces."))

    written: list[str] = []
    skipped: list[str] = []
    source_root = match.root

    for source in sorted(source_root.rglob("*")):  # type: ignore[union-attr]
        if not source.is_file():
            continue
        # `rel` is the path in template space, used for consent gating. It may
        # contain {{TOKEN}} segments (for example src/{{PY_MODULE}}), so the
        # path is rendered before it touches the filesystem.
        rel = str(source.relative_to(source_root)).replace("\\", "/")  # type: ignore[arg-type]
        if rel == "template.json":
            continue
        if rel in gated and not consent:
            skipped.append(rel)
            continue
        is_template = source.name.endswith(".tmpl")
        out_name = source.name[: -len(".tmpl")] if is_template else source.name
        raw_rel = f"{rel.rsplit('/', 1)[0]}/{out_name}" if "/" in rel else out_name
        out_rel = render(raw_rel, variables, False)
        out_abs = target_dir / out_rel
        out_abs.parent.mkdir(parents=True, exist_ok=True)
        if is_template:
            out_abs.write_text(
                render(source.read_text(encoding="utf-8"), variables, out_name.endswith(".json")),
                encoding="utf-8",
            )
        else:
            shutil.copy2(source, out_abs)
        written.append(out_rel)

    # Provenance stamp: a generated project must not look hand-authored.
    (target_dir / "MELODIESPARK_SCAFFOLD.json").write_text(
        json.dumps(
            {
                "generated_at": variables["GENERATED_AT"],
                "generator": f"{PROGRAM} {__version__}",
                "template": match.name,
                "template_version": match.version,
                "template_kind": match.kind,
                "web3_consent_flag_given": consent,
                "status": "SCAFFOLD",
                "disclaimer": (
                    "Generated scaffold. Its presence is not evidence that any described "
                    "capability is built, tested, or operational."
                ),
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    written.append("MELODIESPARK_SCAFFOLD.json")

    append_audit(
        target_dir / "extract-audit.jsonl",
        {
            "action": "TEMPLATE_INIT",
            "target": match.name,
            "outcome": "ALLOWED",
            "bytes": 0,
            "authorization": consent,
            "reason": f"Scaffolded {len(written)} files from template {match.name}.",
            "content_signals": [],
            "catalog": "n/a",
        },
    )

    heading("Written")
    for entry in written:
        line(f"  {entry}")
    if skipped:
        line()
        line(yellow(f"Withheld (consent-gated): {', '.join(skipped)}"))

    heading("Next")
    for target, command in match.install.items():
        line(f"  {target:<8} {render(command, variables, False)}")
    line()
    for example, command in match.run.items():
        line(f"  {example:<18} {render(command, variables, False)}")
    line()
    line(bold("Status: SCAFFOLD. Nothing here has been built, tested, or deployed."))
    return 0


# ---------------------------------------------------------------------------
# verify
# ---------------------------------------------------------------------------

_PRIVATE_KEY_MARKER = re.compile(rb"-----BEGIN [A-Z ]*PRIVATE KEY-----")

# The rules file defines the private-key pattern, so it necessarily contains
# that pattern as a literal. Scanning it would report the detector as a leak,
# forever.
_RULES_BASENAME = "classification-rules.json"


def cmd_verify(args: argparse.Namespace) -> int:
    paths = resolve_paths(catalog=args.catalog)
    checks: list[tuple[str, str, bool, str]] = []

    try:
        catalog = load_catalog(paths.catalog_path)
    except CatalogError as exc:
        checks.append(("CATALOG_LOADS", "Catalog loads", False, str(exc)))
        return _report_checks(checks, args.json)

    checks.append(("CATALOG_LOADS", "Catalog loads", True, f"{len(catalog)} entries from {catalog.source_root}"))
    checks.append(
        ("CONTRACT_VERSION", "Contract version", catalog.contract_version == "1.0.0", catalog.contract_version)
    )

    sha_file = paths.catalog_path.parent / "files.sha256"
    if sha_file.is_file():
        listed: dict[str, str] = {}
        for raw in sha_file.read_text(encoding="utf-8").splitlines():
            if not raw.strip():
                continue
            parts = raw.split("  ", 1)
            if len(parts) == 2 and len(parts[0]) == 64:
                listed[parts[1]] = parts[0]
        mismatches = [e.path for e in catalog.files if listed.get(e.path) != e.sha256]
        checks.append(
            (
                "CHECKSUM_LIST",
                "files.sha256 agrees with catalog",
                not mismatches and len(listed) == len(catalog.files),
                f"{len(listed)} checksums verified"
                if not mismatches
                else f"{len(mismatches)} mismatch(es), listed {len(listed)} vs catalog {len(catalog.files)}",
            )
        )
    else:
        checks.append(("CHECKSUM_LIST", "files.sha256 agrees with catalog", False, f"missing {sha_file}"))

    from .paths import BUNDLED_DATA

    packaged_catalog = BUNDLED_DATA / "catalog" / "content-catalog.json"
    if packaged_catalog.is_file():
        same = packaged_catalog.read_bytes() == paths.catalog_path.read_bytes()
        checks.append(("PACKAGED_CATALOG", "Packaged catalog matches canonical", same, str(packaged_catalog)))
    else:
        checks.append(
            (
                "PACKAGED_CATALOG",
                "Packaged catalog matches canonical",
                False,
                f"missing {packaged_catalog}",
            )
        )

    packaged_rules = BUNDLED_DATA / "rules" / "classification-rules.json"
    if packaged_rules.is_file():
        same = packaged_rules.read_bytes() == paths.rules_path.read_bytes()
        checks.append(("PACKAGED_RULES", "Packaged rules match shared rules", same, str(packaged_rules)))
    else:
        checks.append(("PACKAGED_RULES", "Packaged rules match shared rules", False, f"missing {packaged_rules}"))

    # Secret-leak scan over everything that would ship.
    rules = load_rules(paths.rules_path)
    classifier = Classifier(rules)
    scan_roots = [p for p in (paths.templates_dir, packaged_catalog.parent.parent) if p.is_dir()]

    secret_hits: list[str] = []
    key_hits: list[str] = []
    scanned = 0
    for root in scan_roots:
        for path in sorted(root.rglob("*")):
            if not path.is_file():
                continue
            scanned += 1
            verdict = classifier.classify(path, path)
            name = path.name.lower()
            if verdict.category == "SECRET" or "credentials" in name or name == "apikeys.json":
                secret_hits.append(str(path.relative_to(root)))
            if path.name == _RULES_BASENAME:
                continue
            try:
                if path.stat().st_size <= 4 * 1024 * 1024:
                    if _PRIVATE_KEY_MARKER.search(path.read_bytes()):
                        key_hits.append(str(path.relative_to(root)))
            except OSError:
                continue

    checks.append(
        (
            "NO_SECRET_FILENAMES",
            "No secret filenames in shipped assets",
            not secret_hits,
            ", ".join(secret_hits) if secret_hits else f"{scanned} files scanned across {len(scan_roots)} roots",
        )
    )
    checks.append(
        (
            "NO_PRIVATE_KEY_MATERIAL",
            "No embedded private key material",
            not key_hits,
            ", ".join(key_hits) if key_hits else "no PEM private key blocks found",
        )
    )

    if args.deep:
        if not catalog.source_root_exists:
            checks.append(
                ("DEEP_HASH", "Source files match recorded hashes", False, f"source root absent: {catalog.source_root}")
            )
        else:
            mismatched = 0
            missing = 0
            for entry in catalog.files:
                if entry.vcs_metadata:
                    continue
                source_abs = Path(catalog.source_root) / Path(entry.path)
                if not source_abs.is_file():
                    missing += 1
                    continue
                digest = _sha256_file(source_abs)
                if digest != entry.sha256:
                    mismatched += 1
            checks.append(
                (
                    "DEEP_HASH",
                    "Source files match recorded hashes",
                    mismatched == 0 and missing == 0,
                    f"re-hashed {len(catalog.files)} entries, {mismatched} changed, {missing} missing",
                )
            )

    return _report_checks(checks, args.json)


def _sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for block in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def _report_checks(checks: list[tuple[str, str, bool, str]], as_json: bool) -> int:
    failed = [c for c in checks if not c[2]]
    if as_json:
        line(
            json.dumps(
                {
                    "ok": not failed,
                    "total": len(checks),
                    "failed": len(failed),
                    "checks": [
                        {"id": c[0], "description": c[1], "ok": c[2], "detail": c[3]} for c in checks
                    ],
                },
                indent=2,
            )
        )
    else:
        heading(f"Verification ({len(checks)} checks)")
        table(
            [[green("PASS") if ok else red("FAIL"), cid, desc, detail] for cid, desc, ok, detail in checks],
            ["", "CHECK", "DESCRIPTION", "DETAIL"],
        )
        line()
        line(
            green(f"All {len(checks)} checks passed.")
            if not failed
            else red(f"{len(failed)} of {len(checks)} checks failed.")
        )
    return 1 if failed else 0


# ---------------------------------------------------------------------------
# status
# ---------------------------------------------------------------------------

CAPABILITIES: list[tuple[str, str, str, str]] = [
    (
        "ENGINEERING",
        "Source cataloguing (metadata for every file)",
        "OPERATIONAL",
        "melodie catalog --build writes files.json, files.sha256, repositories.json, "
        "classifications.json, exclusions.json",
    ),
    (
        "ENGINEERING",
        "Catalog query and inspection",
        "OPERATIONAL",
        "melodie inspect, queryable by path, repository, category, and flag",
    ),
    (
        "SECURITY",
        "Deny-by-default extraction with audit trail",
        "OPERATIONAL",
        "SECRET permanently denied; every decision appended to extract-audit.jsonl",
    ),
    (
        "ENGINEERING",
        "Template scaffolding (node, python, web3, unreal, monorepo)",
        "OPERATIONAL",
        "melodie init <dir> --template <name> writes files and a MELODIESPARK_SCAFFOLD.json stamp",
    ),
    (
        "SECURITY",
        "Web3 template safety gate",
        "OPERATIONAL",
        "signing/broadcast files are withheld unless the consent flag is passed",
    ),
    (
        "TECHNICAL",
        "Node and Python catalog parity",
        "OPERATIONAL",
        "parity test compares both frontends over one shared catalog file",
    ),
    (
        "TECHNICAL",
        "pip / pipx package build",
        "OPERATIONAL",
        "python -m build + twine check; pip and pipx install the wheel",
    ),
    (
        "BUSINESS",
        "Web3 on-chain functionality in Melodiespark itself",
        "UNVERIFIED",
        "the web3 template is scaffolding. No funded address, no transaction, no deployment is claimed",
    ),
    (
        "BUSINESS",
        "PyPI publication",
        "BLOCKED",
        "not attempted, and not authorised. Gate: credential rotation, "
        "melodiespark name collision, release decision",
    ),
    (
        "SECURITY",
        "Exposed Stripe credential in the source tree",
        "UNVERIFIED",
        "a live sk_live_ value is catalogued in MelodieCLI/docs/API_KEY_ROTATION_GUIDE.md. "
        "It is treated as exposed and must be rotated by the credential owner. "
        "Excluding it from artifacts does not revoke it",
    ),
    (
        "BUSINESS",
        "Revenue, customers, trading, wagering, token conversion",
        "UNVERIFIED",
        "no payment record, customer identity, or ledger entry exists in this repository",
    ),
]


def cmd_status(args: argparse.Namespace) -> int:
    paths = resolve_paths(catalog=args.catalog)
    templates = list_templates(paths.templates_dir)

    catalog: Catalog | None = None
    catalog_error: str | None = None
    try:
        catalog = load_catalog(paths.catalog_path)
    except CatalogError as exc:
        catalog_error = str(exc)

    if args.json:
        line(
            json.dumps(
                {
                    "cli": {"name": PROGRAM, "version": __version__, "python": sys.version.split()[0]},
                    "catalog": catalog.summary if catalog else {"error": catalog_error},
                    "templates": [{"name": t.name, "kind": t.kind, "version": t.version} for t in templates],
                    "capabilities": [
                        {"layer": l, "capability": c, "status": s, "evidence": e} for l, c, s, e in CAPABILITIES
                    ],
                    "source_root": str(paths.source_root),
                    "source_root_exists": paths.source_root.exists(),
                },
                indent=2,
            )
        )
        return 0

    heading("Melodiespark CLI (Python frontend)")
    line(f"  {PROGRAM} {__version__}")
    line(f"  python       {sys.version.split()[0]}")
    line(f"  source root  {paths.source_root} {green('[present]') if paths.source_root.exists() else yellow('[absent]')}")
    line(
        f"  catalog      {paths.catalog_path} "
        f"{green('[present]') if paths.catalog_path.exists() else yellow('[missing - run: melodie catalog --build]')}"
    )
    line(f"  rules        {paths.rules_path}")
    line(f"  templates    {paths.templates_dir} {green(f'[{len(templates)}]') if templates else yellow('[none]')}")
    line(f"  frontend     {'packaged' if paths.catalog_is_packaged else 'monorepo'}")

    if catalog:
        _print_summary(catalog, paths.source_root)
    elif catalog_error:
        heading("Catalog")
        line(yellow(catalog_error))

    if templates:
        heading("Templates")
        table([[t.name, t.kind, ", ".join(t.targets)] for t in templates], ["NAME", "KIND", "TARGETS"])

    heading("Capabilities")
    line(dim("Status vocabulary and evidence rules: TRUTH_PROTOCOL.md"))
    line()
    table(
        [[layer, capability, status_color(status), evidence] for layer, capability, status, evidence in CAPABILITIES],
        ["LAYER", "CAPABILITY", "STATUS", "EVIDENCE"],
    )
    line()
    line(bold("The presence of a template or a scaffold is not evidence of an operational capability."))
    return 0


# ---------------------------------------------------------------------------
# parser
# ---------------------------------------------------------------------------


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog=PROGRAM,
        description=(
            "Content catalog and template CLI for the Melodiespark source tree. "
            "Thin frontend over the same catalog and templates as @melodiespark/cli."
        ),
        epilog="The catalog records that a file exists. It does not expose its contents.",
    )
    parser.add_argument("--version", action="version", version=f"{PROGRAM} {__version__}")
    subparsers = parser.add_subparsers(dest="command")

    def add_catalog_flag(sub: argparse.ArgumentParser) -> None:
        sub.add_argument("--catalog", help="Path to a catalog file (default: resolved)")

    # catalog
    catalog_parser = subparsers.add_parser("catalog", help="Summarize the catalog")
    add_catalog_flag(catalog_parser)
    catalog_parser.add_argument("--repos", action="store_true", help="Repository provenance table")
    catalog_parser.add_argument("--category", help="List files in one category")
    catalog_parser.add_argument("--json", action="store_true", help="Machine-readable output")
    catalog_parser.set_defaults(func=cmd_catalog)

    # inspect
    inspect_parser = subparsers.add_parser("inspect", help="Show metadata for catalog entries")
    add_catalog_flag(inspect_parser)
    inspect_parser.add_argument("paths", nargs="*", help="Path fragments to match")
    inspect_parser.add_argument("--repo", help="Filter by repository")
    inspect_parser.add_argument("--category", help="Filter by category")
    inspect_parser.add_argument("--flag", help="Filter by classification flag")
    inspect_parser.add_argument("--limit", type=int, default=50, help="Max rows (default 50)")
    inspect_parser.add_argument("--json", action="store_true", help="Machine-readable output")
    inspect_parser.set_defaults(func=cmd_inspect)

    # extract
    extract_parser = subparsers.add_parser(
        "extract", help="Copy content. DENY BY DEFAULT; every decision is audited"
    )
    add_catalog_flag(extract_parser)
    extract_parser.add_argument("paths", nargs="*", help="Path fragments to match")
    extract_parser.add_argument("--repo", help="Filter by repository")
    extract_parser.add_argument("--category", help="Filter by category")
    extract_parser.add_argument("--out", default="./SOURCE", help="Destination (default ./SOURCE)")
    extract_parser.add_argument("--dry-run", action="store_true", help="Decide and audit, write nothing")
    extract_parser.add_argument(
        "--i-have-authorization",
        action="store_true",
        help="Allow SENSITIVE and excluded categories. SECRET stays permanently denied.",
    )
    extract_parser.set_defaults(func=cmd_extract)

    # template
    template_parser = subparsers.add_parser("template", help="List or describe templates")
    template_parser.add_argument(
        "name",
        nargs="?",
        help="Template name. 'list' and 'show' are treated as subcommands.",
    )
    template_parser.add_argument(
        "name_arg",
        nargs="?",
        help=argparse.SUPPRESS,  # consumed by the 'show' prefix
    )
    template_parser.add_argument("--files", action="store_true", help="List the template's files")
    template_parser.add_argument("--json", action="store_true", help="Machine-readable output")
    template_parser.set_defaults(func=cmd_template)

    # init
    init_parser = subparsers.add_parser("init", help="Scaffold a project from a template")
    init_parser.add_argument("directory", nargs="?", help="Target directory")
    init_parser.add_argument("-t", "--template", help="Template to use")
    init_parser.add_argument("--force", action="store_true", help="Allow writing into a non-empty directory")
    init_parser.add_argument("--name", help="Override PACKAGE_NAME")
    init_parser.add_argument("--description", help="Override DESCRIPTION")
    init_parser.add_argument("--bin", help="Override CLI_BIN")
    init_parser.add_argument(
        f"--{SIGNING_CONSENT_FLAG}",
        action="store_true",
        help="Include Web3 signing/broadcasting code. Off by default.",
    )
    init_parser.set_defaults(func=cmd_init)

    # verify
    verify_parser = subparsers.add_parser("verify", help="Catalog integrity and secret-leak scan")
    add_catalog_flag(verify_parser)
    verify_parser.add_argument("--deep", action="store_true", help="Re-hash every source file and compare")
    verify_parser.add_argument("--json", action="store_true", help="Machine-readable output")
    verify_parser.set_defaults(func=cmd_verify)

    # status
    status_parser = subparsers.add_parser("status", help="Capability status")
    add_catalog_flag(status_parser)
    status_parser.add_argument("--json", action="store_true", help="Machine-readable output")
    status_parser.set_defaults(func=cmd_status)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    if not getattr(args, "func", None):
        parser.print_help()
        return 0
    try:
        return int(args.func(args) or 0)
    except CatalogError as exc:
        fail(str(exc))
        return 1
    except BrokenPipeError:  # pragma: no cover - piping into head, etc.
        return 0
    except KeyboardInterrupt:  # pragma: no cover
        fail("Interrupted.")
        return 130


if __name__ == "__main__":  # pragma: no cover
    raise SystemExit(main())
