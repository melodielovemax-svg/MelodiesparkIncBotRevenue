from __future__ import annotations

import json
from pathlib import Path


def registry_path() -> Path:
    return Path(__file__).resolve().parents[2] / "config" / "platforms.json"


def load_registry() -> dict:
    path = registry_path()

    if not path.exists():
        return {}

    return json.loads(path.read_text(encoding="utf-8"))
