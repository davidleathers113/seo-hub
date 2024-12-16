"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { TopicSelection } from "./steps/topic-selection"
import { OutlineGeneration } from "./steps/outline-generation"
import { ContentWriting } from "./steps/content-writing"
import { ContentReview } from "./steps/content-review"

const STEPS = [
  { id: "topic", label: "Topic Selection" },
  { id: "outline", label: "Outline Generation" },
  { id: "writing", label: "Content Writing" },
  { id: "review", label: "Review & Publish" },
]

export function ContentGenerationWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    topic: "",
    keywords: [],
    outline: null,
    content: "",
  })

  const progress = ((currentStep + 1) / STEPS.length) * 100

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = async () => {
    // Save the generated content and redirect to the articles page
    router.push("/dashboard/articles")
  }

  return (
    <div className="space-y-6">
      <Progress value={progress} className="w-full" />

      <div className="flex items-center justify-between mb-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">
            {STEPS[currentStep].label}
          </h2>
          <p className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Tabs value={STEPS[currentStep].id} className="space-y-6">
          <TabsContent value="topic">
            <TopicSelection
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
            />
          </TabsContent>

          <TabsContent value="outline">
            <OutlineGeneration
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          </TabsContent>

          <TabsContent value="writing">
            <ContentWriting
              formData={formData}
              setFormData={setFormData}
              onNext={handleNext}
              onBack={handleBack}
            />
          </TabsContent>

          <TabsContent value="review">
            <ContentReview
              formData={formData}
              onBack={handleBack}
              onComplete={handleComplete}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}