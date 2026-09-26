import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Melodiespark Agent Platform",
  description:
    "Provider-neutral coding-agent CLI runtime with OpenRouter model registry, audit logs, and session management.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0a0e14] text-slate-200 antialiased">
        <Sidebar />
        <main className="ml-60 min-h-screen">
          <div className="px-8 py-8 max-w-7xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
