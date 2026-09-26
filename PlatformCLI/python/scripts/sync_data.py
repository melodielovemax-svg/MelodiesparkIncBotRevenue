"""Sync shared assets into the Python package so a wheel is self-contained.

Copies, from the monorepo:

    packages/content-catalog/rules/classification-rules.json
    packages/content-catalog/catalog/content-catalog.json
    templates/**

into

    python/melodiespark-cli/src/melodiespark_cli/data/**

Run before ``python -m build``:

    python python/melodiespark-cli/scripts/sync_data.py
    python -m build --wheel --outdir dist python/melodiespark-cli
"""

from __future__ import annotations

import filecmp
import shutil
import sys
from pathlib import Path

PACKAGE_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = PACKAGE_DIR.parent.parent
DATA_DIR = PACKAGE_DIR / "src" / "melodiespark_cli" / "data"


def _copy_file(source: Path, target: Path) -> bool:
    """Copy when the content differs. Returns True when written."""
    if target.is_file() and filecmp.cmp(source, target, shallow=False):
        return False
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, target)
    return True


def _copy_tree(source: Path, target: Path) -> int:
    if not source.is_dir():
        return 0
    written = 0
    for path in sorted(source.rglob("*")):
        if path.is_dir() or "__pycache__" in path.parts:
            continue
        relative = path.relative_to(source)
        if _copy_file(path, target / relative):
            written += 1
    # Drop files that no longer exist upstream, so a stale template cannot ship.
    for path in sorted(target.rglob("*"), reverse=True):
        if path.is_file() and not (source / path.relative_to(target)).exists():
            path.unlink()
            written += 1
    return written


def main() -> int:
    rules = REPO_ROOT / "packages" / "content-catalog" / "rules" / "classification-rules.json"
    catalog_dir = REPO_ROOT / "packages" / "content-catalog" / "catalog"
    catalog = catalog_dir / "content-catalog.json"
    templates = REPO_ROOT / "templates"

    if not rules.is_file():
        print(f"error: rules not found at {rules}", file=sys.stderr)
        return 1

    changes = 0
    changes += 1 if _copy_file(rules, DATA_DIR / "rules" / "classification-rules.json") else 0

    if catalog.is_file():
        changes += 1 if _copy_file(catalog, DATA_DIR / "catalog" / "content-catalog.json") else 0
        # files.sha256, exclusions.json and repositories.json travel with the
        # catalog: without files.sha256 the installed CLI cannot run
        # `verify` at all, and without exclusions.json a reviewer of the
        # published wheel cannot see what was denied. files.json is skipped on
        # purpose: it duplicates content-catalog.json and would add ~4 MB to
        # every wheel.
        for extra in ("files.sha256", "exclusions.json", "repositories.json"):
            source = catalog_dir / extra
            if source.is_file():
                changes += 1 if _copy_file(source, DATA_DIR / "catalog" / extra) else 0
    else:
        print(
            f"warning: no catalog at {catalog}. Run `melodie catalog --build` before packaging.",
            file=sys.stderr,
        )

    changes += _copy_tree(templates, DATA_DIR / "templates")

    print(f"synced shared assets into {DATA_DIR} ({changes} file(s) written)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
