import { db } from "@/db";
import { probeResults } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(probeResults)
      .orderBy(probeResults.category, desc(probeResults.runAt));

    return NextResponse.json(rows);
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
