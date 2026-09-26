import { db } from "@/db";
import { sessions, models } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select({
        id: sessions.id,
        taskDescription: sessions.taskDescription,
        role: sessions.role,
        status: sessions.status,
        totalToolCalls: sessions.totalToolCalls,
        totalModelCalls: sessions.totalModelCalls,
        durationMs: sessions.durationMs,
        errorMessage: sessions.errorMessage,
        startedAt: sessions.startedAt,
        completedAt: sessions.completedAt,
        modelId: models.modelId,
        modelDisplayName: models.displayName,
      })
      .from(sessions)
      .leftJoin(models, eq(sessions.modelId, models.id))
      .orderBy(desc(sessions.startedAt));

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
