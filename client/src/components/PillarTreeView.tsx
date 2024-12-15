import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ChevronRight,
  ChevronDown,
  Layers,
  FileText,
  Pencil,
  Check,
  X,
  Plus,
  Trash2
} from "lucide-react"
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
  onPillarUpdate: (pillarId: string, newData: { title?: string }) => void
  onSubpillarUpdate: (pillarId: string, subpillarId: string, newData: { title?: string }) => void
  onAddSubpillar: (pillarId: string) => void
  onDeletePillar: (pillarId: string) => void
  onDeleteSubpillar: (pillarId: string, subpillarId: string) => void
}

interface EditableItemProps {
  title: string
  onSave: (newTitle: string) => void
  className?: string
}

function EditableItem({ title, onSave, className = "" }: EditableItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(title)

  const handleSave = () => {
    if (editValue.trim() && editValue !== title) {
      onSave(editValue.trim())
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(title)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <div className="flex items-center gap-1">
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8"
          autoFocus
        />
        <Button size="icon" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <span className="font-medium truncate">{title}</span>
      <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
        <Pencil className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function PillarTreeView({
  pillars,
  onPillarUpdate,
  onSubpillarUpdate,
  onAddSubpillar,
  onDeletePillar,
  onDeleteSubpillar
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'research': return 'bg-blue-500'
      case 'outline': return 'bg-yellow-500'
      case 'draft': return 'bg-purple-500'
      case 'complete': return 'bg-green-500'
      case 'approved': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'rejected': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
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
                  <EditableItem
                    title={pillar.title}
                    onSave={(newTitle) => onPillarUpdate(pillar.id, { title: newTitle })}
                    className="flex-1 min-w-0"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={getStatusColor(pillar.status)}>
                    {pillar.status}
                  </Badge>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      onAddSubpillar(pillar.id)
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeletePillar(pillar.id)
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="border-t bg-muted/50 divide-y">
                {pillar.subpillars.map((subpillar) => (
                  <div
                    key={subpillar.id}
                    className="flex items-center justify-between p-4 hover:bg-accent"
                  >
                    <div className="ml-6 flex items-center gap-2 flex-1 min-w-0">
                      <FileText className="h-4 w-4 shrink-0" />
                      <EditableItem
                        title={subpillar.title}
                        onSave={(newTitle) =>
                          onSubpillarUpdate(pillar.id, subpillar.id, { title: newTitle })
                        }
                        className="flex-1 min-w-0"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className={getStatusColor(subpillar.status)}>
                        {subpillar.status}
                      </Badge>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => navigate(`/subpillar-detail/${subpillar.id}`)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => onDeleteSubpillar(pillar.id, subpillar.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      ))}
    </div>
  )
}
