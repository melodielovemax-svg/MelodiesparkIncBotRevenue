"""Classification rules contract loader.

This module is the Python side of a single shared contract. It deliberately
re-implements nothing: the rules, the deny patterns, and the content-signal
patterns all come from ``classification-rules.json``, the same file the
TypeScript CLI loads. If the two frontends ever disagree about what may be
extracted, it is a bug in this loader, not in the policy.
"""

from __future__ import annotations

import json
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

# Paths, relative to the repository root, where the shared assets live.
CONTENT_CATALOG_DIR = Path("packages") / "content-catalog"
RULES_RELPATH = CONTENT_CATALOG_DIR / "rules" / "classification-rules.json"
CATALOG_RELPATH = CONTENT_CATALOG_DIR / "catalog" / "content-catalog.json"
TEMPLATES_RELPATH = Path("templates")
PACKAGED_ASSETS_RELPATH = Path("apps") / "melodie-cli" / "assets"

# Marker used to recognise the monorepo root while walking up the tree.
MARKER_RELPATH = CONTENT_CATALOG_DIR / "catalog.schema.json"

_DEFAULT_SOURCE_ROOT = Path(r"C:\melodie\Melodiespark_Source")

_REGEX_CACHE: dict[str, re.Pattern[str]] = {}


class CatalogError(RuntimeError):
    """Raised when the catalog or the rules contract cannot be used."""


def _compile(pattern: str) -> re.Pattern[str]:
    """Compile a rule pattern, hoisting a leading ``(?i)`` into the flags.

    The rules file uses ``(?i)`` prefixes for readability. Python has no inline
    mode flag, so it is lifted into ``re.IGNORECASE`` here, matching the
    TypeScript loader exactly.
    """
    cached = _REGEX_CACHE.get(pattern)
    if cached is not None:
        return cached
    body = pattern
    flags = 0
    if body.startswith("(?i)"):
        flags |= re.IGNORECASE
        body = body[4:]
    compiled = re.compile(body, flags)
    _REGEX_CACHE[pattern] = compiled
    return compiled


@dataclass(frozen=True)
class Rule:
    """One classification rule from the shared contract."""

    id: str
    priority: int
    category: str
    flags: list[str]
    match: dict[str, Any]
    reason: str


@dataclass(frozen=True)
class Rules:
    """Parsed view of ``classification-rules.json``."""

    contract_version: str
    principle: str
    categories: dict[str, str]
    extraction_policy: dict[str, Any]
    rules: list[Rule]
    fallback: dict[str, Any]
    raw: dict[str, Any]

    @property
    def copyable_categories(self) -> set[str]:
        return set(self.extraction_policy.get("copyable_categories", []))

    @property
    def authorization_required_categories(self) -> set[str]:
        return set(self.extraction_policy.get("authorization_required_categories", []))

    @property
    def absolutely_denied_categories(self) -> set[str]:
        return set(self.extraction_policy.get("absolutely_denied_categories", []))

    @property
    def absolutely_denied_paths(self) -> set[str]:
        return set(self.extraction_policy.get("absolutely_denied_paths", []))

    @property
    def absolutely_denied_basename_patterns(self) -> list[re.Pattern[str]]:
        return [_compile(p) for p in self.extraction_policy.get("absolutely_denied_basename_patterns", [])]

    @property
    def content_signals(self) -> list[dict[str, str]]:
        spec = self.extraction_policy.get("content_sensitive_patterns") or {}
        return list(spec.get("patterns", []))

    @property
    def content_scan_max_bytes(self) -> int:
        spec = self.extraction_policy.get("content_sensitive_patterns") or {}
        return int(spec.get("max_scan_bytes", 2 * 1024 * 1024))

    @property
    def authorization_flag(self) -> str:
        return str(self.extraction_policy.get("flag", "--i-have-authorization"))


def load_rules(path: Path) -> Rules:
    """Load and validate the shared rules contract."""
    if not path.is_file():
        raise CatalogError(f"Classification rules not found at {path}.")
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        raise CatalogError(f"Classification rules at {path} are not valid JSON: {exc}") from exc

    rules = [Rule(**r) for r in raw.get("rules", [])]
    if not rules:
        raise CatalogError(f"Classification rules at {path} declare no rules.")
    rules.sort(key=lambda r: r.priority)

    return Rules(
        contract_version=raw.get("contract_version", "unknown"),
        principle=raw.get("principle", ""),
        categories=raw.get("categories", {}),
        extraction_policy=raw.get("extraction_policy", {}),
        rules=rules,
        fallback=raw.get("fallback", {}),
        raw=raw,
    )
