import { useState, useRef, useCallback } from 'react'
import { Handle, Position } from 'reactflow'
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Pencil, Check, X, Plus, MinusCircle } from 'lucide-react'
import { cn } from "../lib/utils"

export function getStatusColor(status: string) {
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

interface PillarNodeData {
  label: string
  status: string
  type: 'pillar' | 'subpillar'
  onUpdate: (id: string, data: any) => void
  onDelete: (id: string) => void
  onAddChild?: (id: string) => void
}

export function PillarNode({ data, id }: { data: PillarNodeData; id: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(data.label)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleEdit = useCallback(() => {
    setIsEditing(true)
    setTimeout(() => inputRef.current?.focus(), 0)
  }, [])

  const handleSave = useCallback(() => {
    if (title.trim()) {
      data.onUpdate(id, { label: title.trim() })
    }
    setIsEditing(false)
  }, [title, id, data])

  const handleCancel = useCallback(() => {
    setTitle(data.label)
    setIsEditing(false)
  }, [data.label])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      handleCancel()
    }
  }, [handleSave, handleCancel])

  const handleAddChild = useCallback(() => {
    if (data.type === 'pillar' && data.onAddChild) {
      data.onAddChild(id)
    }
  }, [data, id])

  return (
    <div className={cn(
      "px-4 py-2 shadow-lg rounded-lg border",
      "bg-background min-w-[200px]",
      data.type === 'pillar' ? 'border-primary' : 'border-secondary'
    )}>
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-muted-foreground"
      />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          {isEditing ? (
            <div className="flex-1 flex gap-1">
              <Input
                ref={inputRef}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
              />
              <Button size="icon" variant="ghost" onClick={handleSave}>
                <Check className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              <span className="font-medium truncate flex-1">{data.label}</span>
              <Button size="icon" variant="ghost" onClick={handleEdit}>
                <Pencil className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <Badge variant="secondary" className={cn("capitalize", getStatusColor(data.status))}>
            {data.status}
          </Badge>
          
          <div className="flex gap-1">
            {data.type === 'pillar' && data.onAddChild && (
              <Button
                size="icon"
                variant="ghost"
                onClick={handleAddChild}
                className="h-6 w-6"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
            <Button
              size="icon"
              variant="ghost"
              onClick={() => data.onDelete(id)}
              className="h-6 w-6 text-destructive"
            >
              <MinusCircle className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-muted-foreground"
      />
    </div>
  )
}
