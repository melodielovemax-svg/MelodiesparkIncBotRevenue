from melodiespark.crypto import normalize_address, format_canonical_intent
from melodiespark.models import Guardian, TelemetryEvent

def test_normalize_address_valid():
    addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    assert normalize_address(addr) == "0xd8da6bf26964af9d7eed9e03e53415d37aa96045"

def test_canonical_intent_format():
    intent = format_canonical_intent(
        chain_id=1,
        asset="ETH",
        amount_display="0.25",
        destination="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
        nonce="test_nonce_123",
        expires_at="2026-10-01T00:00:00Z"
    )
    assert "Melodiespark withdrawal authorization intent" in intent
    assert "Chain ID: 1" in intent
    assert "Amount: 0.25" in intent
    assert "0xd8da6bf26964af9d7eed9e03e53415d37aa96045" in intent
