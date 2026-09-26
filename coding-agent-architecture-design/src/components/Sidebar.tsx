"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Cpu,
  Server,
  Wrench,
  Terminal,
  ScrollText,
  Stethoscope,
  ShieldCheck,
  PlayCircle,
  GitBranch,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/models", label: "Models", icon: Cpu },
  { href: "/providers", label: "Providers", icon: Server },
  { href: "/tools", label: "Tools", icon: Wrench },
  { href: "/sessions", label: "Sessions", icon: Terminal },
  { href: "/audit", label: "Audit Log", icon: ScrollText },
  { href: "/doctor", label: "Agent Doctor", icon: Stethoscope },
  { href: "/permissions", label: "Permissions", icon: ShieldCheck },
  { href: "/run", label: "Run Task", icon: PlayCircle },
  { href: "/architecture", label: "Architecture", icon: GitBranch },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-[#0d1117] border-r border-white/5 flex flex-col z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">MA</span>
          </div>
          <div>
            <p className="text-white text-sm font-semibold leading-tight">
              Melodiespark
            </p>
            <p className="text-slate-500 text-[10px] font-mono">Agent Runtime</p>
          </div>
        </div>
      </div>

      {/* Version badge */}
      <div className="px-5 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 text-[10px] font-mono">
            v0.1.0 — Phase 1
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                isActive
                  ? "bg-violet-500/15 text-violet-300 font-medium"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon
                size={15}
                className={isActive ? "text-violet-400" : "text-slate-500"}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/5">
        <p className="text-slate-600 text-[10px] font-mono">
          Provider-neutral · OpenRouter
        </p>
        <p className="text-slate-700 text-[10px] font-mono mt-0.5">
          PostgreSQL · Drizzle ORM
        </p>
      </div>
    </aside>
  );
}
