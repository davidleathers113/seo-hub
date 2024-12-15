import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { PillarItem } from "./PillarItem"
import { PillarStatus, SubpillarStatus } from "../../utils/statusUtils"

interface Subpillar {
  id: string
  title: string
  status: SubpillarStatus
  progress: number
}

interface Pillar {
  id: string
  title: string
  status: PillarStatus
  subpillars: Subpillar[]
}

interface PillarTreeViewProps {
  pillars: Pillar[]
  onPillarUpdate: (pillarId: string, newData: { title?: string }) => void
  onSubpillarUpdate: (pillarId: string, subpillarId: string, newData: { title?: string }) => void
  onAddSubpillar: (pillarId: string) => void
  onDeletePillar: (pillarId: string) => void
  onDeleteSubpillar: (pillarId: string, subpillarId: string) => void
  onNavigateToSubpillar?: (subpillarId: string) => void
}

export function PillarTreeView({
  pillars,
  onPillarUpdate,
  onSubpillarUpdate,
  onAddSubpillar,
  onDeletePillar,
  onDeleteSubpillar,
  onNavigateToSubpillar
}: PillarTreeViewProps) {
  const navigate = useNavigate()
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set())

  const togglePillar = (pillarId: string) => {
    const newExpanded = new Set(expandedPillars)
    if (newExpanded.has(pillarId)) {
      newExpanded.delete(pillarId)
    } else {
      newExpanded.add(pillarId)
    }
    setExpandedPillars(newExpanded)
  }

  const handleNavigateToSubpillar = (subpillarId: string) => {
    if (onNavigateToSubpillar) {
      onNavigateToSubpillar(subpillarId)
    } else {
      navigate(`/subpillar-detail/${subpillarId}`)
    }
  }

  return (
    <div className="space-y-2">
      {pillars.map((pillar) => (
        <PillarItem
          key={pillar.id}
          {...pillar}
          isExpanded={expandedPillars.has(pillar.id)}
          onToggleExpand={togglePillar}
          onUpdate={onPillarUpdate}
          onSubpillarUpdate={onSubpillarUpdate}
          onAddSubpillar={onAddSubpillar}
          onDelete={onDeletePillar}
          onDeleteSubpillar={onDeleteSubpillar}
          onNavigateToSubpillar={handleNavigateToSubpillar}
        />
      ))}
    </div>
  )
}
