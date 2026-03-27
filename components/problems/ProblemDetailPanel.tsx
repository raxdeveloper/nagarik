"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, ArrowUp, Share2, Eye, MessageCircle, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store/useStore";
import { CATEGORY_CONFIG, STATUS_CONFIG } from "@/lib/constants";
import { Problem, Comment } from "@/lib/supabase/database.types";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { timeAgo, severityLabel } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

export function ProblemDetailPanel({ problemId }: { problemId: string }) {
  const { setSelectedProblemId, updateProblem } = useStore();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [hasUpvoted, setHasUpvoted] = useState(false);
  const [commentLoading, setCommentLoading] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!problemId) return;
    setLoading(true);

    Promise.all([
      supabase.from("problems").select("*").eq("id", problemId).single(),
      supabase.from("comments").select("*").eq("problem_id", problemId).order("created_at", { ascending: true }).limit(20),
    ]).then(([{ data: p }, { data: c }]) => {
      if (p) setProblem(p);
      if (c) setComments(c);
      setLoading(false);
    });

    // Realtime comments
    const channel = supabase
      .channel(`comments-${problemId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments", filter: `problem_id=eq.${problemId}` },
        (payload) => setComments((prev) => [...prev, payload.new as Comment]))
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [problemId]);

  const handleUpvote = async () => {
    if (!user || !problem || hasUpvoted) return;
    // @ts-expect-error - Supabase types mismatch
    await supabase.from("upvotes").insert({ user_id: user.id, problem_id: problem.id });
    // @ts-expect-error - Supabase types mismatch
    await supabase.from("problems").update({ upvotes: problem.upvotes + 1 }).eq("id", problem.id);
    setProblem((p) => p ? { ...p, upvotes: p.upvotes + 1 } : p);
    updateProblem(problem.id, { upvotes: problem.upvotes + 1 });
    setHasUpvoted(true);
  };

  const handleComment = async () => {
    if (!user || !newComment.trim() || !problem) return;
    setCommentLoading(true);
    // @ts-expect-error - Supabase types mismatch
    await supabase.from("comments").insert({ problem_id: problem.id, user_id: user.id, content: newComment.trim() });
    setNewComment("");
    setCommentLoading(false);
  };

  const sev = problem ? severityLabel(problem.severity) : null;
  const catConfig = problem ? CATEGORY_CONFIG[problem.category] : null;
  const statConfig = problem ? STATUS_CONFIG[problem.status] : null;

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="w-80 xl:w-96 flex-shrink-0 glass-dark border-l border-white/5 flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 flex-shrink-0">
        <span className="text-sm font-semibold text-white">Problem Details</span>
        <button onClick={() => setSelectedProblemId(null)} className="p-1 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <X size={14} />
        </button>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-white/30" />
        </div>
      ) : !problem ? (
        <div className="flex-1 flex items-center justify-center text-white/30 text-sm">Problem not found</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {/* Image */}
          {problem.images?.[0] && (
            <div className="h-40 overflow-hidden relative">
              <Image src={problem.images[0]} alt={problem.title} fill className="object-cover" />
            </div>
          )}

          <div className="p-4 space-y-4">
            {/* Category + Status */}
            <div className="flex items-center gap-2 flex-wrap">
              {catConfig && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: `${catConfig.markerColor}20`, color: catConfig.markerColor }}>
                  {catConfig.icon} {catConfig.label}
                </span>
              )}
              {statConfig && (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statConfig.bg}`}>
                  {statConfig.label}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base font-heading font-bold text-white leading-tight">{problem.title}</h2>

            {/* Description */}
            <p className="text-xs text-white/50 leading-relaxed">{problem.description}</p>

            {/* Meta */}
            <div className="grid grid-cols-2 gap-2">
              <div className="glass rounded-lg p-2 text-center">
                <div className={`text-lg font-bold font-heading ${sev?.color}`}>{problem.severity}/10</div>
                <div className="text-[10px] text-white/30">{sev?.label} Severity</div>
              </div>
              <div className="glass rounded-lg p-2 text-center">
                <div className="text-lg font-bold font-heading text-white">{problem.progress}%</div>
                <div className="text-[10px] text-white/30">Progress</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-[#DC143C] rounded-full transition-all" style={{ width: `${problem.progress}%` }} />
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 text-xs text-white/30">
              <span className="flex items-center gap-1"><ArrowUp size={12} />{problem.upvotes}</span>
              <span className="flex items-center gap-1"><Eye size={12} />{problem.view_count}</span>
              <span className="flex items-center gap-1"><MessageCircle size={12} />{comments.length}</span>
              <span className="ml-auto">{timeAgo(problem.created_at)}</span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleUpvote}
                disabled={!user || hasUpvoted}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all ${hasUpvoted ? "bg-[#DC143C]/20 text-[#DC143C] border border-[#DC143C]/30" : "glass border border-white/10 text-white/60 hover:text-white"}`}
              >
                <ArrowUp size={12} /> Upvote
              </button>
              <button
                onClick={() => navigator.share?.({ title: problem.title, url: `/problem/${problem.id}` }).catch(() => {})}
                className="flex items-center justify-center gap-1.5 py-2 px-3 glass rounded-lg text-xs text-white/60 hover:text-white border border-white/10 transition-all"
              >
                <Share2 size={12} />
              </button>
              <Link
                href={`/problem/${problem.id}`}
                className="flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium bg-[#DC143C] text-white hover:bg-[#c01030] transition-all"
              >
                Full Details <ChevronRight size={12} />
              </Link>
            </div>

            {/* Comments */}
            <div>
              <div className="text-xs font-semibold text-white/60 mb-3 flex items-center gap-1">
                <MessageCircle size={12} /> Comments ({comments.length})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto mb-3">
                {comments.map((c) => (
                  <div key={c.id} className="glass rounded-lg p-2.5">
                    <p className="text-xs text-white/70 leading-relaxed">{c.content}</p>
                    <p className="text-[10px] text-white/25 mt-1">{timeAgo(c.created_at)}</p>
                  </div>
                ))}
                {comments.length === 0 && (
                  <p className="text-xs text-white/25 text-center py-3">No comments yet</p>
                )}
              </div>
              {user && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleComment()}
                    placeholder="Add a comment..."
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-[#DC143C]/40"
                  />
                  <button
                    onClick={handleComment}
                    disabled={commentLoading || !newComment.trim()}
                    className="px-3 py-2 bg-[#DC143C] text-white rounded-lg text-xs font-medium hover:bg-[#c01030] disabled:opacity-50 transition-all"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
