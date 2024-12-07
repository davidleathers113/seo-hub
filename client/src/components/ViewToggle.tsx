import { LayoutGrid, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface ViewToggleProps {
  isWhiteboard: boolean
  onToggle: () => void
}

export function ViewToggle({ isWhiteboard, onToggle }: ViewToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            {isWhiteboard ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <Network className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch to {isWhiteboard ? 'List' : 'Whiteboard'} View</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
