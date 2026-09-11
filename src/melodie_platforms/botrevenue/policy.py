from __future__ import annotations


FINANCIAL_POLICY = {
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
