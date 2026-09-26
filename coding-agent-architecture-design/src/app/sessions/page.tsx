import { db } from "@/db";
import { sessions, models } from "@/db/schema";

export const dynamic = "force-dynamic";
import { eq, desc } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import {
  Terminal,
  Clock,
  Wrench,
  Cpu,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

async function getSessions() {
  return db
    .select({
      id: sessions.id,
      taskDescription: sessions.taskDescription,
      role: sessions.role,
      status: sessions.status,
      totalToolCalls: sessions.totalToolCalls,
      totalModelCalls: sessions.totalModelCalls,
      durationMs: sessions.durationMs,
      errorMessage: sessions.errorMessage,
      startedAt: sessions.startedAt,
      completedAt: sessions.completedAt,
      planJson: sessions.planJson,
      permissionsJson: sessions.permissionsJson,
      modelId: models.modelId,
      modelDisplayName: models.displayName,
    })
    .from(sessions)
    .leftJoin(models, eq(sessions.modelId, models.id))
    .orderBy(desc(sessions.startedAt));
}

function formatDuration(ms: number | null) {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

const ROLE_COLORS: Record<string, string> = {
  architect: "text-blue-400",
  coder: "text-violet-400",
  tester: "text-cyan-400",
  verifier: "text-emerald-400",
  orchestrator: "text-amber-400",
  general: "text-slate-400",
};

type PlanJson = { steps?: string[] };

export default async function SessionsPage() {
  const rows = await getSessions();

  const statusCounts = {
    completed: rows.filter((r) => r.status === "completed").length,
    failed: rows.filter((r) => r.status === "failed").length,
    executing: rows.filter((r) => r.status === "executing").length,
    pending: rows.filter((r) => r.status === "pending").length,
  };

  return (
    <div>
      <PageHeader
        title="Agent Sessions"
        subtitle={`${rows.length} total sessions — ${statusCounts.completed} completed, ${statusCounts.failed} failed`}
        breadcrumb="melodiespark-agent session"
        action={
          <Link
            href="/run"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium"
          >
            <Terminal size={14} />
            New Session
          </Link>
        }
      />

      {/* Status summary */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Completed",
            count: statusCounts.completed,
            color: "text-emerald-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Executing",
            count: statusCounts.executing,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
          {
            label: "Failed",
            count: statusCounts.failed,
            color: "text-red-400",
            bg: "bg-red-500/10",
          },
          {
            label: "Pending",
            count: statusCounts.pending,
            color: "text-slate-400",
            bg: "bg-slate-500/10",
          },
        ].map(({ label, count, color, bg }) => (
          <div
            key={label}
            className={`${bg} rounded-xl p-4 border border-white/5`}
          >
            <p className={`text-2xl font-bold ${color}`}>{count}</p>
            <p className="text-slate-500 text-xs font-mono mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Sessions list */}
      <div className="space-y-3">
        {rows.length === 0 && (
          <div className="bg-[#161b22] border border-white/5 rounded-xl p-8 text-center">
            <Terminal size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No sessions yet.</p>
            <p className="text-slate-600 text-xs mt-1">
              Use the Run Task page to start an agent session.
            </p>
          </div>
        )}
        {rows.map((s) => {
          const plan = s.planJson as PlanJson | null;
          return (
            <div
              key={s.id}
              className="bg-[#161b22] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusBadge status={s.status} size="sm" />
                    <span
                      className={`text-[10px] font-mono uppercase ${ROLE_COLORS[s.role ?? "general"] ?? "text-slate-400"}`}
                    >
                      {s.role}
                    </span>
                    <span className="text-slate-700 text-[10px]">·</span>
                    <span className="text-[10px] font-mono text-slate-600 truncate">
                      {s.id.slice(0, 8)}...
                    </span>
                  </div>
                  <p className="text-sm text-white font-medium mb-1 truncate">
                    {s.taskDescription}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5">
                      <Cpu size={11} className="text-slate-600" />
                      <span className="text-xs font-mono text-slate-500">
                        {s.modelDisplayName ?? s.modelId ?? "no model"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Wrench size={11} className="text-slate-600" />
                      <span className="text-xs font-mono text-slate-500">
                        {s.totalToolCalls ?? 0} tool calls
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={11} className="text-slate-600" />
                      <span className="text-xs font-mono text-slate-500">
                        {formatDuration(s.durationMs)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-mono text-slate-600">
                        {s.startedAt
                          ? formatDistanceToNow(new Date(s.startedAt), {
                              addSuffix: true,
                            })
                          : "—"}
                      </span>
                    </div>
                  </div>
                  {s.errorMessage && (
                    <div className="flex items-start gap-2 mt-2 p-2 bg-red-500/5 border border-red-500/10 rounded">
                      <AlertCircle
                        size={11}
                        className="text-red-400 mt-0.5 flex-shrink-0"
                      />
                      <span className="text-xs font-mono text-red-400">
                        {s.errorMessage}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <Link
                    href={`/audit?sessionId=${s.id}`}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300"
                  >
                    Audit log <ArrowRight size={11} />
                  </Link>
                  <span className="text-xs font-mono text-slate-600">
                    {s.totalModelCalls ?? 0} model calls
                  </span>
                </div>
              </div>

              {plan?.steps && (
                <div className="mt-3 pt-3 border-t border-white/5">
                  <p className="text-[10px] font-mono text-slate-600 mb-2 uppercase tracking-wider">
                    Plan
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {plan.steps.map((step: string, i: number) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 bg-white/5 rounded text-slate-500"
                      >
                        {i + 1}. {step}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
