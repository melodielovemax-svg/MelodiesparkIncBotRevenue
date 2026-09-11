from melodie_platforms.botrevenue.policy import policy


def test_financial_policy_is_safe():
    current = policy()
    assert current["autonomous_spending"] is False
    assert current["autonomous_payouts"] is False
    assert current["autonomous_transfers"] is False
    assert current["server_private_keys"] is False
    assert current["treasury_broadcast"] is False
    assert current["human_approval_required"] is True
    assert current["external_signer_required"] is True
