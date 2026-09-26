export const OLLAMA_HOST = process.env.OLLAMA_HOST || "http://127.0.0.1:11434";

// Known model health issues discovered through operational verification
const KNOWN_HEALTH_ISSUES = {
  "qwen3.8": "out_of_memory",
  "qwen3.8:latest": "out_of_memory"
};

export async function isServerReachable() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function listModels() {
  try {
    const res = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status}`);
    const data = await res.json();
    const rawList = data.models || [];

    return rawList.map(item => {
      const name = item.name;
      const baseName = name.split(":")[0];
      const issue = KNOWN_HEALTH_ISSUES[name] || KNOWN_HEALTH_ISSUES[baseName];
      const healthy = !issue;

      return {
        id: name,
        provider: "ollama",
        size: item.size,
        discovered: true,
        available: true,
        healthy,
        executable: healthy,
        ...(issue ? { reason: issue } : {})
      };
    });
  } catch (err) {
    return [];
  }
}

export async function getModelHealth(modelName) {
  const models = await listModels();
  const match = models.find(m => m.id === modelName || m.id.startsWith(modelName));
  if (match) return match;

  const base = modelName.split(":")[0];
  const issue = KNOWN_HEALTH_ISSUES[modelName] || KNOWN_HEALTH_ISSUES[base];
  return {
    id: modelName,
    provider: "ollama",
    discovered: false,
    available: false,
    healthy: false,
    executable: false,
    reason: issue || "model_not_found"
  };
}

export async function run(prompt, options = {}) {
  const models = await listModels();
  let model = options.model;

  if (model) {
    const health = await getModelHealth(model);
    if (!health.healthy) {
      throw new Error(`Model '${model}' on provider 'ollama' is not healthy: ${health.reason || "unavailable"}`);
    }
  } else {
    // Select first healthy model, NEVER an OOM or unhealthy model
    const healthyModels = models.filter(m => m.healthy && m.executable);
    if (healthyModels.length === 0) {
      throw new Error("No healthy Ollama models available. All discovered models are either unavailable or out of memory.");
    }
    model = healthyModels[0].id;
  }

  const stream = Boolean(options.stream);
  const res = await fetch(`${OLLAMA_HOST}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, stream })
  });

  if (!res.ok) {
    const errText = await res.text();
    if (errText.toLowerCase().includes("memory") || errText.toLowerCase().includes("oom")) {
      KNOWN_HEALTH_ISSUES[model] = "out_of_memory";
    }
    throw new Error(`Ollama HTTP ${res.status}: ${errText}`);
  }

  if (stream && res.body) {
    let fullText = "";
    const decoder = new TextDecoder();
    for await (const chunk of res.body) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split("\n");
      for (const line of lines) {
        if (!line.trim()) continue;
        try {
          const parsed = JSON.parse(line);
          if (parsed.response) {
            fullText += parsed.response;
            process.stdout.write(parsed.response);
          }
        } catch {
          // ignore stream parse errors
        }
      }
    }
    return fullText;
  }

  const json = await res.json();
  return json.response || "";
}
