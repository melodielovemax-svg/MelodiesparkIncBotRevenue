import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

function getLedgerStatus() {
  try {
    // The env var points to ledger directory, not the file
    let ledgerPath = process.env.MELODIE_LEDGER_PATH
      ? path.join(process.env.MELODIE_LEDGER_PATH, "ledger.json")
      : path.join("/melodie-data", "ledger", "ledger.json");

    console.log("[health] Looking for ledger at:", ledgerPath);

    if (!fs.existsSync(ledgerPath)) {
      console.log("[health] Ledger not found:", ledgerPath);
      return {
        verifiedPayments: 0,
        totalRevenue: 0,
        ledgerFound: false,
        searchedPath: ledgerPath,
      };
    }

    const ledgerRaw = fs.readFileSync(ledgerPath, "utf-8");
    const ledger = JSON.parse(ledgerRaw);

    console.log("[health] Ledger found with", ledger.length, "entries");

    return {
      verifiedPayments: Array.isArray(ledger) ? ledger.length : 0,
      totalRevenue: Array.isArray(ledger)
        ? ledger.reduce((sum, entry) => sum + (entry.amount || 0), 0)
        : 0,
      ledgerFound: true,
      ledgerPath,
    };
  } catch (error) {
    console.error("[health] Ledger error:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown error",
      verifiedPayments: 0,
      totalRevenue: 0,
      ledgerFound: false,
    };
  }
}

function getTaskStatus() {
  try {
    const tasksRoot = process.env.MELODIE_TASKS_PATH || "/melodie-tasks";

    const taskPath = path.join(tasksRoot, "18-tasks", "TASKLIST_1000.csv");
    const manifestPath = path.join(tasksRoot, "PROJECT_MANIFEST.json");

    console.log("[health] Looking for tasks at:", taskPath);
    console.log("[health] Looking for manifest at:", manifestPath);

    if (!fs.existsSync(taskPath) || !fs.existsSync(manifestPath)) {
      console.log("[health] Tasks or manifest not found");
      return {
        verified: false,
        csvRows: 0,
        manifestCount: 0,
        taskPath,
        manifestPath,
      };
    }

    const csvContent = fs.readFileSync(taskPath, "utf-8");
    const csvRows = csvContent
      .split("\n")
      .filter((line) => line.trim()).length - 1;

    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
    const manifestCount = manifest.task_count || 0;

    console.log("[health] Tasks found - CSV rows:", csvRows, "Manifest:", manifestCount);

    return {
      verified: csvRows === manifestCount,
      csvRows,
      manifestCount,
      match: csvRows === manifestCount,
    };
  } catch (error) {
    console.error("[health] Task error:", error);
    return {
      verified: false,
      error: error instanceof Error ? error.message : "Unknown error",
      csvRows: 0,
      manifestCount: 0,
    };
  }
}

export async function GET() {
  const ledger = getLedgerStatus();
  const tasks = getTaskStatus();

  const status = {
    status: "ok",
    service: "melodiespark-web",
    timestamp: new Date().toISOString(),
    infrastructure: {
      containerRunning: true,
      databaseConfigured: Boolean(process.env.DATABASE_URL),
      backendLedgerAccessible: ledger.ledgerFound,
      ledgerPath: ledger.ledgerPath,
    },
    businessMetrics: {
      verifiedPayments: ledger.verifiedPayments,
      verifiedRevenue: `$${ledger.totalRevenue.toFixed(2)}`,
      verifiedRevenueAmount: ledger.totalRevenue,
      taskIntegrityValid: tasks.verified,
      taskCount: tasks.csvRows,
    },
    verification: {
      ledgerStatus: ledger,
      taskStatus: tasks,
    },
    note: "All metrics reflect actual verified data from mounted backend ledger. No synthetic or claimed values.",
  };

  if (!ledger.ledgerFound || !tasks.verified) {
    return NextResponse.json(
      {
        ...status,
        status: "degraded",
      },
      { status: 503 }
    );
  }

  return NextResponse.json(status, { status: 200 });
}
