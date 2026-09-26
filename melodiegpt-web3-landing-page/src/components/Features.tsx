"use client";

import { Code2, Cpu, Globe, Layers, MessageSquare, Wallet } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Model Router",
    description:
      "MelodieGPT analyzes your prompt and automatically selects the most capable model for the task.",
  },
  {
    icon: Code2,
    title: "Coding Agents",
    description:
      "Specialized agents for Solidity, Rust, Python, and JavaScript that write, review, and debug code.",
  },
  {
    icon: Wallet,
    title: "Wallet-Native Billing",
    description:
      "Pay per prompt with crypto. No subscriptions, no KYC — just connect your wallet and chat.",
  },
  {
    icon: Globe,
    title: "Decentralized Inference",
    description:
      "Queries are routed across a distributed network of inference providers for resilience and privacy.",
  },
  {
    icon: Layers,
    title: "Multi-Modal Support",
    description:
      "Upload images, documents, and code files. MelodieGPT delegates to vision and document models.",
  },
  {
    icon: MessageSquare,
    title: "Agent Marketplace",
    description:
      "Build and publish custom agents. Earn tokens when the community uses your agent.",
  },
];

export function Features() {
  return (
    <section id="features" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Built for <span className="text-gradient">Web3 Developers</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Everything you need to ship AI-powered dApps, agents, and smart contracts.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="glass-card group rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:border-violet-500/20 hover:shadow-xl hover:shadow-violet-500/10"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 text-cyan-300 transition-colors group-hover:from-violet-500 group-hover:to-cyan-500 group-hover:text-white">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-white">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
