# Fresh Install Reproducibility Validation

## Purpose

This validation gate ensures that Melodiespark can be bootstrapped from a clean environment with no existing files, dependencies, or configuration. This provides the strongest evidence foundation before testing external integrations or cross-platform behavior.

## Validation Conditions

**Promotion Condition:**
```
clean environment
      ↓
bootstrap succeeds
      ↓
18/18 application tests
      +
6/6 CLI tests
      ↓
runtime verification
      ↓
REPRODUCIBLE / OPERATIONAL evidence
```

## Prerequisites

- **Node.js:** >= 22.5 (tested on Node 24)
- **npm:** Available via Node.js installation
- **Platform:** Windows (Linux/macOS validation pending)
- **Disk Space:** ~500MB for dependencies and database

## Clean Environment Definition

A clean environment must NOT contain:
- `.env` file
- `node_modules/` directory
- `data/` directory
- `db/` directory
- `reports/` directory
- Any generated or cached files from previous installations

## Official Bootstrap Procedure

### Step 1: Environment Setup

From a clean directory containing only the source code:

```powershell
# Navigate to project directory
cd C:\path\to\melodiespark\apps\command-center

# Verify clean environment
# Should show: .env not found, node_modules not found, etc.
```

### Step 2: Install Dependencies

```powershell
npm install
```

**Expected Result:**
- Exit code: 0
- `node_modules/` directory created
- `package-lock.json` generated/updated
- Single dependency `viem@^2.33.0` installed

### Step 3: Initialize Environment

```powershell
node scripts/initialize.mjs
```

**Expected Result:**
- Exit code: 0
- `.env` file created with random session secrets
- `data/` directory created
- `db/` directory created
- SQLite database initialized
- 600 guardian profiles generated
- Output: "Initialized SQLite database at [path]"
- Output: "Guardian configurations: 600"

### Step 4: Set Admin Password

```powershell
node scripts/set-password.mjs
```

**Expected Result:**
- Prompts for 12+ character password
- Password hash stored in `.env`
- Exit code: 0

### Step 5: Run Application Tests

```powershell
npm test
```

**Expected Result:**
- Exit code: 0
- 18/18 tests passing
- Test duration: ~40 seconds
- Required tests passing:
  - health, configuration, and demo dashboard are operational
  - admin authentication, CSRF, safe workflow, and draft creation work end to end
  - state-changing endpoints reject missing CSRF tokens
  - game telemetry ingestion and karma rewards function properly
  - execution is durable, idempotent, and awards Karma through the ledger API
  - rejects expired authorization and supports cancellation before execution
  - propagates runner failure and timeout without leaking runner errors
  - execution API enforces session, CSRF, ownership, and pagination
  - concurrent submissions and runner claims execute one intent once
  - recovery fails interrupted running executions and resumes queued work deterministically
  - cancellation racing with the runner prevents terminal success
  - production configuration fails closed and readiness exposes only operational state
  - database state survives close, backup, restore, and migration initialization
  - shutdown closes execution admission before draining active work
  - password hashes verify without storing plaintext
  - withdrawal intent canonicalization is deterministic and amount-bound
  - atomic ETH conversion rejects invalid or imprecise values
  - constant-time text comparison handles unequal lengths

### Step 6: Run CLI Smoke Tests

```powershell
node scripts/check-regression-baseline.mjs
```

**Expected Result:**
- Exit code: 0
- 6/6 CLI smoke tests passing:
  - Legacy one-cycle workflow
  - Explicit one-cycle workflow
  - ProductSync
  - WalletVerify instructions
  - TaskRun health
  - RevReport

## Automated Validation Script

The `scripts/validate-fresh-install.mjs` script automates this validation but requires a truly clean environment to succeed.

**To run:**
```powershell
node scripts/validate-fresh-install.mjs
```

**Current Status:** The script will fail in the current development environment due to existing contamination (`.env`, `node_modules`, etc.). This is expected behavior.

## Manual Validation Procedure

Since the current environment is contaminated, manual validation requires:

### Option 1: Clean Directory Clone

```powershell
# Create a new clean directory
mkdir C:\melodie-test-fresh
cd C:\melodie-test-fresh

# Clone or copy source files only (excluding .env, node_modules, data, db, reports)
# Use PowerShell script or manual copy

# Then run the bootstrap procedure
```

### Option 2: Temporary Cleanup (Not Recommended for Validation)

```powershell
# WARNING: This destroys existing data
# Only use if you want to sacrifice current environment

Remove-Item .env -ErrorAction SilentlyContinue
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item data -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item db -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item reports -Recurse -Force -ErrorAction SilentlyContinue

# Then run bootstrap procedure
```

## Evidence Requirements

### For REPRODUCIBLE Status

1. **Clean Environment Evidence:**
   - No pre-existing `.env`, `node_modules`, `data`, `db`, `reports`
   - Fresh source code only

2. **Bootstrap Evidence:**
   - `npm install` succeeds
   - `node scripts/initialize.mjs` succeeds
   - `.env` created with proper structure
   - Database initialized with 600 guardians

3. **Runtime Evidence:**
   - 18/18 application tests passing
   - 6/6 CLI smoke tests passing
   - No manual intervention required

4. **Version Evidence:**
   - Node.js version recorded
   - npm version recorded
   - Platform and architecture recorded
   - Working directory recorded

## Validation Report Structure

Successful validation generates `tests/fresh-install-report.json`:

```json
{
  "timestamp": "2026-09-26T...",
  "validation_type": "FRESH_INSTALL_REPRODUCIBILITY",
  "environment": {
    "nodeVersion": "v24.19.0",
    "npmVersion": "11.17.0",
    "platform": "win32",
    "architecture": "x64"
  },
  "prerequisites": {
    "checks": [...],
    "contamination": [],
    "clean_environment": true
  },
  "bootstrap_process": [...],
  "regression_validation": [...],
  "summary": {
    "overall_status": "REPRODUCIBLE"
  }
}
```

## Known Limitations

1. **Platform Specific:** Current validation is Windows-only
2. **Network Dependent:** Requires internet for `npm install`
3. **Time Dependent:** Full validation takes ~2-3 minutes
4. **Destructive:** True clean environment requires removing existing files

## Next Validation Gates

After fresh-install reproducibility is confirmed:

1. **Cross-Platform Runtime:** Linux/macOS validation
2. **External Integrations:** Real payment provider, wallet connection
3. **Failure/Recovery:** Interrupted execution, error handling
4. **Concurrency:** Parallel execution testing
5. **Production Artifact:** Distribution package testing

## Governance Rule

**Do not promote a capability merely because the test exists.**

Use:
```
IMPLEMENTED
    ↓
TESTED
    ↓
RUNTIME VERIFIED
    ↓
STATUS UPDATED
```

And preserve:
- Not tested → UNVERIFIED
- Test fails → BLOCKED / FAILED
- Tests pass only → demonstrated operational path
- Real business evidence → business claim permitted

## Current Status

**Fresh Install Reproducibility:** UNVERIFIED

**Reason:** Current development environment is contaminated. Validation requires a truly clean environment or separate validation directory.

**Evidence Required:**
- Clean environment bootstrap
- Complete regression baseline
- Runtime verification
- No manual intervention

---

*This validation gate provides the foundation for all subsequent operational claims.*