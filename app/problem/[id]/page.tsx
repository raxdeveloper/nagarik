"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, MessageCircle, Share2, CheckCircle2, Circle, ChevronLeft, Loader2, MapPin, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { Problem, Comment } from "@/lib/supabase/database.types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { timeAgo, severityLabel } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

const STATUS_TIMELINE = ["reported", "verified", "in_progress", "solved"];

export default function ProblemDetailPage({ params }: { params: { id: string } }) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    async function load() {
      const [{ data: p }, { data: c }] = await Promise.all([
        supabase.from("problems").select("*").eq("id", params.id).single(),
        supabase.from("comments").select("*").eq("problem_id", params.id).order("created_at"),
      ]);
      if (p) {
        setProblem(p);
        // @ts-expect-error - Supabase types mismatch
        supabase.from("problems").update({ view_count: (p.view_count || 0) + 1 }).eq("id", params.id);
      }
      if (c) setComments(c);
      setLoading(false);
    }
    load();

    const channel = supabase.channel(`problem-detail-${params.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `problem_id=eq.${params.id}` },
        (payload) => setComments(prev => [...prev, payload.new as Comment]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [params.id]);

  const handleUpvote = async () => {
    if (!user || !problem || hasUpvoted) return;
    // @ts-expect-error - Supabase types mismatch
    await supabase.from("upvotes").insert({ user_id: user.id, problem_id: problem.id });
    // @ts-expect-error - Supabase types mismatch
    await supabase.from("problems").update({ upvotes: problem.upvotes + 1 }).eq("id", problem.id);
    setProblem(p => p ? { ...p, upvotes: p.upvotes + 1 } : p);
    setHasUpvoted(true);
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || !problem) return;
    // @ts-expect-error - Supabase types mismatch
    await supabase.from("comments").insert({ problem_id: problem.id, user_id: user.id, content: newComment.trim() });
    setNewComment("");
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-white/30" />
    </div>
  );

  if (!problem) return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center text-white/40">
      Problem not found
    </div>
  );

  const catConfig = CATEGORY_CONFIG[problem.category];
  const statConfig = STATUS_CONFIG[problem.status];
  const sev = severityLabel(problem.severity);
  const currentStepIdx = STATUS_TIMELINE.indexOf(problem.status);

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back */}
        <Link href="/map" className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white mb-6 transition-colors">
          <ChevronLeft size={16} /> Back to Map
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main */}
          <div className="lg:col-span-2 space-y-5">
            {/* Image Gallery */}
            {problem.images?.length > 0 && (
              <div className="glass rounded-2xl overflow-hidden border border-white/5">
                <div className="relative w-full h-64">
                  <Image src={problem.images[activeImg]} alt={problem.title} fill className="object-cover" />
                </div>
                {problem.images.length > 1 && (
                  <div className="flex gap-2 p-3">
                    {problem.images.map((img, i) => (
                      <button key={i} onClick={() => setActiveImg(i)} className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${activeImg === i ? "border-[#DC143C]" : "border-transparent"}`}>
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Title & Meta */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${catConfig.markerColor}20`, color: catConfig.markerColor }}>
                  {catConfig.icon} {catConfig.label}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statConfig.bg}`}>
                  {statConfig.label}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${sev.color} bg-white/5`}>
                  Severity {problem.severity}/10 — {sev.label}
                </span>
              </div>
              <h1 className="text-2xl font-heading font-bold text-white mb-3">{problem.title}</h1>
              <p className="text-white/50 leading-relaxed mb-4">{problem.description}</p>
              <div className="flex items-center gap-1 text-xs text-white/30">
                <MapPin size={11} /> {problem.latitude.toFixed(4)}°N, {problem.longitude.toFixed(4)}°E
                <span className="mx-2">•</span>
                {timeAgo(problem.created_at)}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="font-heading font-semibold text-white mb-4 text-sm">Status Timeline</h2>
              <div className="space-y-3">
                {STATUS_TIMELINE.map((s, i) => {
                  const done = i <= currentStepIdx && problem.status !== "rejected";
                  const active = i === currentStepIdx && problem.status !== "rejected";
                  return (
                    <div key={s} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-[#DC143C]" : "bg-white/10"}`}>
                        {done ? <CheckCircle2 size={12} className="text-white" /> : <Circle size={12} className="text-white/30" />}
                      </div>
                      <div>
                        <div className={`text-xs font-medium capitalize ${done ? "text-white" : "text-white/30"}`}>{s.replace("_", " ")}</div>
                        {active && problem.solved_at && <div className="text-[10px] text-white/30">{timeAgo(problem.solved_at)}</div>}
                      </div>
                    </div>
                  );
                })}
                {problem.status === "rejected" && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <AlertCircle size={12} className="text-red-400" />
                    </div>
                    <div className="text-xs font-medium text-red-400">Rejected</div>
                  </div>
                )}
              </div>
              {problem.progress > 0 && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-white/30 mb-1">
                    <span>Progress</span><span>{problem.progress}%</span>
                  </div>
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#DC143C] to-[#003893] rounded-full" style={{ width: `${problem.progress}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            <div className="glass rounded-2xl p-6 border border-white/5">
              <h2 className="font-heading font-semibold text-white mb-4 text-sm flex items-center gap-2">
                <MessageCircle size={14} /> Comments ({comments.length})
              </h2>
              <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                {comments.map((c) => (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-3">
                    <p className="text-sm text-white/70 leading-relaxed">{c.content}</p>
                    <p className="text-xs text-white/25 mt-1">{timeAgo(c.created_at)}</p>
                  </motion.div>
                ))}
                {comments.length === 0 && <p className="text-sm text-white/25 text-center py-4">No comments yet. Be the first!</p>}
              </div>
              {user ? (
                <div className="flex gap-2">
                  <input type="text" value={newComment} onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleComment()}
                    placeholder="Share your thoughts..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
                  <button onClick={handleComment} disabled={!newComment.trim()}
                    className="px-4 py-2.5 bg-[#DC143C] text-white rounded-xl text-sm font-medium hover:bg-[#c01030] disabled:opacity-50 transition-all">
                    Post
                  </button>
                </div>
              ) : (
                <Link href="/login" className="block text-center text-sm text-[#DC143C] hover:text-[#ff4d71] transition-colors">
                  Sign in to comment →
                </Link>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-2xl font-heading font-bold text-white">{problem.upvotes}</div>
                  <div className="text-xs text-white/30">Upvotes</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-white">{problem.view_count}</div>
                  <div className="text-xs text-white/30">Views</div>
                </div>
                <div>
                  <div className="text-2xl font-heading font-bold text-white">{comments.length}</div>
                  <div className="text-xs text-white/30">Comments</div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="glass rounded-2xl p-5 border border-white/5 space-y-2">
              <button onClick={handleUpvote} disabled={!user || hasUpvoted}
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all ${hasUpvoted ? "bg-[#DC143C]/20 text-[#DC143C] border border-[#DC143C]/30" : "bg-white/5 text-white hover:bg-white/10 border border-white/10"}`}>
                <ArrowUp size={14} /> {hasUpvoted ? "Upvoted!" : "Upvote this Problem"}
              </button>
              <button onClick={() => navigator.share?.({ title: problem.title, url: window.location.href }).catch(() => {})}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium glass border border-white/10 text-white/60 hover:text-white transition-all">
                <Share2 size={14} /> Share
              </button>
            </div>

            {/* Location */}
            <div className="glass rounded-2xl p-5 border border-white/5">
              <h3 className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Location</h3>
              <div className="text-xs text-white/60 space-y-1">
                <div>Lat: {problem.latitude.toFixed(5)}°N</div>
                <div>Lng: {problem.longitude.toFixed(5)}°E</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
