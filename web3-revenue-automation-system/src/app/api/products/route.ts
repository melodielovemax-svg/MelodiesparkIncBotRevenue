import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, transactions, wallets, karmaEvents } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  try {
    const allProducts = await db.select().from(products).orderBy(desc(products.salesCount));
    return NextResponse.json({ products: allProducts });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, walletId } = body;

    const product = await db.select().from(products).where(eq(products.id, productId)).limit(1);
    if (!product.length) return NextResponse.json({ error: "Product not found" }, { status: 404 });

    const p = product[0];
    const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

    // Record transaction
    const wallet = await db.select().from(wallets).limit(1);
    if (wallet.length) {
      await db.insert(transactions).values({
        walletId: wallet[0].id,
        txHash,
        type: "RECEIVE",
        fromAddress: "0x" + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        toAddress: wallet[0].address,
        amount: p.priceUsdt,
        currency: "USDT",
        gasFee: "0.00250000",
        status: "CONFIRMED",
        blockNumber: 19000000 + Math.floor(Math.random() * 100000),
        blockHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        karmaEarned: p.karmaReward,
        metadata: { productId: p.id, productName: p.name, tier: p.tier },
      });

      // Add karma event
      await db.insert(karmaEvents).values({
        walletId: wallet[0].id,
        eventType: "SERVICE",
        title: `Product Sale: ${p.name}`,
        description: `Automated sale of ${p.name} via bot revenue system`,
        pointsEarned: p.karmaReward,
        maTokensRewarded: p.maTokenReward,
        multiplier: "1.00",
        verified: true,
      });
    }

    return NextResponse.json({
      success: true,
      txHash,
      product: p,
      karmaEarned: p.karmaReward,
      maTokensRewarded: p.maTokenReward,
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
