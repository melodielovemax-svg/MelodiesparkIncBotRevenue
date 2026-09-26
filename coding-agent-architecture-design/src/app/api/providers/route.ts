import { db } from "@/db";
import { providers, models } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: providers.id,
        name: providers.name,
        displayName: providers.displayName,
        baseUrl: providers.baseUrl,
        isConfigured: providers.isConfigured,
        isReachable: providers.isReachable,
        lastCheckedAt: providers.lastCheckedAt,
        modelCount: sql<number>`count(${models.id})::int`,
      })
      .from(providers)
      .leftJoin(models, eq(models.providerId, providers.id))
      .groupBy(providers.id);

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
