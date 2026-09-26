"use client";

import { useState } from "react";
import { Send, Sparkles, User, Bot } from "lucide-react";

const demoMessages = [
  {
    role: "user",
    content: "Build a Solana smart contract that mints an NFT collection with royalties.",
  },
  {
    role: "model",
    content:
      "I'll generate a complete Anchor/Rust program for an NFT collection with creator royalties, plus the Metaplex token-metadata integration. Which model should I route this to?",
    model: "Auto → Claude Opus 5",
  },
];

export function ChatDemo() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState(demoMessages);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: input },
      {
        role: "model",
        content:
          "Processing through MelodieGPT's decentralized router. Routing to the optimal coding model for your request...",
        model: "Auto → GPT-6 Astra",
      },
    ]);
    setInput("");
  };

  return (
    <section id="chat" className="relative px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Try the <span className="text-gradient">Chat Interface</span>
          </h2>
          <p className="mt-4 text-slate-400">
            Type any prompt. MelodieGPT picks the best model automatically.
          </p>
        </div>

        <div className="glass glow-violet overflow-hidden rounded-3xl">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-white/5 bg-white/5 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">MelodieGPT Chat</p>
                <p className="text-xs text-slate-400">Model routing: Auto</p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              Live
            </div>
          </div>

          {/* Messages */}
          <div className="flex h-[420px] flex-col gap-5 overflow-y-auto bg-slate-950/40 px-6 py-6">
            {messages.map((msg, idx) =>
              msg.role === "user" ? (
                <div key={idx} className="flex items-end justify-end gap-3">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-3 text-sm text-white shadow-lg shadow-violet-600/20">
                    {msg.content}
                  </div>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700">
                    <User className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              ) : (
                <div key={idx} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-violet-500">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="max-w-[80%]">
                    <div className="rounded-2xl rounded-tl-md glass-card px-5 py-3 text-sm text-slate-200">
                      {msg.content}
                    </div>
                    {msg.model && (
                      <p className="mt-1.5 text-xs text-cyan-400">{msg.model}</p>
                    )}
                  </div>
                </div>
              )
            )}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-6 py-4"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about Web3, code, art, or trading..."
              className="flex-1 rounded-full border border-white/10 bg-slate-900/60 px-5 py-3 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <button
              type="submit"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/25 transition-all hover:scale-105"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
