export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      provinces: {
        Row: {
          id: number
          name_en: string
          name_np: string
          capital: string
          geojson: Json | null
        }
        Insert: {
          id: number
          name_en: string
          name_np: string
          capital: string
          geojson?: Json | null
        }
        Update: {
          id?: number
          name_en?: string
          name_np?: string
          capital?: string
          geojson?: Json | null
        }
      }
      districts: {
        Row: {
          id: number
          province_id: number
          name_en: string
          name_np: string
          geojson: Json | null
        }
        Insert: {
          id: number
          province_id: number
          name_en: string
          name_np: string
          geojson?: Json | null
        }
        Update: {
          id?: number
          province_id?: number
          name_en?: string
          name_np?: string
          geojson?: Json | null
        }
      }
      problems: {
        Row: {
          id: string
          title: string
          description: string
          category: 'infrastructure' | 'education' | 'health' | 'corruption' | 'environment' | 'economy'
          province_id: number | null
          district_id: number | null
          latitude: number
          longitude: number
          severity: number
          status: 'reported' | 'verified' | 'in_progress' | 'solved' | 'rejected'
          images: string[]
          upvotes: number
          created_by: string | null
          created_at: string
          updated_at: string
          solved_at: string | null
          progress: number
          view_count: number
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: 'infrastructure' | 'education' | 'health' | 'corruption' | 'environment' | 'economy'
          province_id?: number | null
          district_id?: number | null
          latitude: number
          longitude: number
          severity: number
          status?: 'reported' | 'verified' | 'in_progress' | 'solved' | 'rejected'
          images?: string[]
          upvotes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          solved_at?: string | null
          progress?: number
          view_count?: number
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: 'infrastructure' | 'education' | 'health' | 'corruption' | 'environment' | 'economy'
          province_id?: number | null
          district_id?: number | null
          latitude?: number
          longitude?: number
          severity?: number
          status?: 'reported' | 'verified' | 'in_progress' | 'solved' | 'rejected'
          images?: string[]
          upvotes?: number
          created_by?: string | null
          created_at?: string
          updated_at?: string
          solved_at?: string | null
          progress?: number
          view_count?: number
        }
      }
      users: {
        Row: {
          id: string
          email: string | null
          name: string | null
          avatar_url: string | null
          phone: string | null
          nagrika_score: number
          role: 'citizen' | 'volunteer' | 'ngo' | 'government' | 'admin'
          created_at: string
        }
        Insert: {
          id: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          nagrika_score?: number
          role?: 'citizen' | 'volunteer' | 'ngo' | 'government' | 'admin'
          created_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          name?: string | null
          avatar_url?: string | null
          phone?: string | null
          nagrika_score?: number
          role?: 'citizen' | 'volunteer' | 'ngo' | 'government' | 'admin'
          created_at?: string
        }
      }
      upvotes: {
        Row: {
          user_id: string
          problem_id: string
          created_at: string
        }
        Insert: {
          user_id: string
          problem_id: string
          created_at?: string
        }
        Update: {
          user_id?: string
          problem_id?: string
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          problem_id: string
          user_id: string
          content: string
          created_at: string
        }
        Insert: {
          id?: string
          problem_id: string
          user_id: string
          content: string
          created_at?: string
        }
        Update: {
          id?: string
          problem_id?: string
          user_id?: string
          content?: string
          created_at?: string
        }
      }
      organizations: {
        Row: {
          id: string
          name: string
          type: string
          logo_url: string | null
          user_id: string
          problems_solved: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          type: string
          logo_url?: string | null
          user_id: string
          problems_solved?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          logo_url?: string | null
          user_id?: string
          problems_solved?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      problem_category: 'infrastructure' | 'education' | 'health' | 'corruption' | 'environment' | 'economy'
      problem_status: 'reported' | 'verified' | 'in_progress' | 'solved' | 'rejected'
      user_role: 'citizen' | 'volunteer' | 'ngo' | 'government' | 'admin'
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Problem = Tables<'problems'>
export type User = Tables<'users'>
export type Province = Tables<'provinces'>
export type District = Tables<'districts'>
export type Comment = Tables<'comments'>
export type Organization = Tables<'organizations'>

export type ProblemCategory = 'infrastructure' | 'education' | 'health' | 'corruption' | 'environment' | 'economy' | 'water_supply' | 'electricity' | 'waste_management' | 'public_transport'
export type ProblemStatus = 'reported' | 'verified' | 'in_progress' | 'solved' | 'rejected'
