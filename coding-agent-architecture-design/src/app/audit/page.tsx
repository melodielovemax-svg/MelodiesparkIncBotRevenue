import { db } from "@/db";
import { auditEvents, sessions } from "@/db/schema";

export const dynamic = "force-dynamic";
import { eq, desc } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";

async function getAuditEvents(sessionId?: string) {
  let query = db
    .select({
      id: auditEvents.id,
      eventType: auditEvents.eventType,
      agentModel: auditEvents.agentModel,
      tool: auditEvents.tool,
      path: auditEvents.path,
      action: auditEvents.action,
      result: auditEvents.result,
      durationMs: auditEvents.durationMs,
      message: auditEvents.message,
      createdAt: auditEvents.createdAt,
      sessionId: auditEvents.sessionId,
      sessionTask: sessions.taskDescription,
    })
    .from(auditEvents)
    .leftJoin(sessions, eq(auditEvents.sessionId, sessions.id))
    .orderBy(desc(auditEvents.createdAt))
    .$dynamic();

  if (sessionId) {
    query = query.where(eq(auditEvents.sessionId, sessionId));
  }

  return query.limit(200);
}

const EVENT_TYPE_COLORS: Record<string, string> = {
  tool_call: "text-amber-400 bg-amber-500/10",
  model_call: "text-violet-400 bg-violet-500/10",
  session_start: "text-blue-400 bg-blue-500/10",
  session_end: "text-blue-300 bg-blue-500/10",
  plan_created: "text-cyan-400 bg-cyan-500/10",
  task_completed: "text-emerald-400 bg-emerald-500/10",
  error: "text-red-400 bg-red-500/10",
  approval_requested: "text-amber-400 bg-amber-500/10",
  approval_granted: "text-emerald-400 bg-emerald-500/10",
  approval_denied: "text-red-400 bg-red-500/10",
  probe_run: "text-slate-400 bg-slate-500/10",
};

function formatTs(d: Date | null) {
  if (!d) return "—";
  return new Date(d).toISOString().replace("T", " ").slice(0, 19);
}

interface PageProps {
  searchParams: Promise<{ sessionId?: string }>;
}

export default async function AuditPage({ searchParams }: PageProps) {
  const { sessionId } = await searchParams;
  const rows = await getAuditEvents(sessionId);

  return (
    <div>
      <PageHeader
        title="Audit Log"
        subtitle={`${rows.length} events${sessionId ? " for selected session" : " (latest 200)"}`}
        breadcrumb="melodiespark-agent session audit"
      />

      {sessionId && (
        <div className="mb-4 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <p className="text-xs font-mono text-violet-300">
            Filtering by session: {sessionId}
          </p>
          <a
            href="/audit"
            className="text-xs text-violet-400 hover:text-violet-300 underline mt-1 inline-block"
          >
            Clear filter → view all events
          </a>
        </div>
      )}

      <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[160px_140px_140px_100px_80px_80px_1fr] gap-0 px-4 py-2.5 border-b border-white/5 bg-black/20">
          {["Timestamp", "Event", "Model", "Tool", "Action", "Result", "Message"].map(
            (h) => (
              <span
                key={h}
                className="text-[10px] font-mono text-slate-600 uppercase tracking-widest"
              >
                {h}
              </span>
            )
          )}
        </div>

        {/* Rows */}
        <div className="font-mono text-xs divide-y divide-white/[0.03] max-h-[70vh] overflow-y-auto">
          {rows.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-slate-600">No audit events recorded.</p>
            </div>
          )}
          {rows.map((ev) => (
            <div
              key={ev.id}
              className="grid grid-cols-[160px_140px_140px_100px_80px_80px_1fr] gap-0 px-4 py-2.5 hover:bg-white/[0.02] transition-colors"
            >
              <span className="text-slate-600 text-[10px] self-center">
                {formatTs(ev.createdAt)}
              </span>
              <span className="self-center">
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${EVENT_TYPE_COLORS[ev.eventType] ?? "text-slate-500"}`}
                >
                  {ev.eventType?.replace(/_/g, " ")}
                </span>
              </span>
              <span className="text-slate-500 text-[10px] self-center truncate pr-2">
                {ev.agentModel ?? "—"}
              </span>
              <span className="text-slate-400 text-[10px] self-center">
                {ev.tool ?? "—"}
              </span>
              <span className="text-slate-500 text-[10px] self-center">
                {ev.action ?? "—"}
              </span>
              <span className="self-center">
                {ev.result ? (
                  <StatusBadge status={ev.result} size="sm" showDot={false} />
                ) : (
                  <span className="text-slate-700">—</span>
                )}
              </span>
              <span className="text-slate-400 text-[10px] self-center truncate">
                {ev.path ? (
                  <span className="text-amber-400/70 mr-1">{ev.path}</span>
                ) : null}
                {ev.message ?? ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Audit format reference */}
      <div className="mt-6 bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">
          Audit Event Format
        </h2>
        <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs text-slate-400 space-y-1">
          <div className="text-slate-600"># Each tool call produces an auditable record:</div>
          <div>
            <span className="text-violet-400">AGENT</span>
            {"      = "}
            <span className="text-emerald-400">openai/gpt-4-turbo</span>
          </div>
          <div>
            <span className="text-violet-400">TASK </span>
            {"      = "}
            <span className="text-slate-300">implement authentication</span>
          </div>
          <div>
            <span className="text-violet-400">TOOL </span>
            {"      = "}
            <span className="text-amber-400">filesystem.write</span>
          </div>
          <div>
            <span className="text-violet-400">PATH </span>
            {"      = "}
            <span className="text-cyan-400">src/auth/service.ts</span>
          </div>
          <div>
            <span className="text-violet-400">ACTION</span>
            {"     = "}
            <span className="text-slate-300">write</span>
          </div>
          <div>
            <span className="text-violet-400">RESULT</span>
            {"     = "}
            <span className="text-emerald-400">success</span>
          </div>
        </div>
      </div>
    </div>
  );
}
