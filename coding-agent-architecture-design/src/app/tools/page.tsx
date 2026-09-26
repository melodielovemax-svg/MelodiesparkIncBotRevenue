import { db } from "@/db";
import { toolCapabilities } from "@/db/schema";

export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import {
  FolderOpen,
  Terminal,
  GitBranch,
  Search,
  FileCode2,
  Monitor,
  Stethoscope,
  Globe,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
} from "lucide-react";

async function getTools() {
  return db
    .select()
    .from(toolCapabilities)
    .orderBy(toolCapabilities.category, toolCapabilities.toolName);
}

const TOOL_ICONS: Record<string, React.ElementType> = {
  filesystem: FolderOpen,
  shell: Terminal,
  git: GitBranch,
  search: Search,
  patch: FileCode2,
  terminal: Monitor,
  diagnostics: Stethoscope,
  browser: Globe,
};

const CATEGORY_LABELS: Record<string, string> = {
  core: "Core Tools",
  vcs: "Version Control",
  discovery: "Discovery",
  verification: "Verification",
  network: "Network",
};

type PermissionsRecord = Record<string, boolean | number | string>;

export default async function ToolsPage() {
  const rows = await getTools();

  const grouped = rows.reduce<Record<string, typeof rows>>((acc, t) => {
    const cat = t.category ?? "other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const agentContract = [
    { method: "understand(task)", desc: "Parse and decompose the incoming task" },
    { method: "inspect(repository)", desc: "Walk file tree, read context, map dependencies" },
    { method: "plan()", desc: "Generate ordered step list with tool assignments" },
    { method: "execute()", desc: "Run plan steps sequentially via tools" },
    { method: "modify_files()", desc: "Write, patch, or delete files via filesystem tool" },
    { method: "run_tests()", desc: "Invoke test runner via shell tool" },
    { method: "diagnose()", desc: "Parse errors, lint output, type failures" },
    { method: "repair()", desc: "Re-plan and re-execute on test failure" },
    { method: "verify()", desc: "Re-run tests + lint + typecheck + build" },
    { method: "report()", desc: "Emit diff, summary, and audit events" },
  ];

  return (
    <div>
      <PageHeader
        title="Tool Registry"
        subtitle="Agent tools — each maps to a concrete runtime implementation"
        breadcrumb="melodiespark-agent tools"
      />

      <div className="grid grid-cols-2 gap-6 mb-8">
        {Object.entries(grouped).map(([cat, tools]) => (
          <div
            key={cat}
            className="bg-[#161b22] border border-white/5 rounded-xl p-5"
          >
            <h2 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest mb-4">
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="space-y-3">
              {tools.map((tool) => {
                const Icon = TOOL_ICONS[tool.toolName] ?? FileCode2;
                const perms = tool.permissionsJson as PermissionsRecord | null;
                return (
                  <div
                    key={tool.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      tool.isEnabled
                        ? "bg-white/[0.02] border-white/5 hover:border-white/10"
                        : "bg-black/20 border-white/[0.03] opacity-60"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        tool.isEnabled ? "bg-violet-500/10" : "bg-white/5"
                      }`}
                    >
                      <Icon
                        size={14}
                        className={
                          tool.isEnabled ? "text-violet-400" : "text-slate-600"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-mono font-medium text-white">
                          {tool.toolName}
                        </span>
                        {tool.isEnabled ? (
                          <CheckCircle2
                            size={11}
                            className="text-emerald-400"
                          />
                        ) : (
                          <AlertCircle size={11} className="text-slate-600" />
                        )}
                        {tool.requiresApproval && (
                          <div className="flex items-center gap-1">
                            <ShieldAlert
                              size={11}
                              className="text-amber-400"
                            />
                            <span className="text-[10px] font-mono text-amber-400">
                              requires approval
                            </span>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mb-2">
                        {tool.description}
                      </p>
                      {perms && (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(perms).map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-slate-500"
                            >
                              {k}:{" "}
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
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      {tool.lastTestStatus ? (
                        <StatusBadge status={tool.lastTestStatus} size="sm" />
                      ) : (
                        <span className="text-slate-700 text-[10px] font-mono">
                          never
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Agent contract */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-1">
          Agent Contract
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Every model implements this interface. The model becomes a replaceable
          component.
        </p>
        <div className="grid grid-cols-2 gap-2">
          {agentContract.map(({ method, desc }) => (
            <div
              key={method}
              className="flex items-start gap-3 p-3 bg-[#0d1117] rounded-lg border border-white/5"
            >
              <span className="text-violet-400 font-mono text-xs flex-shrink-0">
                {method}
              </span>
              <span className="text-slate-500 text-xs">{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
