import { db } from "@/db";
import { providers, models } from "@/db/schema";

export const dynamic = "force-dynamic";
import { eq, sql } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { CheckCircle2, XCircle, Server, ExternalLink } from "lucide-react";

async function getProviders() {
  return db
    .select({
      id: providers.id,
      name: providers.name,
      displayName: providers.displayName,
      baseUrl: providers.baseUrl,
      isConfigured: providers.isConfigured,
      isReachable: providers.isReachable,
      lastCheckedAt: providers.lastCheckedAt,
      modelCount: sql<number>`count(${models.id})::int`,
    })
    .from(providers)
    .leftJoin(models, eq(models.providerId, providers.id))
    .groupBy(providers.id)
    .orderBy(providers.displayName);
}

const PROVIDER_DESCRIPTIONS: Record<string, string> = {
  openrouter:
    "Unified API gateway to 200+ models. One key to access GPT-4, Claude, Mistral, and more. Dynamic routing with OpenRouter Auto.",
  openai:
    "OpenAI direct integration. Access GPT-4o, GPT-4 Turbo, and GPT-3.5 with native tool calling and function support.",
  anthropic:
    "Anthropic Claude models. Claude 3 Opus/Sonnet/Haiku with 200k context, strong coding and reasoning capabilities.",
  google:
    "Google Gemini models. Gemini 1.5 Pro with 1M context window, multimodal inputs, and native tool use.",
  mistral:
    "Mistral AI models. Mistral Large, Mistral Medium, and Mistral 8x7B with strong coding performance.",
  local:
    "Local Ollama instance. Run models like Llama 3, Mistral, and CodeLlama completely offline.",
  generic:
    "Any OpenAI-compatible API endpoint. Connect to custom or self-hosted model servers.",
};

const PROVIDER_ENV: Record<string, string> = {
  openrouter: "OPENROUTER_API_KEY",
  openai: "OPENAI_API_KEY",
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_API_KEY",
  mistral: "MISTRAL_API_KEY",
  local: "LOCAL_BASE_URL",
};

export default async function ProvidersPage() {
  const rows = await getProviders();

  return (
    <div>
      <PageHeader
        title="Provider Registry"
        subtitle="LLM provider adapters — configure API keys to activate"
        breadcrumb="melodiespark-agent providers"
      />

      <div className="grid grid-cols-2 gap-4">
        {rows.map((p) => (
          <div
            key={p.id}
            className={`bg-[#161b22] border rounded-xl p-5 transition-colors ${
              p.isConfigured
                ? "border-emerald-500/20 hover:border-emerald-500/30"
                : "border-white/5 hover:border-white/10"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    p.isConfigured ? "bg-emerald-500/10" : "bg-white/5"
                  }`}
                >
                  <Server
                    size={15}
                    className={
                      p.isConfigured ? "text-emerald-400" : "text-slate-500"
                    }
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {p.displayName}
                  </h3>
                  <p className="text-xs font-mono text-slate-500">{p.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {p.isConfigured ? (
                  <div className="flex items-center gap-1.5 bg-emerald-500/10 px-2 py-1 rounded">
                    <CheckCircle2 size={11} className="text-emerald-400" />
                    <span className="text-[10px] font-mono text-emerald-400">
                      CONFIGURED
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-slate-500/10 px-2 py-1 rounded">
                    <XCircle size={11} className="text-slate-500" />
                    <span className="text-[10px] font-mono text-slate-500">
                      NOT SET
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {PROVIDER_DESCRIPTIONS[p.name ?? ""] ?? "No description available."}
            </p>

            <div className="space-y-2">
              {p.baseUrl && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600 font-mono">
                    Base URL
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {p.baseUrl}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-mono">
                  Env var
                </span>
                <span className="text-xs font-mono text-amber-400">
                  {PROVIDER_ENV[p.name ?? ""] ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600 font-mono">
                  Models
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {p.modelCount} registered
                </span>
              </div>
            </div>

            {!p.isConfigured && (
              <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-600 font-mono">
                  Set{" "}
                  <span className="text-amber-500">
                    {PROVIDER_ENV[p.name ?? ""] ?? "API_KEY"}
                  </span>{" "}
                  in your .env file to activate this provider.
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Architecture diagram */}
      <div className="mt-8 bg-[#161b22] border border-white/5 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Provider Abstraction Layer
        </h2>
        <div className="font-mono text-xs text-slate-400 bg-[#0d1117] rounded-lg p-4 overflow-x-auto">
          <pre>{`                  ┌──────────────────────┐
                  │    Agent Runtime     │
                  └──────────┬───────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
     OpenRouter           OpenAI             Local
          │                  │                  │
    ┌─────┴─────┐       GPT models       Ollama/etc.
    │           │
 GPT-4 Turbo  Mistral
 GPT-3.5      Auto
 MythoMax     ...`}</pre>
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Every model implements the same{" "}
          <span className="text-violet-400 font-mono">Agent</span> contract —
          the provider becomes a replaceable adapter. Swap models without
          rewriting the runtime.
        </p>
      </div>
    </div>
  );
}
