"use client";

import { useState } from "react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  PlayCircle,
  RefreshCw,
} from "lucide-react";

interface Probe {
  id: string;
  category: string;
  checkName: string;
  status: "PASS" | "FAIL" | "SKIP" | "PENDING";
  message: string | null;
  durationMs: number | null;
  runAt: Date | null;
}

interface DoctorClientProps {
  initialProbes: Probe[];
}

interface GroupedProbes {
  [key: string]: Probe[];
}

export function DoctorClient({ initialProbes }: DoctorClientProps) {
  const [probes, setProbes] = useState<Probe[]>(initialProbes);
  const [running, setRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(
    initialProbes.length > 0
      ? initialProbes[0]?.runAt
        ? new Date(initialProbes[0].runAt).toISOString()
        : null
      : null
  );
  const [result, setResult] = useState<{
    total: number;
    passed: number;
    failed: number;
  } | null>(null);

  const grouped = probes.reduce<GroupedProbes>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = [];
    acc[p.category].push(p);
    return acc;
  }, {});

  const totalPass = probes.filter((p) => p.status === "PASS").length;
  const totalFail = probes.filter((p) => p.status === "FAIL").length;
  const allPass = totalFail === 0 && probes.length > 0;

  async function runDoctor() {
    setRunning(true);
    try {
      const res = await fetch("/api/doctor", { method: "POST" });
      const data = await res.json();
      if (data.results) {
        setProbes(data.results);
        setResult({
          total: data.total,
          passed: data.passed,
          failed: data.failed,
        });
        setLastRunAt(new Date().toISOString());
      }
    } catch {
      // ignore
    } finally {
      setRunning(false);
    }
  }

  return (
    <div>
      {/* Run button + summary */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={runDoctor}
          disabled={running}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm px-5 py-2.5 rounded-lg transition-colors font-medium"
        >
          {running ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <PlayCircle size={14} />
          )}
          {running ? "Running probes..." : "Run Doctor"}
        </button>
        {lastRunAt && (
          <p className="text-xs font-mono text-slate-500">
            Last run: {new Date(lastRunAt).toLocaleString()}
          </p>
        )}
      </div>

      {/* Overall status */}
      {probes.length > 0 && (
        <div
          className={`mb-6 p-4 rounded-xl border ${
            allPass
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-red-500/5 border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-3">
            {allPass ? (
              <CheckCircle2 size={20} className="text-emerald-400" />
            ) : (
              <XCircle size={20} className="text-red-400" />
            )}
            <div>
              <p
                className={`text-sm font-semibold ${allPass ? "text-emerald-400" : "text-red-400"}`}
              >
                {allPass
                  ? "All systems operational"
                  : `${totalFail} check${totalFail !== 1 ? "s" : ""} failed`}
              </p>
              <p className="text-xs text-slate-500 mt-0.5 font-mono">
                {totalPass} passed · {totalFail} failed · {probes.length} total
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terminal output */}
      <div className="bg-[#0d1117] border border-white/5 rounded-xl p-5 mb-6 font-mono text-xs">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-white/5">
          <span className="text-slate-400">Melodiespark Agent Runtime</span>
        </div>
        <div className="text-slate-600 mb-4">
          {"=".repeat(50)}
        </div>

        {Object.entries(grouped).map(([category, checks]) => (
          <div key={category} className="mb-4">
            <div className="text-slate-400 mb-2">{category}</div>
            {checks.map((probe) => (
              <div
                key={probe.id}
                className="flex items-center gap-3 pl-2 mb-1"
              >
                <span
                  className={`w-16 text-right font-semibold ${
                    probe.status === "PASS"
                      ? "text-emerald-400"
                      : probe.status === "FAIL"
                        ? "text-red-400"
                        : probe.status === "SKIP"
                          ? "text-slate-500"
                          : "text-slate-600"
                  }`}
                >
                  [{probe.status}]
                </span>
                <span className="text-slate-300">{probe.checkName}</span>
                {probe.durationMs !== null && (
                  <span className="text-slate-600 ml-auto">
                    {probe.durationMs}ms
                  </span>
                )}
              </div>
            ))}
          </div>
        ))}

        {probes.length === 0 && (
          <div className="text-slate-600 py-4 text-center">
            Run doctor to execute probes...
          </div>
        )}
      </div>

      {/* Detailed results */}
      {Object.entries(grouped).map(([category, checks]) => (
        <div key={category} className="mb-4">
          <h2 className="text-xs font-mono font-semibold text-slate-500 uppercase tracking-widest mb-2">
            {category}
          </h2>
          <div className="bg-[#161b22] border border-white/5 rounded-xl overflow-hidden">
            {checks.map((probe, i) => (
              <div
                key={probe.id}
                className={`flex items-center gap-4 px-4 py-3 ${i < checks.length - 1 ? "border-b border-white/[0.03]" : ""}`}
              >
                {probe.status === "PASS" ? (
                  <CheckCircle2 size={14} className="text-emerald-400 flex-shrink-0" />
                ) : probe.status === "FAIL" ? (
                  <XCircle size={14} className="text-red-400 flex-shrink-0" />
                ) : (
                  <Clock size={14} className="text-slate-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className="text-sm text-white">{probe.checkName}</p>
                  {probe.message && (
                    <p
                      className={`text-xs font-mono mt-0.5 ${
                        probe.status === "FAIL"
                          ? "text-red-400"
                          : "text-slate-500"
                      }`}
                    >
                      {probe.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {probe.durationMs !== null && (
                    <span className="text-xs font-mono text-slate-600">
                      {probe.durationMs}ms
                    </span>
                  )}
                  <StatusBadge status={probe.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* What each status means */}
      <div className="mt-6 bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">
          Classification System
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            {
              status: "OPERATIONAL",
              desc: "Implementation exists · provider reachable · real model request succeeds · tools execute · filesystem changes work · tests pass",
            },
            {
              status: "SCAFFOLD",
              desc: "Runtime/interface exists · provider/tool implementation incomplete",
            },
            {
              status: "PLANNED",
              desc: "Design exists · implementation absent",
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
              desc: "Claimed capability has no corresponding implementation — a model name in YAML is not evidence",
            },
          ].map(({ status, desc }) => (
            <div
              key={status}
              className="p-3 bg-[#0d1117] rounded-lg border border-white/5"
            >
              <StatusBadge status={status} size="sm" />
              <p className="text-xs text-slate-500 mt-2">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
