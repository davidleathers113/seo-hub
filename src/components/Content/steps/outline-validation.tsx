import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, RotateCw } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface OutlineSection {
  title: string
  content: string
  subsections?: {
    title: string
    content: string
  }[]
}

interface OutlineValidationProps {
  outline: {
    id: string
    title: string
    sections: OutlineSection[]
  }
  onValidate: (isValid: boolean, feedback?: string) => void
  onRegenerate: () => void
  isProcessing: boolean
}

export function OutlineValidation({
  outline,
  onValidate,
  onRegenerate,
  isProcessing
}: OutlineValidationProps) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">{outline.title}</h3>
              <Accordion type="single" collapsible className="w-full">
                {outline.sections.map((section, index) => (
                  <AccordionItem key={index} value={`section-${index}`}>
                    <AccordionTrigger className="text-left">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-4 space-y-4">
                        <p className="text-gray-600">{section.content}</p>
                        {section.subsections && section.subsections.length > 0 && (
                          <div className="space-y-2">
                            {section.subsections.map((subsection, subIndex) => (
                              <div key={subIndex} className="pl-4">
                                <h4 className="font-medium">{subsection.title}</h4>
                                <p className="text-gray-600">{subsection.content}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div>
              <h3 className="font-medium mb-2">Feedback</h3>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add any feedback or suggestions for improving the outline..."
                className="h-32"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isProcessing}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
        <Button
          variant="destructive"
          onClick={() => onValidate(false, feedback)}
          disabled={isProcessing}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button
          onClick={() => onValidate(true, feedback)}
          disabled={isProcessing}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
    </div>
  )
}