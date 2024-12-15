import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { ChevronRight, ChevronDown, Layers, Plus, Trash2 } from "lucide-react"
import { EditableItem } from "./EditableItem"
import { SubpillarItem } from "./SubpillarItem"
import { getStatusColor } from "../../utils/statusUtils"
import { PillarStatus, SubpillarStatus } from "../../utils/statusUtils"

interface Subpillar {
  id: string
  title: string
  status: SubpillarStatus
  progress: number
}

interface PillarItemProps {
  id: string
  title: string
  status: PillarStatus
  subpillars: Subpillar[]
  isExpanded: boolean
  onToggleExpand: (id: string) => void
  onUpdate: (pillarId: string, newData: { title?: string }) => void
  onSubpillarUpdate: (pillarId: string, subpillarId: string, newData: { title?: string }) => void
  onAddSubpillar: (pillarId: string) => void
  onDelete: (pillarId: string) => void
  onDeleteSubpillar: (pillarId: string, subpillarId: string) => void
  onNavigateToSubpillar: (subpillarId: string) => void
}

export function PillarItem({
  id,
  title,
  status,
  subpillars,
  isExpanded,
  onToggleExpand,
  onUpdate,
  onSubpillarUpdate,
  onAddSubpillar,
  onDelete,
  onDeleteSubpillar,
  onNavigateToSubpillar
}: PillarItemProps) {
  return (
    <Collapsible
      open={isExpanded}
      onOpenChange={() => onToggleExpand(id)}
    >
      <div className="rounded-lg border bg-card">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Layers className="h-4 w-4" />
              <EditableItem
                title={title}
                onSave={(newTitle) => onUpdate(id, { title: newTitle })}
                className="flex-1 min-w-0"
                isInsideButton={true}
              />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={getStatusColor(status)}>
                {status}
              </Badge>
              <div className="text-sm text-muted-foreground">
                {subpillars.length} subpillars
              </div>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Add subpillar"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddSubpillar(id)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive"
                aria-label="Delete pillar"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="border-t bg-muted/50 divide-y">
            {subpillars.map((subpillar) => (
              <SubpillarItem
                key={subpillar.id}
                {...subpillar}
                pillarId={id}
                onUpdate={onSubpillarUpdate}
                onDelete={onDeleteSubpillar}
                onNavigate={onNavigateToSubpillar}
              />
            ))}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
