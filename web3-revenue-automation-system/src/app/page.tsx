"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";

// ── Types ────────────────────────────────────────────────────────────
interface Wallet {
  id: string; address: string; label: string;
  maTokenBalance: string; ethBalance: string; btcBalance: string;
  usdtBalance: string; karmaPoints: number; level: number;
  totalRevenue: string; isActive: boolean;
}
interface BotSystem {
  id: string; name: string; codename: string; category: string;
  status: string; botCount: number; tasksExecuted: number;
  revenueGenerated: string; maTokensMined: string; contractsSigned: number;
  successRate: string; quantumLevel: number; description: string;
  features: string[];
}
interface Product {
  id: string; name: string; category: string; tier: string;
  description: string; priceUsdt: string; priceMaToken: string;
  karmaReward: number; maTokenReward: string; salesCount: number;
  features: string[]; tags: string[]; releaseVersion: string;
}
interface Transaction {
  id: string; txHash: string; type: string; fromAddress: string;
  toAddress: string; amount: string; currency: string; gasFee: string;
  status: string; blockNumber: number; karmaEarned: number; createdAt: string;
}
interface KarmaEvent {
  id: string; eventType: string; title: string; pointsEarned: number;
  maTokensRewarded: string; multiplier: string; createdAt: string;
}
interface CliLog {
  id: string; taskName: string; phase: string; status: string;
  executionMs: number; outputLog: string; karmaGenerated: number;
  maTokensGenerated: string; createdAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────
function fmt(n: string | number, dec = 4) {
  return parseFloat(String(n)).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
}
function fmtShort(n: string | number) {
  const v = parseFloat(String(n));
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M";
  if (v >= 1_000) return (v / 1_000).toFixed(2) + "K";
  return v.toFixed(2);
}
function shortAddr(addr: string) {
  if (!addr) return "";
  return addr.slice(0, 8) + "..." + addr.slice(-6);
}
function shortHash(h: string) {
  if (!h) return "";
  return h.slice(0, 10) + "..." + h.slice(-8);
}
function timeAgo(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return `${Math.floor(diff / 3600000)}h ago`;
}

// ── Sub-components ───────────────────────────────────────────────────
function TierBadge({ tier }: { tier: string }) {
  return <span className={`tier-badge tier-${tier}`}>{tier}</span>;
}

function PhaseTag({ phase }: { phase: string }) {
  const color: Record<string, string> = {
    ALPHA: "cli-line-alpha", OMEGA: "cli-line-omega", BETA: "cli-line-beta",
    THETA: "cli-line-theta", DELTA: "cli-line-delta", GAMMA: "cli-line-gamma",
    BRAVO: "cli-line-bravo",
  };
  return <span className={`text-xs font-bold px-2 py-0.5 rounded ${color[phase] || "text-slate-400"} bg-white/5 border border-white/10`}>{phase}</span>;
}

function StatCard({ label, value, sub, color = "blue", icon }: {
  label: string; value: string; sub?: string; color?: string; icon: string;
}) {
  const colors: Record<string, string> = {
    blue: "text-cyan-400", gold: "text-amber-400",
    purple: "text-purple-400", green: "text-emerald-400", red: "text-red-400",
  };
  return (
    <div className="stat-card glow-border">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${colors[color]} mb-1`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

function WalletCard({ wallet }: { wallet: Wallet }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <div className="relative rounded-2xl overflow-hidden" style={{
      background: "linear-gradient(135deg, #0a1628 0%, #1a2a4a 50%, #0d1f3c 100%)",
      border: "1px solid rgba(0,212,255,0.3)",
      boxShadow: "0 0 40px rgba(0,212,255,0.1)",
    }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: "url(/images/wallet-card.jpg)",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }} />
      <div className="relative p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/ma-token-logo.png" alt="MA" className="w-10 h-10 rounded-full object-cover animate-float" />
            <div>
              <div className="font-bold text-white text-lg">{wallet.label}</div>
              <div className="text-xs text-cyan-400">MetaMello Treasury • Level {wallet.level}</div>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              ● LIVE SYNC
            </span>
            <span className="text-xs text-slate-500">ARCHANGEL Tier</span>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">Wallet Address</div>
          <div className="flex items-center gap-2">
            <code className="text-xs text-cyan-300 bg-black/30 px-2 py-1 rounded truncate flex-1">
              {wallet.address}
            </code>
            <button onClick={copy} className="text-xs px-2 py-1 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-500/30 transition-colors">
              {copied ? "✓" : "⊕"}
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-amber-400 mb-1">⚡ MA Tokens</div>
            <div className="text-lg font-bold text-white">{fmtShort(wallet.maTokenBalance)}</div>
            <div className="text-xs text-slate-500">≈ ${(parseFloat(wallet.maTokenBalance) * 0.001).toFixed(2)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-purple-400 mb-1">🎯 Karma Points</div>
            <div className="text-lg font-bold text-white">{wallet.karmaPoints.toLocaleString()}</div>
            <div className="text-xs text-slate-500">KP Rank #1</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-cyan-400 mb-1">Ξ ETH</div>
            <div className="text-lg font-bold text-white">{fmt(wallet.ethBalance, 4)}</div>
            <div className="text-xs text-slate-500">≈ ${(parseFloat(wallet.ethBalance) * 2400).toFixed(0)}</div>
          </div>
          <div className="bg-black/30 rounded-lg p-3">
            <div className="text-xs text-orange-400 mb-1">₿ Bitcoin</div>
            <div className="text-lg font-bold text-white">{fmt(wallet.btcBalance, 6)}</div>
            <div className="text-xs text-slate-500">≈ ${(parseFloat(wallet.btcBalance) * 68000).toFixed(0)}</div>
          </div>
        </div>
        <div className="mt-3 bg-black/30 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400">💵 USDT Balance</div>
            <div className="text-lg font-bold text-white">${fmt(wallet.usdtBalance, 2)}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Total Portfolio</div>
            <div className="text-lg font-bold text-amber-400">
              ${(
                parseFloat(wallet.maTokenBalance) * 0.001 +
                parseFloat(wallet.ethBalance) * 2400 +
                parseFloat(wallet.btcBalance) * 68000 +
                parseFloat(wallet.usdtBalance)
              ).toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Wallet Actions Panel ─────────────────────────────────────────────
function WalletActions({ onAction }: { onAction: (msg: string) => void }) {
  const [tab, setTab] = useState<"mining" | "swap" | "send" | "receive">("mining");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, string | number | boolean | null> | null>(null);
  const [swapFrom, setSwapFrom] = useState("MA");
  const [swapTo, setSwapTo] = useState("ETH");
  const [swapAmount, setSwapAmount] = useState("1000");
  const [sendTo, setSendTo] = useState("");
  const [sendAmount, setSendAmount] = useState("");
  const [sendCurrency, setSendCurrency] = useState("MA");

  async function doMine() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/mining", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "MINE" }) });
      const d = await r.json();
      setResult(d);
      if (d.success) onAction(`⚡ Mined ${parseFloat(d.maEarned).toFixed(4)} MA (+${d.karmaEarned} KP)`);
    } finally { setLoading(false); }
  }
  async function doSwap() {
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/mining", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "SWAP", fromCurrency: swapFrom, toCurrency: swapTo, amount: swapAmount }) });
      const d = await r.json();
      setResult(d);
      if (d.success) onAction(`🔄 Swapped ${swapAmount} ${swapFrom} → ${parseFloat(d.outputAmount).toFixed(6)} ${swapTo}`);
    } finally { setLoading(false); }
  }
  async function doSend() {
    if (!sendTo || !sendAmount) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await fetch("/api/mining", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "TRANSFER", toAddress: sendTo, amount: sendAmount, currency: sendCurrency }) });
      const d = await r.json();
      setResult(d);
      if (d.success) onAction(`📤 Sent ${sendAmount} ${sendCurrency} to ${shortAddr(sendTo)}`);
    } finally { setLoading(false); }
  }

  return (
    <div className="glass-card glow-border rounded-xl p-5">
      <div className="text-sm font-bold text-cyan-400 mb-4 flex items-center gap-2">
        <span>💎</span> Wallet Actions
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["mining", "swap", "send", "receive"] as const).map(t => (
          <button key={t} onClick={() => { setTab(t); setResult(null); }} className={`tab-btn ${tab === t ? "active" : ""}`}>
            {t === "mining" ? "⛏ Mine" : t === "swap" ? "🔄 Swap" : t === "send" ? "📤 Send" : "📥 Receive"}
          </button>
        ))}
      </div>

      {tab === "mining" && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Mine MA Tokens via Sacred Geometry APEX quantum fractal engine. Each cycle generates MA tokens + Karma Points, recorded on-chain.
          </div>
          <div className="flex justify-center">
            <button onClick={doMine} disabled={loading} className="btn-mega">
              {loading ? "⟳" : "⚡ START MA MINING"}
            </button>
          </div>
          {result && result.success && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 text-xs space-y-1">
              <div className="text-emerald-400 font-bold">{String(result.message)}</div>
              <div className="text-slate-300">TX: <span className="text-cyan-400 font-mono">{shortHash(String(result.txHash))}</span></div>
              <div className="text-slate-300">MA Earned: <span className="text-amber-400 font-bold">+{parseFloat(String(result.maEarned)).toFixed(4)}</span></div>
              <div className="text-slate-300">Karma: <span className="text-purple-400 font-bold">+{String(result.karmaEarned)}</span></div>
              <div className="text-slate-300">Block: <span className="text-cyan-300">#{String(result.blockNumber)}</span></div>
              <div className="text-slate-300">Status: <span className="text-emerald-400">✅ {String(result.status)}</span></div>
            </div>
          )}
        </div>
      )}

      {tab === "swap" && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">Swap MA Tokens ↔ ETH / BTC / USDT via MetaMello bridge. Gas fees paid by MetaMello.</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">From</div>
              <select value={swapFrom} onChange={e => setSwapFrom(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                {["MA", "ETH", "BTC", "USDT"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">To</div>
              <select value={swapTo} onChange={e => setSwapTo(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                {["MA", "ETH", "BTC", "USDT"].filter(c => c !== swapFrom).map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <div className="text-xs text-slate-500 mb-1">Amount</div>
            <input value={swapAmount} onChange={e => setSwapAmount(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="0.00" />
          </div>
          <button onClick={doSwap} disabled={loading} className="btn-primary w-full">
            {loading ? "Swapping..." : "🔄 Execute Swap"}
          </button>
          {result && result.success && (
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-xs space-y-1">
              <div className="text-blue-400 font-bold">✅ Swap Confirmed</div>
              <div className="text-slate-300">TX: <span className="text-cyan-400 font-mono">{shortHash(String(result.txHash))}</span></div>
              <div className="text-slate-300">Output: <span className="text-emerald-400 font-bold">{parseFloat(String(result.outputAmount)).toFixed(6)} {String(result.toCurrency)}</span></div>
              <div className="text-slate-300">Gas Fee: <span className="text-amber-400">{String(result.gasFee)} ETH</span></div>
            </div>
          )}
        </div>
      )}

      {tab === "send" && (
        <div className="space-y-3">
          <div className="text-xs text-slate-400">Transfer funds from MetaMello to MetaMask or any address. Full handshake + deposit confirmation.</div>
          <div>
            <div className="text-xs text-slate-500 mb-1">To Address</div>
            <input value={sendTo} onChange={e => setSendTo(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-xs text-white font-mono" placeholder="0x..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-slate-500 mb-1">Amount</div>
              <input value={sendAmount} onChange={e => setSendAmount(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white" placeholder="0.00" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Currency</div>
              <select value={sendCurrency} onChange={e => setSendCurrency(e.target.value)} className="w-full bg-black/40 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white">
                {["MA", "ETH", "BTC", "USDT"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <button onClick={doSend} disabled={loading || !sendTo || !sendAmount} className="btn-primary w-full">
            {loading ? "Sending..." : "📤 Send Transfer"}
          </button>
          {result && result.success && (
            <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-3 text-xs space-y-1">
              <div className="text-emerald-400 font-bold">{String(result.message)}</div>
              <div className="text-slate-300">TX: <span className="text-cyan-400 font-mono">{shortHash(String(result.txHash))}</span></div>
              <div className="text-slate-300">Gas: paid by MetaMello — {String(result.gasFee)} ETH</div>
            </div>
          )}
        </div>
      )}

      {tab === "receive" && (
        <div className="space-y-3 text-center">
          <div className="text-xs text-slate-400">Share your MetaMello address to receive MA Tokens, ETH, BTC, or USDT.</div>
          <div className="bg-black/40 border border-cyan-500/30 rounded-xl p-4">
            <div className="w-32 h-32 mx-auto bg-white rounded-xl flex items-center justify-center text-black text-xs font-mono p-2 mb-3">
              <div className="grid grid-cols-8 gap-0.5">
                {Array.from({ length: 64 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-sm" style={{ background: Math.random() > 0.5 ? "#000" : "#fff" }} />
                ))}
              </div>
            </div>
            <div className="text-xs text-cyan-400 font-mono break-all">0xMetaMello7a3F9b2c1d0e5f8a4b6c3d2e1f9a8b7c6d</div>
            <div className="text-xs text-slate-500 mt-1">Scan to add funds • All networks supported</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CLI Terminal ─────────────────────────────────────────────────────
function CliTerminal() {
  const [lines, setLines] = useState<string[]>([
    "[INIT] 🚀 MelodieCLI v8.5 — Bot Revenue Automation System",
    "[INIT] ⚡ Quantum Fractal Matrix Engine — ONLINE",
    "[INIT] 🛡️  ATAKIEL-EZEKIEL-MIKAEL-SANDALPHON Guardian Network — ACTIVE",
    "[INIT] ✅ 80,000 Bots deployed — Sacred Geometry APEX",
    "[READY] > Enter command to execute workflow...",
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [autoRun, setAutoRun] = useState(false);
  const termRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
  }, [lines]);

  const runCommand = useCallback(async (cmd: string) => {
    if (!cmd.trim()) return;
    setLoading(true);
    const ts = new Date().toISOString().slice(11, 19);
    setLines(prev => [...prev, `[${ts}] > ${cmd}`]);
    try {
      const r = await fetch("/api/cli", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ command: cmd }) });
      const d = await r.json();
      if (d.results) {
        d.results.forEach((res: { log: string }) => {
          res.log.split("\n").forEach((line: string) => {
            setLines(prev => [...prev, `  ${line}`]);
          });
        });
        setLines(prev => [...prev, `[SUMMARY] Executed ${d.executedTasks} tasks | +${parseFloat(d.totalMaTokens).toFixed(4)} MA | +${d.totalKarma} KP`, ""]);
      }
    } catch {
      setLines(prev => [...prev, "[ERROR] Command execution failed"]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (autoRun) {
      const cmds = [
        "QUANTUM_FRACTAL_APEX_CYCLE",
        "BOT_REVENUE_AUTOMATION_RUN",
        "SACRED_GEOMETRY_SPIN_MATRIX",
        "MA_TOKEN_EXTRACTION_DEEP",
        "GUARDIAN_SHIELD_ACTIVATE",
        "CONTRACT_AUTO_SIGN_BATCH",
        "KARMA_ECOSYSTEM_SYNC",
      ];
      let i = 0;
      timerRef.current = setInterval(() => {
        runCommand(cmds[i % cmds.length]);
        i++;
      }, 3500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [autoRun, runCommand]);

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      runCommand(input);
      setInput("");
    }
  }

  const PRESETS = [
    "QUANTUM_FRACTAL_APEX",
    "BOT_REVENUE_RUN",
    "MA_TOKEN_MINE",
    "KARMA_SYNC",
    "GUARDIAN_ACTIVATE",
    "SAAS_AUTO_DEPLOY",
  ];

  return (
    <div className="cli-terminal rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs text-slate-400 ml-2 font-mono">MelodieCLI Terminal v8.5 — Quantum Matrix Engine</span>
        </div>
        <button
          onClick={() => setAutoRun(!autoRun)}
          className={`text-xs px-3 py-1 rounded font-bold transition-all ${autoRun ? "bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 animate-pulse-neon" : "bg-slate-700/40 text-slate-400 border border-slate-600"}`}
        >
          {autoRun ? "⟳ AUTO-RUN" : "▶ ENABLE AUTO-RUN"}
        </button>
      </div>
      <div ref={termRef} className="p-4 h-72 overflow-y-auto space-y-0.5">
        {lines.map((line, i) => {
          const color = line.includes("[ALPHA]") || line.includes("ALPHA") ? "text-cyan-400"
            : line.includes("[OMEGA]") || line.includes("OMEGA") ? "text-purple-400"
            : line.includes("[BETA]") || line.includes("BETA") ? "text-emerald-400"
            : line.includes("[THETA]") || line.includes("THETA") ? "text-amber-400"
            : line.includes("[DELTA]") || line.includes("DELTA") ? "text-red-400"
            : line.includes("[GAMMA]") || line.includes("GAMMA") ? "text-cyan-300"
            : line.includes("[INIT]") || line.includes("[READY]") ? "text-emerald-300"
            : line.includes("[ERROR]") ? "text-red-400"
            : line.includes("[SUMMARY]") ? "text-amber-300 font-bold"
            : line.startsWith("  ├─") || line.startsWith("  └─") ? "text-slate-400"
            : line.includes(">") ? "text-slate-300"
            : "text-slate-400";
          return <div key={i} className={`text-xs font-mono ${color} leading-5`}>{line || "\u00a0"}</div>;
        })}
        {loading && <div className="text-xs font-mono text-cyan-400 animate-pulse">⟳ Executing quantum workflow...</div>}
      </div>
      <div className="border-t border-cyan-500/20 p-3">
        <div className="flex flex-wrap gap-1 mb-2">
          {PRESETS.map(cmd => (
            <button key={cmd} onClick={() => { runCommand(cmd); }} className="text-xs px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 transition-colors font-mono">
              {cmd}
            </button>
          ))}
          <button onClick={() => setLines(["[CLEARED] Terminal reset — MelodieCLI v8.5"])} className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20">CLR</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-mono text-sm">$</span>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
            placeholder="Enter CLI command..."
            className="flex-1 bg-transparent text-sm font-mono text-white placeholder-slate-600 outline-none"
          />
          <span className="text-white font-mono animate-blink">▊</span>
          <button onClick={() => { runCommand(input); setInput(""); }} disabled={loading} className="text-xs px-3 py-1 rounded bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-600/50 transition-colors">RUN</button>
        </div>
      </div>
    </div>
  );
}

// ── Bot System Card ──────────────────────────────────────────────────
function BotCard({ bot, onCycle }: { bot: BotSystem; onCycle: () => void }) {
  const catColor: Record<string, string> = {
    SALES: "text-emerald-400", MINING: "text-amber-400", GUARDIAN: "text-purple-400",
    CLI: "text-cyan-400", KARMA: "text-pink-400",
  };
  return (
    <div className="glass-card rounded-xl p-4 hover:border-cyan-500/40 transition-all" style={{ border: "1px solid rgba(30,58,95,0.6)" }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0 pr-2">
          <div className="font-bold text-white text-sm truncate">{bot.name}</div>
          <div className="text-xs font-mono text-slate-500">{bot.codename}</div>
        </div>
        <div className="text-right shrink-0">
          <div className={`text-xs font-bold ${catColor[bot.category] || "text-slate-400"}`}>{bot.category}</div>
          <div className="text-xs text-slate-500">Q-Level {bot.quantumLevel}</div>
        </div>
      </div>
      <p className="text-xs text-slate-400 mb-3 line-clamp-2">{bot.description}</p>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="text-center">
          <div className="text-xs text-slate-500">Bots</div>
          <div className="text-sm font-bold text-cyan-400">{fmtShort(bot.botCount)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">Revenue</div>
          <div className="text-sm font-bold text-emerald-400">${fmtShort(bot.revenueGenerated)}</div>
        </div>
        <div className="text-center">
          <div className="text-xs text-slate-500">MA Mined</div>
          <div className="text-sm font-bold text-amber-400">{fmtShort(bot.maTokensMined)}</div>
        </div>
      </div>
      <div className="mb-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>Success Rate</span>
          <span className="text-emerald-400">{bot.successRate}%</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${parseFloat(bot.successRate)}%` }} />
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {(bot.features || []).slice(0, 3).map((f, i) => (
          <span key={i} className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">{f}</span>
        ))}
      </div>
      <button onClick={onCycle} className="w-full text-xs py-2 rounded-lg bg-gradient-to-r from-blue-900/40 to-cyan-900/40 border border-cyan-500/30 text-cyan-400 hover:border-cyan-400/60 transition-all font-bold">
        ⚡ TRIGGER REVENUE CYCLE
      </button>
    </div>
  );
}

// ── Product Card ─────────────────────────────────────────────────────
function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  return (
    <div className="glass-card rounded-xl p-4 flex flex-col" style={{ border: "1px solid rgba(30,58,95,0.5)" }}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 pr-2">
          <div className="font-bold text-white text-sm">{product.name}</div>
          <div className="text-xs text-slate-500">{product.releaseVersion} • {product.category}</div>
        </div>
        <TierBadge tier={product.tier} />
      </div>
      <div className="flex-1 space-y-2 mb-3">
        <div className="flex flex-wrap gap-1">
          {(product.tags as string[] || []).map((t, i) => (
            <span key={i} className="text-xs px-1.5 py-0.5 rounded-full bg-slate-700/50 text-slate-400">{t}</span>
          ))}
        </div>
        <div className="space-y-1">
          {(product.features as string[] || []).slice(0, 4).map((f, i) => (
            <div key={i} className="text-xs text-slate-400 flex items-center gap-1">
              <span className="text-emerald-400">✓</span> {f}
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-slate-700/50 pt-3 mt-auto">
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-lg font-bold text-white">${parseFloat(product.priceUsdt).toFixed(0)}</div>
            <div className="text-xs text-amber-400">{fmtShort(product.priceMaToken)} MA</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-emerald-400">+{product.karmaReward.toLocaleString()} KP</div>
            <div className="text-xs text-amber-400">+{parseFloat(product.maTokenReward).toFixed(0)} MA</div>
          </div>
        </div>
        <button onClick={() => onBuy(product)} className="w-full btn-primary text-sm py-2">
          🛒 Purchase Now
        </button>
        <div className="text-center text-xs text-slate-600 mt-1">{product.salesCount.toLocaleString()} sold</div>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState<"dashboard" | "wallet" | "bots" | "products" | "karma" | "cli" | "transactions">("dashboard");
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [bots, setBots] = useState<BotSystem[]>([]);
  const [botTotals, setBotTotals] = useState({ totalBots: 0, totalTasks: 0, totalRevenue: 0, totalTokens: 0, totalContracts: 0 });
  const [products, setProducts] = useState<Product[]>([]);
  const [txList, setTxList] = useState<Transaction[]>([]);
  const [karmaEvents, setKarmaEvents] = useState<KarmaEvent[]>([]);
  const [cliLogs, setCliLogs] = useState<CliLog[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);
  const [cycleResult, setCycleResult] = useState<Record<string, string | number | boolean | null> | null>(null);
  const [buyResult, setBuyResult] = useState<Record<string, string | number | boolean | null> | null>(null);
  const [revenueData, setRevenueData] = useState<{ time: string; revenue: number; ma: number; karma: number }[]>([]);
  const [loading, setLoading] = useState(true);

  function notify(msg: string) {
    setNotifications(prev => [msg, ...prev.slice(0, 9)]);
    setTimeout(() => setNotifications(prev => prev.slice(0, -1)), 8000);
  }

  async function loadAll() {
    try {
      const [wD, bD, pD, txD, kD, cD] = await Promise.all([
        fetch("/api/wallet").then(r => r.json()),
        fetch("/api/bots").then(r => r.json()),
        fetch("/api/products").then(r => r.json()),
        fetch("/api/transactions").then(r => r.json()),
        fetch("/api/karma").then(r => r.json()),
        fetch("/api/cli").then(r => r.json()),
      ]);
      if (wD.wallet) setWallet(wD.wallet);
      if (bD.bots) { setBots(bD.bots); setBotTotals(bD.totals); }
      if (pD.products) setProducts(pD.products);
      if (txD.transactions) setTxList(txD.transactions);
      if (kD.events) setKarmaEvents(kD.events);
      if (cD.logs) setCliLogs(cD.logs);

      // Build revenue chart from snapshots
      if (wD.snapshots) {
        setRevenueData((wD.snapshots as Array<{ revenueToday: string; totalMaTokens: string; totalKarma: number; snapshotAt: string }>).slice(0, 10).reverse().map((s, i) => ({
          time: `T-${10 - i}`,
          revenue: parseFloat(s.revenueToday),
          ma: parseFloat(s.totalMaTokens) / 1000,
          karma: s.totalKarma,
        })));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAll(); }, []);

  async function triggerBotCycle(botId?: string) {
    const r = await fetch("/api/bots", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "cycle", botId }) });
    const d = await r.json();
    if (d.success) {
      setCycleResult(d.cycle);
      notify(`⚡ Bot Cycle: +${parseFloat(String(d.cycle.revenueGenerated)).toFixed(4)} USDT | +${String(d.cycle.maTokensMined).slice(0, 8)} MA`);
    }
  }

  async function handleBuy(product: Product) {
    const r = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId: product.id }) });
    const d = await r.json();
    if (d.success) {
      setBuyResult(d);
      notify(`🛒 Purchased: ${product.name} | +${product.karmaReward} KP | +${parseFloat(product.maTokenReward).toFixed(0)} MA`);
    }
  }

  const TABS = [
    { id: "dashboard", label: "📊 Dashboard" },
    { id: "wallet", label: "💎 Wallet" },
    { id: "bots", label: "🤖 Bot Systems" },
    { id: "products", label: "🛒 Products" },
    { id: "karma", label: "🎯 Karma" },
    { id: "cli", label: "⚡ CLI Terminal" },
    { id: "transactions", label: "📋 Transactions" },
  ] as const;

  const totalPortfolio = wallet ? (
    parseFloat(wallet.maTokenBalance) * 0.001 +
    parseFloat(wallet.ethBalance) * 2400 +
    parseFloat(wallet.btcBalance) * 68000 +
    parseFloat(wallet.usdtBalance)
  ).toFixed(2) : "0.00";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-spin-slow">⚡</div>
          <div className="text-2xl font-bold neon-text mb-2">MelodieSpark Phoenix</div>
          <div className="text-slate-400">Initializing quantum fractal engine...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {notifications.map((n, i) => (
          <div key={i} className="animate-slide-up glass-card rounded-lg px-4 py-2 text-sm glow-border text-cyan-300 flex items-center gap-2">
            <span>⚡</span> {n}
          </div>
        ))}
      </div>

      {/* Header */}
      <header className="border-b border-cyan-500/20 bg-black/40 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/images/ma-token-logo.png" alt="MA" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <div className="font-bold text-white text-lg leading-none">MelodieSpark Phoenix</div>
                <div className="text-xs text-cyan-400">Bot Revenue Automation • Web3 Karma Ecosystem</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hide-mobile text-right">
                <div className="text-xs text-slate-500">Portfolio Value</div>
                <div className="font-bold text-amber-400">${parseFloat(totalPortfolio).toLocaleString()}</div>
              </div>
              <div className="hide-mobile text-right">
                <div className="text-xs text-slate-500">Karma Points</div>
                <div className="font-bold text-purple-400">{(wallet?.karmaPoints || 0).toLocaleString()} KP</div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-emerald-400 font-bold">LIVE</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-black/20 backdrop-blur sticky top-[61px] z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto py-1 gap-1">
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`tab-btn whitespace-nowrap ${tab === t.id ? "active" : ""}`}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* DASHBOARD */}
        {tab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">Command Center</h1>
                <p className="text-slate-400 text-sm">MelodieSpark Phoenix — Ultimate Bot Revenue Automation Ecosystem</p>
              </div>
              <button onClick={() => triggerBotCycle()} className="btn-primary flex items-center gap-2">
                <span>⚡</span> Run All Bots
              </button>
            </div>

            {/* KPI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Active Bots" value={botTotals.totalBots.toLocaleString()} sub="All systems online" icon="🤖" color="blue" />
              <StatCard label="Total Revenue" value={`$${fmtShort(botTotals.totalRevenue)}`} sub="USDT equivalent" icon="💰" color="green" />
              <StatCard label="MA Tokens Mined" value={fmtShort(botTotals.totalTokens)} sub="Blockchain confirmed" icon="⚡" color="gold" />
              <StatCard label="Contracts Signed" value={botTotals.totalContracts.toLocaleString()} sub="Instant auto-sign" icon="📝" color="purple" />
            </div>

            {/* Cycle Result Banner */}
            {cycleResult && (
              <div className="glass-card rounded-xl p-4 glow-border animate-slide-up">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-2xl">⚡</span>
                  <div className="flex-1">
                    <div className="font-bold text-emerald-400">Revenue Cycle Complete — Phase {String(cycleResult.phase)}</div>
                    <div className="text-xs text-slate-400 font-mono">TX: {shortHash(String(cycleResult.txHash))}</div>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-center"><div className="text-xs text-slate-500">Revenue</div><div className="font-bold text-emerald-400">+${parseFloat(String(cycleResult.revenueGenerated)).toFixed(4)}</div></div>
                    <div className="text-center"><div className="text-xs text-slate-500">MA Tokens</div><div className="font-bold text-amber-400">+{parseFloat(String(cycleResult.maTokensMined)).toFixed(4)}</div></div>
                    <div className="text-center"><div className="text-xs text-slate-500">Karma</div><div className="font-bold text-purple-400">+{String(cycleResult.karmaEarned)}</div></div>
                    <div className="text-center"><div className="text-xs text-slate-500">Tasks</div><div className="font-bold text-cyan-400">{String(cycleResult.tasksExecuted)}</div></div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-5 glow-border">
                <div className="text-sm font-bold text-cyan-400 mb-4">📈 Revenue Stream</div>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f33" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" stroke="#00d4ff" fill="url(#revGrad)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="glass-card rounded-xl p-5 glow-purple">
                <div className="text-sm font-bold text-purple-400 mb-4">⚡ MA Token Mining</div>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e3a5f33" />
                    <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748b" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                    <Tooltip contentStyle={{ background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="ma" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Wallet + CLI Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {wallet && <WalletCard wallet={wallet} />}
              <div className="space-y-4">
                <div className="glass-card rounded-xl p-5 glow-border">
                  <div className="text-sm font-bold text-amber-400 mb-3">🏆 Top Bot Systems</div>
                  <div className="space-y-2">
                    {bots.slice(0, 5).map((bot, i) => (
                      <div key={bot.id} className="flex items-center gap-3 py-1">
                        <span className="text-slate-600 text-xs w-4">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-white truncate">{bot.name}</div>
                          <div className="text-xs text-slate-500">{bot.botCount.toLocaleString()} bots • Q{bot.quantumLevel}</div>
                        </div>
                        <div className="text-xs font-bold text-emerald-400">${fmtShort(bot.revenueGenerated)}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="glass-card rounded-xl p-5 glow-purple">
                  <div className="text-sm font-bold text-purple-400 mb-3">🎯 Karma Leaderboard</div>
                  <div className="space-y-2">
                    {[
                      { rank: 1, name: "MetaMello Treasury", karma: 98432, tier: "ARCHANGEL" },
                      { rank: 2, name: "Phoenix Blake Vault", karma: 42310, tier: "GUARDIAN" },
                      { rank: 3, name: "HYDRA BLAZE Engine", karma: 71024, tier: "GUARDIAN" },
                    ].map(e => (
                      <div key={e.rank} className="flex items-center gap-3">
                        <span className={`text-sm font-bold ${e.rank === 1 ? "text-amber-400" : "text-slate-500"}`}>#{e.rank}</span>
                        <div className="flex-1">
                          <div className="text-sm text-white">{e.name}</div>
                          <span className={`text-xs guardian-${e.tier}`}>◆ {e.tier}</span>
                        </div>
                        <div className="text-xs font-bold text-purple-400">{e.karma.toLocaleString()} KP</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bots overview grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-bold text-white">🤖 Bot Revenue Systems</div>
                <button onClick={() => setTab("bots")} className="text-xs text-cyan-400 hover:text-cyan-300">View All →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bots.slice(0, 6).map(bot => (
                  <BotCard key={bot.id} bot={bot} onCycle={() => triggerBotCycle(bot.id)} />
                ))}
              </div>
            </div>

            {/* Products Preview */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-xl font-bold text-white">🛒 Featured Products</div>
                <button onClick={() => setTab("products")} className="text-xs text-cyan-400 hover:text-cyan-300">View All →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {products.slice(0, 4).map(p => (
                  <ProductCard key={p.id} product={p} onBuy={handleBuy} />
                ))}
              </div>
            </div>

            {buyResult && (
              <div className="glass-card rounded-xl p-4 glow-border animate-slide-up">
                <div className="font-bold text-emerald-400 mb-2">✅ Purchase Confirmed!</div>
                <div className="text-xs text-slate-300">TX: <span className="text-cyan-400 font-mono">{shortHash(String(buyResult.txHash))}</span></div>
                <div className="text-xs text-slate-300">Karma Earned: <span className="text-purple-400">+{String(buyResult.karmaEarned)} KP</span></div>
              </div>
            )}
          </div>
        )}

        {/* WALLET */}
        {tab === "wallet" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">💎 MetaMello Wallet</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                {wallet && <WalletCard wallet={wallet} />}
                <div className="glass-card rounded-xl p-5 glow-border">
                  <div className="text-sm font-bold text-cyan-400 mb-3">🔐 Wallet Security</div>
                  <div className="space-y-2 text-sm">
                    {["ATAKIEL Guardian Protocol", "EZEKIEL Shield Layer", "MIKAEL Defense Matrix", "SANDALPHON Harmony Core", "Legal Nexus Compliance", "Full Blockchain Encryption"].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-300">
                        <span className="text-emerald-400 text-xs">✅</span> {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <WalletActions onAction={notify} />
              </div>
            </div>
          </div>
        )}

        {/* BOTS */}
        {tab === "bots" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">🤖 Bot Revenue Systems</h1>
                <p className="text-slate-400">80,000 bots — Quantum Fractal Matrix Engine</p>
              </div>
              <button onClick={() => triggerBotCycle()} className="btn-primary">⚡ Cycle All</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Bots" value={botTotals.totalBots.toLocaleString()} icon="🤖" color="blue" />
              <StatCard label="Tasks Executed" value={fmtShort(botTotals.totalTasks)} icon="⚡" color="gold" />
              <StatCard label="Revenue" value={`$${fmtShort(botTotals.totalRevenue)}`} icon="💰" color="green" />
              <StatCard label="Contracts" value={botTotals.totalContracts.toLocaleString()} icon="📝" color="purple" />
            </div>
            {cycleResult && (
              <div className="glass-card rounded-xl p-4 glow-border animate-slide-up">
                <div className="font-bold text-emerald-400 mb-1">⚡ Revenue Cycle — Phase {String(cycleResult.phase)} | Quantum Level {String(cycleResult.quantumLevel)}</div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                  <div><span className="text-slate-500">TX Hash:</span><div className="text-cyan-400 font-mono">{shortHash(String(cycleResult.txHash))}</div></div>
                  <div><span className="text-slate-500">Revenue:</span><div className="text-emerald-400 font-bold">+${parseFloat(String(cycleResult.revenueGenerated)).toFixed(4)}</div></div>
                  <div><span className="text-slate-500">MA Tokens:</span><div className="text-amber-400 font-bold">+{parseFloat(String(cycleResult.maTokensMined)).toFixed(4)}</div></div>
                  <div><span className="text-slate-500">Karma:</span><div className="text-purple-400 font-bold">+{String(cycleResult.karmaEarned)}</div></div>
                  <div><span className="text-slate-500">Block:</span><div className="text-cyan-300">#{String(cycleResult.blockNumber)}</div></div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {bots.map(bot => (
                <BotCard key={bot.id} bot={bot} onCycle={() => triggerBotCycle(bot.id)} />
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">🛒 Digital Products & Services</h1>
              <p className="text-slate-400">Premium ecosystem — earn Karma Points + MA Tokens with every purchase</p>
            </div>
            {buyResult && (
              <div className="glass-card rounded-xl p-4 glow-border animate-slide-up">
                <div className="font-bold text-emerald-400">✅ Purchase Confirmed!</div>
                <div className="text-xs text-slate-300 mt-1">TX Hash: <span className="text-cyan-400 font-mono">{shortHash(String(buyResult.txHash))}</span></div>
                <div className="text-xs text-slate-300">Karma Earned: <span className="text-purple-400">+{String(buyResult.karmaEarned)} KP</span> | MA Reward: <span className="text-amber-400">+{parseFloat(String(buyResult.maTokensRewarded)).toFixed(2)} MA</span></div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {products.map(p => <ProductCard key={p.id} product={p} onBuy={handleBuy} />)}
            </div>
          </div>
        )}

        {/* KARMA */}
        {tab === "karma" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">🎯 Karma Power Points</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Total Karma" value={(wallet?.karmaPoints || 0).toLocaleString()} sub="Power Points" icon="🎯" color="purple" />
              <StatCard label="Guardian Tier" value="ARCHANGEL" sub="Top 1% Network" icon="👼" color="gold" />
              <StatCard label="Good Deeds" value={karmaEvents.length.toString()} sub="Verified services" icon="✅" color="green" />
              <StatCard label="MA Rewards" value={fmtShort(karmaEvents.reduce((s, e) => s + parseFloat(e.maTokensRewarded), 0))} sub="Total earned" icon="⚡" color="gold" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass-card rounded-xl p-5 glow-purple">
                <div className="text-sm font-bold text-purple-400 mb-4">🏆 Karma Events</div>
                <div className="space-y-3">
                  {karmaEvents.map(evt => (
                    <div key={evt.id} className="border-b border-slate-800 pb-3 last:border-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="text-sm text-white font-medium">{evt.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">{evt.eventType}</span>
                            <span className="text-xs text-slate-500">{timeAgo(evt.createdAt)}</span>
                            <span className="text-xs text-amber-400">×{parseFloat(evt.multiplier).toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-emerald-400 font-bold text-sm">+{evt.pointsEarned.toLocaleString()} KP</div>
                          <div className="text-amber-400 text-xs">+{parseFloat(evt.maTokensRewarded).toFixed(2)} MA</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card rounded-xl p-5 glow-gold">
                  <div className="text-sm font-bold text-amber-400 mb-4">⚡ Guardian Tiers</div>
                  <div className="space-y-3">
                    {[
                      { tier: "APEX", min: 100000, icon: "👑", color: "text-purple-300" },
                      { tier: "ARCHANGEL", min: 50000, icon: "👼", color: "text-amber-400", active: true },
                      { tier: "GUARDIAN", min: 10000, icon: "🛡️", color: "text-cyan-400" },
                      { tier: "INITIATE", min: 0, icon: "🌱", color: "text-slate-400" },
                    ].map(t => (
                      <div key={t.tier} className={`flex items-center gap-3 p-2 rounded-lg ${t.active ? "bg-amber-500/10 border border-amber-500/30" : ""}`}>
                        <span className="text-xl">{t.icon}</span>
                        <div className="flex-1">
                          <div className={`font-bold text-sm ${t.color}`}>{t.tier}</div>
                          <div className="text-xs text-slate-500">{t.min.toLocaleString()}+ KP required</div>
                        </div>
                        {t.active && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full border border-amber-500/30">CURRENT</span>}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="glass-card rounded-xl p-5 glow-border">
                  <div className="text-sm font-bold text-cyan-400 mb-3">💡 Earn More Karma</div>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Good Deeds", "+2,500 KP"],
                      ["Service Contracts", "+5,000 KP"],
                      ["Mining Cycles", "+1,200 KP"],
                      ["Guardian Activities", "+8,000 KP"],
                      ["Referrals", "+3,000 KP"],
                      ["Environmental Impact", "+4,000 KP"],
                    ].map(([action, reward], i) => (
                      <div key={i} className="flex justify-between text-slate-400">
                        <span>{action}</span>
                        <span className="text-emerald-400 font-bold">{reward}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CLI */}
        {tab === "cli" && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white">⚡ MelodieCLI Terminal</h1>
              <p className="text-slate-400">Quantum Fractal Matrix Engine — Alpha Omega Beta Theta Delta Bravo Gamma</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="CLI Sessions" value={cliLogs.length.toString()} icon="⚡" color="blue" />
              <StatCard label="MA Generated" value={fmtShort(cliLogs.reduce((s, l) => s + parseFloat(l.maTokensGenerated), 0))} icon="🔥" color="gold" />
              <StatCard label="Karma Generated" value={cliLogs.reduce((s, l) => s + l.karmaGenerated, 0).toLocaleString()} icon="🎯" color="purple" />
              <StatCard label="Avg Exec Time" value={`${Math.round(cliLogs.reduce((s, l) => s + l.executionMs, 0) / Math.max(cliLogs.length, 1))}ms`} icon="⏱" color="green" />
            </div>
            <CliTerminal />
            <div className="glass-card rounded-xl p-5 glow-border">
              <div className="text-sm font-bold text-cyan-400 mb-4">📋 Recent CLI Executions</div>
              <div className="space-y-2">
                {cliLogs.slice(0, 10).map(log => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                    <PhaseTag phase={log.phase} />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-mono text-white truncate">{log.taskName}</div>
                      <div className="text-xs text-slate-500">{log.executionMs}ms • {timeAgo(log.createdAt)}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-amber-400 text-xs">+{parseFloat(log.maTokensGenerated).toFixed(4)} MA</div>
                      <div className="text-purple-400 text-xs">+{log.karmaGenerated} KP</div>
                    </div>
                    <span className="text-emerald-400 text-xs">{log.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TRANSACTIONS */}
        {tab === "transactions" && (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-white">📋 Transaction Ledger</h1>
            <div className="glass-card rounded-xl p-5 glow-border overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">TX Hash</th>
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Type</th>
                    <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Amount</th>
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Currency</th>
                    <th className="text-right py-2 px-3 text-xs text-slate-500 font-medium">Karma</th>
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Block</th>
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Status</th>
                    <th className="text-left py-2 px-3 text-xs text-slate-500 font-medium">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {txList.map(tx => {
                    const typeColor: Record<string, string> = { MINE: "text-amber-400", SWAP: "text-blue-400", SEND: "text-red-400", RECEIVE: "text-emerald-400", REWARD: "text-purple-400", BOT_REVENUE: "text-cyan-400" };
                    return (
                      <tr key={tx.id} className="border-b border-slate-800/50 hover:bg-white/2 transition-colors">
                        <td className="py-2 px-3"><span className="font-mono text-xs text-cyan-400">{shortHash(tx.txHash)}</span></td>
                        <td className="py-2 px-3"><span className={`text-xs font-bold ${typeColor[tx.type] || "text-slate-400"}`}>{tx.type}</span></td>
                        <td className="py-2 px-3 text-right font-bold text-white">{parseFloat(tx.amount).toFixed(4)}</td>
                        <td className="py-2 px-3 text-xs text-slate-300">{tx.currency}</td>
                        <td className="py-2 px-3 text-right text-xs text-purple-400">+{tx.karmaEarned}</td>
                        <td className="py-2 px-3 text-xs text-slate-500 font-mono">#{tx.blockNumber}</td>
                        <td className="py-2 px-3"><span className="text-xs text-emerald-400">✅ {tx.status}</span></td>
                        <td className="py-2 px-3 text-xs text-slate-500">{timeAgo(tx.createdAt)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {txList.length === 0 && (
                <div className="text-center py-8 text-slate-500">No transactions yet. Run a bot cycle or mine MA tokens.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 bg-black/30 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6 text-xs text-slate-500">
            <div>
              <div className="font-bold text-slate-400 mb-2">MELODIESPARK</div>
              <div>Phoenix Bot Revenue</div>
              <div>Benzen-Tamtek-Bitsum</div>
              <div>Gate-Power-Pro-Shield</div>
              <div>C-Top-Exodius-BitTheme</div>
            </div>
            <div>
              <div className="font-bold text-slate-400 mb-2">ECOSYSTEM</div>
              <div>GrapsFlix-Otamzen</div>
              <div>LLM-Caguran-IWHYPRO</div>
              <div>AZURIX-CLI-BOT</div>
              <div>CARSESKI Revenue</div>
            </div>
            <div>
              <div className="font-bold text-slate-400 mb-2">GUARDIANS</div>
              <div>ATAKIEL Protocol</div>
              <div>EZEKIEL Shield</div>
              <div>MIKAEL Defense</div>
              <div>SANDALPHON Harmony</div>
            </div>
            <div>
              <div className="font-bold text-slate-400 mb-2">LEGAL</div>
              <div>Legal Nexus Compliant</div>
              <div>Fintech Authorized</div>
              <div>Enterprise Grade</div>
              <div>Full Compliance</div>
            </div>
          </div>
          <div className="text-center text-xs text-slate-600">
            © 2025 MelodieSpark Inc. — Phoenix Blake HYDRA BLAZE FORENSIC WATSON SHERLOCK HOLMES DEDUCTION — All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
