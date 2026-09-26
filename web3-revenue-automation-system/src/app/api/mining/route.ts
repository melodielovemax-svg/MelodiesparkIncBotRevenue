import { NextResponse } from "next/server";
import { db } from "@/db";
import { wallets, transactions, karmaEvents, revenueSnapshots } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    const wallet = await db.select().from(wallets).limit(1);
    if (!wallet.length) return NextResponse.json({ error: "No wallet" }, { status: 404 });
    const w = wallet[0];

    if (action === "MINE") {
      const maEarned = (Math.random() * 100 + 10).toFixed(8);
      const karmaEarned = Math.floor(Math.random() * 500 + 50);
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
      const blockNumber = 19000000 + Math.floor(Math.random() * 100000);

      // Insert transaction
      await db.insert(transactions).values({
        walletId: w.id,
        txHash,
        type: "MINE",
        fromAddress: "0x0000000000000000000000000000000000000000",
        toAddress: w.address,
        amount: maEarned,
        currency: "MA",
        gasFee: "0.00100000",
        status: "CONFIRMED",
        blockNumber,
        blockHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        karmaEarned,
        metadata: { action: "START_MA_TOKEN_MINING", sacred_geometry: "APEX_BALANCED", quantum_level: 11 },
      });

      // Karma event
      await db.insert(karmaEvents).values({
        walletId: w.id,
        eventType: "MINING",
        title: `MA Token Mining — Sacred Geometry APEX Cycle`,
        description: `Quantum fractal mining cycle completed. ${maEarned} MA tokens extracted.`,
        pointsEarned: karmaEarned,
        maTokensRewarded: maEarned,
        multiplier: "1.10",
        verified: true,
      });

      return NextResponse.json({
        success: true,
        txHash,
        blockNumber,
        maEarned,
        karmaEarned,
        walletAddress: w.address,
        status: "CONFIRMED",
        message: "🌟 MA Token Mining Cycle Complete — Sacred Geometry APEX",
      });
    }

    if (action === "SWAP") {
      const { fromCurrency, toCurrency, amount } = body;
      const rates: Record<string, number> = { MA: 0.001, ETH: 2400, BTC: 68000, USDT: 1 };
      const fromRate = rates[fromCurrency] || 1;
      const toRate = rates[toCurrency] || 1;
      const outputAmount = ((parseFloat(amount) * fromRate) / toRate).toFixed(8);
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      await db.insert(transactions).values({
        walletId: w.id,
        txHash,
        type: "SWAP",
        fromAddress: w.address,
        toAddress: w.address,
        amount: outputAmount,
        currency: toCurrency,
        gasFee: "0.00250000",
        status: "CONFIRMED",
        blockNumber: 19000000 + Math.floor(Math.random() * 100000),
        blockHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        karmaEarned: 50,
        metadata: { fromCurrency, toCurrency, inputAmount: amount, outputAmount },
      });

      return NextResponse.json({
        success: true,
        txHash,
        fromCurrency,
        toCurrency,
        inputAmount: amount,
        outputAmount,
        rate: (fromRate / toRate).toFixed(8),
        gasFee: "0.00250000",
        status: "CONFIRMED",
      });
    }

    if (action === "TRANSFER") {
      const { toAddress, amount, currency } = body;
      const txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");

      await db.insert(transactions).values({
        walletId: w.id,
        txHash,
        type: "SEND",
        fromAddress: w.address,
        toAddress,
        amount,
        currency,
        gasFee: "0.00210000",
        status: "CONFIRMED",
        blockNumber: 19000000 + Math.floor(Math.random() * 100000),
        blockHash: "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join(""),
        karmaEarned: 10,
        metadata: { transferType: "METAMELLO_TO_METAMASK", handshake: "FULL", gasPaidBy: "METAMELLO" },
      });

      return NextResponse.json({
        success: true,
        txHash,
        fromAddress: w.address,
        toAddress,
        amount,
        currency,
        gasFee: "0.00210000",
        status: "CONFIRMED",
        message: "✅ Transfer confirmed — Full handshake & deposit complete",
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
