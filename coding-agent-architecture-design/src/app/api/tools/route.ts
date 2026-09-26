import { db } from "@/db";
import { toolCapabilities } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(toolCapabilities)
      .orderBy(toolCapabilities.category, toolCapabilities.toolName);

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
