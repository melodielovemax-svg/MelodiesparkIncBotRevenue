import json
from pathlib import Path

PACKAGE_ROOT = Path(__file__).resolve().parents[2]
CONFIG = PACKAGE_ROOT / "config" / "platforms.json"

def load_registry():
    with CONFIG.open("r", encoding="utf-8-sig") as f:
        return json.load(f)["platforms"]
