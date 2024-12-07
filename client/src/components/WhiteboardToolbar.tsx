import { Button } from "@/components/ui/button"
import { Plus, MinusCircle, Link } from 'lucide-react'

interface WhiteboardToolbarProps {
  onAddPillar: () => void
  onAddSubpillar: () => void
  onDeleteNodes: () => void
}

export function WhiteboardToolbar({
  onAddPillar,
  onAddSubpillar,
  onDeleteNodes
}: WhiteboardToolbarProps) {
  return (
    <div className="absolute top-4 left-4 z-10 flex gap-2">
      <Button
        onClick={onAddPillar}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Pillar
      </Button>
      <Button
        onClick={onAddSubpillar}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Link className="h-4 w-4" />
        Add Subpillar
      </Button>
      <Button
        onClick={onDeleteNodes}
        variant="destructive"
        size="sm"
        className="gap-2"
      >
        <MinusCircle className="h-4 w-4" />
        Delete Node
      </Button>
    </div>
  )
}
