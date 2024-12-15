import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { FileText, ChevronRight, Trash2 } from "lucide-react"
import { EditableItem } from "./EditableItem"
import { getStatusColor } from "../../utils/statusUtils"
import { SubpillarStatus } from "../../utils/statusUtils"

interface SubpillarItemProps {
  id: string
  title: string
  status: SubpillarStatus
  progress: number
  pillarId: string
  onUpdate: (pillarId: string, subpillarId: string, newData: { title?: string }) => void
  onDelete: (pillarId: string, subpillarId: string) => void
  onNavigate: (subpillarId: string) => void
}

export function SubpillarItem({
  id,
  title,
  status,
  progress,
  pillarId,
  onUpdate,
  onDelete,
  onNavigate
}: SubpillarItemProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-accent">
      <div className="ml-6 flex items-center gap-2 flex-1 min-w-0">
        <FileText className="h-4 w-4 shrink-0" />
        <EditableItem
          title={title}
          onSave={(newTitle) => onUpdate(pillarId, id, { title: newTitle })}
          className="flex-1 min-w-0"
        />
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className={getStatusColor(status)}>
          {status}
        </Badge>
        <div className="text-sm text-muted-foreground">
          {progress}%
        </div>
        <Button
          size="icon"
          variant="ghost"
          aria-label="Navigate to subpillar"
          onClick={() => onNavigate(id)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="text-destructive"
          aria-label="Delete subpillar"
          onClick={() => onDelete(pillarId, id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
