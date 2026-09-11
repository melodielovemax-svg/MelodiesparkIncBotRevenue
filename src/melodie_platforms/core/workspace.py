from __future__ import annotations

from pathlib import Path

from .paths import workspace_root

GROUPS = [
    "apps",
    "packages",
    "services",
    "Platforms",
    "docs",
    "Evidence",
]


def inventory() -> dict:
    root = workspace_root()

    groups: dict[str, list[str]] = {}

    for name in GROUPS:
        target = root / name

        if not target.exists():
            groups[name] = []
            continue

        groups[name] = sorted(entry.name for entry in target.iterdir() if entry.is_dir())

    return {
        "workspace": str(root),
        "groups": groups,
    }


def find_projects(root: Path | None = None) -> list[dict]:
    base = root or workspace_root()

    projects: list[dict] = []

    markers = {
        "package.json",
        "pyproject.toml",
        "*.uproject",
    }

    for directory in base.iterdir():
        if not directory.is_dir():
            continue

        if directory.name.startswith("."):
            continue

        found = []

        for marker in markers:
            found.extend(directory.glob(marker))

        if found:
            projects.append(
                {
                    "name": directory.name,
                    "path": str(directory),
                    "markers": [path.name for path in found],
                }
            )

    return projects
