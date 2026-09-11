from __future__ import annotations


AUTOMATIONS = {
    "workspace-audit": {
        "description": "Inventory Melodiespark workspace components.",
        "risk": "read-only",
        "enabled": True,
    },
    "platform-doctor": {
        "description": "Verify CLI/platform availability.",
        "risk": "read-only",
        "enabled": True,
    },
    "botrevenue-evidence": {
        "description": "Read evidence-backed BotRevenue ledger state.",
        "risk": "read-only",
        "enabled": True,
    },
    "release-audit": {
        "description": "Audit source/build/package/release readiness.",
        "risk": "read-only",
        "enabled": True,
    },
    "treasury-transfer": {
        "description": "Move treasury funds.",
        "risk": "financial",
        "enabled": False,
    },
    "autonomous-payout": {
        "description": "Issue autonomous payouts.",
        "risk": "financial",
        "enabled": False,
    },
    "auto-sign": {
        "description": "Automatically sign transactions/contracts.",
        "risk": "critical",
        "enabled": False,
    },
}


def registry() -> dict:
    return dict(AUTOMATIONS)
