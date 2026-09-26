import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MelodieSpark Phoenix | Bot Revenue Automation — Web3 Karma Ecosystem",
  description:
    "Enterprise Web3 Bot Revenue Automation System — MA Token Mining, Karma Power Points, Sacred Geometry Quantum CLI, MetaMello Wallet, and Digital Civilization Products & Services Ecosystem.",
  keywords: "MA Token, Karma Points, Web3, Blockchain, Bot Revenue, MelodieSpark, MetaMello, Crypto Mining",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="gradient-aurora hex-bg min-h-screen text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
