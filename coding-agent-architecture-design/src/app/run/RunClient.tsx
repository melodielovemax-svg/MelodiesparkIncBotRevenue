"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  PlayCircle,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Clock,
  Cpu,
  Wrench,
} from "lucide-react";

interface Model {
  id: string;
  modelId: string;
  displayName: string;
  role: string | null;
  status: string;
}

interface RunClientProps {
  models: Model[];
}

type AgentRole =
  | "architect"
  | "coder"
  | "tester"
  | "verifier"
  | "orchestrator"
  | "general";

interface RunResult {
  success: boolean;
  sessionId?: string;
  model?: string;
  role?: string;
  eventsCreated?: number;
  error?: string;
}

const EXAMPLE_TASKS = [
  "Implement JWT authentication with refresh tokens and run the tests",
  "Refactor the database access layer to use the repository pattern",
  "Add rate limiting middleware to all API endpoints",
  "Design and implement a caching layer with Redis",
  "Analyze the codebase and identify performance bottlenecks",
];

const ROLES: { value: AgentRole; label: string; desc: string }[] = [
  { value: "general", label: "General", desc: "All-purpose agent" },
  { value: "architect", label: "Architect", desc: "Design & structure" },
  { value: "coder", label: "Coder", desc: "Implementation" },
  { value: "tester", label: "Tester", desc: "Testing & QA" },
  { value: "verifier", label: "Verifier", desc: "Verification" },
  { value: "orchestrator", label: "Orchestrator", desc: "Multi-agent" },
];

export function RunClient({ models }: RunClientProps) {
  const [task, setTask] = useState("");
  const [selectedModel, setSelectedModel] = useState(
    models[0]?.modelId ?? "openai/gpt-4-turbo"
  );
  const [role, setRole] = useState<AgentRole>("coder");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  async function handleRun() {
    if (!task.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task, modelId: selectedModel, role }),
      });
      const data: RunResult = await res.json();
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Task input */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 mb-4">
        <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">
          Task Description
        </label>
        <textarea
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder='e.g. "Implement authentication and run the tests"'
          className="w-full bg-[#0d1117] border border-white/5 rounded-lg px-4 py-3 text-sm text-white placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/50 font-mono"
          rows={4}
        />
        <div className="mt-2">
          <p className="text-[10px] font-mono text-slate-600 mb-1.5">
            Examples:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {EXAMPLE_TASKS.map((ex) => (
              <button
                key={ex}
                onClick={() => setTask(ex)}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300 bg-white/5 hover:bg-white/10 px-2 py-1 rounded transition-colors"
              >
                {ex.slice(0, 50)}...
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Model selection */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-4">
          <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
            Model
          </label>
          <div className="space-y-1.5">
            {models.map((m) => (
              <button
                key={m.modelId}
                onClick={() => setSelectedModel(m.modelId)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedModel === m.modelId
                    ? "bg-violet-500/15 border border-violet-500/30"
                    : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                }`}
              >
                <Cpu size={12} className="text-slate-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-white truncate">
                    {m.modelId}
                  </p>
                  <p className="text-[10px] text-slate-500">{m.displayName}</p>
                </div>
                <StatusBadge status={m.status} size="sm" />
              </button>
            ))}
            {models.length === 0 && (
              <p className="text-xs text-slate-600 font-mono">
                No operational models. Seed the database first.
              </p>
            )}
          </div>
        </div>

        {/* Role + Options */}
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-white/5 rounded-xl p-4">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              Agent Role
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`px-3 py-2 rounded-lg text-left transition-colors ${
                    role === r.value
                      ? "bg-violet-500/15 border border-violet-500/30"
                      : "bg-white/[0.02] border border-white/5 hover:border-white/10"
                  }`}
                >
                  <p className="text-xs font-mono text-white">{r.label}</p>
                  <p className="text-[10px] text-slate-500">{r.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions preview */}
          <div className="bg-[#161b22] border border-white/5 rounded-xl p-4">
            <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">
              Active Permissions
            </label>
            <div className="space-y-1.5 font-mono text-xs">
              {[
                { k: "filesystem.read", v: true },
                { k: "filesystem.write", v: true },
                { k: "shell.enabled", v: true },
                { k: "shell.timeout", v: "120s" },
                { k: "git.commit", v: false },
                { k: "git.push", v: false },
                { k: "network", v: false },
                { k: "destructive", v: false },
              ].map(({ k, v }) => (
                <div key={k} className="flex items-center justify-between">
                  <span className="text-slate-500">{k}</span>
                  <span
                    className={
                      v === true
                        ? "text-emerald-400"
                        : v === false
                          ? "text-red-400"
                          : "text-amber-400"
                    }
                  >
                    {String(v)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Run button */}
      <button
        onClick={handleRun}
        disabled={loading || !task.trim()}
        className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-6 py-3 rounded-xl transition-colors font-semibold"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Executing agent loop...
          </>
        ) : (
          <>
            <PlayCircle size={16} />
            Run Task
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div
          className={`mt-4 p-5 rounded-xl border ${
            result.success
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-red-500/5 border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2 mb-3">
            {result.success ? (
              <CheckCircle2 size={16} className="text-emerald-400" />
            ) : (
              <AlertCircle size={16} className="text-red-400" />
            )}
            <span
              className={`text-sm font-semibold ${result.success ? "text-emerald-400" : "text-red-400"}`}
            >
              {result.success ? "Task completed" : "Task failed"}
            </span>
          </div>

          {result.success && (
            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="flex items-center gap-2">
                <Terminal size={11} className="text-slate-500" />
                <span className="text-slate-500">Session:</span>
                <span className="text-slate-300 truncate">
                  {result.sessionId?.slice(0, 16)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Cpu size={11} className="text-slate-500" />
                <span className="text-slate-500">Model:</span>
                <span className="text-violet-400">{result.model}</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench size={11} className="text-slate-500" />
                <span className="text-slate-500">Events:</span>
                <span className="text-slate-300">{result.eventsCreated}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={11} className="text-slate-500" />
                <span className="text-slate-500">Role:</span>
                <span className="text-slate-300">{result.role}</span>
              </div>
            </div>
          )}

          {result.error && (
            <p className="text-xs font-mono text-red-400 mt-1">
              {result.error}
            </p>
          )}

          {result.success && result.sessionId && (
            <a
              href={`/audit?sessionId=${result.sessionId}`}
              className="mt-3 inline-flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300"
            >
              View audit log →
            </a>
          )}
        </div>
      )}

      {/* CLI equivalent */}
      <div className="mt-6 bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">
          CLI Equivalent
        </h2>
        <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs text-slate-400">
          <div className="text-violet-400">$ melodiespark-agent run \</div>
          <div className="pl-4 text-slate-400">
            --model{" "}
            <span className="text-amber-400">{selectedModel}</span> \
          </div>
          <div className="pl-4 text-slate-400">
            --role <span className="text-cyan-400">{role}</span> \
          </div>
          <div className="pl-4">
            <span className="text-emerald-400">
              &quot;{task || "<describe your task>"}&quot;
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
