import { NextResponse } from "next/server";
import { db } from "@/db";
import { botSystems } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const bots = await db.select().from(botSystems).orderBy(desc(botSystems.quantumLevel));
    // Compute totals
    const totals = bots.reduce((acc, b) => ({
      totalBots: acc.totalBots + b.botCount,
      totalTasks: acc.totalTasks + Number(b.tasksExecuted),
      totalRevenue: acc.totalRevenue + parseFloat(b.revenueGenerated),
      totalTokens: acc.totalTokens + parseFloat(b.maTokensMined),
      totalContracts: acc.totalContracts + b.contractsSigned,
    }), { totalBots: 0, totalTasks: 0, totalRevenue: 0, totalTokens: 0, totalContracts: 0 });
    return NextResponse.json({ bots, totals });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, botId } = body;
    if (action === "cycle") {
      // Simulate a revenue cycle tick
      const rev = (Math.random() * 50 + 5).toFixed(8);
      const tokens = (Math.random() * 500 + 50).toFixed(8);
      const karma = Math.floor(Math.random() * 200 + 20);
      return NextResponse.json({
        success: true,
        cycle: {
          botId: botId || "ALL",
          revenueGenerated: rev,
          maTokensMined: tokens,
          karmaEarned: karma,
          tasksExecuted: Math.floor(Math.random() * 1000 + 100),
          contractsSigned: Math.floor(Math.random() * 10 + 1),
          txHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
          blockNumber: 19000000 + Math.floor(Math.random() * 100000),
          timestamp: new Date().toISOString(),
          phase: ["ALPHA", "OMEGA", "BETA", "THETA", "DELTA", "GAMMA"][Math.floor(Math.random() * 6)],
          quantumLevel: Math.floor(Math.random() * 3) + 9,
        },
      });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
