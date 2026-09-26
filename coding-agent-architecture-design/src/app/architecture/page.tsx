export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/PageHeader";

const DIRECTORY_TREE = `melodiespark-agent/
│
├── cli/
│   ├── commands/
│   │   ├── init         → scaffold .agent/ config directory
│   │   ├── run          → execute agent task
│   │   ├── chat         → interactive chat loop
│   │   ├── models       → list model registry
│   │   ├── providers    → provider status
│   │   ├── agents       → active agent sessions
│   │   ├── tools        → tool registry
│   │   ├── session      → session management
│   │   ├── diff         → show file changes
│   │   ├── test         → run verification suite
│   │   └── doctor       → runtime health check
│   └── main             → entry point
│
├── core/
│   ├── AgentRuntime     → top-level orchestrator
│   ├── AgentLoop        → plan → execute → verify loop
│   ├── Planner          → task decomposition
│   ├── ContextManager   → token budget + memory
│   ├── Memory           → session + cross-session memory
│   ├── TaskManager      → step tracking
│   ├── PermissionManager→ policy enforcement
│   ├── ApprovalManager  → human-in-the-loop
│   └── SessionManager   → session lifecycle
│
├── providers/
│   ├── openrouter/      → unified gateway adapter
│   ├── openai/          → direct OpenAI adapter
│   ├── anthropic/       → Claude adapter
│   ├── google/          → Gemini adapter
│   ├── mistral/         → Mistral adapter
│   └── generic-openai/  → any OpenAI-compatible API
│
├── models/
│   ├── registry         → model database + metadata
│   ├── capabilities     → tool/vision/context flags
│   ├── pricing          → cost tracking per token
│   └── routing          → select model for task type
│
├── tools/
│   ├── filesystem       → read/write/patch files
│   ├── shell            → sandboxed command execution
│   ├── git              → clone/diff/commit
│   ├── search           → semantic + keyword search
│   ├── terminal         → interactive terminal
│   ├── diagnostics      → lint/typecheck/build errors
│   ├── patch            → unified diff engine
│   └── browser          → headless browser (optional)
│
├── sandbox/
│   ├── execution        → process isolation
│   ├── filesystem       → chroot / path restrictions
│   ├── network          → outbound policy
│   └── resource-limits  → CPU/memory/time limits
│
├── verification/
│   ├── tests            → test runner integration
│   ├── lint             → ESLint/Pylint
│   ├── typecheck        → TypeScript/mypy
│   ├── build            → build system integration
│   └── regression       → before/after comparison
│
└── audit/
    ├── events           → structured event stream
    ├── tool-calls       → per-call audit records
    ├── model-calls      → LLM request/response logs
    └── sessions         → session-level summaries`;

const AGENT_CONTRACT = `Agent
 ├── understand(task)       → parse requirements, extract constraints
 ├── inspect(repository)    → walk files, read context, map deps
 ├── plan()                 → generate ordered steps with tool assignments
 ├── execute()              → run steps via tool calls
 ├── modify_files()         → write/patch/delete via filesystem tool
 ├── run_tests()            → invoke runner via shell tool
 ├── diagnose()             → parse errors, lint, type failures
 ├── repair()               → re-plan and re-execute on failure
 ├── verify()               → re-run tests + lint + typecheck + build
 └── report()               → emit diff + summary + audit events`;

const ROUTING_DIAGRAM = `                    TASK
                     │
              ┌──────▼──────┐
              │ Orchestrator│
              └──────┬──────┘
                     │
       ┌─────────────┼──────────────┐
       ▼             ▼              ▼
   Architect       Coder          Tester
       │             │              │
    Model A        Model B        Model C
       └─────────────┼──────────────┘
                     ▼
                  Verifier`;

const EXECUTION_FLOW = `USER TASK
   ↓
PLAN
   ↓
REPOSITORY INSPECTION
   ↓
MODEL REQUEST
   ↓
TOOL CALL
   ↓
FILESYSTEM / SHELL / GIT
   ↓
TEST
   ↓
FAIL?
 ┌─┴─┐
YES  NO
 │    │
REPAIR │
 │    │
 └────┘
   ↓
VERIFY
   ↓
DIFF
   ↓
FINAL REPORT`;

const PROVIDER_DIAGRAM = `                  ┌──────────────────────┐
                  │    Agent Runtime     │
                  └──────────┬───────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     OpenRouter           OpenAI             Local
          │                  │                  │
    ┌─────┴─────┐       GPT models       Ollama/etc.
    │           │
 GPT-4 Turbo  Mistral
 GPT-3.5      Auto
 MythoMax     ...`;

export default function ArchitecturePage() {
  return (
    <div>
      <PageHeader
        title="Architecture"
        subtitle="Provider-neutral coding-agent CLI runtime — full system design"
        breadcrumb="melodiespark-agent architecture"
      />

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Directory tree */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Project Structure
          </h2>
          <div className="bg-[#0d1117] rounded-lg p-4 overflow-auto max-h-[500px]">
            <pre className="font-mono text-[10px] text-slate-400 whitespace-pre leading-5">
              {DIRECTORY_TREE}
            </pre>
          </div>
        </div>

        <div className="space-y-4">
          {/* Execution flow */}
          <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">
              Execution Flow
            </h2>
            <div className="bg-[#0d1117] rounded-lg p-4">
              <pre className="font-mono text-[10px] text-slate-400 whitespace-pre leading-5">
                {EXECUTION_FLOW}
              </pre>
            </div>
          </div>

          {/* Provider diagram */}
          <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-white mb-3">
              Provider Layer
            </h2>
            <div className="bg-[#0d1117] rounded-lg p-4">
              <pre className="font-mono text-[10px] text-slate-400 whitespace-pre leading-5">
                {PROVIDER_DIAGRAM}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Agent contract */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Agent Contract
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Every model implements this interface. The model becomes a
            replaceable component.
          </p>
          <div className="bg-[#0d1117] rounded-lg p-4">
            <pre className="font-mono text-[10px] text-slate-400 whitespace-pre leading-5">
              {AGENT_CONTRACT}
            </pre>
          </div>
        </div>

        {/* Multi-agent routing */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Multi-Agent Orchestration
          </h2>
          <p className="text-xs text-slate-500 mb-3">
            Phase 5 — parallel specialized agents coordinated by an
            orchestrator.
          </p>
          <div className="bg-[#0d1117] rounded-lg p-4">
            <pre className="font-mono text-[10px] text-slate-400 whitespace-pre leading-5">
              {ROUTING_DIAGRAM}
            </pre>
          </div>
        </div>
      </div>

      {/* CLI commands */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-semibold text-white mb-4">
          CLI Commands
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              cmd: "melodiespark-agent init",
              desc: "Scaffold .agent/ config directory with config.yaml, models.yaml, permissions.yaml, policies.yaml",
            },
            {
              cmd: "melodiespark-agent doctor",
              desc: "Run all runtime probes. PASS is only emitted after the operation actually executes successfully.",
            },
            {
              cmd: "melodiespark-agent models",
              desc: "List model registry with status, provider, context window, capabilities, and last probe result.",
            },
            {
              cmd: "melodiespark-agent providers",
              desc: "Show all configured providers and their reachability status.",
            },
            {
              cmd: 'melodiespark-agent run "task"',
              desc: "Execute an agent task. Runs: plan → inspect → model → tools → test → verify → diff → report.",
            },
            {
              cmd: "melodiespark-agent run --model openrouter/auto",
              desc: "Use dynamic model routing — OpenRouter selects the best available model for the task.",
            },
            {
              cmd: "melodiespark-agent run --role architect",
              desc: "Assign a specific role to the agent: architect, coder, tester, verifier, or orchestrator.",
            },
            {
              cmd: "melodiespark-agent diff",
              desc: "Show filesystem changes produced by the last session.",
            },
            {
              cmd: "melodiespark-agent test",
              desc: "Re-run the verification suite against current codebase state.",
            },
            {
              cmd: "melodiespark-agent session",
              desc: "List, resume, or abort agent sessions. Sessions are persisted to the database.",
            },
          ].map(({ cmd, desc }) => (
            <div
              key={cmd}
              className="p-3 bg-[#0d1117] rounded-lg border border-white/5"
            >
              <p className="font-mono text-xs text-violet-400 mb-1.5">
                $ {cmd}
              </p>
              <p className="text-xs text-slate-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* .agent/ init output */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">
          init output → .agent/
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs text-slate-400">
            <pre>{`.agent/
├── config.yaml
├── models.yaml
├── permissions.yaml
├── policies.yaml
├── sessions/
│   └── <session-id>.json
├── logs/
│   └── audit.jsonl
└── memory/
    └── context.json`}</pre>
          </div>
          <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs text-slate-400">
            <pre>{`# config.yaml
runtime:
  version: "0.1.0"
  phase: 1

provider:
  default: openrouter
  model: openai/gpt-4-turbo

agent:
  role: coder
  max_iterations: 10
  repair_attempts: 3

sandbox:
  enabled: true
  timeout: 120

audit:
  enabled: true
  level: verbose`}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
