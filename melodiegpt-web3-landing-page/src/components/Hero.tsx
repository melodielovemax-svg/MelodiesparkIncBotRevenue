"use client";

import { ArrowRight, Bot, Shield, Zap } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden px-6 pt-36 pb-24 md:pt-44 md:pb-32">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-cyan-600/15 blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative mx-auto flex max-w-7xl flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-sm font-medium text-slate-300 backdrop-blur-sm">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
          </span>
          Web3 Native AI Infrastructure
        </div>

        <h1 className="mt-8 max-w-4xl text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[1.05] tracking-tight">
          One Interface.{" "}
          <span className="text-gradient">Every Elite Model.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-400 md:text-xl">
          MelodieGPT is the decentralized chatbot that routes your prompts to the
          best AI models in the world — GPT-6 Astra, Claude Opus 5, Gemini 3.8
          Flash, Grok 4.6, and beyond.
        </p>

        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
          <button className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40">
            Start Chatting
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button className="rounded-full border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10">
            Explore Models
          </button>
        </div>

        <div className="mt-14 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { icon: Bot, label: "13+ Frontier Models", sub: "Always-on routing" },
            { icon: Shield, label: "Decentralized", sub: "Own your prompts" },
            { icon: Zap, label: "Auto Selection", sub: "Best model, every time" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="glass-card flex items-center gap-4 rounded-2xl p-4 text-left transition-transform hover:-translate-y-1"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-cyan-300">
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{stat.label}</p>
                <p className="text-xs text-slate-400">{stat.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
