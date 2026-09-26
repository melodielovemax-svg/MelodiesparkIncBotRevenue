import test from "node:test";
import assert from "node:assert/strict";
import { listProfiles, getProfile, setActiveProfile, getActiveProfile } from "../src/profiles.js";
import { resolveRoute } from "../src/router.js";
import { checkModelHealth } from "../src/health.js";

test("profiles contain all 5 required policies", () => {
  const profiles = listProfiles();
  const ids = profiles.map(p => p.id);

  assert.ok(ids.includes("instant"));
  assert.ok(ids.includes("flash"));
  assert.ok(ids.includes("thinking"));
  assert.ok(ids.includes("deepcoder"));
  assert.ok(ids.includes("pro-max"));
});

test("PRO-MAX profile defines the full agentic pipeline", () => {
  const proMax = getProfile("pro-max");
  assert.ok(proMax);
  assert.equal(proMax.name, "PRO-MAX");
  assert.ok(Array.isArray(proMax.pipeline));
  assert.ok(proMax.pipeline.includes("auto-router"));
  assert.ok(proMax.pipeline.includes("model-selection"));
  assert.ok(proMax.pipeline.includes("provider-adapter"));
  assert.ok(proMax.pipeline.includes("streaming-inference"));
  assert.ok(proMax.pipeline.includes("tool-execution"));
  assert.ok(proMax.pipeline.includes("verification-tests"));
  assert.ok(proMax.pipeline.includes("validated-result"));
});

test("resolveRoute maps alias to exact backend and detects legacy/paper models", async () => {
  const route = await resolveRoute({ model: "gpt-4", profile: "flash" });
  assert.equal(route.model.id, "gpt-4");
  assert.equal(route.provider, "openai");
  assert.equal(route.health.executable, false);
  assert.equal(route.health.reason, "legacy_paper_catalog");
});

test("health check distinguishes discovered vs available vs healthy vs executable", async () => {
  // Legacy paper model
  const legacyHealth = await checkModelHealth("gpt-3.5-turbo-0613");
  assert.equal(legacyHealth.discovered, true);
  assert.equal(legacyHealth.available, false);
  assert.equal(legacyHealth.healthy, false);
  assert.equal(legacyHealth.executable, false);
  assert.equal(legacyHealth.reason, "legacy_paper_catalog");

  // Unknown model
  const unknownHealth = await checkModelHealth("non-existent-model");
  assert.equal(unknownHealth.discovered, false);
  assert.equal(unknownHealth.executable, false);
});
