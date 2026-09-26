import { NextResponse } from "next/server";
import { db } from "@/db";
import { karmaEvents, wallets, leaderboard } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const wallet = await db.select().from(wallets).limit(1);
    if (!wallet.length) return NextResponse.json({ events: [], leaderboard: [] });
    const events = await db.select().from(karmaEvents)
      .where(eq(karmaEvents.walletId, wallet[0].id))
      .orderBy(desc(karmaEvents.createdAt))
      .limit(20);
    const board = await db.select().from(leaderboard).orderBy(leaderboard.rank).limit(20);
    return NextResponse.json({ events, leaderboard: board, wallet: wallet[0] });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
