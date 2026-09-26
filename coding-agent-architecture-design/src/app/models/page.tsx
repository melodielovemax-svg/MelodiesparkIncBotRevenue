import { db } from "@/db";
import { models, providers } from "@/db/schema";

export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
import { StatusBadge } from "@/components/StatusBadge";
import { PageHeader } from "@/components/PageHeader";
import { CheckCircle2, XCircle, Eye, Wrench, Zap } from "lucide-react";

async function getModels() {
  return db
    .select({
      id: models.id,
      modelId: models.modelId,
      displayName: models.displayName,
      status: models.status,
      role: models.role,
      contextWindow: models.contextWindow,
      inputPricePer1k: models.inputPricePer1k,
      outputPricePer1k: models.outputPricePer1k,
      supportsTools: models.supportsTools,
      supportsVision: models.supportsVision,
      supportsStreaming: models.supportsStreaming,
      lastProbeResult: models.lastProbeResult,
      notes: models.notes,
      providerName: providers.name,
      providerDisplayName: providers.displayName,
    })
    .from(models)
    .leftJoin(providers, eq(models.providerId, providers.id))
    .orderBy(models.status, models.displayName);
}

const ROLE_COLORS: Record<string, string> = {
  architect: "text-blue-400 bg-blue-500/10",
  coder: "text-violet-400 bg-violet-500/10",
  tester: "text-cyan-400 bg-cyan-500/10",
  verifier: "text-emerald-400 bg-emerald-500/10",
  orchestrator: "text-amber-400 bg-amber-500/10",
  general: "text-slate-400 bg-slate-500/10",
};

function formatContext(ctx: number | null) {
  if (!ctx) return "—";
  if (ctx >= 1000) return `${Math.round(ctx / 1000)}k`;
  return String(ctx);
}

function formatPrice(p: number | null | undefined) {
  if (p === null || p === undefined) return "—";
  return `$${p.toFixed(4)}`;
}

export default async function ModelsPage() {
  const rows = await getModels();

  const statusGroups = [
    "OPERATIONAL",
    "SCAFFOLD",
    "PLANNED",
    "UNVERIFIED",
    "BLOCKED",
    "FICTIONAL",
  ];

  return (
    <div>
      <PageHeader
        title="Model Registry"
        subtitle={`${rows.length} models registered across all providers`}
        breadcrumb="melodiespark-agent models"
      />

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          {
            status: "OPERATIONAL",
            desc: "Implementation exists, end-to-end probe succeeded",
          },
          {
            status: "SCAFFOLD",
            desc: "Runtime interface exists, implementation incomplete",
          },
          {
            status: "PLANNED",
            desc: "Design exists, implementation absent",
          },
          {
            status: "UNVERIFIED",
            desc: "Implementation exists but runtime evidence is missing",
          },
          {
            status: "BLOCKED",
            desc: "Implementation exists but cannot currently execute",
          },
          {
            status: "FICTIONAL",
            desc: "Claimed capability with no corresponding implementation",
          },
        ].map(({ status, desc }) => (
          <div
            key={status}
            className="bg-[#161b22] border border-white/5 rounded-lg p-3"
          >
            <StatusBadge status={status} size="sm" />
            <p className="text-slate-500 text-xs mt-1.5">{desc}</p>
          </div>
        ))}
      </div>

      {/* Model table grouped by status */}
      {statusGroups.map((statusGroup) => {
        const group = rows.filter((r) => r.status === statusGroup);
        if (group.length === 0) return null;
        return (
          <div key={statusGroup} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <StatusBadge status={statusGroup} size="md" />
              <span className="text-slate-600 text-xs font-mono">
                {group.length} model{group.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Model ID
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Provider
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Context
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Input/1k
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Caps
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-mono text-slate-500 uppercase tracking-wider">
                      Last Probe
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {group.map((m, i) => (
                    <tr
                      key={m.id}
                      className={`${i < group.length - 1 ? "border-b border-white/[0.03]" : ""} hover:bg-white/[0.02] transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-mono text-xs text-white">
                            {m.modelId}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {m.displayName}
                          </p>
                          {m.notes && (
                            <p className="text-[10px] text-slate-600 mt-0.5 italic">
                              {m.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-400">
                          {m.providerDisplayName ?? m.providerName ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${ROLE_COLORS[m.role ?? "general"] ?? ""}`}
                        >
                          {m.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-400">
                          {formatContext(m.contextWindow)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-mono text-slate-400">
                          {formatPrice(m.inputPricePer1k)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {m.supportsTools ? (
                            <span title="Tool calling">
                              <Wrench
                                size={11}
                                className="text-emerald-400"
                              />
                            </span>
                          ) : (
                            <Wrench size={11} className="text-slate-700" />
                          )}
                          {m.supportsVision ? (
                            <span title="Vision">
                              <Eye size={11} className="text-emerald-400" />
                            </span>
                          ) : (
                            <Eye size={11} className="text-slate-700" />
                          )}
                          {m.supportsStreaming ? (
                            <span title="Streaming">
                              <Zap size={11} className="text-emerald-400" />
                            </span>
                          ) : (
                            <Zap size={11} className="text-slate-700" />
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {m.lastProbeResult ? (
                          <StatusBadge
                            status={m.lastProbeResult}
                            size="sm"
                          />
                        ) : (
                          <span className="text-slate-700 text-xs font-mono">
                            never
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
}
