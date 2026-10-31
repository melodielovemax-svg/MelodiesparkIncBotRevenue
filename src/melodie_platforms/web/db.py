"""SQLite persistence. The database is a single-instance trust boundary."""

from __future__ import annotations

import hashlib
import json
import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from datetime import UTC, datetime
from pathlib import Path


def now() -> str:
    return datetime.now(UTC).isoformat(timespec="seconds")


def database_path() -> Path:
    return Path(os.environ.get("MMD_DB_PATH", "./var/metamello.db")).expanduser()


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    db = sqlite3.connect(path, timeout=10)
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys=ON")
    db.execute("PRAGMA busy_timeout=10000")
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def migrate() -> None:
    with connect() as db:
        version = db.execute("PRAGMA user_version").fetchone()[0]
        if version > 1:
            raise RuntimeError("Database schema is newer than this application")
        if version == 0:
            sql = (Path(__file__).parent / "migrations" / "001_initial.sql").read_text(encoding="utf-8")
            db.executescript("BEGIN IMMEDIATE;\n" + sql + "\nPRAGMA user_version=1; COMMIT;")


def append_audit(db: sqlite3.Connection, actor_id: int, action: str, subject: str, payload: dict) -> None:
    """Append a canonical hash-linked event in the caller's transaction."""
    previous = db.execute("SELECT hash FROM audit_events ORDER BY id DESC LIMIT 1").fetchone()
    prev_hash = previous[0] if previous else "0" * 64
    at = now()
    encoded = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    content = json.dumps([at, actor_id, action, subject, encoded, prev_hash], separators=(",", ":"))
    digest = hashlib.sha256(content.encode()).hexdigest()
    db.execute(
        "INSERT INTO audit_events(at,actor_id,action,subject,payload,previous_hash,hash) VALUES (?,?,?,?,?,?,?)",
        (at, actor_id, action, subject, encoded, prev_hash, digest),
    )


def audit_integrity(db: sqlite3.Connection) -> bool:
    previous = "0" * 64
    for row in db.execute("SELECT * FROM audit_events ORDER BY id"):
        content = json.dumps(
            [row["at"], row["actor_id"], row["action"], row["subject"], row["payload"], previous],
            separators=(",", ":"),
        )
        if row["previous_hash"] != previous or hashlib.sha256(content.encode()).hexdigest() != row["hash"]:
            return False
        previous = row["hash"]
    return True
