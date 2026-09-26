import { db } from "@/db";
import { sessions, auditEvents, models } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

const RunSchema = z.object({
  task: z.string().min(1).max(2000),
  modelId: z.string().optional(),
  role: z
    .enum(["architect", "coder", "tester", "verifier", "orchestrator", "general"])
    .optional()
    .default("general"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RunSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { task, modelId, role } = parsed.data;

    // Find model
    let model = null;
    if (modelId) {
      const found = await db
        .select()
        .from(models)
        .where(eq(models.modelId, modelId))
        .limit(1);
      model = found[0] ?? null;
    } else {
      // Default to gpt-4-turbo
      const found = await db
        .select()
        .from(models)
        .where(eq(models.modelId, "openai/gpt-4-turbo"))
        .limit(1);
      model = found[0] ?? null;
    }

    // Create session
    const [session] = await db
      .insert(sessions)
      .values({
        taskDescription: task,
        modelId: model?.id ?? null,
        role,
        status: "planning",
        planJson: {
          steps: [
            "Inspect repository structure",
            "Understand task requirements",
            "Plan implementation",
            "Execute changes",
            "Run tests",
            "Verify and report",
          ],
        },
        permissionsJson: {
          filesystem: { read: true, write: true },
          shell: { enabled: true, timeout_seconds: 120 },
          git: { enabled: true, commit: false, push: false },
          network: { enabled: false },
          destructive: { enabled: false },
          package_install: { require_approval: true },
        },
      })
      .returning();

    // Log session_start event
    await db.insert(auditEvents).values({
      sessionId: session.id,
      eventType: "session_start",
      agentModel: model?.modelId ?? "unknown",
      message: `Session started: ${task}`,
    });

    // Simulate agent execution steps
    const agentModel = model?.modelId ?? "openai/gpt-4-turbo";
    const simulatedEvents = [
      {
        sessionId: session.id,
        eventType: "plan_created" as const,
        agentModel,
        message: "Planning phase: 6 steps identified",
        durationMs: 340,
      },
      {
        sessionId: session.id,
        eventType: "tool_call" as const,
        agentModel,
        tool: "filesystem",
        path: "src/",
        action: "read",
        result: "success" as const,
        durationMs: 18,
        message: "Repository structure inspected",
      },
      {
        sessionId: session.id,
        eventType: "model_call" as const,
        agentModel,
        result: "success" as const,
        durationMs: 1820,
        message: `Model analyzed task: "${task.slice(0, 60)}..."`,
      },
      {
        sessionId: session.id,
        eventType: "tool_call" as const,
        agentModel,
        tool: "search",
        action: "semantic_search",
        result: "success" as const,
        durationMs: 95,
        message: "Relevant files located",
      },
      {
        sessionId: session.id,
        eventType: "tool_call" as const,
        agentModel,
        tool: "filesystem",
        path: "src/generated.ts",
        action: "write",
        result: "success" as const,
        durationMs: 8,
        message: "Implementation written",
      },
      {
        sessionId: session.id,
        eventType: "tool_call" as const,
        agentModel,
        tool: "shell",
        action: "run",
        result: "success" as const,
        durationMs: 4200,
        message: "Tests executed: all passed",
      },
      {
        sessionId: session.id,
        eventType: "task_completed" as const,
        agentModel,
        result: "success" as const,
        message: "Task completed successfully",
      },
      {
        sessionId: session.id,
        eventType: "session_end" as const,
        agentModel,
        message: "Session finalized",
      },
    ];

    await db.insert(auditEvents).values(simulatedEvents);

    // Mark session as completed
    await db
      .update(sessions)
      .set({
        status: "completed",
        completedAt: new Date(),
        durationMs: 6481,
        totalToolCalls: simulatedEvents.filter((e) => e.eventType === "tool_call").length,
        totalModelCalls: simulatedEvents.filter((e) => e.eventType === "model_call").length,
      })
      .where(eq(sessions.id, session.id));

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      model: model?.modelId ?? "unknown",
      role,
      eventsCreated: simulatedEvents.length + 1,
    });
  } catch (error) {
    console.error("Run error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
