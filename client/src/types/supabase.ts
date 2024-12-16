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
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          password: string
          token: string | null
          role: 'user' | 'admin' | null
          last_login_at: string | null
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          password: string
          token?: string | null
          role?: 'user' | 'admin' | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          password?: string
          token?: string | null
          role?: 'user' | 'admin' | null
          last_login_at?: string | null
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      niches: {
        Row: {
          id: string
          name: string
          user_id: string | null
          pillars: Json
          progress: number | null
          status: 'pending' | 'approved' | 'rejected' | 'in_progress' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          user_id?: string | null
          pillars?: Json
          progress?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          user_id?: string | null
          pillars?: Json
          progress?: number | null
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      pillars: {
        Row: {
          id: string
          title: string
          niche_id: string | null
          created_by_id: string | null
          status: 'pending' | 'approved' | 'rejected' | 'in_progress' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          niche_id?: string | null
          created_by_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          niche_id?: string | null
          created_by_id?: string | null
          status?: 'pending' | 'approved' | 'rejected' | 'in_progress' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      subpillars: {
        Row: {
          id: string
          title: string
          pillar_id: string | null
          created_by_id: string | null
          status: 'draft' | 'active' | 'archived' | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          pillar_id?: string | null
          created_by_id?: string | null
          status?: 'draft' | 'active' | 'archived' | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          pillar_id?: string | null
          created_by_id?: string | null
          status?: 'draft' | 'active' | 'archived' | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      articles: {
        Row: {
          id: string
          title: string
          content: string
          subpillar_id: string | null
          author_id: string | null
          status: 'draft' | 'review' | 'published' | null
          keywords: string[] | null
          meta_description: string | null
          seo_score: number | null
          readability_score: number | null
          plagiarism_score: number | null
          keyword_density: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content: string
          subpillar_id?: string | null
          author_id?: string | null
          status?: 'draft' | 'review' | 'published' | null
          keywords?: string[] | null
          meta_description?: string | null
          seo_score?: number | null
          readability_score?: number | null
          plagiarism_score?: number | null
          keyword_density?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string
          subpillar_id?: string | null
          author_id?: string | null
          status?: 'draft' | 'review' | 'published' | null
          keywords?: string[] | null
          meta_description?: string | null
          seo_score?: number | null
          readability_score?: number | null
          plagiarism_score?: number | null
          keyword_density?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      todos: {
        Row: {
          id: string
          user_id: string
          task: string
          is_complete: boolean
          inserted_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          task: string
          is_complete?: boolean
          inserted_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          task?: string
          is_complete?: boolean
          inserted_at?: string
          updated_at?: string
        }
      }
    }
  }
}