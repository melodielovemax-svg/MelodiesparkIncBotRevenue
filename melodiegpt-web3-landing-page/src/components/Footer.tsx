"use client";

import Link from "next/link";
import { Code, X, MessageCircle, Sparkles, AlertCircle, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";

const footerLinks = [
  {
    title: "Product",
    links: ["Models", "Agents", "API", "Pricing"],
  },
  {
    title: "Developers",
    links: ["Documentation", "SDK", "GitHub", "Status"],
  },
  {
    title: "Company",
    links: ["About", "Blog", "Careers", "Contact"],
  },
  {
    title: "Legal",
    links: ["Privacy", "Terms", "Cookie Policy"],
  },
];

interface SystemStatus {
  status: string;
  infrastructure: {
    containerRunning: boolean;
    databaseConfigured: boolean;
    backendLedgerAccessible: boolean;
  };
  businessMetrics: {
    verifiedPayments: number;
    verifiedRevenue: string;
    verifiedRevenueAmount: number;
    taskIntegrityValid: boolean;
    taskCount: number;
  };
}

export function Footer() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/health");
        if (response.ok) {
          const data = await response.json();
          setSystemStatus(data);
          setStatusError(null);
          setLastUpdate(new Date().toLocaleTimeString());
        } else {
          setStatusError("Health check returned non-200 status");
        }
      } catch (error) {
        setStatusError(
          error instanceof Error ? error.message : "Failed to fetch status"
        );
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const isHealthy =
    systemStatus &&
    systemStatus.infrastructure.backendLedgerAccessible &&
    systemStatus.businessMetrics.taskIntegrityValid;

  return (
    <footer className="border-t border-white/5 bg-slate-950 px-6 pt-16 pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">
                Melodie<span className="text-gradient">GPT</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-400">
              The decentralized AI chat interface for every frontier model.
            </p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="X"
              >
                <X className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="GitHub"
              >
                <Code className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-slate-400 transition-colors hover:text-white"
                aria-label="Discord"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="text-sm font-semibold text-white">{group.title}</h4>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-sm text-slate-400 transition-colors hover:text-white"
                    >
                      {link}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-8 border-t border-white/5 pt-8 md:flex-row">
          <div className="flex flex-col gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} MelodieSpark. All rights reserved.</p>
            <p>
              Powered by Next.js, Tailwind CSS, decentralized inference, and
              verified backend ledger.
            </p>
          </div>

          {/* System Verification Status */}
          <div className="flex flex-col gap-4 rounded-lg border border-white/10 bg-slate-900/50 p-5">
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {statusError ? (
                <>
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-xs font-semibold uppercase text-amber-500">
                    Status Unverified
                  </span>
                </>
              ) : isHealthy ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-xs font-semibold uppercase text-green-500">
                    Verified & Operational
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-xs font-semibold uppercase text-red-500">
                    Verification Failed
                  </span>
                </>
              )}
            </div>

            {/* Verified Metrics - ONLY DISPLAY ACTUAL VALUES */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="rounded bg-slate-800/50 p-2">
                <p className="text-slate-400">Verified Payments</p>
                <p className="font-mono font-semibold text-white">
                  {systemStatus?.businessMetrics.verifiedPayments ?? 0}
                </p>
              </div>
              <div className="rounded bg-slate-800/50 p-2">
                <p className="text-slate-400">Verified Revenue</p>
                <p className="font-mono font-semibold text-green-400">
                  {systemStatus?.businessMetrics.verifiedRevenue ?? "$0.00"}
                </p>
              </div>
              <div className="rounded bg-slate-800/50 p-2">
                <p className="text-slate-400">Task Integrity</p>
                <p className="font-mono font-semibold text-white">
                  {systemStatus?.businessMetrics.taskIntegrityValid
                    ? "✓ VALID"
                    : "✗ INVALID"}
                </p>
              </div>
              <div className="rounded bg-slate-800/50 p-2">
                <p className="text-slate-400">Task Count</p>
                <p className="font-mono font-semibold text-white">
                  {systemStatus?.businessMetrics.taskCount ?? 0}
                </p>
              </div>
            </div>

            {/* Footer note */}
            <div className="border-t border-white/10 pt-2">
              <p className="text-xs italic text-slate-400">
                ✓ All metrics are verified from actual system state.
                <br />
                {lastUpdate && (
                  <>
                    Last verified: {lastUpdate}
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
