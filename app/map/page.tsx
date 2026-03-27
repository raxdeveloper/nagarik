"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store/useStore";
import { supabase } from "@/lib/supabase/client";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { Problem } from "@/lib/supabase/database.types";
import { ProblemDetailPanel } from "@/components/problems/ProblemDetailPanel";
import { FilterSidebar } from "@/components/map/FilterSidebar";
import { ReportForm } from "@/components/problems/ReportForm";
import { SlidersHorizontal, Search, Map, List, LayoutGrid, Loader2 } from "lucide-react";

export default function MapPage() {
  const { problems, setProblems, addProblem, filters, nav, setSelectedProblemId, setView, setShowReportForm } = useStore();
  const [NepalMap, setNepalMap] = useState<React.ComponentType<{ problems: Problem[] }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterOpen, setFilterOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically import map (SSR safe)
  useEffect(() => {
    import("@/components/map/NepalMap").then((m) => setNepalMap(() => m.NepalMap));
  }, []);

  // Fetch problems
  useEffect(() => {
    async function fetchProblems() {
      setLoading(true);
      let query = supabase.from("problems").select("*").order("created_at", { ascending: false }).limit(200);
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.province_id) query = query.eq("province_id", filters.province_id);
      query = query.gte("severity", filters.severity_min).lte("severity", filters.severity_max);

      const { data, error } = await query;
      if (!error && data) setProblems(data as Problem[]);
      setLoading(false);
    }
    fetchProblems();
  }, [filters, setProblems]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("problems-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "problems" }, (payload) => {
        addProblem(payload.new as Problem);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "problems" }, () => {
        // handled in store via updateProblem
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [addProblem]);

  const filteredProblems = problems.filter((p) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 w-screen h-screen bg-[#030303] overflow-hidden">
      
      {/* Absolute Full Screen Map Layer */}
      <div className="absolute inset-0 z-0">
        {nav.view === "map" && (
          <>
            {NepalMap ? (
              <NepalMap problems={filteredProblems} />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/40 bg-[#030303]">
                <Loader2 size={32} className="animate-spin" />
              </div>
            )}
          </>
        )}
        {nav.view === "city" && (
          <div className="w-full h-full flex items-center justify-center bg-[#030303]">
            <div className="text-center">
              <div className="text-4xl mb-3">🏙️</div>
              <div className="text-white/60 font-medium">City View</div>
              <div className="text-white/30 text-sm">3D building visualization</div>
            </div>
          </div>
        )}
      </div>

      {/* Floating UI Overlays */}
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-col pt-[88px]">
        
        {/* Top Control Bar Floating */}
        <div className="pointer-events-auto flex items-center gap-2 px-4 py-3 mx-4 mt-4 glass-dark rounded-2xl shadow-2xl flex-shrink-0">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className={`p-2 rounded-xl transition-all ${filterOpen ? "bg-white text-black" : "text-white/60 hover:text-white hover:bg-white/10"}`}
          >
            <SlidersHorizontal size={18} />
          </button>

          <div className="flex-1 max-w-sm relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="Search city, problem..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-[15px] font-medium text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 glass rounded-xl p-1 ml-auto">
            {([["map", Map], ["city", LayoutGrid], ["list", List]] as const).map(([v, Icon]) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1.5 rounded-lg transition-all capitalize text-[13px] font-semibold flex items-center gap-1.5 ${nav.view === v ? "bg-white text-black shadow-md" : "text-white/50 hover:text-white"}`}
              >
                <Icon size={14} />
                <span className="hidden md:inline">{v}</span>
              </button>
            ))}
          </div>

          <button onClick={() => setShowReportForm(true)} className="btn-primary ml-2 py-2 px-4 text-sm hidden sm:flex">
            Report Issue
          </button>
        </div>

        {/* Floating Sidebars Body */}
        <div className="flex-1 flex overflow-hidden p-4 gap-4 pointer-events-none">
          
          {/* Filters Sidebar */}
          {filterOpen && (
            <div className="pointer-events-auto w-80 flex-shrink-0 glass-dark rounded-3xl overflow-hidden shadow-2xl h-fit max-h-full overflow-y-auto">
              <FilterSidebar />
            </div>
          )}

          {/* List View Overlay */}
          {nav.view === "list" && (
            <div className="pointer-events-auto flex-1 glass-dark rounded-3xl overflow-y-auto shadow-2xl p-6">
              <div className="space-y-3 max-w-3xl mx-auto">
                {filteredProblems.map((p) => (
                  <button key={p.id} onClick={() => setSelectedProblemId(p.id)} className="w-full bg-white/5 rounded-2xl p-5 hover:bg-white/10 text-left transition-all flex gap-4 items-center group">
                    <div className="w-4 h-4 rounded-full flex-shrink-0 shadow-[0_0_12px_currentColor]" style={{ color: CATEGORY_CONFIG[p.category]?.markerColor, background: "currentColor" }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-heading font-bold text-white text-lg truncate mb-1 group-hover:underline">{p.title}</div>
                      <div className="text-sm text-white/50 capitalize font-medium">{p.category} • Severity {p.severity}/10 • {p.status}</div>
                    </div>
                    <div className="text-sm font-bold text-white/40 group-hover:text-white">↑ {p.upvotes}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detail Side Panel Overlay */}
          {nav.selectedProblemId && (
            <div className="pointer-events-auto w-96 flex-shrink-0 ml-auto glass-dark rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col h-full right-bound">
              <ProblemDetailPanel problemId={nav.selectedProblemId} />
            </div>
          )}
        </div>
      </div>

      <div className="pointer-events-auto">
        {nav.showReportForm && <ReportForm />}
      </div>
    </div>
  );
}
