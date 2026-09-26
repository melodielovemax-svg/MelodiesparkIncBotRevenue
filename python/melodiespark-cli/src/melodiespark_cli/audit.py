"""Append-only extraction audit log.

Identical semantics to ``apps/melodie-cli/src/audit.ts``: one JSONL record per
decision, so "who read what, when, and under which authorization" is
answerable after the fact.
"""

from __future__ import annotations

import getpass
import json
import os
import platform
from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from pathlib import Path


def audit_actor() -> str:
    for key in ("MELODIESPARK_ACTOR", "USERNAME", "USER"):
        value = os.environ.get(key)
        if value:
            return value
    try:
        return getpass.getuser()
    except Exception:  # pragma: no cover - depends on host environment
        return "unknown"


@dataclass
class AuditRecord:
    """One decision, written to ``extract-audit.jsonl``."""

    ts: str
    actor: str
    action: str
    target: str
    outcome: str
    bytes: int
    authorization: bool
    reason: str
    content_signals: list[str] = field(default_factory=list)
    catalog: str = ""
    host: str = ""


def append_audit(log_path: Path, record: dict) -> AuditRecord:
    """Append one decision to the audit log."""
    full = AuditRecord(
        ts=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        actor=audit_actor(),
        host=f"{platform.system().lower()}-{platform.machine()}",
        **record,
    )
    log_path.parent.mkdir(parents=True, exist_ok=True)
    with log_path.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(asdict(full)) + "\n")
    return full


def read_audit(log_path: Path) -> list[AuditRecord]:
    """Read the audit trail, skipping corrupt lines."""
    if not log_path.is_file():
        return []
    out: list[AuditRecord] = []
    for raw in log_path.read_text(encoding="utf-8").splitlines():
        if not raw.strip():
            continue
        try:
            out.append(AuditRecord(**json.loads(raw)))
        except (json.JSONDecodeError, TypeError):
            continue
    return out
