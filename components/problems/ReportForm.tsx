"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, CheckCircle, Loader2, Upload, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useStore } from "@/lib/store/useStore";
import { NEPAL_CENTER } from "@/lib/constants";
import { ProblemCategory, Problem } from "@/lib/supabase/database.types";
import dynamic from "next/dynamic";

const LocationPicker = dynamic(() => import("./LocationPicker").then(m => m.LocationPicker as React.ComponentType<{lat: number, lng: number, onChange: (lat: number, lng: number) => void}>), { ssr: false });

const CATEGORIES: { key: ProblemCategory; label: string; icon: string; desc: string }[] = [
  { key: "infrastructure", label: "Infrastructure", icon: "🏗️", desc: "Roads, bridges, water, electricity" },
  { key: "education", label: "Education", icon: "📚", desc: "Schools, teachers, curriculum" },
  { key: "health", label: "Health", icon: "🏥", desc: "Hospitals, medicines, sanitation" },
  { key: "corruption", label: "Corruption", icon: "⚖️", desc: "Bribery, misuse of power" },
  { key: "environment", label: "Environment", icon: "🌿", desc: "Pollution, deforestation, waste" },
  { key: "economy", label: "Economy", icon: "💰", desc: "Unemployment, prices, trade" },
];

const STEPS = ["Location", "Category", "Details", "Review"];

interface FormData {
  latitude: number;
  longitude: number;
  category: ProblemCategory | null;
  title: string;
  description: string;
  severity: number;
  images: File[];
}

export function ReportForm() {
  const { setShowReportForm, addProblem } = useStore();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState<FormData>({
    latitude: NEPAL_CENTER[0],
    longitude: NEPAL_CENTER[1],
    category: null,
    title: "",
    description: "",
    severity: 5,
    images: [],
  });

  const canNext = () => {
    if (step === 0) return form.latitude !== 0 && form.longitude !== 0;
    if (step === 1) return form.category !== null;
    if (step === 2) return form.title.trim().length >= 5 && form.description.trim().length >= 10;
    return true;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5);
    setForm((f) => ({ ...f, images: files }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Upload images
      const imageUrls: string[] = [];
      for (const file of form.images) {
        const ext = file.name.split(".").pop();
        const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await supabase.storage.from("problem-images").upload(path, file, { contentType: file.type });
        if (!error) {
          const { data: { publicUrl } } = supabase.storage.from("problem-images").getPublicUrl(path);
          imageUrls.push(publicUrl);
        }
      }

      const insertData = {
        title: form.title,
        description: form.description,
        category: form.category!,
        latitude: form.latitude,
        longitude: form.longitude,
        severity: form.severity,
        images: imageUrls,
        status: "reported",
        upvotes: 0,
        progress: 0,
        view_count: 0,
        created_by: user?.id || null,
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error } = await supabase.from("problems").insert(insertData as any).select().single();

      if (!error && data) {
        addProblem(data as unknown as Problem);
        // Award Nagrika Score
        if (user) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore – RPC function exists at runtime; Supabase types unaware of it
            await supabase.rpc("increment_nagrika_score" as any, { user_id: user.id, amount: 50 });
          } catch { }
        }
        setSuccess(true);
        setTimeout(() => setShowReportForm(false), 2500);
      }
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowReportForm(false)} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-lg glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="font-heading font-bold text-white text-lg">Report a Problem</h2>
            <p className="text-xs text-white/40">Step {step + 1} of {STEPS.length}: {STEPS[step]}</p>
          </div>
          <button onClick={() => setShowReportForm(false)} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Progress */}
        <div className="flex gap-1 px-5 pt-4">
          {STEPS.map((s, i) => (
            <div key={s} className={`flex-1 h-1 rounded-full transition-all ${i <= step ? "bg-[#DC143C]" : "bg-white/10"}`} />
          ))}
        </div>

        {/* Content */}
        <div className="p-5 min-h-[300px]">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center h-64 gap-4"
              >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-400 w-8 h-8" />
                </div>
                <div className="text-center">
                  <h3 className="font-heading font-bold text-white text-lg mb-1">Problem Reported!</h3>
                  <p className="text-xs text-white/40">+50 Nagrika Score added to your profile</p>
                </div>
              </motion.div>
            ) : step === 0 ? (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-white/50 mb-3">Click on the map to pin the problem location.</p>
                <div className="h-64 rounded-xl overflow-hidden border border-white/10">
                  <LocationPicker
                    lat={form.latitude}
                    lng={form.longitude}
                    onChange={(lat: number, lng: number) => setForm((f) => ({ ...f, latitude: lat, longitude: lng }))}
                  />
                </div>
                <div className="mt-2 text-xs text-white/30 flex items-center gap-1">
                  <MapPin size={11} />
                  {form.latitude.toFixed(4)}°N, {form.longitude.toFixed(4)}°E
                </div>
              </motion.div>
            ) : step === 1 ? (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <p className="text-sm text-white/50 mb-3">What type of problem is this?</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map(({ key, label, icon, desc }) => (
                    <button
                      key={key}
                      onClick={() => setForm((f) => ({ ...f, category: key }))}
                      className={`p-3 rounded-xl border text-left transition-all ${form.category === key ? "border-[#DC143C]/50 bg-[#DC143C]/10" : "border-white/10 bg-white/3 hover:border-white/20"}`}
                    >
                      <div className="text-xl mb-1">{icon}</div>
                      <div className="text-xs font-semibold text-white">{label}</div>
                      <div className="text-[10px] text-white/40">{desc}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : step === 2 ? (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Problem Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="Short, clear title for the problem"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#DC143C]/40"
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                    placeholder="Describe the problem in detail..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#DC143C]/40 resize-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Severity: {form.severity}/10</label>
                  <input
                    type="range" min={1} max={10}
                    value={form.severity}
                    onChange={(e) => setForm((f) => ({ ...f, severity: Number(e.target.value) }))}
                    className="w-full accent-[#DC143C] h-1.5"
                  />
                  <div className="flex justify-between text-[10px] text-white/25 mt-1">
                    <span>Minor</span><span>Moderate</span><span>Critical</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1 block">Photos (max 5, jpg/png)</label>
                  <label className="flex items-center gap-2 p-3 border border-dashed border-white/15 rounded-xl cursor-pointer hover:border-white/30 transition-all">
                    <Upload size={14} className="text-white/40" />
                    <span className="text-xs text-white/40">{form.images.length > 0 ? `${form.images.length} file(s) selected` : "Click to upload images"}</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                  </label>
                </div>
              </motion.div>
            ) : (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-3">
                <h3 className="text-sm font-semibold text-white/60 mb-4">Review Your Report</h3>
                <div className="glass rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORIES.find(c => c.key === form.category)?.icon}</span>
                    <span className="text-sm font-medium text-white">{form.title}</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">{form.description}</p>
                  <div className="flex gap-2 flex-wrap text-[10px]">
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-white/40 capitalize">{form.category}</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-white/40">Severity {form.severity}/10</span>
                    <span className="px-2 py-0.5 bg-white/5 rounded-full text-white/40">{form.latitude.toFixed(4)}°N</span>
                    {form.images.length > 0 && <span className="px-2 py-0.5 bg-white/5 rounded-full text-white/40">{form.images.length} photos</span>}
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-[#DC143C]/5 border border-[#DC143C]/15 rounded-xl">
                  <AlertCircle size={14} className="text-[#DC143C] flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-white/50">Submitting will add <strong className="text-white">+50 Nagrika Score</strong> to your profile and make this problem visible to all citizens.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex gap-3 p-5 border-t border-white/5">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="px-5 py-2.5 glass border border-white/10 rounded-xl text-sm text-white/60 hover:text-white transition-all"
              >
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button
                onClick={() => setStep((s) => s + 1)}
                disabled={!canNext()}
                className="flex-1 px-5 py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting || !canNext()}
                className="flex-1 px-5 py-2.5 bg-[#DC143C] hover:bg-[#c01030] text-white text-sm font-medium rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {submitting ? <><Loader2 size={14} className="animate-spin" /> Submitting...</> : "Submit Report"}
              </button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}


