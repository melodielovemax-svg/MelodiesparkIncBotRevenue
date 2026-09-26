"""Filesystem layout resolution for the Python CLI.

Mirrors ``apps/melodie-cli/src/paths.ts``. Both frontends must resolve the same
assets so that one catalog drives both.

Resolution order for each asset:
    explicit argument > environment variable > monorepo > packaged data
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

from .contract import (
    CATALOG_RELPATH,
    MARKER_RELPATH,
    RULES_RELPATH,
    TEMPLATES_RELPATH,
)

PACKAGE_DIR = Path(__file__).resolve().parent
BUNDLED_DATA = PACKAGE_DIR / "data"

DEFAULT_SOURCE_ROOT = Path(r"C:\melodie\Melodiespark_Source")


def find_monorepo_root(start: Path | None = None) -> Path | None:
    """Walk up looking for the monorepo marker file."""
    current = (start or PACKAGE_DIR).resolve()
    for _ in range(12):
        if (current / MARKER_RELPATH).is_file():
            return current
        if current.parent == current:
            break
        current = current.parent
    return None


def _pick(candidates: list[Path | None], env_var: str) -> Path | None:
    from_env = os.environ.get(env_var)
    if from_env:
        candidate = Path(from_env)
        if candidate.exists():
            return candidate
    for candidate in candidates:
        if candidate is not None and candidate.exists():
            return candidate
    return None


@dataclass(frozen=True)
class ResolvedPaths:
    """Every asset location the CLI needs, already resolved."""

    catalog_path: Path
    rules_path: Path
    templates_dir: Path
    source_root: Path
    monorepo_root: Path | None
    catalog_is_packaged: bool


def resolve_paths(
    catalog: str | Path | None = None,
    source_root: str | Path | None = None,
) -> ResolvedPaths:
    """Resolve catalog, rules, templates, and source root."""
    root = find_monorepo_root()

    monorepo_catalog = (root / CATALOG_RELPATH) if root else None
    monorepo_rules = (root / RULES_RELPATH) if root else None
    monorepo_templates = (root / TEMPLATES_RELPATH) if root else None

    catalog_path = _pick(
        [Path(catalog) if catalog else None, monorepo_catalog, BUNDLED_DATA / "catalog" / "content-catalog.json"],
        "MELODIESPARK_CATALOG",
    )
    rules_path = _pick(
        [monorepo_rules, BUNDLED_DATA / "rules" / "classification-rules.json"],
        "MELODIESPARK_RULES",
    )
    templates_dir = _pick(
        [monorepo_templates, BUNDLED_DATA / "templates"],
        "MELODIESPARK_TEMPLATES",
    )

    resolved_source = (
        Path(source_root)
        if source_root
        else Path(os.environ["MELODIESPARK_SOURCE"])
        if os.environ.get("MELODIESPARK_SOURCE")
        else (root / "Melodiespark_Source")
        if root and (root / "Melodiespark_Source").is_dir()
        else DEFAULT_SOURCE_ROOT
    )

    packaged_catalog = BUNDLED_DATA / "catalog" / "content-catalog.json"

    return ResolvedPaths(
        catalog_path=catalog_path or (monorepo_catalog or packaged_catalog),
        rules_path=rules_path or (monorepo_rules or BUNDLED_DATA / "rules" / "classification-rules.json"),
        templates_dir=templates_dir or (monorepo_templates or BUNDLED_DATA / "templates"),
        source_root=resolved_source,
        monorepo_root=root,
        catalog_is_packaged=bool(catalog_path) and catalog_path.resolve() == packaged_catalog.resolve(),
    )
