"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Map, AlertCircle, Users, CheckCircle2, Activity, Globe, Zap, ArrowRight, Home, BarChart } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store/useStore";
import { ReportForm } from "@/components/problems/ReportForm";

// ... existing AnimatedNumber and BentoStats ...
function AnimatedNumber({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);
  const startTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (target === 0) {
      setCurrent(0);
      return;
    }
    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCurrent(Math.floor(eased * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [target, duration]);

  return <span>{current.toLocaleString()}</span>;
}

function BentoStats({ stats }: { stats: { total: number; solved: number; users: number; districts: number } }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl mx-auto px-6 mb-32 relative z-10">
      {[
        { label: "Civic Reports Filed", value: stats.total, icon: AlertCircle, color: "text-[#DC143C]" },
        { label: "Issues Resolved", value: stats.solved, icon: CheckCircle2, color: "text-green-400" },
        { label: "Active Citizens", value: stats.users, icon: Users, color: "text-purple-400" },
        { label: "Districts Covered", value: stats.districts, icon: Map, color: "text-blue-400" },
      ].map((s, i) => {
        const Icon = s.icon;
        return (
          <motion.div 
            key={i} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 + (i * 0.1) }}
            className="glass-card rounded-[2rem] p-8 flex flex-col items-center justify-center text-center relative overflow-hidden group"
          >
            <div className={`absolute top-0 left-0 w-full h-1 opacity-20 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-transparent via-current to-transparent ${s.color}`} />
            <div className={`mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 ${s.color} group-hover:scale-110 transition-transform`}>
              <Icon size={32} strokeWidth={1.5} />
            </div>
            <div className="text-5xl md:text-6xl font-heading font-black text-white mb-2 tracking-tight">
              <AnimatedNumber target={s.value} />
            </div>
            <div className="text-sm font-medium text-white/50 uppercase tracking-widest">{s.label}</div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { nav, setShowReportForm } = useStore();
  const [stats, setStats] = useState({ total: 0, solved: 0, users: 0, districts: 0 });

  useEffect(() => {
    async function fetchStats() {
      try {
        const [totalRes, solvedRes, usersRes, distRes] = await Promise.all([
          supabase.from("problems").select("*", { count: "exact", head: true }),
          supabase.from("problems").select("*", { count: "exact", head: true }).eq("status", "solved"),
          supabase.from("users").select("*", { count: "exact", head: true }),
          supabase.from("problems").select("district_id").not("district_id", "is", null)
        ]);
        const uniqueDist = new Set((distRes.data as any)?.map((p: any) => p.district_id)).size;
        
        // Use ?? 0 to strictly use real data and avoid rendering mock fallbacks when Count is 0
        setStats({
          total: totalRes.count ?? 0, 
          solved: solvedRes.count ?? 0,
          users: usersRes.count ?? 0, 
          districts: uniqueDist || 0
        });
      } catch (err) {
        setStats({ total: 0, solved: 0, users: 0, districts: 0 });
      }
    }
    fetchStats();
  }, []);

  const handleReportAction = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setShowReportForm(true);
    } else {
      router.push("/login?redirect=report");
    }
  };

  return (
    <div className="min-h-screen bg-[#030303] selection:bg-white selection:text-black grid-bg relative">
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#DC143C] opacity-[0.05] blur-[150px] pointer-events-none" />

      {/* ── CLEAN HERO ────────────────────────────────────── */}
      <section className="relative pt-32 pb-20 flex flex-col items-center justify-center overflow-hidden z-10 px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-4xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#DC143C]/30 bg-[#DC143C]/10 text-[#DC143C] text-xs font-bold uppercase tracking-widest mb-10 shadow-[0_0_20px_rgba(220,20,60,0.1)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
            </span>
            Live Updates Across All 7 Provinces
          </div>
          
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-[7rem] font-heading font-black text-white leading-[1] tracking-[-0.03em] mb-8 drop-shadow-2xl text-center">
            Empowering <br className="hidden sm:block"/> The Citizens.
          </h1>
          
          <p className="text-xl text-white/60 font-medium max-w-3xl mb-12 leading-relaxed">
            Report local civic issues, infrastructure problems, and track resolutions. 
            A minimalist civic-tech platform for 30 million people.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md mx-auto">
            <button onClick={handleReportAction} className="btn-primary w-full shadow-xl">
              Take Action Now <ArrowRight size={18} strokeWidth={2.5} />
            </button>
            <Link href="/map" className="btn-ghost w-full">
              <Map size={18} /> View Live Map
            </Link>
          </div>
        </motion.div>
      </section>

      {/* ── BENTO STATS ──────────────────────────────────── */}
      <BentoStats stats={stats} />

      {/* ── FEATURES GRID ─────────────────────────────────── */}
      <section className="pb-32 px-6 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">How Nagrika Works</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">Modern tools built for a transparent democracy.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { tag: "01", title: "Report Instantly", desc: "Snap a picture, geo-tag the precise location, and submit a civic issue directly to the public ledger in seconds.", icon: AlertCircle },
            { tag: "02", title: "Public Tracking", desc: "Every issue is instantly mapped and publicly verifiable, preventing reports from getting lost in bureaucratic filing.", icon: Activity },
            { tag: "03", title: "Accountability", desc: "Earn civic rating points for authentic reporting while authorities resolve verified public infrastructure problems.", icon: CheckCircle2 }
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="gradient-border rounded-[2rem]">
                <div className="bg-[#0a0a0a] rounded-[inherit] p-10 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                    <Icon size={24} className="text-white" />
                  </div>
                  <div className="text-sm font-bold text-white/30 mb-2 uppercase tracking-widest">{f.tag}</div>
                  <h3 className="text-2xl font-heading font-bold text-white mb-4">{f.title}</h3>
                  <p className="text-white/50 leading-relaxed font-medium">{f.desc}</p>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── BOTTOM CTA ───────────────────────────────────── */}
      <section className="pb-32 px-6 text-center max-w-4xl mx-auto relative z-10">
        <div className="glass-card rounded-[3rem] p-12 md:p-20 relative overflow-hidden border-white/10">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#DC143C]/20 via-transparent to-[#003893]/20 opacity-30" />
          <h2 className="relative z-10 text-4xl md:text-6xl font-heading font-black text-white mb-6">
            Nepal's Future <br/> Starts Here.
          </h2>
          <button onClick={handleReportAction} className="relative z-10 btn-primary px-8 py-4 bg-white text-black text-lg">
            Submit a Report
          </button>
        </div>
      </section>

      {nav.showReportForm && <ReportForm />}
    </div>
  );
}
