from __future__ import annotations

import socket


SERVICES = {
    "ollama": ("127.0.0.1", 11434),
    "litellm": ("127.0.0.1", 4000),
    "melodie-gateway": ("127.0.0.1", 4100),
}


def probe(host: str, port: int, timeout: float = 0.4) -> bool:
    try:
        with socket.create_connection((host, port), timeout=timeout):
            return True
    except OSError:
        return False


def audit_services() -> list[dict]:
    rows = []

    for name, (host, port) in SERVICES.items():
        alive = probe(host, port)

        rows.append(
            {
                "service": name,
                "endpoint": f"{host}:{port}",
                "status": "VERIFIED" if alive else "UNVERIFIED",
            }
        )

    return rows
