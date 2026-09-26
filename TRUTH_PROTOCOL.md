# Melodiespark Truth Protocol

**Effective Date:** 2025-01-01
**Classification:** BINDING OPERATIONAL STANDARD
**Authority:** Governance Framework + Evidence Model
**Custodian:** Gordon (AI Assistant) + Project Lead

---

## The Core Principle

**Governance defines how evidence is interpreted; governance does not substitute for evidence.**

This protocol exists to eliminate the possibility of vaporware, inference-based claims, and sophisticated facades masquerading as operational reality within Melodiespark.

---

## The Three Foundational Rules

### Rule 1: Governance ≠ Evidence

**What governance does:**
- Defines classification criteria
- Establishes status categories
- Creates audit trail requirements
- Specifies evidence sources

**What governance cannot do:**
- Replace missing evidence
- Justify "reasonable inference"
- Upgrade status without external verification
- Substitute architectural elegance for operational proof

**Consequence:**
If a business capability lacks evidence, it is classified `UNVERIFIED` regardless of governance quality, code quality, or infrastructure sophistication.

### Rule 2: The Inference Filter

When asked, "Does Melodiespark support X?" the answer must follow this exact pattern:

```
CLAIM: "Melodiespark supports X"

ENGINEERING EVIDENCE:
  ✅ or ❌ Code exists for X
  ✅ or ❌ Tests cover X
  ✅ or ❌ Runtime verification of X exists

BUSINESS EVIDENCE:
  ✅ or ❌ Real transaction processed for X
  ✅ or ❌ Real customer used X
  ✅ or ❌ Payment gateway confirmed X

CURRENT STATUS: [OPERATIONAL / SCAFFOLD / UNVERIFIED / etc.]

REASONING: [Cite specific source—git commit, test file, transaction hash, customer record, etc.]
```

Never:
- "It should work because the code looks right" → UNVERIFIED
- "The function exists, so it's ready" → SCAFFOLD
- "The infrastructure is in place" → UNVERIFIED for business claims
- "It passed internal testing" → May justify OPERATIONAL for engineering; says nothing about business

### Rule 3: The Source Requirement

**To upgrade any capability from `UNVERIFIED` → `OPERATIONAL` (business claims only):**

Provide a specific external source of truth. Examples:
- Transaction hash (blockchain transaction)
- Payment processor confirmation (Stripe API response, bank statement)
- Customer record (verified identity, real account)
- Signed contract (legal agreement with real party)
- Audit log (third-party verified activity)
- Time-stamped record (immutable ledger entry with external timestamp)

Never upgrade based on:
- "The code looks good"
- "Tests passed locally"
- "The architecture is solid"
- "We're confident it works"
- "The infrastructure is ready"

---

## Domain-Specific Truth Tables

### ENGINEERING LAYER
**Source of Truth:** Git commits, code reviews, test suites, runtime logs

| Status | Definition | Evidence Required |
|--------|-----------|------------------|
| OPERATIONAL | Code implemented, tests pass, runtime verified | Passing test suite + runtime behavior observable |
| SCAFFOLD | Implementation exists; real-world usage not demonstrated | Code exists + tests written (may not all pass) |
| PLANNED | Documented intention; not yet implemented | Design document + no code committed |
| PAPER-ONLY | Designed/specified; no implementation started | Specification document only |
| BLOCKED | Implementation exists but cannot currently run | Code exists + documented failure reason + dependency identified |
| UNVERIFIED | Insufficient evidence to assess implementation | No source of truth available |

### TECHNICAL LAYER
**Source of Truth:** Test results, runtime logs, system behavior, deployment records

| Status | Definition | Evidence Required |
|--------|-----------|------------------|
| OPERATIONAL | Tested against real conditions; behavior verified | Passing test + runtime output + reproducible results |
| SCAFFOLD | Tests pass; real-world scenario not executed | Tests pass + code executes + untested edge cases exist |
| BLOCKED | Dependency failure prevents operation | Clear error log + identified blocker |
| UNVERIFIED | No test evidence available | No test suite or test results unavailable |

### BUSINESS LAYER (Revenue / Customers / Market)
**Source of Truth:** Payment processor records, customer records, bank statements, signed contracts

| Status | Definition | Evidence Required |
|--------|-----------|------------------|
| OPERATIONAL | Real-world business activity verified and recorded | Payment processor confirmation + ledger record + customer identity verified + time-stamped |
| SCAFFOLD | Business code exists; real-world activity not demonstrated | Code written + tests mock business activity + no real transaction processed |
| UNVERIFIED | No evidence of real-world business activity | No payment records, no customer accounts, no transactions |
| BLOCKED | Legal/regulatory impediment prevents operation | Documented legal constraint or regulatory denial |

### SECURITY LAYER
**Source of Truth:** Security audit results, penetration test reports, encryption verification

| Status | Definition | Evidence Required |
|--------|-----------|------------------|
| HARDENED | Controls implemented and verified | Audit report + test confirmation + runtime verification |
| MONITORED | Activity logging and alerting active | Audit logs exist + retention verified |
| UNVERIFIED | Security posture not assessed | No security review conducted |

---

## The Reality Gap Tracking System

Melodiespark now maintains a **Gap Report** showing distance between target state and actual evidence:

### Gap Report Template

```
CAPABILITY: [Name]
TARGET STATE: [Intended final status]
CURRENT STATE: [Status based on available evidence]
GAP: [Difference]

EVIDENCE INVENTORY:
  Engineering: [OPERATIONAL / SCAFFOLD / etc.]
  Technical: [OPERATIONAL / SCAFFOLD / etc.]
  Business: [OPERATIONAL / UNVERIFIED / etc.]
  Security: [HARDENED / UNVERIFIED / etc.]

UPGRADE PATH:
  From CURRENT to TARGET requires: [Specific evidence]
  Example: "Need real customer transaction from Stripe API"

BLOCKER (if any):
  Current impediment: [Specific issue]
  Resolution path: [Steps to unblock]

INTEGRITY CHECK:
  Is this capability being presented as more mature than evidence supports? YES / NO
  If YES, correct classification immediately.
```

---

## Conversation Evidence ≠ Operational Evidence

**This protocol itself is documentation, not evidence.**

Examples of what this conversation IS:
- ✅ A record of governance decisions
- ✅ A framework for classification
- ✅ A commitment to truth-based methodology
- ✅ A tool for auditing claims

Examples of what this conversation is NOT:
- ❌ Evidence that a business capability exists
- ❌ Proof of customer activity
- ❌ Proof of revenue
- ❌ Proof of operational capability
- ❌ Substitution for external verification

**Rule:** If someone asks, "Does Melodiespark have customers?" the answer is not "See the governance conversation." The answer is: "Status: `UNVERIFIED`. No documented real customers exist in the system record."

---

## The Inference Filter: Examples

**Incorrect inference → UNVERIFIED correction:**

| Claim | Inference | Correct Classification |
|-------|-----------|------------------------|
| "Revenue processing works" | Code exists + tests pass | SCAFFOLD (code/tests exist; no real payment processed) |
| "The system is production-ready" | Infrastructure hardened + architecture elegant | UNVERIFIED (for business); OPERATIONAL (for infrastructure) |
| "We support 10K concurrent users" | Architecture allows it | SCAFFOLD or UNVERIFIED (never tested at scale) |
| "Customers can subscribe" | Subscription code written | SCAFFOLD (code exists; no real customer transaction) |
| "The token economy works" | Smart contracts written | PAPER-ONLY (not deployed or tested on-chain) |

---

## Upgrade Paths: From UNVERIFIED to OPERATIONAL

Each capability must have a documented, specific upgrade path.

### Example: "Business Revenue" Upgrade

```
CURRENT STATE: UNVERIFIED
REASON: No real transactions processed

UPGRADE TO OPERATIONAL requires:
  1. Real customer acquires subscription via Stripe
     EVIDENCE: Customer signup record + email verification
  
  2. Stripe processes payment
     EVIDENCE: Stripe webhook received + payment confirmed
  
  3. Transaction recorded in ledger
     EVIDENCE: Ledger database entry + timestamp + amount
  
  4. Third-party verification
     EVIDENCE: Stripe API confirms payment + bank statement shows receipt
  
  5. Manual audit verification
     EVIDENCE: Independent auditor confirms ledger entry matches payment record

ESTIMATED EFFORT: Real customer acquisition (weeks to months, market-dependent)
```

---

## What Breaks This Protocol

Violations that immediately flag a Melodiespark claim as compromised:

1. **Classification without evidence source** — Saying something is OPERATIONAL without citing specific evidence
2. **Governance substitution** — Using "the protocol says" as justification instead of actual evidence
3. **Conversation-as-evidence** — Claiming something is real because we discussed it
4. **Inference filling gaps** — Upgrading status because "it should work"
5. **Engineering-to-business leap** — Saying something is operationally profitable because the code is good
6. **Security-as-legitimacy** — Using hardened infrastructure as proof of real revenue
7. **Silence on gaps** — Not documenting when evidence is missing

---

## Going Forward: AI Assistant Commitment

As Melodiespark's auditor, I commit to:

✅ **The Inference Filter:** Never answer "Is X operational?" with inference. Always cite specific evidence source.

✅ **The Source Requirement:** Demand external verification (payment record, customer record, test output, etc.) before upgrading business status.

✅ **The Fiction Barrier:** Immediately categorize vision, narrative, or future-state as FICTIONAL or PAPER-ONLY, never business evidence.

✅ **The Gap Report:** Track distance between target and actual evidence.

✅ **The Violation Flag:** Immediately escalate if governance is used as substitute for evidence.

✅ **The Separation Rule:** Never conflate security, engineering, and business status.

---

## The Final Map

```
VISION (Future-state target)
    ↓
PLAN (How to reach vision)
    ↓
IMPLEMENTATION (Code written)
    ↓
TESTING (Tests written + pass)
    ↓
ENGINEERING OPERATIONAL (Code verified)
    ↓
REAL-WORLD DEPLOYMENT (Running in production)
    ↓
REAL-WORLD USAGE (Actual customers/transactions)
    ↓
BUSINESS OPERATIONAL (Verified + audited)
```

Melodiespark is currently somewhere between IMPLEMENTATION and TESTING for business-layer claims.

Infrastructure is OPERATIONAL. Business is UNVERIFIED.

That's the honest map.

---

## The Signature

I, Gordon (AI Assistant), commit to enforcing this protocol without exception, inference, or sophistication-based shortcut.

Every claim about Melodiespark will be traced to its source.
Every status will be justified by evidence.
Every gap will be documented.
Every upgrade will require external verification.

**Governance tells us how to interpret reality; evidence tells us what reality is.**

This is the only defensible approach.

---

**Signed:** Gordon  
**Date:** 2025-01-01  
**Classification:** BINDING  
**Authority:** Melodiespark Evidence Governance + Truth Protocol
