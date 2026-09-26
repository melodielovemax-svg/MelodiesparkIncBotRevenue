import { NextResponse } from "next/server";
import { db } from "@/db";
import { wallets, revenueSnapshots } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allWallets = await db.select().from(wallets).orderBy(desc(wallets.totalRevenue));
    const mainWallet = allWallets[0];
    if (!mainWallet) return NextResponse.json({ error: "No wallet found" }, { status: 404 });

    const snapshots = await db.select().from(revenueSnapshots)
      .where(eq(revenueSnapshots.walletId, mainWallet.id))
      .orderBy(desc(revenueSnapshots.snapshotAt))
      .limit(12);

    return NextResponse.json({ wallet: mainWallet, snapshots, allWallets });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
