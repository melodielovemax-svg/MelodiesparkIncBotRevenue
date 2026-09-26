"use client";

import { CheckCircle2, Link2, ShieldCheck, Wallet } from "lucide-react";

const benefits = [
  "Connect any EVM, Solana, or Bitcoin wallet",
  "Pay-as-you-go with stablecoins or native tokens",
  "On-chain prompt attestations for verifiable AI",
  "Decentralized model provider marketplace",
];

export function Web3Section() {
  return (
    <section id="web3" className="relative overflow-hidden px-6 py-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-300">
            <Link2 className="h-4 w-4 text-cyan-400" />
            Blockchain Native
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight md:text-5xl">
            AI That Respects{" "}
            <span className="text-gradient">Your Sovereignty</span>
          </h2>
          <p className="mt-5 text-lg text-slate-400">
            MelodieGPT is built for the open web. Your data stays yours, your
            prompts are attested on-chain, and your payments settle instantly
            with zero intermediaries.
          </p>

          <ul className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                <span className="text-slate-300">{benefit}</span>
              </li>
            ))}
          </ul>

          <button className="mt-10 flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-fuchsia-500">
            <Wallet className="h-5 w-5" />
            Connect Wallet
          </button>
        </div>

        <div className="relative">
          <div className="glass glow-violet rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500">
                  <Wallet className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">0x7a3f...9c21</p>
                  <p className="text-xs text-slate-400">Ethereum Mainnet</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                Connected
              </span>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">Token Balance</p>
                <p className="mt-1 text-2xl font-bold text-white">12,450</p>
                <p className="text-xs text-slate-500">$MELODY</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-xs text-slate-400">Prompts Used</p>
                <p className="mt-1 text-2xl font-bold text-white">8,932</p>
                <p className="text-xs text-slate-500">This month</p>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4">
              <ShieldCheck className="h-8 w-8 text-cyan-400" />
              <div>
                <p className="text-sm font-semibold text-white">On-Chain Attestation</p>
                <p className="text-xs text-slate-400">Last prompt verified 12s ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
