export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface ResearchType {
  id: string
  created_at: string
  user_id: string
  niche_id: string
  type: 'keywords' | 'competitors' | 'suggestions'
  query: string
  results: Json
}

export interface Database {
  public: {
    Tables: {
      niches: {
        Row: {
          id: string
          name: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      pillars: {
        Row: {
          id: string
          niche_id: string
          title: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
          status: 'draft' | 'review' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          niche_id: string
          title: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'review' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          niche_id?: string
          title?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'review' | 'approved' | 'rejected'
        }
      }
      subpillars: {
        Row: {
          id: string
          pillar_id: string
          title: string
          description: string | null
          user_id: string
          created_at: string
          updated_at: string
          status: 'draft' | 'review' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          pillar_id: string
          title: string
          description?: string | null
          user_id: string
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'review' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          pillar_id?: string
          title?: string
          description?: string | null
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'review' | 'approved' | 'rejected'
        }
      }
      articles: {
        Row: {
          id: string
          pillar_id: string
          title: string
          content: string | null
          status: 'draft' | 'review' | 'published'
          user_id: string
          created_at: string
          updated_at: string
          published_at: string | null
          seo_score: number | null
        }
        Insert: {
          id?: string
          pillar_id: string
          title: string
          content?: string | null
          status?: 'draft' | 'review' | 'published'
          user_id: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          seo_score?: number | null
        }
        Update: {
          id?: string
          pillar_id?: string
          title?: string
          content?: string | null
          status?: 'draft' | 'review' | 'published'
          user_id?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          seo_score?: number | null
        }
      }
      outlines: {
        Row: {
          id: string
          article_id: string
          content: Json
          user_id: string
          created_at: string
          updated_at: string
          status: 'draft' | 'review' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          article_id: string
          content?: Json
          user_id: string
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'review' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          article_id?: string
          content?: Json
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: 'draft' | 'review' | 'approved' | 'rejected'
        }
      }
      research: {
        Row: ResearchType
        Insert: Omit<ResearchType, 'id' | 'created_at'>
        Update: Partial<Omit<ResearchType, 'id' | 'created_at'>>
      }
      workflows: {
        Row: {
          id: string
          article_id: string
          current_step: string
          completed_steps: string[]
          status: string
          settings: Json
          metadata: Json
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          current_step?: string
          completed_steps?: string[]
          status?: string
          settings?: Json
          metadata?: Json
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          current_step?: string
          completed_steps?: string[]
          status?: string
          settings?: Json
          metadata?: Json
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      seo_analyses: {
        Row: {
          id: string
          article_id: string
          metrics: Json
          score: number
          recommendations: string[]
          critical_issues: string[]
          improvements: string[]
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          article_id: string
          metrics: Json
          score: number
          recommendations?: string[]
          critical_issues?: string[]
          improvements?: string[]
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          article_id?: string
          metrics?: Json
          score?: number
          recommendations?: string[]
          critical_issues?: string[]
          improvements?: string[]
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}