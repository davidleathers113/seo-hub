export interface SubpillarItem {
  id: string
  title: string
  status: 'research' | 'outline' | 'draft' | 'complete'
  progress: number
}

export interface PillarItem {
  id: string
  title: string
  status: 'approved' | 'pending' | 'rejected'
  subpillars: SubpillarItem[]
}

export interface PillarWhiteboardViewProps {
  pillars: PillarItem[]
  onNodeClick: (nodeId: string) => void
  onPillarUpdate: (nodeId: string, newData: any) => void
  onPillarsChange: (updatedPillars: PillarItem[]) => void
}
