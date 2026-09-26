export const dynamic = "force-dynamic";

import { PageHeader } from "@/components/PageHeader";
import {
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

const DEFAULT_PERMISSIONS = {
  filesystem: {
    read: true,
    write: true,
    delete: false,
    label: "Filesystem",
    icon: "📁",
  },
  shell: {
    enabled: true,
    timeout_seconds: 120,
    label: "Shell Execution",
    icon: "💻",
  },
  git: {
    enabled: true,
    commit: false,
    push: false,
    label: "Git",
    icon: "🌿",
  },
  network: {
    enabled: false,
    label: "Network",
    icon: "🌐",
  },
  destructive: {
    enabled: false,
    label: "Destructive Operations",
    icon: "⚠️",
  },
  package_install: {
    require_approval: true,
    label: "Package Install",
    icon: "📦",
  },
};

interface PermEntry {
  value: boolean | number;
  label: string;
}

function PermRow({ value, label }: PermEntry) {
  const k = label;
  const isTrue = value === true;
  const isFalse = value === false;
  const isNumber = typeof value === "number";

  return (
    <div className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
      <div className="flex items-center gap-2">
        {isTrue ? (
          <CheckCircle2 size={13} className="text-emerald-400" />
        ) : isFalse ? (
          <XCircle size={13} className="text-red-400" />
        ) : (
          <AlertCircle size={13} className="text-amber-400" />
        )}
        <span className="text-xs font-mono text-slate-400">{label ?? k}</span>
      </div>
      <span
        className={`text-xs font-mono font-semibold ${
          isTrue
            ? "text-emerald-400"
            : isFalse
              ? "text-red-400"
              : "text-amber-400"
        }`}
      >
        {isNumber ? `${value}s` : String(value)}
      </span>
    </div>
  );
}

const PHASES = [
  {
    phase: "Phase 1",
    label: "CLI + Provider Abstraction",
    status: "active",
    items: ["CLI", "Provider abstraction", "OpenRouter adapter", "Model registry"],
  },
  {
    phase: "Phase 2",
    label: "Tool Layer",
    status: "planned",
    items: ["Filesystem tools", "Shell tool", "Git tool", "Search tool", "Patch engine"],
  },
  {
    phase: "Phase 3",
    label: "Agent Loop",
    status: "planned",
    items: ["AgentLoop", "Planning", "Execution", "Recovery", "Verification"],
  },
  {
    phase: "Phase 4",
    label: "Safety + Audit",
    status: "planned",
    items: ["Sandbox", "Permissions", "Approvals", "Audit trail"],
  },
  {
    phase: "Phase 5",
    label: "Multi-Agent",
    status: "planned",
    items: ["Orchestration", "Model routing", "Parallel agents", "Persistent sessions"],
  },
  {
    phase: "Phase 6",
    label: "Verification",
    status: "planned",
    items: ["Capability probes", "Integration tests", "Adversarial tests", "Operational evidence"],
  },
];

export default function PermissionsPage() {
  return (
    <div>
      <PageHeader
        title="Permissions & Safety"
        subtitle="Explicit capability model — no unrestricted host access by default"
        breadcrumb="melodiespark-agent permissions"
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        {Object.entries(DEFAULT_PERMISSIONS).map(([key, perm]) => {
          const { label, icon, ...rest } = perm as { label: string; icon: string; [k: string]: boolean | number | string };

          const hasEnabled = "enabled" in rest;
          const isEnabled = hasEnabled ? rest.enabled === true : true;

          return (
            <div
              key={key}
              className={`bg-[#161b22] border rounded-xl p-4 ${
                isEnabled
                  ? "border-white/5"
                  : "border-white/[0.03] opacity-70"
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base">{icon}</span>
                <h3 className="text-sm font-semibold text-white">{label}</h3>
                {!isEnabled && (
                  <span className="ml-auto">
                    <ShieldX size={13} className="text-red-400" />
                  </span>
                )}
                {isEnabled && !("require_approval" in rest) && (
                  <span className="ml-auto">
                    <ShieldCheck size={13} className="text-emerald-400" />
                  </span>
                )}
                {"require_approval" in rest && rest.require_approval && (
                  <span className="ml-auto">
                    <ShieldAlert size={13} className="text-amber-400" />
                  </span>
                )}
              </div>
              <div>
                {Object.entries(rest).map(([k, v]) => (
                  <PermRow
                    key={k}
                    value={v as boolean | number}
                    label={k.replace(/_/g, " ")}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* YAML config */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            permissions.yaml
          </h2>
          <div className="bg-[#0d1117] rounded-lg p-4 font-mono text-xs text-slate-400 overflow-x-auto">
            <pre>{`permissions:
  filesystem:
    read: true
    write: true

  shell:
    enabled: true
    timeout_seconds: 120

  git:
    enabled: true
    commit: false
    push: false

  network:
    enabled: false

  destructive:
    enabled: false

  package_install:
    require_approval: true`}</pre>
          </div>
        </div>

        <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-3">
            Approval flow
          </h2>
          <div className="space-y-2 font-mono text-xs">
            {[
              { step: "1", label: "Agent requests tool call", color: "text-slate-400" },
              { step: "2", label: "PermissionManager checks policy", color: "text-blue-400" },
              { step: "3", label: "If require_approval → pause + notify", color: "text-amber-400" },
              { step: "4", label: "User grants or denies", color: "text-violet-400" },
              { step: "5", label: "ApprovalManager unblocks or aborts", color: "text-slate-400" },
              { step: "6", label: "AuditLogger records decision", color: "text-emerald-400" },
            ].map(({ step, label, color }) => (
              <div key={step} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-[10px] text-slate-500 flex-shrink-0">
                  {step}
                </span>
                <span className={color}>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-white/5">
            <p className="text-xs text-slate-500">
              Every tool call is logged regardless of approval status. The audit
              trail is immutable and session-scoped.
            </p>
          </div>
        </div>
      </div>

      {/* Implementation roadmap */}
      <div className="bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Implementation Roadmap
        </h2>
        <div className="grid grid-cols-3 gap-3">
          {PHASES.map(({ phase, label, status, items }) => (
            <div
              key={phase}
              className={`p-3 rounded-lg border ${
                status === "active"
                  ? "bg-violet-500/5 border-violet-500/20"
                  : "bg-white/[0.02] border-white/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                    status === "active"
                      ? "bg-violet-500/20 text-violet-400"
                      : "bg-slate-500/10 text-slate-500"
                  }`}
                >
                  {phase}
                </span>
                {status === "active" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <p className="text-xs font-medium text-slate-300 mb-2">{label}</p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item} className="flex items-center gap-1.5">
                    {status === "active" ? (
                      <CheckCircle2 size={10} className="text-emerald-400" />
                    ) : (
                      <span className="w-2 h-2 rounded-full border border-slate-700" />
                    )}
                    <span className="text-[10px] text-slate-500">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
