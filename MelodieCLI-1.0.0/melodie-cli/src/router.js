import { getActiveProfile, getProfile } from "./profiles.js";
import { findModel, getActiveModel } from "./models.js";
import { checkModelHealth } from "./health.js";
import { runAgent as runProvider } from "./providers.js";
import { audit } from "./core.js";

export async function resolveRoute(options = {}) {
  // 1. Resolve Profile
  const profile = options.profile ? getProfile(options.profile) : getActiveProfile();
  if (!profile) {
    throw new Error(`Profile '${options.profile}' not recognized.`);
  }

  // 2. Resolve Model
  let modelQuery = options.model;
  let model = null;

  if (modelQuery) {
    model = findModel(modelQuery);
    if (!model) {
      throw new Error(`Model '${modelQuery}' not recognized in catalog. Run \`melodie models\` to list models.`);
    }
  } else {
    // Use profile default model
    model = findModel(profile.defaultModel) || getActiveModel();
  }

  // 3. Resolve Provider
  const provider = options.provider || model.provider || "openrouter";

  // 4. Check Health & Availability
  let health = await checkModelHealth(model);
  let fallbackUsed = null;

  // If selected model is unhealthy (e.g. OOM or unexecutable), check fallbacks in profile
  if (!health.healthy && Array.isArray(profile.fallbackModels)) {
    for (const fbId of profile.fallbackModels) {
      const fbModel = findModel(fbId);
      if (fbModel && fbModel.id !== model.id) {
        const fbHealth = await checkModelHealth(fbModel);
        if (fbHealth.healthy && fbHealth.executable) {
          fallbackUsed = {
            original: model.id,
            originalReason: health.reason,
            fallback: fbModel.id
          };
          model = fbModel;
          health = fbHealth;
          break;
        }
      }
    }
  }

  return {
    profile,
    model,
    provider: options.provider || model.provider,
    health,
    pipeline: profile.pipeline || ["model-selection", "provider-adapter", "inference"],
    fallbackUsed
  };
}

export async function executeRoute(prompt, options = {}) {
  const route = await resolveRoute(options);

  audit("router.execute", {
    profile: route.profile.id,
    model: route.model.id,
    provider: route.provider,
    fallbackUsed: route.fallbackUsed
  });

  if (!route.health.executable) {
    const reason = route.health.reason || "unavailable";
    const resolution = route.health.resolution ? `\nResolution: ${route.health.resolution}` : "";
    throw new Error(
      `Inference blocked for model '${route.model.id}' on provider '${route.provider}' (Status: ${reason.toUpperCase()}).${resolution}`
    );
  }

  const runOptions = {
    model: route.model.id,
    stream: Boolean(options.stream),
    maxTokens: route.profile.maxTokens
  };

  const result = await runProvider(route.provider, prompt, runOptions);
  return result;
}
