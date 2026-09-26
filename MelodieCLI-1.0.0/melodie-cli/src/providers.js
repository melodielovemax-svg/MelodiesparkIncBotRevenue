import { config, vaultRead, hasSecret } from "./core.js";
import * as openrouterAdapter from "./adapters/openrouter.js";
import * as ollamaAdapter from "./adapters/ollama.js";
import * as openaiAdapter from "./adapters/openai-cli.js";
import * as claudeAdapter from "./adapters/claude-cli.js";
import * as geminiAdapter from "./adapters/gemini-cli.js";
import * as antigravityAdapter from "./adapters/antigravity-cli.js";

const defs = {
  antigravity: {
    label: "Antigravity",
    kind: "cli",
    executableKey: "antigravity",
    auth: "agy uses Google Sign-In/system keyring or GEMINI_API_KEY; Melodie does not capture passwords.",
    adapter: antigravityAdapter
  },
  gemini: {
    label: "Gemini CLI",
    kind: "cli",
    executableKey: "gemini",
    auth: "Google Sign-In or GEMINI_API_KEY.",
    adapter: geminiAdapter
  },
  claude: {
    label: "Claude",
    kind: "cli",
    executableKey: "claude",
    auth: "Use the installed Claude CLI's official browser/OAuth or API-key flow.",
    adapter: claudeAdapter
  },
  openai: {
    label: "OpenAI/Codex",
    kind: "cli",
    executableKey: "openai",
    auth: "Use Codex's official login or OPENAI_API_KEY.",
    adapter: openaiAdapter
  },
  openrouter: {
    label: "OpenRouter",
    kind: "api",
    auth: "OPENROUTER_API_KEY",
    adapter: openrouterAdapter
  },
  ollama: {
    label: "Ollama",
    kind: "api",
    auth: "Local HTTP endpoint; no cloud credential required.",
    adapter: ollamaAdapter
  }
};

export function providers() {
  const c = config();
  return Object.entries(defs).map(([id, d]) => ({
    id,
    label: d.label,
    kind: d.kind,
    executable: d.executableKey ? (c.executables?.[d.executableKey] || d.executableKey) : null,
    authenticated: id === "ollama" || hasSecret(id) || Boolean(id === "openrouter" && process.env.OPENROUTER_API_KEY),
    auth: d.auth
  }));
}

export async function listModels(provider) {
  if (provider === "ollama") {
    const list = await ollamaAdapter.listModels();
    return list.map(m => m.id);
  }
  if (provider === "openrouter") {
    const key = vaultRead().openrouter || process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error("Not authenticated: use `melodie auth set openrouter <KEY>` or set OPENROUTER_API_KEY.");
    }
    const list = await openrouterAdapter.listModels(key);
    return list.map(m => m.id);
  }
  return [];
}

export async function runAgent(provider, prompt, options = {}) {
  const c = config();
  if (provider === "ollama") {
    return await ollamaAdapter.run(prompt, options);
  }
  if (provider === "openrouter") {
    const key = vaultRead().openrouter || process.env.OPENROUTER_API_KEY;
    if (!key) {
      throw new Error("Not authenticated: use `melodie auth set openrouter <KEY>` or set OPENROUTER_API_KEY.");
    }
    return await openrouterAdapter.run(prompt, options, key);
  }

  const def = defs[provider];
  if (!def) throw new Error(`Unknown provider: ${provider}`);
  const exe = c.executables?.[def.executableKey] || def.executableKey;
  if (!exe) throw new Error(`No executable configured for ${provider}`);

  if (def.adapter?.run) {
    return await def.adapter.run(prompt, options, exe);
  }
  throw new Error(`No execution adapter implemented for provider '${provider}'`);
}

export async function providerStatus(provider) {
  if (provider === "ollama") {
    try {
      const reachable = await ollamaAdapter.isServerReachable();
      const m = await ollamaAdapter.listModels();
      const healthyCount = m.filter(x => x.healthy).length;
      return { ok: reachable, totalModels: m.length, healthyModels: healthyCount };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }
  if (provider === "openrouter") {
    const key = vaultRead().openrouter || process.env.OPENROUTER_API_KEY;
    const health = openrouterAdapter.checkHealth(key);
    return { ok: health.healthy, ...health };
  }
  const c = config();
  const def = defs[provider];
  const exe = c.executables?.[def?.executableKey] || def?.executableKey;
  return { configured: Boolean(exe), authenticated: hasSecret(provider), executable: exe };
}
