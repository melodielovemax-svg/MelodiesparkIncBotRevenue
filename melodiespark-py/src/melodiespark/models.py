from dataclasses import dataclass, field
from typing import Optional, Dict, Any, List

@dataclass
class Guardian:
    id: str
    name: str
    tier: str
    domain: str
    soul_core: str
    role: str
    status: str = "configured"

@dataclass
class TelemetryEvent:
    event_type: str
    client_version: str = "1.0.0"
    session_id: str = "py_session"
    player_id: str = "guardian_py"
    act_number: Optional[int] = None
    boss_defeated: Optional[str] = None
    damage_dealt: int = 0
    shatters_triggered: int = 0
    reactions_triggered: int = 0
    phoenix_ascensions: int = 0
    karma_earned: int = 0
    payload: Dict[str, Any] = field(default_factory=dict)

@dataclass
class RevenueSummary:
    total_records: int
    currencies: List[str]
    mode: str = "demo"

@dataclass
class KarmaStatus:
    balance: int
    transferable: bool
    notice: str
