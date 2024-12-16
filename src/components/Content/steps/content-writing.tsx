"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { getNicheById } from "@/lib/api"
import { Icons } from "@/components/ui/icons"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Niche } from "@/types/database"

interface ContentWritingProps {
  formData: {
    topic: string
    keywords: string[]
    outline: {
      sections: Array<{
        title: string
        points: string[]
      }>
    }
    content: string
  }
  setFormData: (data: typeof formData) => void
  onNext: () => void
  onBack: () => void
}

export function ContentWriting({
  formData,
  setFormData,
  onNext,
  onBack,
}: ContentWritingProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSection, setCurrentSection] = useState(0)
  const { data: niche, isLoading: isLoadingNiche } = useQuery<Niche>({
    queryKey: ["niche", formData.topic],
    queryFn: () => getNicheById(formData.topic),
    enabled: Boolean(formData.topic),
  })

  const generateContent = async () => {
    setIsGenerating(true)
    try {
      const section = formData.outline.sections[currentSection]
      const response = await fetch("/api/generate/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche: niche?.name,
          keywords: formData.keywords,
          section: {
            title: section.title,
            points: section.points,
          },
          previousContent: formData.content,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate content")
      }

      const data = await response.json()
      setFormData({
        ...formData,
        content: formData.content + "\n\n" + data.content,
      })

      if (currentSection < formData.outline.sections.length - 1) {
        setCurrentSection(currentSection + 1)
      }
    } catch (error) {
      console.error("Error generating content:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoadingNiche) {
    return <Skeleton className="h-[400px]" />
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Generate Content</h3>
            <p className="text-sm text-muted-foreground">
              Generating content section by section ({currentSection + 1} of{" "}
              {formData.outline.sections.length})
            </p>
          </div>
          <Button
            onClick={generateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Section"
            )}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4">
            <h4 className="text-base font-medium mb-2">Current Section</h4>
            <div className="space-y-2">
              <h5 className="font-medium">
                {formData.outline.sections[currentSection].title}
              </h5>
              <ul className="list-disc list-inside space-y-1">
                {formData.outline.sections[currentSection].points.map(
                  (point: string, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      {point}
                    </li>
                  )
                )}
              </ul>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-base font-medium mb-2">Generated Content</h4>
            <ScrollArea className="h-[300px]">
              <Textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                className="min-h-[300px] resize-none"
              />
            </ScrollArea>
          </Card>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.content || currentSection < formData.outline.sections.length - 1}
        >
          Next Step
        </Button>
      </div>
    </div>
  )
}