import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "MelodieGPT — Ultimate Web3 AI Chatbot",
  description:
    "MelodieGPT is the next-generation Web3 AI chatbot with access to the world's leading models including GPT-6 Astra, Claude Opus 5, Gemini 3.8 Flash, Grok 4.6, and more.",
  keywords: [
    "Web3",
    "AI",
    "Chatbot",
    "MelodieGPT",
    "GPT-6 Astra",
    "Claude Opus 5",
    "Gemini 3.8 Flash",
    "Grok 4.6",
    "Kimi K3",
    "DeepSeek",
  ],
  authors: [{ name: "MelodieGPT" }],
  openGraph: {
    title: "MelodieGPT — Ultimate Web3 AI Chatbot",
    description:
      "The decentralized AI interface that lets you chat with every top model from one place.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-slate-950 text-slate-50 antialiased selection:bg-violet-500/40 selection:text-white">
        {children}
      </body>
    </html>
  );
}
