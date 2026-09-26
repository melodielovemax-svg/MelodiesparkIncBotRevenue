import path from "node:path";
import { fileURLToPath } from "node:url";
import { readJson, config, saveConfig } from "./core.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROFILES_FILE = path.join(__dirname, "..", "config", "profiles.json");

export function getProfilesData() {
  return readJson(PROFILES_FILE, {
    defaultProfile: "pro-max",
    profiles: []
  });
}

export function listProfiles() {
  const data = getProfilesData();
  const current = getActiveProfile();
  return (data.profiles || []).map(p => ({
    ...p,
    active: p.id === current.id
  }));
}

export function getProfile(id) {
  if (!id) return null;
  const q = String(id).trim().toLowerCase();
  const data = getProfilesData();
  return (data.profiles || []).find(p => p.id.toLowerCase() === q || p.name.toLowerCase() === q) || null;
}

export function getActiveProfile() {
  const c = config();
  const activeId = c.defaultProfile || "pro-max";
  const found = getProfile(activeId);
  if (found) return found;

  const data = getProfilesData();
  return (data.profiles || [])[0] || {
    id: "pro-max",
    name: "PRO-MAX",
    description: "Melodie flagship orchestration policy",
    defaultModel: "openrouter/auto",
    pipeline: ["auto-router", "model-selection", "provider-adapter", "streaming-inference", "tool-execution", "verification-tests", "validated-result"]
  };
}

export function setActiveProfile(id) {
  const profile = getProfile(id);
  if (!profile) {
    const data = getProfilesData();
    const available = (data.profiles || []).map(p => p.id).join(", ");
    throw new Error(`Unknown profile: '${id}'. Available profiles: ${available}`);
  }
  const c = config();
  c.defaultProfile = profile.id;
  saveConfig(c);
  return profile;
}
