from __future__ import annotations

import json
from pathlib import Path

from ..core.paths import workspace_root


def ledger_path() -> Path:
    return workspace_root() / "BotRevenue" / "Revenue-Register.jsonl"


def read_events() -> list[dict]:
    path = ledger_path()

    if not path.exists():
        return []

    rows: list[dict] = []

    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()

        if not line:
            continue

        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            rows.append(
                {
                    "status": "FAILED",
                    "error": "invalid_json",
                }
            )

    return rows


def summarize(events: list[dict]) -> dict:
    verified_payments = 0
    verified_revenue = 0.0
    fulfilled_orders = 0

    for event in events:
        status = str(event.get("status", "")).upper()
        event_type = str(event.get("type", "")).lower()

        if status != "VERIFIED":
            continue

        if event_type == "payment":
            verified_payments += 1
            verified_revenue += float(event.get("amount", 0) or 0)

        if event_type == "fulfillment":
            fulfilled_orders += 1

    return {
        "verified_payments": verified_payments,
        "verified_revenue": verified_revenue,
        "fulfilled_orders": fulfilled_orders,
        "source_events": len(events),
        "status": "VERIFIED" if events else "UNVERIFIED",
    }
