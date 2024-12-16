"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { getNicheById } from "@/lib/api"
import { Icons } from "@/components/ui/icons"

interface OutlineGenerationProps {
  formData: {
    topic: string
    keywords: string[]
    outline: any
    content: string
  }
  setFormData: (data: any) => void
  onNext: () => void
  onBack: () => void
}

export function OutlineGeneration({
  formData,
  setFormData,
  onNext,
  onBack,
}: OutlineGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { data: niche, isLoading: isLoadingNiche } = useQuery({
    queryKey: ["niche", formData.topic],
    queryFn: () => getNicheById(formData.topic),
    enabled: !!formData.topic,
  })

  const generateOutline = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate/outline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          niche: niche?.name,
          keywords: formData.keywords,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate outline")
      }

      const data = await response.json()
      setFormData({
        ...formData,
        outline: data.outline,
      })
    } catch (error) {
      console.error("Error generating outline:", error)
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
            <h3 className="text-lg font-medium">Generate Content Outline</h3>
            <p className="text-sm text-muted-foreground">
              Generate an AI-powered outline based on your selected niche and keywords
            </p>
          </div>
          <Button
            onClick={generateOutline}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Outline"
            )}
          </Button>
        </div>

        {formData.outline && (
          <Card className="p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <h4 className="text-base font-medium mb-2">Generated Outline:</h4>
              <div className="space-y-2">
                {formData.outline.sections.map((section: any, index: number) => (
                  <div key={index} className="pl-4 border-l-2 border-border">
                    <h5 className="font-medium">{section.title}</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {section.points.map((point: string, i: number) => (
                        <li key={i} className="text-sm text-muted-foreground">
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          onClick={onNext}
          disabled={!formData.outline}
        >
          Next Step
        </Button>
      </div>
    </div>
  )
}