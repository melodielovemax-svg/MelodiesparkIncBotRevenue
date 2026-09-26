#!/usr/bin/env node

/**
 * Melodiespark CLI — Master Command Line Interface
 * Usable via `npx melodiespark`, `pnpm dlx melodiespark`, or global npm install.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/config.mjs';
import { Repository } from '../src/db.mjs';
import { IntegrationManager } from '../src/integrations.mjs';
import { SafeWorkflowEngine } from '../src/workflows.mjs';
import { createApplication } from '../src/server.mjs';
import { normalizeAddress, verifyWalletSignature } from '../src/wallet.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const command = args[0] || 'help';

function printHelp() {
  console.log(`
MELODIESPARK — MASTER COMMAND CENTER CLI (v0.1.0)
Architecture: Définition ≠ Runtime ≠ Infrastructure ≠ UI ≠ Finance

Usage:
  npx melodiespark <command> [options]
  pnpm dlx melodiespark <command> [options]

Commands:
  status                   Display system health, active mode, and database stats
  start [--port <p>]       Start the Command Center HTTP API server
  cycle [count]            Run N finite safe workflow validation cycles (default: 1)
  guardians [tier]         List guardian profiles (tiers: arc_angel, guardian, sub_guardian)
  products                 List e-commerce product drafts and catalog
  karma                    Display karma ledger summary and engagement metrics
  telemetry                Display latest ARPG telemetry from Path of Melodie
  challenge <address>      Generate an EIP-191 non-custodial wallet challenge
  verify <addr> <msg> <sig> Verify an EIP-191 wallet signature
  help                     Show this help screen
`);
}

async function main() {
  const config = loadConfig({ ROOT_DIR: root });
  const db = new Repository({ databasePath: config.databasePath, schemaPath: config.schemaPath, config });
  const integrations = new IntegrationManager({ db, config });
  const workflows = new SafeWorkflowEngine({ db, config, integrations, root });

  try {
    switch (command) {
      case 'help':
      case '--help':
      case '-h':
        printHelp();
        break;

      case 'version':
      case '--version':
      case '-v':
        console.log('melodiespark-command-center v0.1.0');
        break;

      case 'status': {
        const healthy = db.healthy();
        const dash = db.dashboard();
        const tele = db.getGameTelemetryStats();
        console.log(`\n=== MELODIESPARK SYSTEM STATUS ===`);
        console.log(`Database Health : ${healthy ? 'OK (Healthy)' : 'DEGRADED'}`);
        console.log(`App Mode        : ${config.appMode.toUpperCase()}`);
        const arcAngels = dash.guardians.arc_angel || 0;
        const guardians = dash.guardians.guardian || 0;
        const subGuardians = dash.guardians.sub_guardian || 0;
        const totalGuardians = arcAngels + guardians + subGuardians;
        console.log(`Guardians       : ${totalGuardians} total (${arcAngels} Arc-Angels, ${guardians} Guardians, ${subGuardians} Sub-Guardians)`);
        console.log(`Workflows (7d)  : ${dash.workflows.sevenDay.total} total (${dash.workflows.sevenDay.succeeded} succeeded)`);
        console.log(`Connected Wallets: ${dash.wallets}`);
        console.log(`Game Telemetry  : ${tele.totalEvents} events recorded (${tele.totalDamage} total dmg, ${tele.totalShatters} shatters, ${tele.totalReactions} reactions)`);
        console.log(`==================================\n`);
        break;
      }

      case 'start': {
        const portIndex = args.indexOf('--port');
        const customPort = portIndex !== -1 ? args[portIndex + 1] : config.port;
        const app = createApplication({ ...config, PORT: String(customPort) });
        app.server.listen(customPort, config.host, () => {
          console.log(`\nMelodiespark Command Center running at http://${config.host}:${customPort}`);
          console.log(`Press Ctrl+C to stop.`);
        });
        return; // Keep running
      }

      case 'cycle': {
        const count = Math.max(1, Math.min(20, parseInt(args[1] || '1', 10)));
        console.log(`\nRunning ${count} safe workflow cycle(s)...`);
        for (let i = 1; i <= count; i++) {
          const run = await workflows.runCycle({ trigger: `cli:cycle:${i}` });
          console.log(`[Cycle ${i}/${count}] Status: ${run.status.toUpperCase()} | Succeeded: ${run.tasksSucceeded}/${run.tasksTotal} | Duration: ${run.durationMs}ms`);
        }
        break;
      }

      case 'guardians': {
        const filterTier = args[1];
        const list = db.listGuardians({ limit: 20, tier: filterTier });
        console.log(`\n=== GUARDIANS REGISTRY (Showing ${list.length} profiles) ===`);
        for (const g of list) {
          console.log(`[${g.tier.toUpperCase()}] ${g.name.padEnd(20)} | Domain: ${g.domain.padEnd(12)} | Soul: ${g.soul_core}`);
        }
        break;
      }

      case 'products': {
        const products = db.listProducts(20);
        console.log(`\n=== E-COMMERCE PRODUCTS & DRAFTS ===`);
        for (const p of products) {
          console.log(`[${p.sku}] ${p.title} (${p.product_type}) — ${(p.price_minor / 100).toFixed(2)} ${p.currency} [${p.status}]`);
        }
        break;
      }

      case 'karma': {
        const balance = db.getKarmaBalance('demo_user');
        console.log(`\n=== KARMA LEDGER ===`);
        console.log(`Current Balance: ${balance} Karma Points`);
        console.log(`Boundary Notice: Karma is strictly an internal community metric. Non-crypto, non-convertible to fiat.`);
        break;
      }

      case 'telemetry': {
        const items = db.listGameTelemetry(10);
        const stats = db.getGameTelemetryStats();
        console.log(`\n=== PATH OF MELODIE TELEMETRY ===`);
        console.log(`Total Events: ${stats.totalEvents} | Total Shatters: ${stats.totalShatters} | Reactions: ${stats.totalReactions} | Phoenix Ascensions: ${stats.totalAscensions}`);
        for (const t of items) {
          console.log(`[${t.event_type}] Act ${t.act_number || 'N/A'} | Boss: ${t.boss_defeated || 'None'} | Dmg: ${t.damage_dealt} | At: ${t.created_at}`);
        }
        break;
      }

      case 'challenge': {
        const address = args[1];
        if (!address) {
          console.error('Error: specify an Ethereum address: melodiespark challenge 0x...');
          process.exit(1);
        }
        const norm = normalizeAddress(address);
        const nonce = Math.random().toString(36).slice(2);
        console.log(`\nEIP-191 Nonce Challenge for ${norm}:`);
        console.log(`Nonce: ${nonce}`);
        console.log(`Message: "Sign to prove wallet ownership. Non-custodial, no spending rights granted."`);
        break;
      }

      case 'verify': {
        const [addr, msg, sig] = [args[1], args[2], args[3]];
        if (!addr || !msg || !sig) {
          console.error('Error: specify address, message, and signature');
          process.exit(1);
        }
        const verified = await verifyWalletSignature({ address: addr, message: msg, signature: sig });
        console.log(`Verification result for ${verified}: SUCCESS`);
        break;
      }

      default:
        console.error(`Unknown command: "${command}"`);
        printHelp();
        process.exit(1);
    }
  } finally {
    if (command !== 'start') {
      db.close();
    }
  }
}

main().catch((err) => {
  console.error('CLI Error:', err);
  process.exit(1);
});
