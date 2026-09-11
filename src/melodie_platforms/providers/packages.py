from __future__ import annotations

from ..core.process import capture, installed

PROVIDERS = {
    "npm": ["--version"],
    "npx": ["--version"],
    "pnpm": ["--version"],
    "python": ["--version"],
    "pip": ["--version"],
    "pipx": ["--version"],
}


def audit_packages() -> list[dict]:
    rows = []

    for command, args in PROVIDERS.items():
        if not installed(command):
            rows.append(
                {
                    "provider": command,
                    "status": "UNVERIFIED",
                    "version": None,
                }
            )
            continue

        result = capture(command, args)

        value = result.stdout.strip() or result.stderr.strip() or None

        rows.append(
            {
                "provider": command,
                "status": "VERIFIED" if result.exit_code == 0 else "FAILED",
                "version": value,
            }
        )

    return rows
