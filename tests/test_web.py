"""API integration tests use a fresh, empty SQLite database for each test."""

import sqlite3

import pytest
from fastapi.testclient import TestClient

from melodie_platforms.web.app import app
from melodie_platforms.web.auth import bootstrap
from melodie_platforms.web.db import audit_integrity, connect


@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setenv("MMD_DB_PATH", str(tmp_path / "command.db"))
    monkeypatch.setenv("MMD_ADMIN_EMAIL", "admin@example.test")
    monkeypatch.setenv("MMD_ADMIN_PASSWORD", "an-extremely-long-test-password")
    monkeypatch.setenv("MMD_COOKIE_SECURE", "false")
    bootstrap()
    with TestClient(app) as test_client:
        yield test_client


def login(client, email="admin@example.test", password="an-extremely-long-test-password"):
    response = client.post("/api/auth/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["csrf_token"]


def test_empty_database_and_session_gate(client):
    assert client.get("/api/overview").status_code == 401
    assert client.get("/api/health").json()["database"] == "VERIFIED"
    csrf = login(client)
    result = client.get("/api/overview").json()
    assert result["counts"] == {}
    assert result["revenue_status"] == "UNVERIFIED"
    assert result["policy"]["payments_automatic"] is False
    assert result["policy"]["wallet_automatic_broadcast"] is False
    assert result["policy"]["evidence_required"] is True
    assert result["policy"]["production_release_requires_approval"] is True
    assert result["policy"]["secrets_in_source"] is False
    assert client.get("/api/finance").json()["verified_revenue"] is None
    assert client.post("/api/auth/logout").status_code == 403
    assert client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf}).status_code == 200
    assert client.get("/api/overview").status_code == 401


def test_records_validation_audit_and_immutability(client):
    csrf = login(client)
    path = "/api/records/products"
    assert client.post(path, json={"title": "Draft offer"}).status_code == 403
    headers = {"X-CSRF-Token": csrf}
    assert client.post(path, json={"title": "   "}, headers=headers).status_code == 422
    assert client.post(path, json={"title": "X", "status": "VERIFIED"}, headers=headers).status_code == 422
    assert client.post(path, json={"title": "X", "unexpected": 42}, headers=headers).status_code == 422
    assert client.post("/api/records/transactions", json={"title": "X"}, headers=headers).status_code == 422
    created = client.post(
        path, json={"title": "Draft offer", "description": "Internal review"}, headers=headers
    )
    assert created.status_code == 201
    record = created.json()
    assert record["status"] == "DRAFT"
    assert client.get(path).json()["items"][0]["id"] == record["id"]
    assert (
        client.patch(
            f"{path}/{record['id']}", json={"status": "PENDING_APPROVAL"}, headers=headers
        ).status_code
        == 200
    )
    assert client.patch(f"{path}/{record['id']}", json={"title": None}, headers=headers).status_code == 422
    audit = client.get("/api/audit").json()
    assert audit["integrity"] == "VERIFIED"
    assert [event["action"] for event in audit["items"]] == ["record.updated", "record.created"]
    with connect() as db:
        assert audit_integrity(db)
        with pytest.raises(sqlite3.DatabaseError):
            db.execute("DELETE FROM audit_events")
    assert client.get("/api/overview").json()["counts"]["products"] == 1


def test_login_throttle_role_and_origin(client):
    for _ in range(5):
        assert (
            client.post(
                "/api/auth/login", json={"email": "admin@example.test", "password": "wrong"}
            ).status_code
            == 401
        )
    assert (
        client.post(
            "/api/auth/login",
            json={"email": "admin@example.test", "password": "an-extremely-long-test-password"},
        ).status_code
        == 429
    )
    assert (
        client.post(
            "/api/auth/login",
            headers={"Origin": "https://attacker.test"},
            json={"email": "x", "password": "x"},
        ).status_code
        == 403
    )
    with connect() as db:
        db.execute("DELETE FROM login_attempts WHERE email=?", ("admin@example.test",))
    admin_csrf = login(client)
    assert (
        client.post(
            "/api/users", json={"email": "viewer@example.test", "password": "viewer-password-strong"}
        ).status_code
        == 403
    )
    created = client.post(
        "/api/users",
        headers={"X-CSRF-Token": admin_csrf},
        json={"email": "viewer@example.test", "password": "viewer-password-strong", "role": "viewer"},
    )
    assert created.status_code == 201
    assert client.get("/api/users").json()["items"][1]["role"] == "viewer"
    assert "viewer-password-strong" not in client.get("/api/audit").text
    csrf = login(client, "viewer@example.test", "viewer-password-strong")
    assert client.get("/api/users").status_code == 403
    assert client.get("/api/records/customers").status_code == 200
    assert (
        client.post(
            "/api/records/customers", json={"title": "Someone"}, headers={"X-CSRF-Token": csrf}
        ).status_code
        == 403
    )


def test_frontend_and_live_endpoints(client):
    assert "MetaMello-D" in client.get("/").text
    assert client.get("/static/app.js").status_code == 200
    assert client.get("/").headers["Content-Security-Policy"].startswith("default-src 'self'")
    login(client)
    network = client.get("/api/network").json()
    assert network["scope"] == "local TCP probes only"
    assert len(network["items"]) == 3
    assert client.get("/api/capabilities").json()["items"][0]["status"] == "BLOCKED"
