import test from "node:test";
import assert from "node:assert/strict";
import { providers } from "../src/providers.js";
import { getModelHealth as getOllamaModelHealth } from "../src/adapters/ollama.js";
import { checkHealth as checkOpenRouterHealth } from "../src/adapters/openrouter.js";

test("providers registry includes all 6 core providers", () => {
  const list = providers();
  const ids = list.map(p => p.id);

  assert.ok(ids.includes("antigravity"));
  assert.ok(ids.includes("gemini"));
  assert.ok(ids.includes("claude"));
  assert.ok(ids.includes("openai"));
  assert.ok(ids.includes("openrouter"));
  assert.ok(ids.includes("ollama"));
});

test("ollama health model explicitly flags qwen3.8 as unhealthy due to out_of_memory", async () => {
  const health = await getOllamaModelHealth("qwen3.8:latest");
  assert.equal(health.id, "qwen3.8:latest");
  assert.equal(health.provider, "ollama");
  assert.equal(health.healthy, false);
  assert.equal(health.executable, false);
  assert.equal(health.reason, "out_of_memory");
});

test("openrouter health check distinguishes unauthenticated from authenticated states", () => {
  const unauth = checkOpenRouterHealth(null);
  assert.equal(unauth.discovered, true);
  assert.equal(unauth.available, false);
  assert.equal(unauth.healthy, false);
  assert.equal(unauth.executable, false);
  assert.equal(unauth.reason, "missing_api_key");

  const auth = checkOpenRouterHealth("sk-or-dummy-key");
  assert.equal(auth.discovered, true);
  assert.equal(auth.available, true);
  assert.equal(auth.healthy, true);
  assert.equal(auth.executable, true);
});
