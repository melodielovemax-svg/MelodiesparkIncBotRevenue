# Melodie CLI Agent Platform - Evidence Engine

## 1. Evidence Invariants

In Melodie, status cannot be upgraded through assertions alone:

```text
EVIDENCE DETERMINES STATUS; SOPHISTICATION DOES NOT.
```

Every agent execution produces:
```text
REQUEST
   ↓
PLAN
   ↓
MODEL
   ↓
TOOLS
   ↓
FILES CHANGED
   ↓
COMMANDS
   ↓
TESTS
   ↓
RESULT
   ↓
VERIFICATION
   ↓
AUDIT RECORD
```

---

## 2. Evidence Record Schema

Stored in `.melodie/evidence/<execution_id>.json`:

```json
{
  "execution_id": "1c6d80f1-8de3-4dbf-b754-791786022509",
  "task_id": "TASK-000001",
  "agent_id": "coder",
  "model": "local/mock-coder",
  "status": "VERIFIED",
  "timestamp": "2026-09-26T07:36:46.999Z",
  "files_changed": 0,
  "file_details": [],
  "tests": {
    "passed": 1,
    "failed": 0,
    "total": 1
  },
  "runtime_verified": true,
  "evidence": [
    "sandbox-exec",
    "audit-trail"
  ],
  "audit_id": "9bc3230a-471a-42c1-8408-ae5935f11cb8",
  "checksum": "b9593c3bfe..."
}
```

---

## 3. Cryptographic Verification

Run:
```bash
melodie evidence verify <execution_id>
```

The engine recomputes the SHA-256 hash over the canonical record attributes. If the file has been modified or tampered with, verification fails immediately with a mismatch report.
