import { NextResponse } from "next/server";
import { db } from "@/db";
import { cliTaskLogs, botSystems } from "@/db/schema";
import { desc } from "drizzle-orm";

const PHASES = ["ALPHA", "OMEGA", "BETA", "THETA", "DELTA", "BRAVO", "GAMMA"];
const GEOMETRIES = ["HEXAGONAL", "PENTAGONAL", "PYRAMIDAL", "RECTANGULAR", "CIRCULAR", "HEPTAGONAL", "POLYGONAL"];

const TASK_TEMPLATES = [
  "QUANTUM_FRACTAL_MATRIX_INIT",
  "SACRED_GEOMETRY_SPIN_APEX",
  "BOT_NETWORK_80K_DEPLOY",
  "MA_TOKEN_MINING_CYCLE",
  "CONTRACT_AUTO_SIGN_BATCH",
  "KARMA_EXTRACTION_ENGINE",
  "REVENUE_TREASURY_SYNC",
  "GUARDIAN_ARCHANGEL_SHIELD",
  "LEGAL_NEXUS_COMPLIANCE_CHECK",
  "METAMELLO_WALLET_SYNC",
  "ALPHA_OMEGA_THETA_LOOP",
  "BLOCKCHAIN_LEDGER_VERIFY",
  "GOOD_DEED_SERVICE_DEPLOY",
  "POLYGON_ROTATION_MATRIX",
  "EXPONENTIAL_YIELD_CALC",
  "LLM_AGENT_CODEGEN_RUN",
  "SAAS_AUTO_DEPLOY_CLOUD",
  "MELODIECLI_SYSTEM_BUILD",
  "PRODUCT_RELEASE_AUTOMATION",
  "CRYPTO_SWAP_BRIDGE_EXEC",
];

export async function GET() {
  try {
    const logs = await db.select().from(cliTaskLogs).orderBy(desc(cliTaskLogs.createdAt)).limit(50);
    const bots = await db.select().from(botSystems).limit(10);
    return NextResponse.json({ logs, bots });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { command } = body;

    // Generate CLI execution response
    const taskCount = Math.floor(Math.random() * 5) + 1;
    const results = [];

    for (let i = 0; i < taskCount; i++) {
      const phase = PHASES[Math.floor(Math.random() * PHASES.length)];
      const geo = GEOMETRIES[Math.floor(Math.random() * GEOMETRIES.length)];
      const task = TASK_TEMPLATES[Math.floor(Math.random() * TASK_TEMPLATES.length)];
      const maTokens = (Math.random() * 500 + 50).toFixed(8);
      const karma = Math.floor(Math.random() * 1000 + 100);
      const execMs = Math.floor(Math.random() * 300 + 50);
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      const log = `[${phase}:${geo}] ⚡ ${task}\n` +
        `  ├─ Quantum Level: ${Math.floor(Math.random() * 3) + 9}/11\n` +
        `  ├─ MA Tokens Mined: +${maTokens} MA\n` +
        `  ├─ Karma Points: +${karma} KP\n` +
        `  ├─ TX Hash: ${txHash}\n` +
        `  ├─ Block: #${19000000 + Math.floor(Math.random() * 100000)}\n` +
        `  ├─ Execution: ${execMs}ms\n` +
        `  └─ Status: ✅ CONFIRMED`;

      const bots = await db.select().from(botSystems).limit(1);

      await db.insert(cliTaskLogs).values({
        taskName: task,
        phase,
        status: "SUCCESS",
        executionMs: execMs,
        outputLog: log,
        karmaGenerated: karma,
        maTokensGenerated: maTokens,
        botSystemId: bots.length ? bots[0].id : null,
      });

      results.push({ phase, geometry: geo, task, maTokens, karma, execMs, txHash, log });
    }

    return NextResponse.json({
      success: true,
      command,
      executedTasks: results.length,
      results,
      totalMaTokens: results.reduce((s, r) => s + parseFloat(r.maTokens), 0).toFixed(8),
      totalKarma: results.reduce((s, r) => s + r.karma, 0),
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
