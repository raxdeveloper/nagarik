"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Loader2, Medal, Trophy, Star } from "lucide-react";
import { User } from "@/lib/supabase/database.types";

export default function LeaderboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("users").select("*").order("nagrika_score", { ascending: false }).limit(50);
      if (data) setUsers(data as User[]);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#05050a] flex items-center justify-center">
      <Loader2 size={32} className="animate-spin text-[#DC143C]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#ea580c] flex items-center justify-center text-white mx-auto mb-4">
            <Trophy size={32} />
          </div>
          <h1 className="text-4xl font-heading font-bold text-white mb-2">Nagrika Leaderboard</h1>
          <p className="text-white/40">Top citizens driving positive change across Nepal.</p>
        </div>

        <div className="glass border border-white/5 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 text-xs font-semibold text-white/40 uppercase tracking-wider bg-white/5">
            <div className="col-span-1 text-center">Rank</div>
            <div className="col-span-6">Citizen</div>
            <div className="col-span-3 text-center">Score</div>
            <div className="col-span-2 text-right">Role</div>
          </div>

          {/* List */}
          <div className="divide-y divide-white/5">
            {users.map((user, i) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors group">
                {/* Rank */}
                <div className="col-span-1 flex justify-center">
                  {i === 0 ? <Medal size={24} className="text-yellow-400" /> :
                   i === 1 ? <Medal size={24} className="text-gray-300" /> :
                   i === 2 ? <Medal size={24} className="text-amber-600" /> :
                   <span className="text-white/30 font-bold text-lg">{i + 1}</span>}
                </div>

                {/* Info */}
                <div className="col-span-6 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#DC143C] to-[#003893] p-0.5">
                    <div className="w-full h-full rounded-full bg-[#0a0a14] flex items-center justify-center text-white font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-white group-hover:text-[#DC143C] transition-colors">{user.name || "Anonymous Citizen"}</div>
                    <div className="text-[10px] text-white/30 truncate max-w-[200px]">{user.email}</div>
                  </div>
                </div>

                {/* Score */}
                <div className="col-span-3 flex justify-center items-center gap-1.5">
                  <Star size={14} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold text-white text-lg">{user.nagrika_score.toLocaleString()}</span>
                </div>

                {/* Role */}
                <div className="col-span-2 text-right">
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/50 capitalize">
                    {user.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
