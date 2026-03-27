"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailLogin = async () => {
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });
    if (err) setError(err.message);
    else router.push("/");
    setLoading(false);
  };

  const handleSendOTP = async () => {
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.signInWithOtp({ phone: `+977${phone}` });
    if (err) setError(err.message);
    else setOtpSent(true);
    setLoading(false);
  };

  const handleVerifyOTP = async () => {
    setLoading(true); setError("");
    const { error: err } = await supabase.auth.verifyOtp({ phone: `+977${phone}`, token: otp, type: "sms" });
    if (err) setError(err.message);
    else router.push("/");
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#05050a] grid-bg flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-glow-nepal-red pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm glass-dark border border-white/10 rounded-2xl p-8 relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#DC143C] to-[#003893] flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
            न
          </div>
          <h1 className="font-heading font-bold text-white text-xl">Welcome to NAGRIKA</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to report and track problems</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex glass rounded-lg p-1 border border-white/10 mb-6">
          <button onClick={() => setMode("email")} className={`flex-1 py-1.5 rounded-md text-sm transition-all flex items-center justify-center gap-1.5 ${mode === "email" ? "bg-[#DC143C] text-white" : "text-white/40 hover:text-white"}`}>
            <Mail size={13} /> Email
          </button>
          <button onClick={() => setMode("phone")} className={`flex-1 py-1.5 rounded-md text-sm transition-all flex items-center justify-center gap-1.5 ${mode === "phone" ? "bg-[#DC143C] text-white" : "text-white/40 hover:text-white"}`}>
            <Phone size={13} /> Phone OTP
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">{error}</div>
        )}

        {mode === "email" ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs text-white/40 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="citizen@nepal.gov"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
            </div>
            <div>
              <label className="text-xs text-white/40 mb-1 block">Password</label>
              <div className="relative">
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30">
                  {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
            <button onClick={handleEmailLogin} disabled={loading || !email || !password}
              className="w-full py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-2">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <><ArrowRight size={14} /> Sign In</>}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {!otpSent ? (
              <>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Nepal Phone Number</label>
                  <div className="flex">
                    <span className="px-3 py-2.5 bg-white/5 border border-r-0 border-white/10 rounded-l-xl text-sm text-white/40">+977</span>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="98XXXXXXXX"
                      className="flex-1 bg-white/5 border border-white/10 rounded-r-xl px-4 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
                  </div>
                </div>
                <button onClick={handleSendOTP} disabled={loading || phone.length < 10}
                  className="w-full py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : "Send OTP"}
                </button>
              </>
            ) : (
              <>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Enter OTP sent to +977{phone}</label>
                  <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="123456" maxLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white text-center tracking-widest placeholder-white/25 focus:outline-none focus:border-[#DC143C]/40" />
                </div>
                <button onClick={handleVerifyOTP} disabled={loading || otp.length < 6}
                  className="w-full py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={14} className="animate-spin" /> : <><ArrowRight size={14} /> Verify &amp; Login</>}
                </button>
                <button onClick={() => setOtpSent(false)} className="w-full text-xs text-white/40 hover:text-white/60 transition-colors">
                  ← Change number
                </button>
              </>
            )}
          </div>
        )}

        <div className="mt-6 text-center text-xs text-white/30">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[#DC143C] hover:text-[#ff4d71] transition-colors">Sign up</Link>
        </div>

        <div className="mt-3 text-center">
          <Link href="/" className="text-xs text-white/20 hover:text-white/40 transition-colors">
            Continue as guest →
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
