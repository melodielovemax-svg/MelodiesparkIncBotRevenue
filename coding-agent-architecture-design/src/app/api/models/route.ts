import { db } from "@/db";
import { models, providers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: models.id,
        modelId: models.modelId,
        displayName: models.displayName,
        status: models.status,
        role: models.role,
        contextWindow: models.contextWindow,
        inputPricePer1k: models.inputPricePer1k,
        outputPricePer1k: models.outputPricePer1k,
        supportsTools: models.supportsTools,
        supportsVision: models.supportsVision,
        supportsStreaming: models.supportsStreaming,
        lastProbeAt: models.lastProbeAt,
        lastProbeResult: models.lastProbeResult,
        notes: models.notes,
        updatedAt: models.updatedAt,
        providerName: providers.name,
        providerDisplayName: providers.displayName,
      })
      .from(models)
      .leftJoin(providers, eq(models.providerId, providers.id))
      .orderBy(models.status, models.displayName);

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
