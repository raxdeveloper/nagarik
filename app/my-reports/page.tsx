"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, FileText, Calendar, Eye, AlertCircle, TrendingUp } from "lucide-react";
import { Problem } from "@/lib/supabase/database.types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Image from "next/image";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { timeAgo, severityLabel } from "@/lib/utils";

export default function MyReportsPage() {
  const [reports, setReports] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  type ReportProblem = Problem;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    async function load() {
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("problems").select("*").eq("created_by", user.id).order("created_at", { ascending: false });
      if (data) setReports(data as ReportProblem[]);
      setLoading(false);
    }
    load();
  }, [user]);

  if (loading) return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#DC143C]" />
    </div>
  );

  if (!user) return (
    <div className="min-h-screen bg-[#05050a] flex flex-col items-center justify-center text-white/40 gap-4">
      <AlertCircle size={48} className="text-[#DC143C]/50" />
      <p>Sign in to view your reports</p>
      <Link href="/login" className="px-6 py-2 bg-[#DC143C] text-white rounded-xl hover:bg-[#c01030] transition-colors">Sign In</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
              <FileText size={28} className="text-[#DC143C]" /> My Reports
            </h1>
            <p className="text-white/40 text-sm mt-1">Track the status of problems you&apos;ve reported</p>
          </div>
          <div className="glass px-4 py-2 rounded-xl border border-[#DC143C]/20 flex items-center gap-2">
            <span className="text-[#DC143C] font-bold">Total:</span>
            <span className="text-white">{reports.length}</span>
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="glass border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
            <FileText size={48} className="text-white/10 mb-4" />
            <h3 className="text-lg font-heading text-white mb-2">No reports yet</h3>
            <p className="text-white/40 text-sm max-w-sm mb-6">You haven&apos;t reported any problems. Become an active Nagrika by reporting civic issues around you.</p>
            <Link href="/map" className="px-6 py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white rounded-xl transition-all">Go to Map</Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {reports.map((p) => {
              const catConfig = CATEGORY_CONFIG[p.category];
              const statConfig = STATUS_CONFIG[p.status];
              const sev = severityLabel(p.severity);

              return (
                <Link href={`/problem/${p.id}`} key={p.id} className="glass rounded-2xl border border-white/5 hover:border-[#DC143C]/30 transition-all flex flex-col overflow-hidden group">
                  {/* Image */}
                  <div className="h-32 bg-white/5 relative overflow-hidden">
                    {p.images?.[0] ? (
                      <Image src={p.images[0]} alt={p.title} fill className="object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <span className="text-4xl">{catConfig?.icon}</span>
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statConfig?.bg} backdrop-blur-md`}>
                        {statConfig?.label}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catConfig?.markerColor}20`, color: catConfig?.markerColor }}>
                        {catConfig?.icon} {catConfig?.label}
                      </span>
                      <span className={`text-[10px] ${sev?.color}`}>Sev {p.severity}/10</span>
                    </div>
                    
                    <h3 className="font-heading font-semibold text-white text-sm line-clamp-2 leading-tight mb-2 group-hover:text-[#DC143C] transition-colors">
                      {p.title}
                    </h3>
                    
                    <p className="text-xs text-white/40 line-clamp-2 leading-relaxed mb-4 flex-1">
                      {p.description}
                    </p>

                    {/* Progress */}
                    {p.progress > 0 && (
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] text-white/30 mb-1">
                          <span>Progress</span><span>{p.progress}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-[#DC143C] to-blue-500 rounded-full" style={{ width: `${p.progress}%` }} />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-[10px] text-white/30 pt-3 border-t border-white/5 mt-auto">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><TrendingUp size={10} /> {p.upvotes}</span>
                        <span className="flex items-center gap-1"><Eye size={10} /> {p.view_count}</span>
                      </div>
                      <span className="flex items-center gap-1 flex-shrink-0">
                        <Calendar size={10} /> {timeAgo(p.created_at)}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
