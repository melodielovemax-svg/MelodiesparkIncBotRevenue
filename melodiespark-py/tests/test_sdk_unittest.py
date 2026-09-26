import unittest
from melodiespark.crypto import normalize_address, format_canonical_intent
from melodiespark.models import Guardian, TelemetryEvent

class TestMelodiesparkSDK(unittest.TestCase):
    def test_normalize_address_valid(self):
        addr = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
        self.assertEqual(normalize_address(addr), "0xd8da6bf26964af9d7eed9e03e53415d37aa96045")

    def test_normalize_address_invalid(self):
        with self.assertRaises(ValueError):
            normalize_address("invalid_eth_address")

    def test_canonical_intent(self):
        intent = format_canonical_intent(
            chain_id=1,
            asset="ETH",
            amount_display="0.5",
            destination="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",
            nonce="nonce_abc",
            expires_at="2026-10-01T00:00:00Z"
        )
        self.assertIn("Melodiespark withdrawal authorization intent", intent)
        self.assertIn("Chain ID: 1", intent)
        self.assertIn("Amount: 0.5", intent)
        self.assertIn("0xd8da6bf26964af9d7eed9e03e53415d37aa96045", intent)

    def test_models(self):
        g = Guardian(
            id="AA-001",
            name="ZEUS-PRIME",
            tier="arc_angel",
            domain="core",
            soul_core="PRIME-LOGIC",
            role="Orchestrator"
        )
        self.assertEqual(g.name, "ZEUS-PRIME")
        self.assertEqual(g.tier, "arc_angel")

        t = TelemetryEvent(event_type="boss_slain", damage_dealt=1000)
        self.assertEqual(t.event_type, "boss_slain")
        self.assertEqual(t.damage_dealt, 1000)

if __name__ == "__main__":
    unittest.main()
