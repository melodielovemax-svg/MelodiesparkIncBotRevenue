#!/usr/bin/env node
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { config, saveConfig, ensureHome, setSecret, deleteSecret, hasSecret, audit } from "./core.js";
import { providers, providerStatus } from "./providers.js";
import { listModels, findModel, setActiveModel, getActiveModel } from "./models.js";
import { listProfiles, setActiveProfile, getActiveProfile } from "./profiles.js";
import { executeRoute } from "./router.js";
import { checkModelHealth } from "./health.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

ensureHome();
const rawArgv = process.argv.slice(2);
const argv = [...rawArgv];
const cmd = argv.shift();

function arg(name, fallback = null) {
  const i = rawArgv.indexOf(name);
  return i >= 0 ? (rawArgv[i + 1] ?? fallback) : fallback;
}
function flag(name) {
  return rawArgv.includes(name);
}
function providerArg() {
  return arg("--provider") || arg("-p") || config().defaultProvider || "ollama";
}
function print(x) {
  console.log(typeof x === "string" ? x : JSON.stringify(x, null, 2));
}

function formatTable(rows, headers) {
  const colWidths = headers.map((h, idx) => {
    const maxVal = Math.max(...rows.map(r => String(r[idx] ?? "").length), h.length);
    return Math.min(maxVal, 40);
  });

  const sep = colWidths.map(w => "-".repeat(w)).join("  ");
  const headerLine = headers.map((h, idx) => h.padEnd(colWidths[idx])).join("  ");
  const lines = [headerLine, sep];

  for (const r of rows) {
    const line = r.map((c, idx) => String(c ?? "").padEnd(colWidths[idx]).slice(0, colWidths[idx])).join("  ");
    lines.push(line);
  }
  return lines.join("\n");
}

async function main() {
  switch (cmd) {
    case "models": {
      const p = arg("--provider") || arg("-p");
      const legacy = flag("--legacy");
      const all = flag("--all");
      const asJson = flag("--json");

      const models = await listModels({ provider: p, legacy, all });

      if (asJson) {
        print(models);
        break;
      }

      if (models.length === 0) {
        print(legacy ? "No legacy models found." : "No models found matching criteria.");
        break;
      }

      const headers = ["MODEL ID", "ALIAS", "PROVIDER", "CONTEXT", "STATUS", "LEGACY"];
      const rows = models.map(m => [
        m.id,
        m.alias || "-",
        m.provider,
        m.contextWindow ? `${Math.round(m.contextWindow / 1024)}k` : "-",
        m.status || (m.healthy === false ? "unhealthy" : "active"),
        m.legacy ? "YES (catalog)" : "NO"
      ]);

      print(formatTable(rows, headers));
      break;
    }

    case "model": {
      const sub = argv.shift();
      if (sub === "use") {
        const query = argv.shift();
        if (!query) throw new Error("Model ID or alias required. Usage: melodie model use <alias|id>");
        const model = setActiveModel(query);
        print(`Active model set to: ${model.id} (alias: ${model.alias}, provider: ${model.provider})`);
      } else if (sub === "current" || sub === "status") {
        const active = getActiveModel();
        const health = await checkModelHealth(active);
        print({
          model: active,
          health
        });
      } else {
        print("model: use <alias|id> | current");
      }
      break;
    }

    case "profiles": {
      const asJson = flag("--json");
      const profiles = listProfiles();

      if (asJson) {
        print(profiles);
        break;
      }

      const headers = ["ACTIVE", "PROFILE", "DEFAULT MODEL", "STRATEGY", "DESCRIPTION"];
      const rows = profiles.map(p => [
        p.active ? "* YES" : "  no",
        p.name,
        p.defaultModel,
        p.strategy,
        p.description
      ]);
      print(formatTable(rows, headers));
      break;
    }

    case "profile": {
      const sub = argv.shift();
      if (sub === "use") {
        const name = argv.shift();
        if (!name) throw new Error("Profile name required. Usage: melodie profile use <instant|flash|thinking|deepcoder|pro-max>");
        const prof = setActiveProfile(name);
        print(`Active profile set to: ${prof.name} (${prof.description})`);
        print(`Default model for profile: ${prof.defaultModel}`);
      } else if (sub === "current" || sub === "status") {
        print(getActiveProfile());
      } else {
        print("profile: use <instant|flash|thinking|deepcoder|pro-max> | current");
      }
      break;
    }

    case "platforms": {
      const sub = argv.shift() || "status";
      if (sub === "install") {
        const installer = path.resolve(__dirname, "..", "..", "scripts", "Install-MelodiePlatforms.ps1");
        print(`[Melodie] Launching multi-platform installer: ${installer}`);
        execSync(`powershell.exe -NoProfile -ExecutionPolicy Bypass -File "${installer}"`, {
          stdio: "inherit"
        });
      } else if (sub === "list") {
        print({
          platforms: [
            { name: "Node / npm / pnpm / npx", role: "Core Model Gateway & PRO-MAX Router", package: "@melodiespark/melodie-cli" },
            { name: "Python / pip / pipx", role: "Content Catalog & Scaffolding Frontend", package: "melodiespark-cli" },
            { name: "BotRevenue Automation", role: "Golden-Path & Non-Custodial Revenue Safeguards", package: "MelodiesparkIncBotRevenue" },
            { name: "Coding Agents", role: "Orchestrated Multi-Agent Execution", supported: ["antigravity", "gemini", "claude", "openai", "openrouter", "ollama"] }
          ]
        });
      } else if (sub === "doctor") {
        const ps = providers();
        const activeModel = getActiveModel();
        const modelHealth = await checkModelHealth(activeModel);
        print({
          doctor: "Melodiespark Platform Diagnostic",
          node: process.version,
          platform: process.platform,
          activeModel: { id: activeModel.id, health: modelHealth },
          financialSafety: {
            treasury_broadcast: "DISABLED",
            server_private_keys: false,
            autonomous_spending: "DISABLED",
            autonomous_transfers: "DISABLED",
            human_approval_required: true,
            external_signer_required: true
          },
          evidenceTaxonomy: ["VERIFIED", "UNVERIFIED", "BLOCKED", "DRAFT", "PENDING_APPROVAL", "FAILED", "COMPLETED", "DISABLED"],
          providers: ps
        });
      } else if (sub === "botrevenue") {
        print({
          goldenPath: "catalog -> checkout -> verified payment -> fulfillment -> entitlement -> evidence",
          revenuePolicy: "Checkout creation is not revenue. Production revenue remains UNVERIFIED unless supported by real evidence.",
          financialSafety: {
            treasury_broadcast: "DISABLED",
            server_private_keys: false,
            autonomous_spending: "DISABLED",
            autonomous_transfers: "DISABLED",
            autonomous_payouts: "DISABLED",
            human_approval_required: true,
            external_signer_required: true
          }
        });
      } else {
        print({
          platforms: "Melodie Platform CLI Infrastructure",
          version: "1.1.0",
          node: process.version,
          commands: [
            "melodiespark-cli platforms install",
            "melodiespark-cli platforms doctor",
            "melodiespark-cli platforms list",
            "melodiespark-cli platforms botrevenue"
          ]
        });
      }
      break;
    }

    case "botrevenue": {
      print({
        goldenPath: "catalog -> checkout -> verified payment -> fulfillment -> entitlement -> evidence",
        revenuePolicy: "Checkout creation is not revenue. Production revenue remains UNVERIFIED unless supported by real evidence.",
        financialSafety: {
          treasury_broadcast: "DISABLED",
          server_private_keys: false,
          autonomous_spending: "DISABLED",
          autonomous_transfers: "DISABLED",
          autonomous_payouts: "DISABLED",
          human_approval_required: true,
          external_signer_required: true
        }
      });
      break;
    }

    case "auth": {
      const sub = argv.shift();
      if (sub === "set") {
        const p = argv.shift(), secret = argv.shift();
        if (!p || !secret) throw new Error("Usage: melodie auth set <provider> <secret>");
        setSecret(p, secret);
        print(`Stored encrypted credential for ${p}.`);
      } else if (sub === "status") {
        print(Object.fromEntries(providers().map(p => [p.id, { authenticated: p.authenticated }])));
      } else if (sub === "remove") {
        const p = argv.shift();
        if (!p) throw new Error("Provider required.");
        deleteSecret(p);
        print(`Removed credential for ${p}.`);
      } else if (sub === "login") {
        const p = argv.shift() || providerArg();
        if (p === "ollama") print("Ollama is local; no login required.");
        else if (p === "openrouter") print("Use `melodie auth set openrouter <API_KEY>` or set OPENROUTER_API_KEY.");
        else if (p === "gemini") print("Run `gemini` and choose Sign in with Google, or configure GEMINI_API_KEY.");
        else if (p === "antigravity") print("Run `agy`; it uses its official browser/system-keyring authentication.");
        else if (p === "claude") print("Run your installed Claude CLI's official login flow.");
        else if (p === "openai") print("Run `codex --login` for the official Sign in with ChatGPT flow.");
        else print(`No login adapter for ${p}.`);
        audit("auth.login", { provider: p });
      } else {
        print("auth: login | set | status | remove");
      }
      break;
    }

    case "providers": {
      print(providers());
      break;
    }

    case "agent": {
      const sub = argv.shift();
      if (sub === "use") {
        const p = argv.shift();
        if (!p) throw new Error("Provider required.");
        const c = config();
        c.defaultProvider = p;
        saveConfig(c);
        print(`Default provider: ${p}`);
      } else if (sub === "status") {
        print(await providerStatus(providerArg()));
      } else {
        print("agent: use <provider> | status");
      }
      break;
    }

    case "run": {
      // Find non-flag trailing prompt
      const nonFlagArgs = rawArgv.slice(1).filter((x, idx, arr) => {
        if (x.startsWith("-")) return false;
        const prev = arr[idx - 1];
        if (prev && (prev === "--model" || prev === "-m" || prev === "--profile" || prev === "--provider" || prev === "-p")) {
          return false;
        }
        return true;
      });

      const prompt = arg("--prompt") || nonFlagArgs.join(" ");
      if (!prompt) throw new Error("Prompt required. Usage: melodie run [--model <model>] [--profile <profile>] \"<prompt>\"");

      const model = arg("--model") || arg("-m");
      const profile = arg("--profile");
      const provider = arg("--provider") || arg("-p");
      const stream = flag("--stream");

      const result = await executeRoute(prompt, {
        model,
        profile,
        provider,
        stream
      });

      if (!stream) {
        print(result);
      }
      break;
    }

    case "status": {
      const ps = providers();
      const activeModel = getActiveModel();
      const activeProfile = getActiveProfile();
      const modelHealth = await checkModelHealth(activeModel);

      print({
        version: "1.1.0",
        node: process.version,
        platform: process.platform,
        home: process.env.USERPROFILE || process.env.HOME,
        orchestration: {
          activeProfile: activeProfile.name,
          activeModel: activeModel.id,
          activeModelAlias: activeModel.alias,
          activeProvider: activeModel.provider,
          modelHealth: {
            healthy: modelHealth.healthy,
            executable: modelHealth.executable,
            status: modelHealth.reason || "healthy"
          }
        },
        providers: ps
      });
      break;
    }

    case "config": {
      print(config());
      break;
    }

    case "help":
    default: {
      print(`Melodie CLI 1.1.0: Unified Model Registry + Provider Adapters + PRO-MAX Router

Models & Profiles:
  melodie models [--provider <p>] [--legacy] [--all]
  melodie model use <alias|id>
  melodie model current
  melodie profiles
  melodie profile use <instant|flash|thinking|deepcoder|pro-max>
  melodie profile current

Platforms & BotRevenue:
  melodiespark-cli platforms install
  melodiespark-cli platforms doctor
  melodiespark-cli platforms list
  melodiespark-cli botrevenue

Execution:
  melodie run [--model <model>] [--profile <profile>] [--stream] <prompt>

Providers & Auth:
  melodie providers
  melodie auth login [provider]
  melodie auth set <provider> <secret>
  melodie auth status
  melodie auth remove <provider>
  melodie agent use <provider>
  melodie agent status

System:
  melodie status
  melodie config
`);
      break;
    }
  }
}

main().catch(e => {
  console.error(`ERROR: ${e.message}`);
  process.exitCode = 1;
});
