"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, Wallet } from "lucide-react";

const navLinks = [
  { label: "Models", href: "#models" },
  { label: "Chat Demo", href: "#chat" },
  { label: "Web3", href: "#web3" },
  { label: "Features", href: "#features" },
];

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "glass shadow-lg shadow-black/20" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/25">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Melodie<span className="text-gradient">GPT</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <button className="group relative overflow-hidden rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-700 hover:shadow-lg hover:shadow-cyan-500/20">
            <span className="relative z-10 flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </span>
          </button>
          <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-600/25 transition-all hover:from-violet-500 hover:to-fuchsia-500 hover:shadow-violet-500/40">
            Launch App
          </button>
        </div>

        <button
          className="md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-slate-200" />
          ) : (
            <Menu className="h-6 w-6 text-slate-200" />
          )}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass border-t border-white/5 px-6 py-4 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-slate-300 transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <button className="flex items-center justify-center gap-2 rounded-full bg-slate-800 px-5 py-2.5 text-sm font-semibold text-white">
                <Wallet className="h-4 w-4" />
                Connect Wallet
              </button>
              <button className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white">
                Launch App
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
