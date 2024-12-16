export interface Niche {
  id: string
  name: string
  user_id: string
  pillars: any[]
  progress: number
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  created_at: string
  updated_at: string
}

export interface Pillar {
  id: string
  title: string
  niche_id: string
  created_by_id: string
  status: 'pending' | 'approved' | 'rejected' | 'in_progress'
  created_at: string
  updated_at: string
}

export interface Article {
  id: string
  title: string
  content: string
  subpillar_id: string
  author_id: string
  status: 'draft' | 'review' | 'published'
  keywords: string[]
  meta_description: string
  seo_score: number
  readability_score: number
  plagiarism_score: number
  keyword_density: number
  created_at: string
  updated_at: string
}

export interface Research {
  id: string
  subpillar_id: string
  article_id: string
  content: string
  source: string
  relevance: number
  notes: string
  created_by_id: string
  created_at: string
  updated_at: string
}

export interface Outline {
  id: string
  subpillar_id: string
  sections: any[]
  status: 'draft' | 'approved' | 'in_progress'
  created_by_id: string
  created_at: string
  updated_at: string
}