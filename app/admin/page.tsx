"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, ShieldCheck, CheckCircle2, XCircle, Clock } from "lucide-react";
import { Problem, User } from "@/lib/supabase/database.types";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import Link from "next/link";
import { timeAgo } from "@/lib/utils";

export default function AdminPage() {
  const [reports, setReports] = useState<Problem[]>([]);
  const [admin, setAdmin] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: userRaw } = await supabase.from("users").select("*").eq("id", user.id).single();
      const userData = userRaw as unknown as User;
      if (userData?.role === "admin" || userData?.role === "government") {
        setAdmin(userData);
        const { data: qProblems } = await supabase.from("problems").select("*").order("created_at", { ascending: false }).limit(100);
        if (qProblems) setReports(qProblems as Problem[]);
      }
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdate = async (id: string, updates: Partial<Problem>) => {
    setUpdatingId(id);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore – Supabase generated types resolve to never; runtime schema is valid
    const { error } = await supabase.from("problems").update(updates as any).eq("id", id);
    if (!error) {
      setReports((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)));
    }
    setUpdatingId(null);
  };

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#DC143C]" />
    </div>
  );

  if (!admin) return (
    <div className="min-h-screen grid-bg flex flex-col items-center justify-center text-white/40 gap-4">
      <ShieldCheck size={48} className="text-[#DC143C]/50" />
      <h2 className="text-xl font-heading font-bold text-white">Access Denied</h2>
      <p>You need Administrator or Government role to access this panel.</p>
      <Link href="/" className="px-6 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors mt-4">Return Home</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-white flex items-center gap-3">
              <ShieldCheck size={28} className="text-[#DC143C]" /> Admin Panel
            </h1>
            <p className="text-white/40 text-sm mt-1">Verify, reject, or update progress on reported problems.</p>
          </div>
          <div className="glass px-4 py-2 rounded-xl border border-[#DC143C]/20 text-xs flex flex-col items-end">
            <span className="text-white/40 uppercase tracking-widest">{admin.role}</span>
            <span className="text-white font-medium">{admin.name}</span>
          </div>
        </div>

        <div className="glass border border-white/5 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/5 text-xs text-white/40 uppercase tracking-wider font-semibold">
                  <th className="p-4 rounded-tl-2xl">Problem</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Severity</th>
                  <th className="p-4">Status & Progress</th>
                  <th className="p-4 text-right rounded-tr-2xl">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {reports.map((p) => {
                  const catConfig = CATEGORY_CONFIG[p.category];
                  const statConfig = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 max-w-[250px]">
                        <Link href={`/problem/${p.id}`} className="font-medium text-white text-sm line-clamp-1 group-hover:text-[#DC143C] transition-colors">
                          {p.title}
                        </Link>
                        <div className="text-[10px] text-white/30 mt-1">{timeAgo(p.created_at)}</div>
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ background: `${catConfig?.markerColor}15`, color: catConfig?.markerColor }}>
                          {catConfig?.icon} {catConfig?.label}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] font-bold ${p.severity >= 8 ? 'text-red-400' : p.severity >= 5 ? 'text-amber-400' : 'text-green-400'}`}>
                          {p.severity}/10
                        </span>
                      </td>
                      <td className="p-4 min-w-[200px]">
                        <div className="flex flex-col gap-2">
                          <select
                            value={p.status}
                            onChange={(e) => handleUpdate(p.id, { status: e.target.value as Problem['status'], solved_at: e.target.value === "solved" ? new Date().toISOString() : null })}
                            disabled={updatingId === p.id}
                            className={`text-xs px-2 py-1 rounded-lg border focus:outline-none disabled:opacity-50 appearance-none bg-[#0a0a14] ${statConfig?.bg}`}
                          >
                            <option value="reported">Reported</option>
                            <option value="verified">Verified</option>
                            <option value="in_progress">In Progress</option>
                            <option value="solved">Solved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          
                          <div className="flex items-center gap-2">
                            <input
                              type="range" min={0} max={100} step={5}
                              value={p.progress}
                              onChange={(e) => handleUpdate(p.id, { progress: Number(e.target.value) })}
                              disabled={updatingId === p.id}
                              className="w-full h-1 bg-white/10 rounded-full appearance-none accent-[#DC143C]"
                            />
                            <span className="text-[10px] text-white/40 w-6 text-right">{p.progress}%</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {updatingId === p.id ? (
                          <Loader2 size={16} className="animate-spin text-white/40 inline" />
                        ) : (
                          <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {p.status !== "verified" && p.status !== "solved" && (
                               <button onClick={() => handleUpdate(p.id, { status: "verified" })} title="Mark Verified" className="p-1.5 rounded bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors">
                                 <CheckCircle2 size={14} />
                               </button>
                            )}
                            {p.status !== "in_progress" && p.status !== "solved" && (
                               <button onClick={() => handleUpdate(p.id, { status: "in_progress", progress: 20 })} title="Start Progress" className="p-1.5 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors">
                                 <Clock size={14} />
                               </button>
                            )}
                            {p.status !== "rejected" && (
                               <button onClick={() => handleUpdate(p.id, { status: "rejected" })} title="Reject" className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                                 <XCircle size={14} />
                               </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {reports.length === 0 && (
              <div className="p-8 text-center text-white/30 text-sm">No reports to display.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
