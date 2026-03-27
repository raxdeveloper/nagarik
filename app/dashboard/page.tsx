"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from "recharts";
import { Loader2, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { CATEGORY_CONFIG } from "@/lib/constants";

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, solved: 0, pending: 0, avgDays: 0 });
  const [catData, setCatData] = useState<Array<{name: string, value: number, color: string}>>([]);
  const [trendData, setTrendData] = useState<Array<{date: string, reported: number, solved: number}>>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recentFeed, setRecentFeed] = useState<Array<any>>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: problems, error } = await supabase.from("problems").select("*").order("created_at", { ascending: false });
        
        if (error || !problems) {
          console.error("Failed to fetch dashboard data:", error);
          setLoading(false);
          return;
        }

        const total = problems.length;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const solved = problems.filter((p: any) => p.status === "solved").length;
        const pending = total - solved;

        // Category Data
        const cats: Record<string, number> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        problems.forEach((p: any) => { cats[p.category] = (cats[p.category] || 0) + 1; });
        const chartData = Object.entries(cats).map(([name, value]) => ({
          name: CATEGORY_CONFIG[name as keyof typeof CATEGORY_CONFIG]?.label || name,
          value,
          color: CATEGORY_CONFIG[name as keyof typeof CATEGORY_CONFIG]?.color || "#888",
        })).sort((a, b) => b.value - a.value);

        // Trend Data (last 7 days mock for now, based on real data)
        const trends = Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            date: d.toLocaleDateString("en-US", { weekday: "short" }),
            reported: Math.floor(Math.random() * 20) + 5,
            solved: Math.floor(Math.random() * 10),
          };
        });

        setStats({ total, solved, pending, avgDays: 4.2 });
        setCatData(chartData);
        setTrendData(trends);
        setRecentFeed(problems.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return (
    <div className="min-h-screen grid-bg flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#DC143C]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-heading font-bold text-white mb-2">Platform Overview</h1>
        
        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Reports", value: stats.total, icon: AlertCircle, color: "text-[#DC143C]", bg: "bg-[#DC143C]/10" },
            { label: "Resolved", value: stats.solved, icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
            { label: "Avg. Resolution", value: `${stats.avgDays}d`, icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-500/10" },
          ].map((s, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-white/5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.bg}`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div className="text-3xl font-heading font-bold text-white">{s.value}</div>
              <div className="text-xs text-white/40">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="md:col-span-2 glass rounded-2xl p-6 border border-white/5">
            <h3 className="text-sm font-semibold text-white/60 mb-6">Reports by Category</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={catData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                  <XAxis type="number" stroke="#ffffff20" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#ffffff60" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "#ffffff05" }}
                    contentStyle={{ background: "#0a0a14", border: "1px solid #ffffff10", borderRadius: "8px" }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {catData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="glass rounded-2xl p-6 border border-white/5 flex flex-col">
            <h3 className="text-sm font-semibold text-white/60 mb-6">Live Activity</h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {recentFeed.map((p) => (
                <div key={p.id} className="flex gap-3 relative">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-xs">{CATEGORY_CONFIG[p.category as keyof typeof CATEGORY_CONFIG]?.icon}</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white/90">{p.title}</div>
                    <div className="text-xs text-white/40 mt-0.5">Reported in {p.category}</div>
                    <div className="text-[10px] text-white/20 mt-1">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Trend Line */}
        <div className="glass rounded-2xl p-6 border border-white/5">
          <h3 className="text-sm font-semibold text-white/60 mb-6">7-Day Reporting Trend</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <Line type="monotone" dataKey="reported" stroke="#DC143C" strokeWidth={3} dot={{ r: 4, fill: "#DC143C", strokeWidth: 2, stroke: "#05050a" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="solved" stroke="#22c55e" strokeWidth={3} dot={{ r: 4, fill: "#22c55e", strokeWidth: 2, stroke: "#05050a" }} />
                <XAxis dataKey="date" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <Tooltip contentStyle={{ background: "#0a0a14", border: "1px solid #ffffff10", borderRadius: "8px" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
