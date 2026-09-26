export const OPENROUTER_ENDPOINT = "https://openrouter.ai/api/v1";

export async function listModels(apiKey) {
  if (!apiKey) {
    throw new Error("OpenRouter API key required. Run `melodie auth set openrouter <KEY>` or set OPENROUTER_API_KEY.");
  }
  const res = await fetch(`${OPENROUTER_ENDPOINT}/models`, {
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer": "https://melodiespark.local",
      "X-Title": "Melodie CLI"
    }
  });
  if (!res.ok) {
    throw new Error(`OpenRouter HTTP ${res.status}: ${await res.text()}`);
  }
  const data = await res.json();
  return (data.data || []).map(m => ({
    id: m.id,
    name: m.name || m.id,
    contextWindow: m.context_length || 4096,
    pricing: m.pricing
  }));
}

export async function run(prompt, options = {}, apiKey) {
  if (!apiKey) {
    throw new Error("OpenRouter API key required. Run `melodie auth set openrouter <KEY>` or set OPENROUTER_API_KEY.");
  }

  const model = options.model || "openrouter/auto";
  const messages = options.messages || [{ role: "user", content: prompt }];
  const stream = Boolean(options.stream);

  const payload = {
    model,
    messages,
    stream,
    ...(options.maxTokens ? { max_tokens: options.maxTokens } : {})
  };

  const res = await fetch(`${OPENROUTER_ENDPOINT}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "https://melodiespark.local",
      "X-Title": "Melodie CLI"
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`OpenRouter HTTP ${res.status}: ${errorText}`);
  }

  if (stream && res.body) {
    let fullText = "";
    const decoder = new TextDecoder();
    for await (const chunk of res.body) {
      const text = decoder.decode(chunk, { stream: true });
      const lines = text.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data:")) continue;
        const rawJson = trimmed.slice(5).trim();
        if (rawJson === "[DONE]") break;
        try {
          const parsed = JSON.parse(rawJson);
          const delta = parsed.choices?.[0]?.delta?.content || "";
          if (delta) {
            fullText += delta;
            process.stdout.write(delta);
          }
        } catch {
          // ignore stream chunk parse errors
        }
      }
    }
    return fullText;
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

export function checkHealth(apiKey) {
  if (!apiKey) {
    return {
      discovered: true,
      available: false,
      healthy: false,
      executable: false,
      reason: "missing_api_key"
    };
  }
  return {
    discovered: true,
    available: true,
    healthy: true,
    executable: true
  };
}
