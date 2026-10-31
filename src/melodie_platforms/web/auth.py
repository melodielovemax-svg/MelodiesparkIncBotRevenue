"""Server-side sessions, password hashing and request authorization."""

from __future__ import annotations

import hashlib
import hmac
import os
import re
import secrets
from datetime import UTC, datetime, timedelta
from typing import Annotated

from fastapi import Depends, HTTPException, Request

from .db import connect, now

SESSION_SECONDS = 8 * 3600
EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def password_hash(password: str) -> str:
    salt = secrets.token_bytes(16)
    derived = hashlib.scrypt(password.encode(), salt=salt, n=2**14, r=8, p=1)
    return f"{salt.hex()}:{derived.hex()}"


def verify_password(password: str, encoded: str) -> bool:
    try:
        salt, digest = encoded.split(":")
        candidate = hashlib.scrypt(password.encode(), salt=bytes.fromhex(salt), n=2**14, r=8, p=1)
        return hmac.compare_digest(candidate, bytes.fromhex(digest))
    except (ValueError, TypeError):
        return False


def bootstrap() -> None:
    from .db import migrate

    migrate()
    email = os.environ.get("MMD_ADMIN_EMAIL", "").strip().lower()
    password = os.environ.get("MMD_ADMIN_PASSWORD", "")
    if not EMAIL.fullmatch(email) or len(password) < 14 or len(password) > 256:
        raise ValueError("Set MMD_ADMIN_EMAIL and MMD_ADMIN_PASSWORD (14–256 characters) in the environment")
    with connect() as db:
        if db.execute("SELECT 1 FROM users LIMIT 1").fetchone():
            raise ValueError("Bootstrap refused: a user already exists")
        db.execute(
            "INSERT INTO users(email,password_hash,role,created_at) VALUES (?,?,?,?)",
            (email, password_hash(password), "admin", now()),
        )


def create_session(user_id: int) -> tuple[str, str]:
    token = secrets.token_urlsafe(32)
    csrf = secrets.token_urlsafe(32)
    expiry = (datetime.now(UTC) + timedelta(seconds=SESSION_SECONDS)).isoformat(timespec="seconds")
    with connect() as db:
        db.execute("DELETE FROM sessions WHERE expires_at <= ?", (now(),))
        db.execute(
            "INSERT INTO sessions(token_hash,user_id,csrf_token,expires_at) VALUES (?,?,?,?)",
            (hashlib.sha256(token.encode()).hexdigest(), user_id, csrf, expiry),
        )
    return token, csrf


def current_user(request: Request) -> dict:
    token = request.cookies.get("mmd_session", "")
    if not token:
        raise HTTPException(status_code=401, detail="Authentication required")
    with connect() as db:
        row = db.execute(
            "SELECT users.id,users.email,users.role,sessions.csrf_token FROM sessions "
            "JOIN users ON users.id=sessions.user_id WHERE token_hash=? AND expires_at>?",
            (hashlib.sha256(token.encode()).hexdigest(), now()),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=401, detail="Session expired")
    return dict(row)


def require_write(request: Request, user: Annotated[dict, Depends(current_user)]) -> dict:
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    submitted = request.headers.get("X-CSRF-Token", "")
    if not submitted or not hmac.compare_digest(submitted, user["csrf_token"]):
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
    return user


def require_csrf(request: Request, user: Annotated[dict, Depends(current_user)]) -> dict:
    submitted = request.headers.get("X-CSRF-Token", "")
    if not submitted or not hmac.compare_digest(submitted, user["csrf_token"]):
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
    return user
