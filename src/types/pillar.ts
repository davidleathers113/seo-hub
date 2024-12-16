import { Database } from './database'

export type Pillar = Database['public']['Tables']['pillars']['Row']
export type PillarInsert = Database['public']['Tables']['pillars']['Insert']
export type PillarUpdate = Database['public']['Tables']['pillars']['Update']

export type Subpillar = Database['public']['Tables']['subpillars']['Row']
export type SubpillarInsert = Database['public']['Tables']['subpillars']['Insert']
export type SubpillarUpdate = Database['public']['Tables']['subpillars']['Update']

export interface PillarWithStats extends Pillar {
  subpillarCount: number
  articleCount: number
  publishedArticleCount: number
}

export interface PillarUpdateData {
  title?: string
  description?: string | null
  status?: 'draft' | 'review' | 'approved' | 'rejected'
}