export interface Model {
  id: string;
  name: string;
  provider: string;
  description: string;
  tags: Array<{ text: string; variant: "private" | "anon" | "new" | "discount" | "uncensored" | "locked" }>;
  icon: string;
  color: string;
  featured?: boolean;
}

export const models: Model[] = [
  {
    id: "auto",
    name: "Auto",
    provider: "MelodieGPT",
    description: "Selects the best model based on your prompt and context automatically.",
    tags: [],
    icon: "⚙️",
    color: "from-slate-500 to-slate-400",
    featured: true,
  },
  {
    id: "kimi-k3",
    name: "Kimi K3",
    provider: "Moonshot AI",
    description: "Long-context reasoning model with exceptional coding and analysis skills.",
    tags: [{ text: "Private", variant: "private" }],
    icon: "K",
    color: "from-violet-600 to-fuchsia-600",
  },
  {
    id: "claude-fable-51",
    name: "Claude Fable 5.1",
    provider: "Anthropic",
    description: "Creative storytelling and narrative generation at its finest.",
    tags: [
      { text: "New", variant: "new" },
      { text: "Anon", variant: "anon" },
    ],
    icon: "☀",
    color: "from-orange-500 to-amber-500",
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    provider: "Anthropic",
    description: "Deep reasoning, research, and complex agentic workflows.",
    tags: [{ text: "Anon", variant: "anon" }],
    icon: "◉",
    color: "from-orange-500 to-red-500",
  },
  {
    id: "claude-sonnet-46",
    name: "Claude Sonnet 4.6",
    provider: "Anthropic",
    description: "Balanced intelligence and speed for everyday tasks.",
    tags: [{ text: "Anon", variant: "anon" }],
    icon: "✺",
    color: "from-orange-400 to-rose-400",
  },
  {
    id: "deepseek-v41-flash",
    name: "DeepSeek V4.1 Flash",
    provider: "DeepSeek",
    description: "Blazing fast coding assistant with low latency responses.",
    tags: [
      { text: "New", variant: "new" },
      { text: "Private", variant: "private" },
    ],
    icon: "D",
    color: "from-cyan-500 to-blue-600",
  },
  {
    id: "gemini-38-flash",
    name: "Gemini 3.8 Flash",
    provider: "Google",
    description: "Multimodal flash model with native image and text understanding.",
    tags: [
      { text: "New", variant: "new" },
      { text: "50% off", variant: "discount" },
      { text: "Anon", variant: "anon" },
    ],
    icon: "G",
    color: "from-blue-500 to-indigo-500",
  },
  {
    id: "glm-53-flash",
    name: "GLM 5.3 Flash",
    provider: "Zhipu AI",
    description: "Efficient Chinese-English bilingual model for global conversations.",
    tags: [{ text: "Private", variant: "private" }],
    icon: "Z",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "glm-47-flash-heretic",
    name: "GLM 4.7 Flash Heretic",
    provider: "Zhipu AI",
    description: "Uncensored reasoning variant built for unrestricted research.",
    tags: [
      { text: "New", variant: "new" },
      { text: "Uncensored", variant: "uncensored" },
      { text: "Private", variant: "private" },
    ],
    icon: "Z",
    color: "from-emerald-600 to-lime-600",
  },
  {
    id: "glm-46",
    name: "GLM 4.6",
    provider: "Zhipu AI",
    description: "General-purpose large language model with strong benchmarks.",
    tags: [{ text: "Private", variant: "private" }],
    icon: "Z",
    color: "from-emerald-500 to-cyan-500",
  },
  {
    id: "google-gemma-4-31b",
    name: "Google Gemma 4 31B Instruct",
    provider: "Google",
    description: "Open-weight instruction-tuned model for flexible deployment.",
    tags: [{ text: "Private", variant: "private" }],
    icon: "G",
    color: "from-slate-400 to-slate-500",
  },
  {
    id: "gpt-6-astra",
    name: "GPT-6 Astra",
    provider: "OpenAI",
    description: "Frontier reasoning model with advanced coding and agent capabilities.",
    tags: [
      { text: "New", variant: "new" },
      { text: "Anon", variant: "anon" },
    ],
    icon: "🌀",
    color: "from-green-400 to-emerald-500",
    featured: true,
  },
  {
    id: "grok-46",
    name: "Grok 4.6",
    provider: "xAI",
    description: "Real-time, witty assistant with up-to-date knowledge access.",
    tags: [{ text: "Private", variant: "private" }],
    icon: "⚡",
    color: "from-red-500 to-orange-500",
  },
];
