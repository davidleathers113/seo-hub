"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Image as ImageIcon, Link as LinkIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface ResearchResult {
  id: string
  content: string
  source: string
  relevance: number
  images?: {
    url: string
    alt: string
    context: string
  }[]
}

interface ResearchResultsProps {
  research: ResearchResult[]
  subpillarId: string
}

export function ResearchResults({ research, subpillarId }: ResearchResultsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedResult, setSelectedResult] = useState<string | null>(null)

  const filteredResearch = research.filter(
    (item) =>
      item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sortedResearch = [...filteredResearch].sort(
    (a, b) => b.relevance - a.relevance
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search research..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Badge variant="secondary">
          {filteredResearch.length} Results
        </Badge>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="space-y-4">
          {sortedResearch.map((result) => (
            <Card
              key={result.id}
              className={cn(
                "transition-colors hover:bg-accent/50",
                selectedResult === result.id && "border-primary"
              )}
            >
              <CardHeader className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "bg-blue-500/10 text-blue-500",
                          result.relevance >= 0.8 && "bg-green-500/10 text-green-500",
                          result.relevance < 0.5 && "bg-yellow-500/10 text-yellow-500"
                        )}
                      >
                        {Math.round(result.relevance * 100)}% Relevant
                      </Badge>
                      {result.images && result.images.length > 0 && (
                        <Badge variant="outline" className="gap-1">
                          <ImageIcon className="h-3 w-3" />
                          {result.images.length} Images
                        </Badge>
                      )}
                    </div>
                    <a
                      href={result.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1"
                    >
                      <LinkIcon className="h-3 w-3" />
                      {result.source}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedResult(
                      selectedResult === result.id ? null : result.id
                    )}
                  >
                    {selectedResult === result.id ? "Hide" : "Show"}
                  </Button>
                </div>
              </CardHeader>
              {selectedResult === result.id && (
                <CardContent className="p-4 pt-0">
                  <div className="space-y-4">
                    <p className="text-sm whitespace-pre-wrap">{result.content}</p>
                    {result.images && result.images.length > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        {result.images.map((image, index) => (
                          <div key={index} className="space-y-2">
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="rounded-md w-full h-32 object-cover"
                            />
                            {image.alt && (
                              <p className="text-xs text-muted-foreground">
                                {image.alt}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}