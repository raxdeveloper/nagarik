"use client";

import { useStore } from "@/lib/store/useStore";
import { CATEGORY_CONFIG, PROVINCE_NAMES, STATUS_CONFIG } from "@/lib/constants";
import { ProblemCategory, ProblemStatus } from "@/lib/supabase/database.types";
import { RotateCcw } from "lucide-react";

export function FilterSidebar() {
  const { filters, setFilters, resetFilters } = useStore();

  return (
    <div className="w-64 flex-shrink-0 glass-dark border-r border-white/5 overflow-y-auto flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <h3 className="text-sm font-heading font-semibold text-white">Filters</h3>
        <button onClick={resetFilters} className="text-white/30 hover:text-white/70 transition-colors flex items-center gap-1 text-xs">
          <RotateCcw size={11} /> Reset
        </button>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* Category */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Category</label>
          <div className="space-y-1">
            <button
              onClick={() => setFilters({ category: null })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${!filters.category ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              All Categories
            </button>
            {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilters({ category: key as ProblemCategory })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-center gap-2 ${filters.category === key ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.markerColor }} />
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Status</label>
          <div className="space-y-1">
            <button
              onClick={() => setFilters({ status: null })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${!filters.status ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              All Status
            </button>
            {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setFilters({ status: key as ProblemStatus })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${filters.status === key ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Province */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">Province</label>
          <div className="space-y-1">
            <button
              onClick={() => setFilters({ province_id: null })}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${!filters.province_id ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
            >
              All Provinces
            </button>
            {PROVINCE_NAMES.map((p) => (
              <button
                key={p.id}
                onClick={() => setFilters({ province_id: p.id })}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all ${filters.province_id === p.id ? "bg-white/10 text-white" : "text-white/40 hover:text-white hover:bg-white/5"}`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Severity Range */}
        <div>
          <label className="text-xs text-white/40 uppercase tracking-wider mb-2 block">
            Severity: {filters.severity_min}–{filters.severity_max}
          </label>
          <div className="space-y-2">
            <input
              type="range" min={1} max={10}
              value={filters.severity_min}
              onChange={(e) => setFilters({ severity_min: Number(e.target.value) })}
              className="w-full accent-[#DC143C] h-1"
            />
            <input
              type="range" min={1} max={10}
              value={filters.severity_max}
              onChange={(e) => setFilters({ severity_max: Number(e.target.value) })}
              className="w-full accent-[#DC143C] h-1"
            />
          </div>
          <div className="flex justify-between text-xs text-white/20 mt-1">
            <span>Low 1</span>
            <span>Critical 10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
