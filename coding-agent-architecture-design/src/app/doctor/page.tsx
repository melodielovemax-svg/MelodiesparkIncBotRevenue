import { db } from "@/db";
import { probeResults } from "@/db/schema";
import { desc } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { DoctorClient } from "./DoctorClient";

export const dynamic = "force-dynamic";

async function getProbes() {
  return db
    .select()
    .from(probeResults)
    .orderBy(probeResults.category, desc(probeResults.runAt));
}

export default async function DoctorPage() {
  const probes = await getProbes();
  return (
    <div>
      <PageHeader
        title="Agent Doctor"
        subtitle="Runtime verification — PASS is only emitted after the operation actually executes successfully"
        breadcrumb="melodiespark-agent doctor"
      />
      <DoctorClient initialProbes={probes} />
    </div>
  );
}
