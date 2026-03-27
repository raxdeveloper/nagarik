import { ProblemCategory, ProblemStatus } from '@/lib/supabase/database.types'

export const CATEGORY_CONFIG: Record<ProblemCategory, {
  label: string
  color: string
  markerColor: string
  icon: string
  bg: string
}> = {
  infrastructure: {
    label: 'Infrastructure',
    color: '#ef4444',
    markerColor: '#ef4444',
    icon: '🏗️',
    bg: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
  education: {
    label: 'Education',
    color: '#3b82f6',
    markerColor: '#3b82f6',
    icon: '📚',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  health: {
    label: 'Health',
    color: '#22c55e',
    markerColor: '#22c55e',
    icon: '🏥',
    bg: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  corruption: {
    label: 'Corruption',
    color: '#f59e0b',
    markerColor: '#f59e0b',
    icon: '⚖️',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  environment: {
    label: 'Environment',
    color: '#a855f7',
    markerColor: '#a855f7',
    icon: '🌿',
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
  economy: {
    label: 'Economy',
    color: '#ec4899',
    markerColor: '#ec4899',
    icon: '💰',
    bg: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
  },
  electricity: {
    label: 'Electricity & Grid',
    color: '#fbbf24',
    markerColor: '#fbbf24',
    icon: '⚡',
    bg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  },
  water_supply: {
    label: 'Water Supply',
    color: '#0ea5e9',
    markerColor: '#0ea5e9',
    icon: '💧',
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  },
  waste_management: {
    label: 'Waste Management',
    color: '#8b5cf6',
    markerColor: '#8b5cf6',
    icon: '🗑️',
    bg: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
  },
  public_transport: {
    label: 'Public Transport',
    color: '#f97316',
    markerColor: '#f97316',
    icon: '🚌',
    bg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  },
}

export const STATUS_CONFIG: Record<ProblemStatus, {
  label: string
  color: string
  bg: string
}> = {
  reported: {
    label: 'Reported',
    color: '#94a3b8',
    bg: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  },
  verified: {
    label: 'Verified',
    color: '#60a5fa',
    bg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  in_progress: {
    label: 'In Progress',
    color: '#f59e0b',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  solved: {
    label: 'Solved',
    color: '#22c55e',
    bg: 'bg-green-500/10 text-green-400 border-green-500/20',
  },
  rejected: {
    label: 'Rejected',
    color: '#ef4444',
    bg: 'bg-red-500/10 text-red-400 border-red-500/20',
  },
}

export const PROVINCE_NAMES = [
  { id: 1, name: 'Koshi Province', capital: 'Biratnagar' },
  { id: 2, name: 'Madhesh Province', capital: 'Janakpur' },
  { id: 3, name: 'Bagmati Province', capital: 'Hetauda' },
  { id: 4, name: 'Gandaki Province', capital: 'Pokhara' },
  { id: 5, name: 'Lumbini Province', capital: 'Deukhuri' },
  { id: 6, name: 'Karnali Province', capital: 'Birendranagar' },
  { id: 7, name: 'Sudurpashchim Province', capital: 'Dhangadhi' },
]

export const PROVINCE_COLORS = [
  '#1e3a5f', '#1a4a6e', '#152e4d', '#0f2a47', '#1b3d5c', '#122848', '#1c3a5a',
]

export const NEPAL_CENTER: [number, number] = [28.3949, 84.1240]
export const NEPAL_DEFAULT_ZOOM = 7
