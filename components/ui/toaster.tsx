import * as React from "react"

export function Toaster() {
  return <div id="toaster-root" />
}

export function useToast() {
  const toast = (opts: { title?: string; description?: string; variant?: "default" | "destructive" }) => {
    // Simple implementation using alert for now, can be enhanced
    if (typeof window !== "undefined") {
      const el = document.createElement("div")
      el.className = `fixed bottom-4 right-4 z-[9999] glass-dark border rounded-xl p-4 text-sm font-medium transition-all ${
        opts.variant === "destructive" ? "border-red-500/40 text-red-400" : "border-green-500/40 text-green-400"
      }`
      el.innerHTML = `<div class="font-semibold">${opts.title || ""}</div><div class="text-white/60 text-xs mt-0.5">${opts.description || ""}</div>`
      document.body.appendChild(el)
      setTimeout(() => el.remove(), 3500)
    }
  }
  return { toast }
}
