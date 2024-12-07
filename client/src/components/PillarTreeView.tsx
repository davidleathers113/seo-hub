import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ChevronRight, ChevronDown, Layers, FileText } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SubpillarItem {
  id: string
  title: string
  status: 'research' | 'outline' | 'draft' | 'complete'
  progress: number
}

interface PillarItem {
  id: string
  title: string
  status: 'approved' | 'rejected' | 'pending'
  subpillars: SubpillarItem[]
}

interface PillarTreeViewProps {
  pillars: PillarItem[]
  onModify: (pillar: PillarItem) => void
}

export function PillarTreeView({ pillars, onModify }: PillarTreeViewProps) {
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

  return (
    <div className="space-y-2">
      {pillars.map((pillar) => (
        <Collapsible
          key={pillar.id}
          open={expandedPillars.has(pillar.id)}
          onOpenChange={() => togglePillar(pillar.id)}
        >
          <div className="rounded-lg border bg-card">
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-2">
                  {expandedPillars.has(pillar.id) ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <Layers className="h-4 w-4" />
                  <span className="font-medium">{pillar.title}</span>
                  <Badge variant="secondary" className="ml-2">
                    {pillar.subpillars.length} subpillars
                  </Badge>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t bg-muted/50">
                {pillar.subpillars.map((subpillar) => (
                  <Button
                    key={subpillar.id}
                    variant="ghost"
                    className="w-full justify-start gap-2 rounded-none border-b p-4 hover:bg-accent"
                    onClick={() => navigate(`/subpillar-detail/${subpillar.id}`)}
                  >
                    <div className="ml-6 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>{subpillar.title}</span>
                      <Badge variant="secondary" className="ml-2">
                        {subpillar.status}
                      </Badge>
                    </div>
                  </Button>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  )
}
