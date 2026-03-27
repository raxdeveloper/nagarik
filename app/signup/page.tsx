"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    const { data, error: err } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (err) { setError(err.message); setLoading(false); return; }
    // Create user profile
    if (data.user) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore – Supabase generated types resolve to never; runtime schema is valid
      await supabase.from("users").insert({ id: data.user.id, email, name, nagrika_score: 0, role: "citizen" });
    }
    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/"), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-glow-nepal-blue pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-dark border border-white/10 rounded-2xl p-8 relative"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC143C] to-[#003893] flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">न</div>
          <h1 className="font-heading font-bold text-white text-xl">Join NAGRIKA</h1>
          <p className="text-white/40 text-sm mt-1">Become a citizen of change</p>
        </div>

        {success ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🎉</div>
            <p className="text-white font-medium">Account created!</p>
            <p className="text-white/40 text-sm mt-1">Redirecting you home...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>}
            <div>
              <label className="text-xs text-white/40 mb-1 block">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Hari Bahadur Thapa"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-9 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button onClick={handleSignup} disabled={loading || !name || !email || !password}
              className="w-full py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><ArrowRight size={14} /> Create Account</>}
            </button>
            <p className="text-[10px] text-white/25 text-center">By signing up, you become a Nagrika — a citizen committed to a better Nepal.</p>
          </div>
        )}

        <div className="mt-5 text-center text-xs text-white/30">
          Already have an account?{" "}
          <Link href="/login" className="text-[#DC143C] hover:text-[#ff4d71] transition-colors">Sign in</Link>
        </div>
      </motion.div>
    </div>
  );
}
