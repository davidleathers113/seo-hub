import { Button } from "../../components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu"
import { Plus, MinusCircle, Maximize2, Minimize2, ChevronDown } from 'lucide-react'
import { Panel } from 'reactflow'

interface NicheOption {
  id: string
  name: string
}

interface WhiteboardToolbarProps {
  niches: NicheOption[]
  currentNicheId: string
  onNicheChange: (nicheId: string) => void
  onAddPillar: () => void
  onDeleteSelected: () => void
  onToggleFullscreen: () => void
  isFullScreen: boolean
  hasSelectedNodes: boolean
}

export function WhiteboardToolbar({
  niches,
  currentNicheId,
  onNicheChange,
  onAddPillar,
  onDeleteSelected,
  onToggleFullscreen,
  isFullScreen,
  hasSelectedNodes
}: WhiteboardToolbarProps) {
  const currentNiche = niches.find(niche => niche.id === currentNicheId)

  return (
    <Panel position="top-left" className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            {currentNiche?.name || 'Select Niche'}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {niches.map(niche => (
            <DropdownMenuItem
              key={niche.id}
              onClick={() => onNicheChange(niche.id)}
            >
              {niche.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        onClick={onAddPillar}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Plus className="h-4 w-4" />
        Add Pillar
      </Button>

      {hasSelectedNodes && (
        <Button
          onClick={onDeleteSelected}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <MinusCircle className="h-4 w-4" />
          Delete Selected
        </Button>
      )}

      <Button
        onClick={onToggleFullscreen}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        {isFullScreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>
    </Panel>
  )
}
