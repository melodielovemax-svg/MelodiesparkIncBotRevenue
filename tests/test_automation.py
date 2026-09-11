from melodie_platforms.automation.engine import automation_status


def test_sensitive_automation_disabled():
    entries = {item["id"]: item for item in automation_status()}
    assert entries["treasury-transfer"]["status"] == "DISABLED"
    assert entries["autonomous-payout"]["status"] == "DISABLED"
    assert entries["auto-sign"]["status"] == "DISABLED"
