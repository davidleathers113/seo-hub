"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ContentSuggestion {
  title: string
  description: string
  type: "how-to" | "list" | "guide" | "comparison" | "case-study"
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedWordCount: number
  targetKeywords: string[]
}

export function ContentSuggestions() {
  const [topic, setTopic] = useState("")
  const [results, setResults] = useState<ContentSuggestion[]>([])

  const { mutate: getSuggestions, isLoading } = useMutation({
    mutationFn: async (searchTopic: string) => {
      const response = await fetch("/api/research/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: searchTopic }),
      })
      if (!response.ok) throw new Error("Failed to get content suggestions")
      return response.json()
    },
    onSuccess: (data) => {
      setResults(data.suggestions)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (topic.trim()) {
      getSuggestions(topic)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
      case "intermediate":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
      case "advanced":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Content Suggestions</h2>
        <p className="text-sm text-muted-foreground">
          Get AI-powered content ideas for your topic
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="topic">Topic</Label>
          <div className="flex space-x-2">
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Enter your topic"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Get Ideas"
              )}
            </Button>
          </div>
        </div>
      </form>

      {results.length > 0 && (
        <div className="grid gap-4">
          {results.map((suggestion, index) => (
            <Card key={index} className="p-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{suggestion.title}</h3>
                    <Badge
                      className={getDifficultyColor(suggestion.difficulty)}
                      variant="outline"
                    >
                      {suggestion.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {suggestion.description}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{suggestion.type}</Badge>
                  <span className="text-sm text-muted-foreground">
                    ~{suggestion.estimatedWordCount} words
                  </span>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Target Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.targetKeywords.map((keyword) => (
                      <Badge key={keyword} variant="outline">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}