from __future__ import annotations

from .registry import registry


def automation_status() -> list[dict]:
    rows = []

    for key, value in registry().items():
        rows.append(
            {
                "id": key,
                "description": value["description"],
                "risk": value["risk"],
                "status": "COMPLETED" if value["enabled"] else "DISABLED",
            }
        )

    return rows


def require_enabled(name: str) -> dict:
    entries = registry()

    if name not in entries:
        raise KeyError(name)

    entry = entries[name]

    if not entry["enabled"]:
        raise PermissionError(
            f"Automation '{name}' is DISABLED by policy."
        )

    return entry
