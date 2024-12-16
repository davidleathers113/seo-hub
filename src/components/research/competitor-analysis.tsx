"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CompetitorResult {
  url: string
  title: string
  wordCount: number
  readability: number
  keywords: string[]
  headings: string[]
  visualElements: {
    images: { src: string; alt: string; context: string }[]
    charts: { type: string; data: any }[]
    layout: { structure: string; sections: string[] }
  }
  semanticTopics: {
    topic: string
    relevance: number
    relatedKeywords: string[]
  }[]
  contentStructure: {
    sections: {
      heading: string
      summary: string
      wordCount: number
      keyPoints: string[]
    }[]
  }
}

interface CompetitorAnalysisResponse {
  competitors: CompetitorResult[]
}

export function CompetitorAnalysis() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<CompetitorResult[]>([])
  const [selectedTab, setSelectedTab] = useState("overview")

  const { mutate: analyzeCompetitors, isPending } = useMutation<
    CompetitorAnalysisResponse,
    Error,
    string
  >({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch("/api/research/competitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
      if (!response.ok) throw new Error("Failed to analyze competitors")
      return response.json()
    },
    onSuccess: (data) => {
      setResults(data.competitors)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      analyzeCompetitors(query)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Competitor Analysis</h2>
        <p className="text-sm text-muted-foreground">
          Analyze top-ranking content for your target keyword using AI-powered insights
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyword">Target Keyword</Label>
          <div className="flex space-x-2">
            <Input
              id="keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a keyword to analyze competitors"
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                "Analyze"
              )}
            </Button>
          </div>
        </div>
      </form>

      {results.length > 0 && (
        <div className="grid gap-6">
          {results.map((result) => (
            <Card key={result.url} className="p-6">
              <Tabs value={selectedTab} onValueChange={setSelectedTab}>
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="topics">Topics</TabsTrigger>
                  <TabsTrigger value="structure">Structure</TabsTrigger>
                  <TabsTrigger value="visual">Visual</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">{result.title}</h3>
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:underline"
                      >
                        {result.url}
                      </a>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Word Count</p>
                        <p className="font-medium">{result.wordCount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Readability</p>
                        <p className="font-medium">{result.readability}/100</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Main Keywords</p>
                      <div className="flex flex-wrap gap-2">
                        {result.keywords.map((keyword) => (
                          <Badge key={keyword} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="topics" className="mt-4">
                  <div className="space-y-4">
                    {result.semanticTopics.map((topic, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{topic.topic}</h4>
                          <Badge variant="outline">
                            {Math.round(topic.relevance * 100)}% relevant
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {topic.relatedKeywords.map((keyword) => (
                            <Badge key={keyword} variant="secondary">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="structure" className="mt-4">
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="space-y-6">
                      {result.contentStructure.sections.map((section, index) => (
                        <div key={index} className="space-y-2">
                          <h4 className="font-medium">{section.heading}</h4>
                          <p className="text-sm text-muted-foreground">
                            {section.summary}
                          </p>
                          <div className="space-y-1">
                            {section.keyPoints.map((point, idx) => (
                              <p key={idx} className="text-sm">
                                • {point}
                              </p>
                            ))}
                          </div>
                          <Badge variant="outline">{section.wordCount} words</Badge>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="visual" className="mt-4">
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium mb-2">Layout Structure</h4>
                      <Badge variant="outline">
                        {result.visualElements.layout.structure}
                      </Badge>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {result.visualElements.layout.sections.map((section, index) => (
                          <Badge key={index} variant="secondary">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Images</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {result.visualElements.images.map((image, index) => (
                          <div key={index} className="space-y-2">
                            <img
                              src={image.src}
                              alt={image.alt}
                              className="rounded-md"
                            />
                            <p className="text-sm text-muted-foreground">
                              {image.context}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {result.visualElements.charts.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Charts and Graphs</h4>
                        <div className="grid grid-cols-2 gap-4">
                          {result.visualElements.charts.map((chart, index) => (
                            <div key={index}>
                              {/* TODO: Implement chart visualization */}
                              <Badge>{chart.type}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
