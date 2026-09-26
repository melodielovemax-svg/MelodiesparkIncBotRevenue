# Melodiespark Python SDK & CLI

Official Python SDK and command line client for the Melodiespark Command Center & Path of Melodie ARPG runtime.

## Installation

### Via pip:
```bash
pip install melodiespark
```

### Via pipx (isolated CLI):
```bash
pipx install melodiespark
```

## CLI Usage

```bash
# Check Command Center status
melodiespark status

# View Guardian matrix profiles
melodiespark guardians --tier arc_angel

# Trigger safe workflow cycle
melodiespark cycle --count 1

# Check Karma balance & rules
melodiespark karma

# Post ARPG game telemetry event
melodiespark telemetry --event boss_slain --boss "The Cinder Warden" --damage 12000
```

## Python API Usage

```python
from melodiespark import MelodieClient

client = MelodieClient(base_url="http://127.0.0.1:4173")

# Health & Dashboard
health = client.get_health()
dash = client.get_dashboard()

# Telemetry Emitter
client.emit_telemetry(
    event_type="boss_slain",
    boss_defeated="The Cinder Warden",
    act_number=1,
    damage_dealt=14500,
    shatters=12,
    karma_earned=50
)

# Non-custodial wallet challenge
challenge = client.get_wallet_challenge("0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045")
print("Nonce:", challenge["nonce"])
```
