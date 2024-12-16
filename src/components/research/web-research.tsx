"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Sparkles } from "lucide-react"

interface WebResearchProps {
  subpillarId: string
  onResearchComplete?: () => void
}

interface WebResearchRequest {
  query: string
  includeImages: boolean
}

interface WebResearchResponse {
  success: boolean
  message: string
}

export function WebResearch({ subpillarId, onResearchComplete }: WebResearchProps) {
  const [query, setQuery] = useState("")
  const [includeImages, setIncludeImages] = useState(true)
  const { toast } = useToast()

  const { mutate: performResearch, isPending } = useMutation<
    WebResearchResponse,
    Error,
    void,
    unknown
  >({
    mutationFn: async () => {
      const response = await fetch(`/api/subpillars/${subpillarId}/research`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          includeImages,
        } as WebResearchRequest),
      })

      if (!response.ok) {
        throw new Error("Failed to perform research")
      }

      return response.json()
    },
    onSuccess: () => {
      toast({
        title: "Research Complete",
        description: "Web research results have been saved.",
      })
      if (onResearchComplete) {
        onResearchComplete()
      }
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to perform web research. Please try again.",
      })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      performResearch()
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="query">Research Query</Label>
          <Input
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your research query..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="include-images"
            checked={includeImages}
            onCheckedChange={setIncludeImages}
          />
          <Label htmlFor="include-images">Include Images</Label>
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Researching...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Start Research
            </>
          )}
        </Button>
      </form>

      <div className="text-sm text-muted-foreground">
        <p>This will:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Search the web for relevant content</li>
          <li>Extract key information and insights</li>
          {includeImages && <li>Find relevant images and visuals</li>}
          <li>Save all research results for your content</li>
        </ul>
      </div>
    </div>
  )
}
