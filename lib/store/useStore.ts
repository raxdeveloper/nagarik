import { create } from 'zustand'
import { Problem, ProblemCategory, ProblemStatus } from '@/lib/supabase/database.types'

interface Filters {
  category: ProblemCategory | null
  status: ProblemStatus | null
  province_id: number | null
  district_id: number | null
  severity_min: number
  severity_max: number
  search: string
}

interface NavState {
  view: 'map' | 'city' | 'list'
  language: 'en' | 'np'
  showReportForm: boolean
  selectedProblemId: string | null
  sidebarOpen: boolean
}

interface Store {
  problems: Problem[]
  filters: Filters
  nav: NavState
  setProblems: (problems: Problem[]) => void
  addProblem: (problem: Problem) => void
  updateProblem: (id: string, updates: Partial<Problem>) => void
  setFilters: (filters: Partial<Filters>) => void
  resetFilters: () => void
  setView: (view: NavState['view']) => void
  setLanguage: (lang: NavState['language']) => void
  setShowReportForm: (show: boolean) => void
  setSelectedProblemId: (id: string | null) => void
  setSidebarOpen: (open: boolean) => void
}

const defaultFilters: Filters = {
  category: null,
  status: null,
  province_id: null,
  district_id: null,
  severity_min: 1,
  severity_max: 10,
  search: '',
}

export const useStore = create<Store>((set) => ({
  problems: [],
  filters: defaultFilters,
  nav: {
    view: 'map',
    language: 'en',
    showReportForm: false,
    selectedProblemId: null,
    sidebarOpen: true,
  },
  setProblems: (problems) => set({ problems }),
  addProblem: (problem) =>
    set((state) => ({ problems: [problem, ...state.problems] })),
  updateProblem: (id, updates) =>
    set((state) => ({
      problems: state.problems.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setView: (view) =>
    set((state) => ({ nav: { ...state.nav, view } })),
  setLanguage: (language) =>
    set((state) => ({ nav: { ...state.nav, language } })),
  setShowReportForm: (showReportForm) =>
    set((state) => ({ nav: { ...state.nav, showReportForm } })),
  setSelectedProblemId: (selectedProblemId) =>
    set((state) => ({ nav: { ...state.nav, selectedProblemId } })),
  setSidebarOpen: (sidebarOpen) =>
    set((state) => ({ nav: { ...state.nav, sidebarOpen } })),
}))
