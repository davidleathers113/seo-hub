"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Check, X } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ContentReviewProps {
  content: {
    title: string
    sections: {
      id: string
      title: string
      content: string
    }[]
  }
  onApprove: () => void
  onReject: (feedback: string) => void
  isProcessing: boolean
}

export function ContentReview({
  content,
  onApprove,
  onReject,
  isProcessing
}: ContentReviewProps) {
  const [feedback, setFeedback] = useState('')
  const [activeTab, setActiveTab] = useState('preview')

  const renderPreview = () => (
    <div className="prose prose-sm max-w-none dark:prose-invert">
      <h1>{content.title}</h1>
      {content.sections.map((section) => (
        <div key={section.id} className="mb-8">
          <h2>{section.title}</h2>
          <div className="whitespace-pre-wrap">{section.content}</div>
        </div>
      ))}
    </div>
  )

  const renderRawContent = () => (
    <div className="space-y-6">
      {content.sections.map((section) => (
        <div key={section.id}>
          <h3 className="font-medium mb-2">{section.title}</h3>
          <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
            <code>{section.content}</code>
          </pre>
        </div>
      ))}
    </div>
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw Content</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="mt-0">
              {renderPreview()}
            </TabsContent>
            <TabsContent value="raw" className="mt-0">
              {renderRawContent()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <h3 className="font-medium">Review Feedback</h3>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add any feedback or suggestions for improvement..."
              className="h-32"
              disabled={isProcessing}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="destructive"
          onClick={() => onReject(feedback)}
          disabled={isProcessing || !feedback}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button
          onClick={onApprove}
          disabled={isProcessing}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
    </div>
  )
}