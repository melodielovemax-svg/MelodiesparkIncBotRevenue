import "server-only";
import { db } from "@/db";
import { models, sessions, auditEvents, probeResults, providers } from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Cpu,
  Server,
  Terminal,
  ScrollText,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

async function getStats() {
  const [modelStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      operational: sql<number>`count(*) filter (where ${models.status} = 'OPERATIONAL')::int`,
      unverified: sql<number>`count(*) filter (where ${models.status} = 'UNVERIFIED')::int`,
    })
    .from(models);

  const [sessionStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      completed: sql<number>`count(*) filter (where ${sessions.status} = 'completed')::int`,
      failed: sql<number>`count(*) filter (where ${sessions.status} = 'failed')::int`,
      executing: sql<number>`count(*) filter (where ${sessions.status} = 'executing')::int`,
    })
    .from(sessions);

  const [auditStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      toolCalls: sql<number>`count(*) filter (where ${auditEvents.eventType} = 'tool_call')::int`,
    })
    .from(auditEvents);

  const [probeStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      passed: sql<number>`count(*) filter (where ${probeResults.status} = 'PASS')::int`,
    })
    .from(probeResults);

  const recentSessions = await db
    .select({
      id: sessions.id,
      taskDescription: sessions.taskDescription,
      status: sessions.status,
      role: sessions.role,
      durationMs: sessions.durationMs,
      startedAt: sessions.startedAt,
      modelDisplayName: models.displayName,
    })
    .from(sessions)
    .leftJoin(models, eq(sessions.modelId, models.id))
    .orderBy(desc(sessions.startedAt))
    .limit(4);

  const recentAudit = await db
    .select()
    .from(auditEvents)
    .orderBy(desc(auditEvents.createdAt))
    .limit(6);

  const allProviders = await db.select().from(providers);

  const statusBreakdown = await db
    .select({
      status: models.status,
      count: sql<number>`count(*)::int`,
    })
    .from(models)
    .groupBy(models.status);

  return {
    modelStats,
    sessionStats,
    auditStats,
    probeStats,
    recentSessions,
    recentAudit,
    allProviders,
    statusBreakdown,
  };
}

function TerminalBlock({ lines }: { lines: { text: string; color?: string }[] }) {
  return (
    <div className="bg-[#0d1117] rounded-lg border border-white/5 p-4 font-mono text-xs overflow-x-auto">
      {lines.map((line, i) => (
        <div key={i} className={`${line.color ?? "text-slate-400"} leading-6`}>
          {line.text}
        </div>
      ))}
    </div>
  );
}

export async function DashboardContent() {
  const {
    modelStats,
    sessionStats,
    auditStats,
    probeStats,
    recentSessions,
    recentAudit,
    allProviders,
    statusBreakdown,
  } = await getStats();

  const configuredProviders = allProviders.filter((p) => p.isConfigured).length;

  const statusOrder = ["OPERATIONAL", "SCAFFOLD", "PLANNED", "UNVERIFIED", "BLOCKED", "FICTIONAL"];
  const statusColors: Record<string, string> = {
    OPERATIONAL: "bg-emerald-500",
    SCAFFOLD: "bg-amber-500",
    PLANNED: "bg-blue-500",
    UNVERIFIED: "bg-slate-500",
    BLOCKED: "bg-red-500",
    FICTIONAL: "bg-purple-500",
  };

  return (
    <div>
      {/* Hero banner */}
      <div
        className="relative rounded-2xl overflow-hidden mb-8 border border-white/5"
        style={{
          backgroundImage: "url(/hero-bg.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0e14]/95 via-[#0a0e14]/80 to-transparent" />
        <div className="relative px-8 py-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-mono uppercase tracking-widest">
              Runtime Active · Phase 1
            </span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Melodiespark Agent Runtime
          </h1>
          <p className="text-slate-300 text-sm max-w-xl">
            Provider-neutral coding-agent CLI. Swap OpenRouter models without
            rewriting the agent runtime. Every integration is classified:{" "}
            <span className="text-emerald-400">Operational</span>,{" "}
            <span className="text-amber-400">Scaffold</span>,{" "}
            <span className="text-blue-400">Planned</span>, or{" "}
            <span className="text-slate-400">Unverified</span>.
          </p>
          <div className="flex items-center gap-3 mt-5">
            <Link
              href="/run"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
            >
              <Zap size={14} />
              Run Task
            </Link>
            <Link
              href="/doctor"
              className="flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Agent Doctor
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Models Registered"
          value={modelStats?.total ?? 0}
          sub={`${modelStats?.operational ?? 0} operational`}
          icon={<Cpu size={16} className="text-violet-400" />}
          color="violet"
        />
        <StatCard
          label="Sessions Run"
          value={sessionStats?.total ?? 0}
          sub={`${sessionStats?.completed ?? 0} completed · ${sessionStats?.failed ?? 0} failed`}
          icon={<Terminal size={16} className="text-amber-400" />}
          color="amber"
        />
        <StatCard
          label="Audit Events"
          value={auditStats?.total ?? 0}
          sub={`${auditStats?.toolCalls ?? 0} tool calls`}
          icon={<ScrollText size={16} className="text-blue-400" />}
          color="default"
        />
        <StatCard
          label="Probes Passed"
          value={
            probeStats?.total
              ? `${probeStats.passed}/${probeStats.total}`
              : "0/0"
          }
          sub="Runtime verification"
          icon={<CheckCircle2 size={16} className="text-emerald-400" />}
          color="emerald"
        />
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        {/* Model status breakdown */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Model Registry</h2>
            <Link
              href="/models"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-2">
            {statusOrder.map((st) => {
              const row = statusBreakdown.find((s) => s.status === st);
              const count = row?.count ?? 0;
              const total = modelStats?.total ?? 1;
              const pct = total > 0 ? Math.round((count / total) * 100) : 0;
              return (
                <div key={st}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={st} size="sm" />
                    <span className="text-xs font-mono text-slate-400">
                      {count}
                    </span>
                  </div>
                  <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${statusColors[st] ?? "bg-slate-500"} transition-all`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Providers */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">Providers</h2>
            <Link
              href="/providers"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {allProviders.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server size={12} className="text-slate-500" />
                  <span className="text-sm text-slate-300">
                    {p.displayName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {p.isConfigured ? (
                    <CheckCircle2 size={12} className="text-emerald-400" />
                  ) : (
                    <XCircle size={12} className="text-slate-600" />
                  )}
                  <span
                    className={`text-[10px] font-mono ${p.isConfigured ? "text-emerald-400" : "text-slate-600"}`}
                  >
                    {p.isConfigured ? "configured" : "not set"}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-slate-500 text-xs font-mono">
              {configuredProviders} of {allProviders.length} configured
            </p>
          </div>
        </div>

        {/* CLI quick reference */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            CLI Reference
          </h2>
          <TerminalBlock
            lines={[
              { text: "$ melodiespark-agent init", color: "text-violet-400" },
              { text: "  → .agent/config.yaml", color: "text-slate-500" },
              { text: "" },
              { text: "$ melodiespark-agent doctor", color: "text-violet-400" },
              { text: "  → runtime · tools · probes", color: "text-slate-500" },
              { text: "" },
              { text: "$ melodiespark-agent models", color: "text-violet-400" },
              { text: "  → registry status", color: "text-slate-500" },
              { text: "" },
              {
                text: '$ melodiespark-agent run \\ ',
                color: "text-violet-400",
              },
              {
                text: '  --model openrouter/auto \\',
                color: "text-slate-400",
              },
              {
                text: '  "Implement auth"',
                color: "text-emerald-400",
              },
            ]}
          />
        </div>
      </div>

      {/* Recent sessions + Audit */}
      <div className="grid grid-cols-2 gap-6">
        {/* Recent sessions */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              Recent Sessions
            </h2>
            <Link
              href="/sessions"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentSessions.length === 0 && (
              <p className="text-slate-600 text-sm font-mono">
                No sessions yet. Run a task to start.
              </p>
            )}
            {recentSessions.map((s) => (
              <div
                key={s.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/5 hover:border-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-200 truncate font-medium">
                    {s.taskDescription}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-mono text-slate-500">
                      {s.modelDisplayName ?? "no model"}
                    </span>
                    <span className="text-slate-700">·</span>
                    <span className="text-[10px] font-mono text-slate-600">
                      {s.startedAt
                        ? formatDistanceToNow(new Date(s.startedAt), {
                            addSuffix: true,
                          })
                        : "—"}
                    </span>
                  </div>
                </div>
                <StatusBadge status={s.status} size="sm" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent audit */}
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-white">
              Live Audit Feed
            </h2>
            <Link
              href="/audit"
              className="text-xs text-violet-400 hover:text-violet-300 flex items-center gap-1"
            >
              Full log <ArrowRight size={11} />
            </Link>
          </div>
          <div className="space-y-1 font-mono text-xs">
            {recentAudit.length === 0 && (
              <p className="text-slate-600 font-mono text-xs">
                No events recorded.
              </p>
            )}
            {recentAudit.map((ev) => (
              <div key={ev.id} className="flex items-start gap-2 py-1">
                <span className="text-slate-600 flex-shrink-0 text-[10px] pt-0.5">
                  {ev.createdAt
                    ? new Date(ev.createdAt).toLocaleTimeString()
                    : "—"}
                </span>
                <span
                  className={`flex-shrink-0 uppercase text-[10px] w-16 text-right ${
                    ev.eventType === "tool_call"
                      ? "text-amber-400"
                      : ev.eventType === "model_call"
                        ? "text-violet-400"
                        : ev.eventType === "session_start" ||
                            ev.eventType === "session_end"
                          ? "text-blue-400"
                          : ev.eventType === "task_completed"
                            ? "text-emerald-400"
                            : ev.eventType === "error"
                              ? "text-red-400"
                              : "text-slate-500"
                  }`}
                >
                  {ev.eventType?.replace("_", " ")}
                </span>
                <span className="text-slate-400 truncate">
                  {ev.message ?? ""}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agent execution flow */}
      <div className="mt-6 bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Agent Execution Flow
        </h2>
        <div className="flex items-center gap-0 overflow-x-auto">
          {[
            { label: "TASK", color: "bg-violet-500/20 border-violet-500/30 text-violet-300" },
            { label: "PLAN", color: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
            { label: "INSPECT", color: "bg-cyan-500/20 border-cyan-500/30 text-cyan-300" },
            { label: "MODEL", color: "bg-violet-500/20 border-violet-500/30 text-violet-300" },
            { label: "TOOL", color: "bg-amber-500/20 border-amber-500/30 text-amber-300" },
            { label: "FS/SHELL/GIT", color: "bg-orange-500/20 border-orange-500/30 text-orange-300" },
            { label: "TEST", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" },
            { label: "VERIFY", color: "bg-blue-500/20 border-blue-500/30 text-blue-300" },
            { label: "DIFF", color: "bg-slate-500/20 border-slate-500/30 text-slate-300" },
            { label: "REPORT", color: "bg-emerald-500/20 border-emerald-500/30 text-emerald-300" },
          ].map((step, i, arr) => (
            <div key={step.label} className="flex items-center flex-shrink-0">
              <div
                className={`px-3 py-1.5 rounded border text-[10px] font-mono font-semibold ${step.color}`}
              >
                {step.label}
              </div>
              {i < arr.length - 1 && (
                <div className="text-slate-700 px-1 text-xs">→</div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-600">
            On TEST FAIL:
          </span>
          <span className="text-[10px] font-mono text-amber-500">→ REPAIR</span>
          <span className="text-[10px] font-mono text-slate-600">→ retry loop</span>
        </div>
      </div>
    </div>
  );
}
