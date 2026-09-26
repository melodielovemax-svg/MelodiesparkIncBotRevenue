# Melodie CLI Agent Platform - Agent Registry & Execution

## 1. Functional Profiles & Namespaces

Agents are configured as structured profiles in `agents/registry.json`.

### 1.1 Core Functional Profiles
- `coder`: Synthesizes code edits, inspects repos, and builds patches.
- `tester`: Executes test suites and asserts non-regression.
- `security`: Validates sandbox boundaries and secret leak defenses.
- `forensic`: Inspects execution traces, cryptographic hashes, and provenance.
- `research`: Surveys documentation and API specifications.
- `documentation`: Maintains architecture runbooks and specifications.
- `product`: Manages requirements and roadmaps.
- `compliance`: Enforces Truth Protocol and licensing constraints.
- `deployment`: Evaluates deployment readiness and gate enforcement.

### 1.2 Namespace Profiles
Specialized profiles include:
`Benzen`, `Tamtek`, `Bitsum`, `Gate`, `Power`, `Pro_Power_Shield`, `Pro_C`, `Top`, `Exodius`, `BitTheme`, `GrapsFlix`, `Otamzen`, `LLM`, `Caguran`, `IWHYPROGATOGATE`, `AZURIX`, `CLI-BOT`, `Revenue-Automation`, `CARSESKI`, `Phoenix_Blake`, `HYDRA`, `BLAZE`, `WATSON`, `WHATSON`, `WHATZONE`, `SHERLOCK_LOCK_HOLMES`, `HOMES_DEDUCTION`, `ARLOCKTWINS`.

Initial profile state:
- `engineering_state: SCAFFOLD`
- `runtime_state: UNVERIFIED`

---

## 2. 80,000 Logical Agent Architecture

```text
80,000 logical agent definitions
             ↓
        Agent Registry
             ↓
       Task Scheduler
             ↓
           Queue
             ↓
     Worker Pool (e.g. 32)
             ↓
          Sandbox
             ↓
         Execution
```

Logical addressability is separated from OS process allocation:
- Agents `AGENT-000001` through `AGENT-080000` represent addressable logical entities with specific system prompts and roles.
- Execution is serialized through a bounded physical worker pool (default 32 worker slots) preventing thread and socket exhaustion.

---

## 3. Governed Coding Pipeline

```text
USER
 │
 ▼
TASK
 │
 ▼
PLAN
 │
 ▼
DECOMPOSE
 │ ├── inspect repository
 │ ├── inspect dependencies
 │ ├── identify files
 │ ├── formulate changes
 │ └── define tests
 │
 ▼
PROPOSE PATCH
 │
 ▼
POLICY CHECK
 │
 ▼
SANDBOX
 │
 ▼
EDIT
 │
 ▼
TEST
 │
 ▼
VERIFY
 │ ├── PASS → evidence
 │ └── FAIL → diagnose → repair → retest
 │
 ▼
HUMAN REVIEW
 │
 ▼
COMMIT/PACKAGE
```
