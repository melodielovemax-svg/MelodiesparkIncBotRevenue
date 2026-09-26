import { Suspense } from "react";
import { DashboardContent } from "./DashboardContent";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-slate-500 font-mono text-sm animate-pulse">
            Loading runtime...
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
