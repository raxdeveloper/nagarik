"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, BarChart3, Trophy, FileText, Home, LogIn, LogOut, Menu, X, Globe, Plus } from "lucide-react";
import { useStore } from "@/lib/store/useStore";
import { supabase } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/map", label: "Map", icon: Map },
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/my-reports", label: "Reports", icon: FileText },
];

export function Navbar() {
  const pathname = usePathname();
  const { nav, setLanguage, setShowReportForm } = useStore();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const toggleLanguage = () => setLanguage(nav.language === "en" ? "np" : "en");
  const handleLogout = async () => { await supabase.auth.signOut(); setUser(null); };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? "glass-dark shadow-[0_1px_0_rgba(255,255,255,0.05)]" : "bg-transparent"}`}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-[88px] flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center w-[160px] md:w-[220px] h-[80px] group select-none overflow-hidden relative mr-2">
          <img 
            src="/logo.png" 
            alt="Nagrika Logo" 
            className="absolute w-[180%] h-[180%] object-contain scale-110 md:scale-125 transition-transform duration-200 group-hover:scale-[1.3]" 
          />
        </Link>

        {/* Desktop Nav — pill style */}
        <div className="hidden md:flex items-center gap-0.5 glass rounded-2xl px-1.5 py-1.5 border border-white/[0.07]">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                  active
                    ? "bg-[#DC143C]/15 text-[#DC143C]"
                    : "text-white/50 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                <Icon size={13} />
                {label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute inset-0 rounded-xl bg-[#DC143C]/12 border border-[#DC143C]/20"
                    transition={{ type: "spring", stiffness: 500, damping: 40 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-medium text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/[0.08]"
          >
            <Globe size={11} />
            {nav.language === "en" ? "नेपाली" : "English"}
          </button>

          <button
            onClick={() => setShowReportForm(true)}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-[13px] font-heading font-semibold rounded-xl transition-all nepal-red-glow"
          >
            <Plus size={14} strokeWidth={2.5} />
            Report
          </button>

          {user ? (
            <button onClick={handleLogout} className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] text-white/50 hover:text-white hover:bg-white/5 transition-all">
              <LogOut size={13} /> Logout
            </button>
          ) : (
            <Link href="/login" className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[13px] text-white/50 hover:text-white hover:bg-white/5 transition-all border border-white/[0.08]">
              <LogIn size={13} /> Login
            </Link>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-all"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass-dark border-t border-white/[0.06]"
          >
            <div className="px-4 py-4 flex flex-col gap-1">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[14px] font-medium transition-all ${
                    pathname === href
                      ? "bg-[#DC143C]/12 text-[#DC143C] border border-[#DC143C]/20"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/[0.06] flex flex-col gap-2">
                <button
                  onClick={() => { setShowReportForm(true); setMobileOpen(false); }}
                  className="w-full px-4 py-2.5 bg-[#DC143C] text-white text-sm font-heading font-semibold rounded-xl nepal-red-glow flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Report a Problem
                </button>
                {user ? (
                  <button onClick={handleLogout} className="text-sm text-white/50 py-2">Logout</button>
                ) : (
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm text-white/50 py-2 text-center">Login / Sign Up</Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
