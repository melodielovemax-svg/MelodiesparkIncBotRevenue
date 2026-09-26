import { db } from "@/db";
import { auditEvents, sessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    let query = db
      .select({
        id: auditEvents.id,
        eventType: auditEvents.eventType,
        agentModel: auditEvents.agentModel,
        tool: auditEvents.tool,
        path: auditEvents.path,
        action: auditEvents.action,
        result: auditEvents.result,
        durationMs: auditEvents.durationMs,
        message: auditEvents.message,
        createdAt: auditEvents.createdAt,
        sessionId: auditEvents.sessionId,
        sessionTask: sessions.taskDescription,
      })
      .from(auditEvents)
      .leftJoin(sessions, eq(auditEvents.sessionId, sessions.id))
      .orderBy(desc(auditEvents.createdAt))
      .$dynamic();

    if (sessionId) {
      query = query.where(eq(auditEvents.sessionId, sessionId));
    }

    const rows = await query.limit(200);
    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
