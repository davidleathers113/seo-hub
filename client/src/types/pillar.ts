export interface Subpillar {
  id: string
  title: string
  status: 'research' | 'outline' | 'draft' | 'complete'
  progress: number
}

export interface Pillar {
  id: string
  title: string
  status: 'approved' | 'pending' | 'rejected'
  updatedAt: string
  subpillars: Subpillar[]
}

export interface PillarUpdateData {
  title?: string
  status?: 'approved' | 'pending' | 'rejected'
}

export interface SubpillarUpdateData {
  title?: string
  status?: 'research' | 'outline' | 'draft' | 'complete'
  progress?: number
}
