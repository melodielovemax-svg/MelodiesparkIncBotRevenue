from __future__ import annotations

FINANCIAL_POLICY = {
    "payments_automatic": False,
    "wallet_automatic_broadcast": False,
    "evidence_required": True,
    "production_release_requires_approval": True,
    "secrets_in_source": False,
    "autonomous_spending": False,
    "autonomous_payouts": False,
    "autonomous_transfers": False,
    "autonomous_contract_signing": False,
    "server_private_keys": False,
    "treasury_broadcast": False,
    "human_approval_required": True,
    "external_signer_required": True,
}


def policy() -> dict:
    return dict(FINANCIAL_POLICY)
