# Melodie CLI Agent Platform Architecture

## 1. Overview & Core Philosophy

The Melodie CLI Agent Platform is an evidence-first, governed coding-agent environment. It integrates dynamic model catalogs, multi-provider gateways, task dependency scheduling, and sandboxed agent execution while enforcing strict boundaries between catalog records, connected credentials, live inference, and verified production status.

```text
                         MELODIEOS
                            │
                    MELODIE CLI PLATFORM
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
   MODEL GATEWAY       AGENT ENGINE        PROJECT ENGINE
        │                   │                   │
   OpenRouter          Planner             Inspect
   OpenAI              Coder               Analyze
   Anthropic           Tester              Build
   Google              Reviewer            Test
   Ollama              Security            Package
   Local Engine        Research            Deploy*
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    POLICY / SANDBOX
                            │
                 ┌──────────┼──────────┐
                 │          │          │
             Filesystem   Commands   Network
                 │          │          │
                 └──────────┼──────────┘
                            │
                       VERIFICATION
                            │
                  TESTS → EVIDENCE → AUDIT
                            │
                      HUMAN APPROVAL
                            │
                         EXECUTE
```

`*` Deployment remains strictly gated until a verified deployment provider is configured and independently confirmed.

---

## 2. Invariants & Status Hierarchy

Status is strictly evidence-driven per `TRUTH_PROTOCOL.md`:

```text
CATALOG ENTRY
     ≠
CONNECTED PROVIDER
     ≠
SUCCESSFUL INFERENCE
     ≠
PRODUCTION READY
```

- **OPERATIONAL**: Implemented, tested, and actively verified at runtime.
- **SCAFFOLD**: Architectural structure exists in code; runtime path pending full live verification.
- **UNVERIFIED**: Documented or catalogued entry without active credential/runtime proof.
- **PLANNED / PAPER-ONLY**: Future milestone or design specification.
- **BLOCKED**: Deliberately disabled by security policy (e.g. autonomous fund transfers, unapproved deployment).
- **FICTIONAL**: Narrative lore elements clearly partitioned from engineering realities.

---

## 3. Subsystem Breakdown

### 3.1 Model Gateway & Dynamic Catalog Sync
- OpenRouter serves as the primary multi-model gateway (`https://openrouter.ai/api/v1`).
- `melodie models sync` dynamically synchronizes catalog metadata (context windows, pricing, modalities) rather than hard-coding static model lists.
- Supports Auto Router (`openrouter/auto`) and Pareto Code Router (`openrouter/flavor-pareto-code`).

### 3.2 Provider Architecture
All adapters implement `ProviderAdapter`:
- `listModels(): Promise<ModelEntry[]>`
- `healthCheck(): Promise<HealthCheckResult>`
- `chat(req: ChatRequest): Promise<ChatResponse>`
- `stream(req: ChatRequest): AsyncIterable<ChatChunk>`
- `estimateCost(model, inTokens, outTokens): CostEstimate`
- `getCapabilities(model?): ProviderCapabilities`

Credentials resolve exclusively from environment variables (`OPENROUTER_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GEMINI_API_KEY`). Never hardcoded, never committed.

### 3.3 Governed Coding-Agent Engine
The coding agent pipeline is bounded:
`TASK -> PLAN -> DECOMPOSE -> PROPOSE PATCH -> POLICY CHECK -> SANDBOX -> EDIT -> TEST -> VERIFY -> HUMAN REVIEW`

The agent is never given unrestricted shell access. Every execution passes through filesystem scoping, command allowlists, timeout constraints, output caps, and explicit human approval gates (`--i-approve-execution`).

### 3.4 80,000 Logical Agent Addressing
- Registry cleanly separates logical agent definitions from physical processes.
- 80,000 logical addressing slots map onto bounded queues and virtual worker pools (e.g., 32 physical slots), avoiding OS process exhaustion.

### 3.5 1,010-Task Manifest
Authoritative engineering tasks stored in `tasks/PROJECT_MANIFEST.json` across 14 categories:
`CLI`, `ARCHITECTURE`, `SECURITY`, `PROVIDERS`, `MODELS`, `ROUTER`, `AGENTS`, `SANDBOX`, `WORKFLOWS`, `EVIDENCE`, `AUDIT`, `DEPLOYMENT`, `TESTING`, `DOCUMENTATION`.

### 3.6 Quantum Fractal Matrix
Implemented as recursive workflow orchestration:
- Sequential Pipeline: `ALPHA -> BETA -> THETA -> DELTA -> BRAVO -> GAMMA -> OMEGA`.
- Durable Node Cycle: `INPUT -> PLAN -> DECOMPOSE -> EXECUTE -> TEST -> VERIFY -> RECORD -> NEXT`.
