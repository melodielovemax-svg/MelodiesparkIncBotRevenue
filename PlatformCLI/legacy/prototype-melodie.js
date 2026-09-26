#!/usr/bin/env node
// =============================================================================
// RETIRED PROTOTYPE - NOT PART OF THE SHIPPED CLI - DO NOT RUN
// =============================================================================
//
// Superseded by ../bin/melodie.mjs (@melodiespark/cli 0.1.0).
// Kept only as a record of the earlier prototype. It is not referenced by
// package.json "bin", is excluded from "files", and is never executed by the
// test suite.
//
// It was retired for two concrete reasons, both of which are TRUTH_PROTOCOL.md
// violations rather than style preferences:
//
//   1. `recordVerifiedPayment(orderId, amount, provider)` wrote a ledger entry
//      with status 'VERIFIED' from CLI arguments alone, with no payment
//      gateway confirmation, no customer identity, and no external source of
//      truth. TRUTH_PROTOCOL Rule 3 requires a payment-processor record before
//      a business claim may be called VERIFIED. Any real revenue status must be
//      derived from `apps/command-center`'s revenue_events and integration runs,
//      not from a command-line argument.
//
//   2. `awardKarma(userId, amount)` credited `karma` and minted `ma` at a
//      hardcoded 0.001 rate. CONTENT-GRID.md lists "MA/Karma conversion" as
//      NOT IMPLEMENTED and requiring legal/economic design, with "no mint or
//      conversion path". The prototype implemented exactly the path that the
//      product grid says must not exist.
//
// Additionally, ROOT was hardcoded to 'C:\Melodie', so the CLI was not
// cross-platform.
//
// The replacement CLI ships `melodie status` (evidence-based capability
// reporting) and deliberately ships NO `record` command. See
// ../../DECISIONS.md for the full decision record.
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = 'C:\\Melodie';

// Truth constants
const VERSION = '0.1.0';
const APP_NAME = 'MelodieSpark';

// ============================================================================
// REVENUE SERVICE (Real Ledger)
// ============================================================================
class RevenueService {
  constructor() {
    this.ledgerDir = path.join(ROOT, 'data', 'ledger');
    this.ledgerFile = path.join(this.ledgerDir, 'ledger.json');
  }

  async initialize() {
    if (!fs.existsSync(this.ledgerDir)) {
      fs.mkdirSync(this.ledgerDir, { recursive: true });
    }
    if (!fs.existsSync(this.ledgerFile)) {
      fs.writeFileSync(this.ledgerFile, JSON.stringify([], null, 2));
    }
    console.log('[RevenueService] Initialized at', this.ledgerFile);
  }

  recordVerifiedPayment(orderId, amount, provider) {
    const ledger = this.getLedger();
    const entry = {
      id: this.generateId(),
      orderId,
      amount,
      provider,
      verifiedAt: new Date().toISOString(),
      status: 'VERIFIED'
    };
    ledger.push(entry);
    fs.writeFileSync(this.ledgerFile, JSON.stringify(ledger, null, 2));
    console.log(`[RevenueService] PAYMENT_VERIFIED: $${amount} from ${provider}`);
    return entry;
  }

  getLedger() {
    try {
      return JSON.parse(fs.readFileSync(this.ledgerFile, 'utf-8'));
    } catch {
      return [];
    }
  }

  getStatus() {
    const ledger = this.getLedger();
    const total = ledger.reduce((sum, e) => sum + e.amount, 0);
    return {
      verifiedPayments: ledger.length,
      totalRevenue: total,
      ledgerFile: this.ledgerFile
    };
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }
}

// ============================================================================
// REWARDS SERVICE (Karma Tracking)
// ============================================================================
class RewardsService {
  constructor() {
    this.dataDir = path.join(ROOT, 'data', 'rewards');
    this.accountsFile = path.join(this.dataDir, 'accounts.json');
  }

  async initialize() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.accountsFile)) {
      fs.writeFileSync(this.accountsFile, JSON.stringify({}, null, 2));
    }
    console.log('[RewardsService] Initialized at', this.accountsFile);
  }

  awardKarma(userId, amount) {
    const accounts = this.getAccounts();
    const user = accounts[userId] || { id: userId, karma: 0, ma: 0 };
    user.karma += amount;
    user.ma += amount * 0.001;
    accounts[userId] = user;
    fs.writeFileSync(this.accountsFile, JSON.stringify(accounts, null, 2));
    console.log(`[RewardsService] KARMA_AWARDED: ${amount} karma to ${userId}`);
    return user;
  }

  getAccounts() {
    try {
      return JSON.parse(fs.readFileSync(this.accountsFile, 'utf-8'));
    } catch {
      return {};
    }
  }
}

// ============================================================================
// WALLET SERVICE (Stub)
// ============================================================================
class WalletService {
  constructor() {
    this.keystoreDir = path.join(ROOT, 'data', 'keystore');
  }

  async initialize() {
    if (!fs.existsSync(this.keystoreDir)) {
      fs.mkdirSync(this.keystoreDir, { recursive: true });
    }
    console.log('[WalletService] Initialized (scaffold mode - no keys generated)');
  }

  async getStatus() {
    return {
      status: 'SCAFFOLD',
      reason: 'Wallet service is scaffold - no funded address exists yet'
    };
  }
}

// ============================================================================
// TASK VERIFICATION (From actual CSV)
// ============================================================================
class TaskVerifier {
  constructor() {
    this.taskFile = path.join(ROOT, 'MelodieCLI_Enterprise_RealOnly_Template', '18-tasks', 'TASKLIST_1000.csv');
    this.manifestFile = path.join(ROOT, 'MelodieCLI_Enterprise_RealOnly_Template', 'PROJECT_MANIFEST.json');
  }

  verify() {
    if (!fs.existsSync(this.taskFile)) {
      return { valid: false, error: 'TASKLIST_1000.csv not found' };
    }
    if (!fs.existsSync(this.manifestFile)) {
      return { valid: false, error: 'PROJECT_MANIFEST.json not found' };
    }

    // Read CSV (simple line count)
    const csvContent = fs.readFileSync(this.taskFile, 'utf-8');
    const csvLines = csvContent.split('\n').filter(line => line.trim());
    const csvRows = csvLines.length - 1; // exclude header

    // Read manifest
    const manifest = JSON.parse(fs.readFileSync(this.manifestFile, 'utf-8'));
    const manifestCount = manifest.task_count;

    return {
      valid: csvRows === manifestCount,
      csvRows,
      manifestCount,
      match: csvRows === manifestCount,
      taskFile: this.taskFile,
      manifestFile: this.manifestFile
    };
  }
}

// ============================================================================
// CLI COMMANDS
// ============================================================================
async function cmdInit() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  MELODIESPARK SYSTEM INITIALIZATION                    ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  try {
    const rev = new RevenueService();
    await rev.initialize();

    const rew = new RewardsService();
    await rew.initialize();

    const wal = new WalletService();
    await wal.initialize();

    const tasks = new TaskVerifier();
    const taskStatus = tasks.verify();

    console.log('\n✅ All services initialized.\n');
    console.log('Task Integrity:', taskStatus.match ? '✅ VALID' : '❌ MISMATCH');
    console.log('  CSV rows:', taskStatus.csvRows);
    console.log('  Manifest:', taskStatus.manifestCount);
  } catch (e) {
    console.error('❌ Initialization failed:', e.message);
    process.exit(1);
  }
}

async function cmdStatus() {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  MELODIESPARK SYSTEM STATUS                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const rev = new RevenueService();
  const rew = new RewardsService();
  const wal = new WalletService();
  const tasks = new TaskVerifier();

  const revStatus = rev.getStatus();
  const walStatus = await wal.getStatus();
  const taskStatus = tasks.verify();

  console.log('REVENUE SERVICE:');
  console.log(`  Verified Payments: ${revStatus.verifiedPayments}`);
  console.log(`  Total Revenue: $${revStatus.totalRevenue.toFixed(2)}`);

  console.log('\nREWARDS SERVICE:');
  const rewards = rew.getAccounts();
  console.log(`  Accounts: ${Object.keys(rewards).length}`);

  console.log('\nWALLET SERVICE:');
  console.log(`  Status: ${walStatus.status}`);
  console.log(`  Note: ${walStatus.reason}`);

  console.log('\nTASK VERIFICATION:');
  console.log(`  CSV Rows: ${taskStatus.csvRows}`);
  console.log(`  Manifest: ${taskStatus.manifestCount}`);
  console.log(`  Integrity: ${taskStatus.match ? '✅ VALID' : '❌ MISMATCH'}`);

  console.log();
}

async function cmdRecord(orderId, amount, provider) {
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║  RECORDING VERIFIED PAYMENT                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  if (!orderId || !amount || !provider) {
    console.error('Usage: melodie record <orderId> <amount> <provider>');
    process.exit(1);
  }

  try {
    const rev = new RevenueService();
    await rev.initialize();
    const entry = rev.recordVerifiedPayment(orderId, parseFloat(amount), provider);
    console.log('\n✅ Payment recorded:');
    console.log(JSON.stringify(entry, null, 2));
  } catch (e) {
    console.error('❌ Failed:', e.message);
    process.exit(1);
  }
}

// ============================================================================
// MAIN
// ============================================================================
async function main() {
  const args = process.argv.slice(2);
  const cmd = args[0];

  switch (cmd) {
    case 'init':
      await cmdInit();
      break;
    case 'status':
      await cmdStatus();
      break;
    case 'record':
      await cmdRecord(args[1], args[2], args[3]);
      break;
    default:
      console.log(`\n${APP_NAME} CLI v${VERSION}\n`);
      console.log('Commands:');
      console.log('  melodie init                          Initialize all services');
      console.log('  melodie status                        Show system status');
      console.log('  melodie record <orderId> <$> <provider>  Record verified payment');
      console.log();
  }
}

main().catch(console.error);
