"use client";

import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "default" | "emerald" | "red" | "amber" | "violet";
}

const COLOR_MAP = {
  default: "text-white",
  emerald: "text-emerald-400",
  red: "text-red-400",
  amber: "text-amber-400",
  violet: "text-violet-400",
};

export function StatCard({
  label,
  value,
  sub,
  icon,
  color = "default",
}: StatCardProps) {
  return (
    <div className="bg-[#161b22] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-500 text-xs font-mono uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className={`text-3xl font-bold ${COLOR_MAP[color]}`}>{value}</p>
          {sub && (
            <p className="text-slate-500 text-xs mt-1.5 font-mono">{sub}</p>
          )}
        </div>
        {icon && (
          <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 ml-3">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
