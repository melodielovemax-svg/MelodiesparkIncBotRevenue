"use client";

type ModelStatus =
  | "OPERATIONAL"
  | "SCAFFOLD"
  | "PLANNED"
  | "BLOCKED"
  | "UNVERIFIED"
  | "FICTIONAL";

type ProbeStatus = "PASS" | "FAIL" | "SKIP" | "PENDING";

type SessionStatus =
  | "pending"
  | "planning"
  | "executing"
  | "verifying"
  | "completed"
  | "failed"
  | "aborted";

type AnyStatus = ModelStatus | ProbeStatus | SessionStatus | string;

const STATUS_CONFIG: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  // Model statuses
  OPERATIONAL: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "OPERATIONAL",
  },
  SCAFFOLD: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
    label: "SCAFFOLD",
  },
  PLANNED: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
    label: "PLANNED",
  },
  BLOCKED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "BLOCKED",
  },
  UNVERIFIED: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
    label: "UNVERIFIED",
  },
  FICTIONAL: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
    label: "FICTIONAL",
  },
  // Probe statuses
  PASS: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "PASS",
  },
  FAIL: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "FAIL",
  },
  SKIP: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
    label: "SKIP",
  },
  PENDING: {
    bg: "bg-slate-500/10",
    text: "text-slate-500",
    dot: "bg-slate-500",
    label: "PENDING",
  },
  // Session statuses
  pending: {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
    label: "pending",
  },
  planning: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
    label: "planning",
  },
  executing: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400 animate-pulse",
    label: "executing",
  },
  verifying: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-400",
    dot: "bg-cyan-400",
    label: "verifying",
  },
  completed: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "completed",
  },
  failed: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "failed",
  },
  aborted: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
    label: "aborted",
  },
  // Tool status
  success: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
    label: "success",
  },
  failure: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "failure",
  },
  timeout: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
    label: "timeout",
  },
  denied: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
    label: "denied",
  },
};

interface StatusBadgeProps {
  status: AnyStatus;
  size?: "sm" | "md" | "lg";
  showDot?: boolean;
}

export function StatusBadge({
  status,
  size = "md",
  showDot = true,
}: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    bg: "bg-slate-500/10",
    text: "text-slate-400",
    dot: "bg-slate-400",
    label: status,
  };

  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-1",
    md: "text-xs px-2 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2",
  };

  const dotSizes = {
    sm: "w-1 h-1",
    md: "w-1.5 h-1.5",
    lg: "w-2 h-2",
  };

  return (
    <span
      className={`inline-flex items-center font-mono font-semibold rounded uppercase tracking-wider ${config.bg} ${config.text} ${sizeClasses[size]}`}
    >
      {showDot && (
        <span
          className={`rounded-full flex-shrink-0 ${config.dot} ${dotSizes[size]}`}
        />
      )}
      {config.label}
    </span>
  );
}
