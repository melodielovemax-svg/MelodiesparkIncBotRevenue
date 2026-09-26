import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, config, saveConfig } from "./core.js";
import { listModels as listOllamaModels } from "./adapters/ollama.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODELS_FILE = path.join(__dirname, "..", "config", "models.json");

export function getStaticCatalog() {
  const data = readJson(MODELS_FILE, { catalog: [] });
  return data.catalog || [];
}

export async function listModels(options = {}) {
  const catalog = getStaticCatalog();
  let models = [...catalog];

  // Optionally include discovered Ollama models
  if (!options.provider || options.provider === "ollama") {
    try {
      const ollamaModels = await listOllamaModels();
      for (const om of ollamaModels) {
        if (!models.some(m => m.id === om.id)) {
          models.push({
            id: om.id,
            alias: om.id.split(":")[0],
            name: `Ollama Local (${om.id})`,
            family: "Ollama",
            provider: "ollama",
            contextWindow: 4096,
            supportsTools: false,
            supportsStructuredOutput: false,
            legacy: false,
            status: om.healthy ? "active" : "unhealthy",
            discovered: om.discovered,
            available: om.available,
            healthy: om.healthy,
            executable: om.executable,
            ...(om.reason ? { reason: om.reason } : {}),
            description: `Local Ollama instance model (healthy: ${om.healthy})`
          });
        }
      }
    } catch {
      // Ollama not reachable, omit dynamic tags
    }
  }

  if (options.provider) {
    const prov = options.provider.toLowerCase();
    models = models.filter(m => m.provider.toLowerCase() === prov);
  }

  if (options.legacyOnly || (options.legacy === true && !options.all)) {
    models = models.filter(m => m.legacy === true);
  } else if (!options.legacy && !options.all) {
    // By default, list active/supported models unless --legacy or --all is passed
    models = models.filter(m => !m.legacy);
  }

  return models;
}

export function findModel(query) {
  if (!query) return null;
  const q = String(query).trim().toLowerCase();
  const catalog = getStaticCatalog();

  // 1. Exact alias or id match
  let found = catalog.find(m => m.alias.toLowerCase() === q || m.id.toLowerCase() === q);
  if (found) return found;

  // 2. Partial match on alias or id
  found = catalog.find(m => m.alias.toLowerCase().includes(q) || m.id.toLowerCase().includes(q));
  if (found) return found;

  // 3. Fallback for custom or direct model IDs (e.g. raw Ollama or OpenRouter ID)
  if (q.includes("/") || q.includes(":")) {
    const provider = q.startsWith("openrouter/") || q.startsWith("mistralai/") || q.startsWith("mancer/") || q.startsWith("undi95/") || q.startsWith("gryphe/")
      ? "openrouter"
      : (q.includes(":") ? "ollama" : "openrouter");
    return {
      id: query,
      alias: query,
      name: query,
      family: "Custom",
      provider,
      contextWindow: 4096,
      supportsTools: false,
      supportsStructuredOutput: false,
      legacy: false,
      status: "custom",
      description: "Direct user-specified model identifier"
    };
  }

  return null;
}

export function getActiveModel() {
  const c = config();
  const configuredId = c.defaultModel;
  if (configuredId) {
    const found = findModel(configuredId);
    if (found) return found;
    return {
      id: configuredId,
      alias: configuredId,
      name: configuredId,
      provider: c.defaultProvider || "openrouter",
      legacy: false,
      status: "custom"
    };
  }
  return findModel("auto") || {
    id: "openrouter/auto",
    alias: "auto",
    name: "OpenRouter Auto Router",
    provider: "openrouter",
    contextWindow: 2000000,
    legacy: false,
    status: "active"
  };
}

export function setActiveModel(query) {
  const model = findModel(query);
  if (!model) {
    throw new Error(`Unknown model: '${query}'. Run \`melodie models\` to see available models.`);
  }
  const c = config();
  c.defaultModel = model.id;
  c.defaultProvider = model.provider;
  saveConfig(c);
  return model;
}
