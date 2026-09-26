"use client";

import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { models } from "@/lib/models";
import { ModelCard } from "./ModelCard";

const filterOptions = ["All", "Anon", "Private", "New", "Coding"];

export function ModelShowcase() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredModels = models.filter((model) => {
    const matchesQuery =
      model.name.toLowerCase().includes(query.toLowerCase()) ||
      model.provider.toLowerCase().includes(query.toLowerCase()) ||
      model.description.toLowerCase().includes(query.toLowerCase());

    if (activeFilter === "All") return matchesQuery;
    if (activeFilter === "Coding") {
      const codingTerms = ["code", "coding", "programming", "smart contract", "anchor", "rust", "python", "javascript"];
      return matchesQuery && codingTerms.some((term) => model.description.toLowerCase().includes(term));
    }
    return matchesQuery && model.tags.some((tag) => tag.text === activeFilter || tag.variant === activeFilter.toLowerCase());
  });

  return (
    <section id="models" className="relative px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              All <span className="text-gradient">Models & Agents</span>
            </h2>
            <p className="mt-3 max-w-xl text-slate-400">
              Every frontier model from the MelodieGPT registry — accessible
              through a single Web3-native interface.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search models..."
                className="h-10 rounded-full border border-white/10 bg-slate-900/60 pl-9 pr-4 text-sm text-white placeholder:text-slate-500 focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-slate-500" />
              <div className="flex flex-wrap gap-2">
                {filterOptions.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                      activeFilter === filter
                        ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20"
                        : "border border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredModels.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </div>

        {filteredModels.length === 0 && (
          <div className="mt-12 rounded-2xl border border-dashed border-white/10 bg-white/5 py-16 text-center">
            <p className="text-slate-400">No models match your search.</p>
          </div>
        )}
      </div>
    </section>
  );
}
