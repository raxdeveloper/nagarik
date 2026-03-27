import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat("en-NP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date))
}

export function timeAgo(date: string | Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(date)
}

export function severityLabel(severity: number) {
  if (severity <= 3) return { label: "Low", color: "text-green-400" }
  if (severity <= 6) return { label: "Medium", color: "text-amber-400" }
  if (severity <= 8) return { label: "High", color: "text-orange-400" }
  return { label: "Critical", color: "text-red-400" }
}
