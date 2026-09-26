import { db } from "@/db";
import { models, sessions, auditEvents, probeResults } from "@/db/schema";
import { sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const [modelStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        operational: sql<number>`count(*) filter (where ${models.status} = 'OPERATIONAL')::int`,
        unverified: sql<number>`count(*) filter (where ${models.status} = 'UNVERIFIED')::int`,
        scaffold: sql<number>`count(*) filter (where ${models.status} = 'SCAFFOLD')::int`,
        planned: sql<number>`count(*) filter (where ${models.status} = 'PLANNED')::int`,
      })
      .from(models);

    const [sessionStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        completed: sql<number>`count(*) filter (where ${sessions.status} = 'completed')::int`,
        failed: sql<number>`count(*) filter (where ${sessions.status} = 'failed')::int`,
        executing: sql<number>`count(*) filter (where ${sessions.status} = 'executing')::int`,
        avgDurationMs: sql<number>`avg(${sessions.durationMs})::int`,
      })
      .from(sessions);

    const [auditStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        toolCalls: sql<number>`count(*) filter (where ${auditEvents.eventType} = 'tool_call')::int`,
        modelCalls: sql<number>`count(*) filter (where ${auditEvents.eventType} = 'model_call')::int`,
        errors: sql<number>`count(*) filter (where ${auditEvents.eventType} = 'error')::int`,
      })
      .from(auditEvents);

    const [probeStats] = await db
      .select({
        total: sql<number>`count(*)::int`,
        passed: sql<number>`count(*) filter (where ${probeResults.status} = 'PASS')::int`,
        failed: sql<number>`count(*) filter (where ${probeResults.status} = 'FAIL')::int`,
      })
      .from(probeResults);

    // Status breakdown for chart
    const statusBreakdown = await db
      .select({
        status: models.status,
        count: sql<number>`count(*)::int`,
      })
      .from(models)
      .groupBy(models.status);

    return NextResponse.json({
      models: modelStats,
      sessions: sessionStats,
      audit: auditStats,
      probes: probeStats,
      statusBreakdown,
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
