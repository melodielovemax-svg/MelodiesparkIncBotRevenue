from enum import StrEnum


class EvidenceStatus(StrEnum):
    VERIFIED = "VERIFIED"
    UNVERIFIED = "UNVERIFIED"
    BLOCKED = "BLOCKED"
    DRAFT = "DRAFT"
    PENDING_APPROVAL = "PENDING_APPROVAL"
    FAILED = "FAILED"
    COMPLETED = "COMPLETED"
    DISABLED = "DISABLED"


VALID_STATUSES = {status.value for status in EvidenceStatus}
