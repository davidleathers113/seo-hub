import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Pencil, Check, X } from "lucide-react"

interface EditableItemProps {
  title: string
  onSave: (newTitle: string) => void
  className?: string
  isInsideButton?: boolean
}

export function EditableItem({ 
  title, 
  onSave, 
  className = "",
  isInsideButton = false 
}: EditableItemProps) {
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
      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
        <Input
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-8"
          autoFocus
          role="textbox"
        />
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleSave}
          aria-label="Save edit"
        >
          <Check className="h-4 w-4" />
        </Button>
        <Button 
          size="icon" 
          variant="ghost" 
          onClick={handleCancel}
          aria-label="Cancel edit"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  const EditControl = isInsideButton ? 'div' : Button
  const editProps = isInsideButton ? {
    role: 'button',
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsEditing(true)
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        e.stopPropagation()
        setIsEditing(true)
      }
    },
    tabIndex: 0
  } : {
    onClick: (e: React.MouseEvent) => {
      e.stopPropagation()
      setIsEditing(true)
    }
  }

  return (
    <div className={`flex items-center justify-between gap-2 ${className}`}>
      <span className="font-medium truncate">{title}</span>
      <EditControl 
        {...editProps}
        size={!isInsideButton ? "icon" : undefined}
        variant={!isInsideButton ? "ghost" : undefined}
        aria-label="Edit"
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-10 w-10 cursor-pointer"
      >
        <Pencil className="h-4 w-4" />
      </EditControl>
    </div>
  )
}
