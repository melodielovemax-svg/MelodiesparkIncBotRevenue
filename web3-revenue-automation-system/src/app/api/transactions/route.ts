import { NextResponse } from "next/server";
import { db } from "@/db";
import { transactions, wallets } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const wallet = await db.select().from(wallets).limit(1);
    if (!wallet.length) return NextResponse.json({ transactions: [] });
    const txs = await db.select().from(transactions)
      .where(eq(transactions.walletId, wallet[0].id))
      .orderBy(desc(transactions.createdAt))
      .limit(50);
    return NextResponse.json({ transactions: txs });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
