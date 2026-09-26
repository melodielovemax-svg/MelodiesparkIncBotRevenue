import test from "node:test";
import assert from "node:assert/strict";
import { getStaticCatalog, listModels, findModel } from "../src/models.js";

test("static catalog includes all required target families and models", () => {
  const catalog = getStaticCatalog();
  const ids = catalog.map(m => m.id);

  // OpenAI
  assert.ok(ids.includes("gpt-4-turbo"));
  assert.ok(ids.includes("gpt-4"));
  assert.ok(ids.includes("gpt-3.5-turbo"));
  assert.ok(ids.includes("gpt-3.5-turbo-0613"));
  assert.ok(ids.includes("gpt-3.5-turbo-instruct"));
  assert.ok(ids.includes("gpt-3.5-turbo-16k"));
  assert.ok(ids.includes("gpt-3.5-turbo-16k-0613"));

  // Mistral
  assert.ok(ids.includes("mistralai/mistral-large-2407"));

  // OpenRouter
  assert.ok(ids.includes("openrouter/auto"));

  // Mancer
  assert.ok(ids.includes("mancer/weaver"));

  // Undi95
  assert.ok(ids.includes("undi95/remm-slerp-l2-13b"));

  // Gryphe
  assert.ok(ids.includes("gryphe/mythomax-l2-13b"));
});

test("aliases resolve properly to exact model backends", () => {
  assert.equal(findModel("auto")?.id, "openrouter/auto");
  assert.equal(findModel("mistral-large")?.id, "mistralai/mistral-large-2407");
  assert.equal(findModel("gpt-4-turbo")?.id, "gpt-4-turbo");
  assert.equal(findModel("weaver")?.id, "mancer/weaver");
  assert.equal(findModel("remm-slerp")?.id, "undi95/remm-slerp-l2-13b");
  assert.equal(findModel("mythomax")?.id, "gryphe/mythomax-l2-13b");
});

test("historical OpenAI models are marked legacy/catalog while modern models are active", () => {
  const gpt4 = findModel("gpt-4");
  assert.equal(gpt4?.legacy, true);
  assert.equal(gpt4?.status, "catalog");

  const gpt35 = findModel("gpt-3.5-turbo");
  assert.equal(gpt35?.legacy, true);
  assert.equal(gpt35?.status, "catalog");

  const gpt4Turbo = findModel("gpt-4-turbo");
  assert.equal(gpt4Turbo?.legacy, false);
  assert.equal(gpt4Turbo?.status, "active");

  const auto = findModel("auto");
  assert.equal(auto?.legacy, false);
  assert.equal(auto?.status, "active");
});

test("context windows and features match official specifications", () => {
  const auto = findModel("auto");
  assert.equal(auto?.contextWindow, 2000000);
  assert.equal(auto?.supportsTools, true);

  const mistral = findModel("mistral-large");
  assert.equal(mistral?.contextWindow, 131072);
  assert.equal(mistral?.supportsTools, true);
  assert.equal(mistral?.supportsStructuredOutput, true);
});

test("filtering models by provider and legacy works accurately", async () => {
  const openrouterModels = await listModels({ provider: "openrouter", all: true });
  assert.ok(openrouterModels.length >= 5);
  for (const m of openrouterModels) {
    assert.equal(m.provider, "openrouter");
  }

  const legacyModels = await listModels({ legacy: true });
  assert.ok(legacyModels.length >= 5);
  for (const m of legacyModels) {
    assert.equal(m.legacy, true);
  }
});
