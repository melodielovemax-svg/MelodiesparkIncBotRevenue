"""MetaMello-D API: local operational records, never financial execution."""

from __future__ import annotations

import hashlib
import json
import logging
import os
import sqlite3
import time
from contextlib import asynccontextmanager
from datetime import UTC, datetime, timedelta
from pathlib import Path
from typing import Annotated, Literal
from urllib.parse import urlparse

from fastapi import Depends, FastAPI, HTTPException, Request, Response
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict, Field

from ..automation.engine import automation_status
from ..botrevenue.policy import policy
from ..providers.services import audit_services
from .auth import (
    EMAIL,
    create_session,
    current_user,
    password_hash,
    require_csrf,
    require_write,
    verify_password,
)
from .db import append_audit, audit_integrity, connect, migrate, now

ReadUser = Annotated[dict, Depends(current_user)]
WriteUser = Annotated[dict, Depends(require_write)]
CsrfUser = Annotated[dict, Depends(require_csrf)]

logger = logging.getLogger("metamello")
logging.basicConfig(level=os.environ.get("MMD_LOG_LEVEL", "INFO"), format="%(message)s")
STATIC = Path(__file__).parent / "static"
Kind = Literal["products", "customers", "agents", "work_orders", "cases", "integrations"]
Status = Literal["DRAFT", "UNVERIFIED", "BLOCKED", "PENDING_APPROVAL", "DISABLED", "COMPLETED"]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    migrate()
    yield


app = FastAPI(title="MetaMello-D", version="0.1.0", docs_url=None, redoc_url=None, lifespan=lifespan)
app.mount("/static", StaticFiles(directory=STATIC), name="static")


@app.middleware("http")
async def security_headers(request: Request, call_next):
    start = time.monotonic()
    if request.method not in ("GET", "HEAD", "OPTIONS") and request.headers.get("origin"):
        origin = urlparse(request.headers["origin"])
        if origin.netloc.lower() != request.headers.get("host", "").lower() or origin.scheme not in (
            "http",
            "https",
        ):
            return JSONResponse({"detail": "Origin not allowed"}, status_code=403)
    try:
        response = await call_next(request)
    except Exception:
        logger.exception(json.dumps({"event": "unhandled_error", "path": request.url.path}))
        raise
    response.headers["X-Content-Type-Options"] = "nosniff"
    preview_embed = os.environ.get("MMD_PREVIEW_EMBED", "false").lower() == "true"
    if not preview_embed:
        response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"
    ancestors = "https://arena.ai https://*.arena.ai https://*.e2b.app" if preview_embed else "'none'"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; "
        f"object-src 'none'; base-uri 'none'; frame-ancestors {ancestors}"
    )
    response.headers["Cache-Control"] = "no-store"
    logger.info(
        json.dumps(
            {
                "event": "request",
                "method": request.method,
                "path": request.url.path,
                "status": response.status_code,
                "elapsed_ms": int((time.monotonic() - start) * 1000),
            }
        )
    )
    return response


class Login(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=1, max_length=256)


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=14, max_length=256)
    role: Literal["admin", "viewer"] = "viewer"


class RecordCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=1, max_length=120)
    description: str = Field(default="", max_length=2000)
    status: Status = "DRAFT"


class RecordUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(default=None, min_length=1, max_length=120)
    description: str | None = Field(default=None, max_length=2000)
    status: Status | None = None


def record_dict(row: sqlite3.Row) -> dict:
    return dict(row)


@app.get("/")
def index():
    return FileResponse(STATIC / "index.html")


@app.get("/api/health")
def health():
    with connect() as db:
        db.execute("SELECT 1")
    return {"status": "COMPLETED", "checked_at": now(), "database": "VERIFIED"}


@app.post("/api/auth/login")
def login(body: Login, response: Response):
    email = body.email.strip().lower()
    with connect() as db:
        attempts = db.execute(
            "SELECT failures,locked_until FROM login_attempts WHERE email=?", (email,)
        ).fetchone()
        if attempts and attempts["locked_until"] and attempts["locked_until"] > now():
            raise HTTPException(status_code=429, detail="Try again later")
        row = db.execute("SELECT id,email,role,password_hash FROM users WHERE email=?", (email,)).fetchone()
        # Same hash work for unknown emails; do not expose account existence.
        valid = verify_password(body.password, row["password_hash"] if row else DUMMY_HASH)
        if not row or not valid:
            failures = (attempts["failures"] if attempts else 0) + 1
            locked = (
                (datetime.now(UTC) + timedelta(minutes=15)).isoformat(timespec="seconds")
                if failures >= 5
                else None
            )
            db.execute(
                "INSERT INTO login_attempts(email,failures,locked_until) VALUES(?,?,?) "
                "ON CONFLICT(email) DO UPDATE SET failures=excluded.failures,locked_until=excluded.locked_until",
                (email, failures, locked),
            )
            # commit before reporting failure (context manager rolls back on exception)
            db.commit()
            raise HTTPException(status_code=401, detail="Invalid credentials")
        db.execute("DELETE FROM login_attempts WHERE email=?", (email,))
    token, csrf = create_session(row["id"])
    response.set_cookie(
        "mmd_session",
        token,
        max_age=8 * 3600,
        httponly=True,
        secure=os.environ.get("MMD_COOKIE_SECURE", "true").lower() != "false",
        samesite="strict",
        path="/",
    )
    return {"email": row["email"], "role": row["role"], "csrf_token": csrf}


# Valid scrypt encoding used only to equalize nonexistent-user password verification cost.
DUMMY_HASH = (
    "00000000000000000000000000000000:"
    + hashlib.scrypt(b"not-a-real-password", salt=b"\x00" * 16, n=2**14, r=8, p=1).hex()
)


@app.get("/api/auth/me")
def me(user: ReadUser):
    return {"email": user["email"], "role": user["role"], "csrf_token": user["csrf_token"]}


@app.post("/api/auth/logout")
def logout(request: Request, response: Response, _user: CsrfUser):
    token = request.cookies.get("mmd_session", "")
    with connect() as db:
        db.execute("DELETE FROM sessions WHERE token_hash=?", (hashlib.sha256(token.encode()).hexdigest(),))
    response.delete_cookie("mmd_session", path="/")
    return {"status": "COMPLETED"}


@app.get("/api/users")
def users(user: ReadUser):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    with connect() as db:
        items = [dict(row) for row in db.execute("SELECT id,email,role,created_at FROM users ORDER BY id")]
    return {"items": items, "checked_at": now()}


@app.post("/api/users", status_code=201)
def create_user(body: UserCreate, user: WriteUser):
    email = body.email.strip().lower()
    if not EMAIL.fullmatch(email):
        raise HTTPException(status_code=422, detail="Invalid email address")
    with connect() as db:
        try:
            cursor = db.execute(
                "INSERT INTO users(email,password_hash,role,created_at) VALUES (?,?,?,?)",
                (email, password_hash(body.password), body.role, now()),
            )
        except sqlite3.IntegrityError:
            raise HTTPException(status_code=409, detail="User already exists") from None
        append_audit(
            db, user["id"], "user.created", f"users/{cursor.lastrowid}", {"email": email, "role": body.role}
        )
    return {"id": cursor.lastrowid, "email": email, "role": body.role}


@app.get("/api/overview")
def overview(_user: ReadUser):
    with connect() as db:
        counts = {
            row["kind"]: row["total"]
            for row in db.execute("SELECT kind,count(*) AS total FROM records GROUP BY kind")
        }
        events = db.execute("SELECT count(*) FROM audit_events").fetchone()[0]
        integrity = audit_integrity(db)
    return {
        "counts": counts,
        "audit_events": events,
        "audit_integrity": "VERIFIED" if integrity else "FAILED",
        "checked_at": now(),
        "financial_status": "DISABLED",
        "revenue_status": "UNVERIFIED",
        "release_status": "PENDING_APPROVAL",
        "policy": policy(),
    }


@app.get("/api/records/{kind}")
def list_records(kind: Kind, _user: ReadUser):
    with connect() as db:
        rows = db.execute(
            "SELECT id,kind,title,description,status,created_at,updated_at FROM records "
            "WHERE kind=? ORDER BY id DESC LIMIT 100",
            (kind,),
        ).fetchall()
    return {"items": [record_dict(row) for row in rows], "checked_at": now(), "limit": 100}


@app.post("/api/records/{kind}", status_code=201)
def create_record(kind: Kind, body: RecordCreate, user: WriteUser):
    title = body.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Title cannot be blank")
    stamp = now()
    with connect() as db:
        cursor = db.execute(
            "INSERT INTO records(kind,title,description,status,created_at,updated_at,created_by) "
            "VALUES(?,?,?,?,?,?,?)",
            (kind, title, body.description.strip(), body.status, stamp, stamp, user["id"]),
        )
        record_id = cursor.lastrowid
        append_audit(
            db,
            user["id"],
            "record.created",
            f"{kind}/{record_id}",
            {"title": title, "description": body.description.strip(), "status": body.status},
        )
        row = db.execute(
            "SELECT id,kind,title,description,status,created_at,updated_at FROM records WHERE id=?",
            (record_id,),
        ).fetchone()
    return record_dict(row)


@app.patch("/api/records/{kind}/{record_id}")
def update_record(kind: Kind, record_id: int, body: RecordUpdate, user: WriteUser):
    changes = body.model_dump(exclude_unset=True)
    if not changes:
        raise HTTPException(status_code=422, detail="No changes supplied")
    if "title" in changes and (changes["title"] is None or not changes["title"].strip()):
        raise HTTPException(status_code=422, detail="Title cannot be blank")
    if any(value is None for value in changes.values()):
        raise HTTPException(status_code=422, detail="Null values are not allowed")
    with connect() as db:
        previous = db.execute("SELECT id FROM records WHERE id=? AND kind=?", (record_id, kind)).fetchone()
        if not previous:
            raise HTTPException(status_code=404, detail="Record not found")
        changes = {key: value.strip() if isinstance(value, str) else value for key, value in changes.items()}
        # Column names are Pydantic-declared fields, not request-supplied SQL identifiers.
        db.execute(
            "UPDATE records SET " + ", ".join(f"{key}=?" for key in changes) + ", updated_at=? WHERE id=?",
            (*changes.values(), now(), record_id),
        )
        append_audit(db, user["id"], "record.updated", f"{kind}/{record_id}", changes)
        row = db.execute(
            "SELECT id,kind,title,description,status,created_at,updated_at FROM records WHERE id=?",
            (record_id,),
        ).fetchone()
    return record_dict(row)


@app.get("/api/audit")
def audit(_user: ReadUser):
    with connect() as db:
        items = [
            dict(row)
            for row in db.execute(
                "SELECT id,at,actor_id,action,subject,payload,previous_hash,hash FROM audit_events ORDER BY id DESC LIMIT 100"
            )
        ]
        integrity = audit_integrity(db)
    return {"items": items, "integrity": "VERIFIED" if integrity else "FAILED", "checked_at": now()}


@app.get("/api/network")
def network(_user: ReadUser):
    return {"items": audit_services(), "checked_at": now(), "scope": "local TCP probes only"}


@app.get("/api/automations")
def automations(_user: ReadUser):
    return {"items": automation_status(), "checked_at": now()}


@app.get("/api/finance")
def finance(_user: ReadUser):
    return {
        "status": "DISABLED",
        "verified_revenue": None,
        "verified_payments": None,
        "reconciliation": "BLOCKED",
        "interac": "DISABLED",
        "subscriptions": "BLOCKED",
        "note": "No provider credentials or verified callbacks. Legacy JSONL is not trusted payment evidence.",
        "checked_at": now(),
    }


@app.get("/api/capabilities")
def capabilities(_user: ReadUser):
    return {
        "items": [
            {
                "name": "MCP gateway & provider routing",
                "status": "BLOCKED",
                "reason": "No approved provider configuration",
            },
            {
                "name": "Live reputation monitoring",
                "status": "BLOCKED",
                "reason": "No authorized source or credentials",
            },
            {
                "name": "Interac e-Transfer adapter",
                "status": "DISABLED",
                "reason": "Bank access and callbacks not verified",
            },
            {
                "name": "Desktop client",
                "status": "DRAFT",
                "reason": "Web-first API architecture; no desktop packaging",
            },
        ],
        "checked_at": now(),
    }
