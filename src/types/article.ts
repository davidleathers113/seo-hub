import { Database } from './database'
import { Json } from './database'

export type Article = Database['public']['Tables']['articles']['Row']
export type ArticleInsert = Database['public']['Tables']['articles']['Insert']
export type ArticleUpdate = Database['public']['Tables']['articles']['Update']

export type Outline = Database['public']['Tables']['outlines']['Row']
export type OutlineInsert = Database['public']['Tables']['outlines']['Insert']
export type OutlineUpdate = Database['public']['Tables']['outlines']['Update']

export interface ArticleWithRelations extends Article {
  pillar: {
    title: string
    niche_id: string
  }
  outline?: {
    content: Json
    status: string
  }
  seo_analysis?: {
    score: number
    metrics: Json
    recommendations: string[]
  }
}

export interface ArticleMetrics {
  wordCount: number
  readingTime: number
  headingCount: number
  imageCount: number
  linkCount: number
  paragraphCount: number
}