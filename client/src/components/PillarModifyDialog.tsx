import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

interface PillarModifyDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  initialTitle: string
  onSave: (newTitle: string) => Promise<void>
}

export function PillarModifyDialog({
  isOpen,
  onOpenChange,
  initialTitle,
  onSave,
}: PillarModifyDialogProps) {
  const [title, setTitle] = useState(initialTitle)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    try {
      setLoading(true)
      await onSave(title)
      onOpenChange(false)
    } catch (error) {
      // Error handling is managed by the parent component
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modify Content Pillar</DialogTitle>
          <DialogDescription>
            Update the pillar title to better reflect your content strategy
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <Alert variant="info" className="bg-blue-500/10 text-blue-500">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Guidelines for Content Pillars</AlertTitle>
            <AlertDescription className="mt-2 text-sm text-muted-foreground">
              <ul className="list-disc pl-4 space-y-1">
                <li>Be specific and descriptive</li>
                <li>Ensure it aligns with your niche</li>
                <li>Keep it concise but meaningful</li>
                <li>Avoid overlapping with other pillars</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="pillar-title">
              Pillar Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pillar-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter pillar title"
              className="col-span-3"
            />
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={loading || !title.trim() || title === initialTitle}
            onClick={handleSave}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
