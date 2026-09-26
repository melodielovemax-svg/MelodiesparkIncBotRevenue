import { vaultRead, hasSecret, config } from "./core.js";
import { getModelHealth as getOllamaModelHealth, isServerReachable as isOllamaReachable } from "./adapters/ollama.js";
import { findModel } from "./models.js";

export async function checkModelHealth(modelQuery) {
  const model = typeof modelQuery === "string" ? findModel(modelQuery) : modelQuery;

  if (!model) {
    return {
      id: modelQuery,
      provider: "unknown",
      discovered: false,
      available: false,
      healthy: false,
      executable: false,
      reason: "model_not_found"
    };
  }

  // 1. Check legacy models
  if (model.legacy || model.status === "catalog") {
    return {
      id: model.id,
      alias: model.alias,
      provider: model.provider,
      discovered: true,
      available: false,
      healthy: false,
      executable: false,
      reason: "legacy_paper_catalog",
      description: model.description
    };
  }

  // 2. Check Ollama models
  if (model.provider === "ollama") {
    const reachable = await isOllamaReachable();
    if (!reachable) {
      return {
        id: model.id,
        alias: model.alias,
        provider: "ollama",
        discovered: true,
        available: false,
        healthy: false,
        executable: false,
        reason: "ollama_server_offline"
      };
    }
    const health = await getOllamaModelHealth(model.id);
    return {
      alias: model.alias,
      ...health
    };
  }

  // 3. Check OpenRouter models
  if (model.provider === "openrouter") {
    const key = vaultRead().openrouter || process.env.OPENROUTER_API_KEY;
    if (!key) {
      return {
        id: model.id,
        alias: model.alias,
        provider: "openrouter",
        discovered: true,
        available: false,
        healthy: false,
        executable: false,
        reason: "missing_openrouter_api_key",
        resolution: "Run `melodie auth set openrouter <KEY>` or set OPENROUTER_API_KEY"
      };
    }
    return {
      id: model.id,
      alias: model.alias,
      provider: "openrouter",
      discovered: true,
      available: true,
      healthy: true,
      executable: true
    };
  }

  // 4. Check OpenAI models
  if (model.provider === "openai") {
    const key = vaultRead().openai || process.env.OPENAI_API_KEY;
    const c = config();
    const exe = c.executables?.openai || "codex";
    const hasAuth = Boolean(key) || hasSecret("openai");
    return {
      id: model.id,
      alias: model.alias,
      provider: "openai",
      discovered: true,
      available: hasAuth,
      healthy: hasAuth,
      executable: hasAuth,
      ...(!hasAuth ? { reason: "missing_openai_auth", resolution: "Run `melodie auth login openai` or set OPENAI_API_KEY" } : {})
    };
  }

  // Default fallback for other providers
  return {
    id: model.id,
    alias: model.alias,
    provider: model.provider,
    discovered: true,
    available: true,
    healthy: true,
    executable: true
  };
}
