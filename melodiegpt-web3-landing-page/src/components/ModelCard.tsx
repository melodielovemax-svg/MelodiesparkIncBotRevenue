"use client";

import { Lock, Users, Sparkles, Tag, EyeOff } from "lucide-react";
import type { Model } from "@/lib/models";

const tagStyles = {
  private: "bg-violet-500/10 text-violet-300 border-violet-500/20",
  anon: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
  new: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
  discount: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  uncensored: "bg-rose-500/10 text-rose-300 border-rose-500/20",
  locked: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const tagIcons = {
  private: Users,
  anon: EyeOff,
  new: Sparkles,
  discount: Tag,
  uncensored: EyeOff,
  locked: Lock,
};

interface ModelCardProps {
  model: Model;
}

export function ModelCard({ model }: ModelCardProps) {
  const isLocked = model.tags.some((t) => t.variant === "locked");

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl glass-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-white/15 hover:shadow-xl ${
        model.featured ? "ring-1 ring-violet-500/30" : ""
      }`}
    >
      {model.featured && (
        <div className="absolute top-0 right-0 rounded-bl-xl rounded-tr-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Featured
        </div>
      )}

      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${model.color} text-lg font-bold text-white shadow-lg`}
        >
          {model.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className={`text-base font-semibold ${isLocked ? "text-slate-500" : "text-white"}`}>
            {model.name}
          </h3>
          <p className={`text-xs ${isLocked ? "text-slate-600" : "text-slate-400"}`}>
            {model.provider}
          </p>
        </div>
        {isLocked && <Lock className="h-4 w-4 text-slate-500" />}
      </div>

      <p
        className={`mt-4 text-sm leading-relaxed ${
          isLocked ? "text-slate-600" : "text-slate-300"
        }`}
      >
        {model.description}
      </p>

      {model.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {model.tags.map((tag) => {
            const Icon = tagIcons[tag.variant];
            return (
              <span
                key={tag.text}
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${tagStyles[tag.variant]}`}
              >
                <Icon className="h-3 w-3" />
                {tag.text}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
}
