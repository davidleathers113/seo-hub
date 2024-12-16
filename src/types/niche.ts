import { Database } from './database'

export type Niche = Database['public']['Tables']['niches']['Row']
export type NicheInsert = Database['public']['Tables']['niches']['Insert']
export type NicheUpdate = Database['public']['Tables']['niches']['Update']

export interface NicheWithStats extends Niche {
  pillarCount: number
  articleCount: number
  publishedArticleCount: number
}