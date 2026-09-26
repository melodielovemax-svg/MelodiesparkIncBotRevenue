import { db } from "@/db";
import { models } from "@/db/schema";

export const dynamic = "force-dynamic";
import { eq } from "drizzle-orm";
import { PageHeader } from "@/components/PageHeader";
import { RunClient } from "./RunClient";

async function getOperationalModels() {
  return db
    .select({
      id: models.id,
      modelId: models.modelId,
      displayName: models.displayName,
      role: models.role,
      status: models.status,
    })
    .from(models)
    .where(eq(models.status, "OPERATIONAL"))
    .orderBy(models.displayName);
}

export default async function RunPage() {
  const operationalModels = await getOperationalModels();

  return (
    <div>
      <PageHeader
        title="Run Task"
        subtitle="Start an agent session — describe your task and select a model"
        breadcrumb="melodiespark-agent run"
      />
      <RunClient models={operationalModels} />
    </div>
  );
}
