# CLI Extension Documentation

## Overview

The Melodiespark Command Center CLI has been extended with new commands that provide controlled orchestration capabilities while maintaining strict security boundaries. These commands integrate with the existing SafeWorkflowEngine and follow the project's compliance requirements.

## New CLI Commands

### PowerShell Commands

All commands are executed via the QuantumMatrix.ps1 wrapper:

```powershell
# Navigate to the melodiespark directory
cd C:\melodie\melodiespark

# Execute commands using PowerShell 7+
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action <Command>
```

#### Available Commands

1. **ProductSync** - Synchronize product drafts
   ```powershell
   pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action ProductSync
   ```
   - Lists current product catalog
   - Reports draft vs published counts
   - Creates audit trail
   - **No automatic publishing** - manual review required

2. **WalletVerify** - Wallet verification instructions
   ```powershell
   pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action WalletVerify
   ```
   - Provides EIP-191 challenge generation instructions
   - Directs users to web interface for actual verification
   - No private key storage or exposure
   - **Read-only operation**

3. **TaskRun** - Execute specific workflow tasks
   ```powershell
   pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action TaskRun -TaskId <taskId>
   ```
   - Valid task IDs: `health`, `data-integrity`, `integration-status`, `security-config`, `catalog-integrity`
   - Executes single predefined task from SafeWorkflowEngine
   - Creates audit trail for each execution
   - **Bounded execution with timeout**

4. **RevReport** - Revenue reconciliation report
   ```powershell
   pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action RevReport
   ```
   - Generates financial reconciliation report
   - Shows integration status (Stripe, Shopify)
   - Excludes demo data by default
   - **Report only - no fund movements**

### NPM Commands

Alternative access via npm scripts:

```bash
cd C:\melodie\apps\command-center

npm run cli:sync      # Product sync
npm run cli:verify    # Wallet verification instructions  
npm run cli:task      # Task execution (requires argument)
npm run cli:report    # Revenue report
```

## Security & Compliance

### Human-in-the-Loop
- All commands require manual execution
- No automatic scheduling or triggers
- Explicit user intent required for each action

### No Private Keys
- Wallet operations use EIP-191 signature verification only
- No private key storage in application
- Challenges are one-time and expiring

### No Automatic Payouts
- Revenue reports are informational only
- No automatic fund transfers
- Withdrawal requires separate manual authorization flow

### Bounded Execution
- Task execution has configurable timeout (1-300 seconds)
- No infinite loops or unbounded processes
- Process recovery and cleanup on failure

### Audit Trail
- All commands create audit log entries
- Actor, action, resource, and outcome logged
- Timestamps and details preserved

## Integration with Existing Architecture

### SafeWorkflowEngine Integration
- TaskRun command uses existing workflow engine
- Leverages current task definitions
- Maintains Guardian assignment patterns

### Database Integration
- All commands use existing Repository class
- Follows current schema and migrations
- Maintains data integrity constraints

### Configuration Integration
- Uses existing config system
- Respects environment variables
- Follows production/development modes

## Examples

### Product Management Workflow
```powershell
# 1. Check current product status
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action ProductSync

# 2. Review products in web interface
# 3. Manually approve/publish via dashboard
```

### System Health Check
```powershell
# Run individual health validation
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action TaskRun -TaskId health

# Check data integrity
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action TaskRun -TaskId data-integrity

# Verify security configuration
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action TaskRun -TaskId security-config
```

### Revenue Reconciliation
```powershell
# Generate reconciliation report
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action RevReport

# Review integration status
pwsh -ExecutionPolicy Bypass -File ".\automation\powershell\QuantumMatrix.ps1" -Action TaskRun -TaskId integration-status
```

## Troubleshooting

### PowerShell Version
- Requires PowerShell 7.0+
- Use `pwsh` command instead of `powershell`
- Check version: `pwsh --version`

### Command Center Location
- Script automatically detects Command Center location
- Supports multiple path configurations
- Falls back to legacy path if needed

### Node.js Requirements
- Requires Node.js 22.5+
- Checked automatically before execution
- Error message if version mismatch

### Database Access
- Requires SQLite database to exist
- Created automatically on first run
- Check permissions if access errors occur

## Regression Verification

Run `npm run test:regression` from `apps/command-center` to verify the required
application test cases and smoke-test the bounded `run-safe-cycle.mjs`
commands. The CLI checks use a temporary SQLite database and remove it when
the run completes. The recorded 18-test minimum is a regression floor; new
tests may be added without updating it.

Passing these checks verifies only the listed application tests and CLI command
paths. It does not establish the operational status of other CLI packages,
integrations, production deployments, or game runtimes.

## Future Extensions

The CLI extension is designed to support additional commands while maintaining security boundaries:

- Additional task types for workflow engine
- Enhanced reporting capabilities
- Integration testing commands
- Configuration management tools

All future extensions will follow the same security principles:
- Human-in-the-loop execution
- No automatic financial actions
- Full audit trail
- Bounded execution with timeouts