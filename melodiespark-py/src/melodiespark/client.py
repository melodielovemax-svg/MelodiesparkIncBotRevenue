import requests
from typing import Dict, Any, List, Optional
from .models import Guardian, TelemetryEvent, KarmaStatus

class MelodieClient:
    """Client for Melodiespark Command Center API."""

    def __init__(self, base_url: str = "http://127.0.0.1:4173", timeout: float = 10.0):
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.session = requests.Session()

    def get_health(self) -> Dict[str, Any]:
        """Fetch Command Center health status."""
        resp = self.session.get(f"{self.base_url}/api/health", timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def get_dashboard(self) -> Dict[str, Any]:
        """Fetch system dashboard overview."""
        resp = self.session.get(f"{self.base_url}/api/dashboard", timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def list_guardians(self, tier: Optional[str] = None, limit: int = 50) -> List[Guardian]:
        """Fetch guardian matrix profiles."""
        params = {"limit": limit}
        if tier:
            params["tier"] = tier
        resp = self.session.get(f"{self.base_url}/api/guardians", params=params, timeout=self.timeout)
        resp.raise_for_status()
        data = resp.json()
        return [
            Guardian(
                id=item["id"],
                name=item["name"],
                tier=item["tier"],
                domain=item["domain"],
                soul_core=item["soul_core"],
                role=item["role"],
                status=item.get("status", "configured")
            )
            for item in data.get("items", [])
        ]

    def get_karma(self) -> KarmaStatus:
        """Fetch karma ledger balance."""
        resp = self.session.get(f"{self.base_url}/api/karma", timeout=self.timeout)
        resp.raise_for_status()
        data = resp.json()
        return KarmaStatus(
            balance=data.get("balance", 0),
            transferable=data.get("transferable", False),
            notice=data.get("notice", "")
        )

    def get_wallet_challenge(self, address: str, chain_id: int = 1) -> Dict[str, Any]:
        """Request a non-custodial EIP-191 challenge."""
        params = {"address": address, "chainId": chain_id}
        resp = self.session.get(f"{self.base_url}/api/wallet/challenge", params=params, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def emit_telemetry(
        self,
        event_type: str,
        act_number: Optional[int] = None,
        boss_defeated: Optional[str] = None,
        damage_dealt: int = 0,
        shatters: int = 0,
        reactions: int = 0,
        ascensions: int = 0,
        karma_earned: int = 0,
        payload: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Send ARPG gameplay telemetry to the Command Center."""
        body = {
            "clientVersion": "1.0.0",
            "eventType": event_type,
            "actNumber": act_number,
            "bossDefeated": boss_defeated,
            "damageDealt": damage_dealt,
            "shattersTriggered": shatters,
            "reactionsTriggered": reactions,
            "phoenixAscensions": ascensions,
            "karmaEarned": karma_earned,
            "payload": payload or {}
        }
        resp = self.session.post(f"{self.base_url}/api/game/telemetry", json=body, timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()

    def get_telemetry_stats(self) -> Dict[str, Any]:
        """Fetch telemetry statistics recorded from Path of Melodie."""
        resp = self.session.get(f"{self.base_url}/api/game/telemetry", timeout=self.timeout)
        resp.raise_for_status()
        return resp.json()
