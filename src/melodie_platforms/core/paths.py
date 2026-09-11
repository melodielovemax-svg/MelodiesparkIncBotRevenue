from __future__ import annotations

import os
from pathlib import Path

DEFAULT_ROOT = Path(r"D:\MelodieCLII")


def workspace_root() -> Path:
    raw = os.environ.get("MELODIE_WORKSPACE")

    if raw:
        return Path(raw).expanduser().resolve()

    return DEFAULT_ROOT


def evidence_root() -> Path:
    return workspace_root() / "Evidence"


def platforms_root() -> Path:
    return workspace_root() / "Platforms"


def safe_relative(path: Path, root: Path | None = None) -> str:
    base = root or workspace_root()

    try:
        return str(path.resolve().relative_to(base.resolve()))
    except ValueError:
        return str(path.resolve())
