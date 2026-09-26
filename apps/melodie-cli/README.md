# @melodiespark/cli — Melodie CLI Agent Platform & Content Catalog

Evidence-first governed coding-agent platform, AI model router, and content catalog for Melodiespark.

```bash
npm install -g @melodiespark/cli     # or: pnpm add -g @melodiespark/cli
npx @melodiespark/cli                # zero-install execution
```

Python frontend, same catalog, same templates, same policy:

```bash
pip install melodiespark-cli          # or: pipx install melodiespark-cli
```

---

## The Core Rule

> **CATALOG ENTRY ≠ CONNECTED PROVIDER ≠ SUCCESSFUL INFERENCE ≠ PRODUCTION READY**

The presence of a model in the registry, a configured agent profile, a seeded template, or an indexed file does not imply that live inference, autonomous shell access, external credentials, or deployment are connected.

---

## Command Surface

### 1. Platform & Diagnostics
```bash
melodie doctor                  # Runtime, environment, sandbox boundary & provider health
melodie status                  # Capability status and Melodie CLI platform dashboard
melodie verify                  # Catalog integrity, policy assertions, secret scans
melodie audit [query]           # Inspect immutable cryptographic audit event log
```

### 2. Models & Providers
```bash
melodie models                  # List models registered in dynamic catalog
melodie models sync             # Dynamically sync model catalog from OpenRouter API
melodie models search <query>   # Search models by name, family, provider, or capability
melodie models inspect <model>  # Detailed context window, pricing, and modal capabilities
melodie models test <model>     # Execute inference probe (local mock or configured provider)

melodie provider list           # List registered model gateway adapters & credential states
melodie provider verify <name>  # Health-check provider connectivity
melodie provider add <name>     # Register custom adapter
melodie provider remove <name>  # Unregister adapter
```

### 3. Project Engine (Builder Studio)
```bash
melodie project create <name>   # Initialize project scaffold
melodie project inspect [dir]   # Inspect directory structure
melodie project analyze [dir]   # Deep repository analysis (languages, tests, security)
melodie project plan [dir]      # Synthesize architecture proposal & task roadmap
melodie project build [dir]     # Build project artifacts in sandbox
melodie project test [dir]      # Run project test suite
melodie project package [dir]   # Package project for distribution
```

### 4. Coding-Agent Engine
```bash
melodie agent list              # List registered agent profiles (80,000 logical capacity)
melodie agent create <name>     # Register custom agent profile
melodie agent plan <task>       # Decompose coding task into architectural steps
melodie agent code <task>       # Synthesize code patch proposal
melodie agent review <target>   # Review patch or file for security and style
melodie agent test              # Run tests through sandbox policy
melodie agent security          # Inspect sandbox boundaries and active policies
melodie agent execute <task_id> # Governed agent execution (--i-approve-execution required)
```

### 5. Workflows & Orchestration
```bash
melodie workflow run <task>     # Execute Quantum Fractal Matrix (7-Node Pipeline)
melodie workflow history        # Inspect past workflow execution traces
melodie workflow pause/resume/cancel
```

### 6. Evidence & Sandbox
```bash
melodie evidence list           # List cryptographic evidence records
melodie evidence verify <id>    # Verify SHA-256 integrity of evidence record
melodie evidence export         # Export evidence registry as JSON

melodie sandbox inspect         # Inspect sandbox confinement and resource limits
melodie sandbox permissions     # Display active permissions
melodie sandbox reset           # Reset sandbox execution workspace
```

### 7. Deployment Gating
```bash
melodie deployment plan         # Evaluate deployment readiness and gating checks
melodie deployment verify       # Verify target cloud provider environment
melodie deployment release      # Attempt release (gated by default; requires approval)
```

### 8. Content Catalog & Extraction (Legacy Compatibility)
```bash
melodie catalog                 # Summarize catalog (--build to re-hash tree)
melodie inspect <path…>         # Query catalog metadata (never prints file contents)
melodie extract <path…>         # Copy content. Deny by default. Audited.
melodie template [name]         # List and describe scaffolding templates
melodie init <dir> -t <name>    # Scaffold a project from template
```

---

## Governed Agent Execution

No `melodie agent execute` command has unrestricted shell access. Every execution passes through:
- **Filesystem Scoping**: Confined to designated project workspace.
- **Command Allowlist**: Only pre-approved executables (`git`, `npm`, `tsc`, `node`, `python`).
- **Dangerous Pattern Blocking**: Shell metacharacters (`;`, `&`, `|`, `` ` ``, `$`) and destructive commands (`rmdir /s`, `format`) are denied.
- **Secret Isolation**: Child processes are scrubbed of API keys.
- **Human Approval Gate**: Mutations require explicit operator authorization (`--i-approve-execution`).

---

## 80,000 Logical Agent Architecture

Melodie separates logical agent addressability from physical process concurrency:
- **80,000 Logical Definitions**: Profiles and specialized coordinates (`AGENT-000001` through `AGENT-080000`).
- **Physical Worker Pool**: Bounded concurrent execution slots (default 32 worker slots) preventing thread, memory, or socket exhaustion.

---

## 1,010-Task Manifest & Quantum Fractal Matrix

Authoritative engineering tasks are loaded from `tasks/PROJECT_MANIFEST.json` across 14 categories with verified dependency graphs.

The **Quantum Fractal Matrix** implements a 7-node sequential durable pipeline:
`ALPHA -> BETA -> THETA -> DELTA -> BRAVO -> GAMMA -> OMEGA`
Where each node executes the cycle:
`INPUT -> PLAN -> DECOMPOSE -> EXECUTE -> TEST -> VERIFY -> RECORD -> NEXT`.

---

## Development & Test Suite

```bash
npm run build          # tsc -> dist/
npm test               # 43 tests: policy, parity, models, providers, sandbox, agents, tasks, CLI
node bin/melodie.mjs doctor
node bin/melodie.mjs status
```
