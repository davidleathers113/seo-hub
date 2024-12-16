import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCw } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface ContentSection {
  id: string
  title: string
  content: string
}

interface ContentGenerationProps {
  sections: ContentSection[]
  onRegenerateSection: (sectionId: string) => void
  onUpdateSection: (sectionId: string, content: string) => void
  isProcessing: boolean
}

export function ContentGeneration({
  sections,
  onRegenerateSection,
  onUpdateSection,
  isProcessing
}: ContentGenerationProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Accordion
            type="multiple"
            value={expandedSections}
            onValueChange={setExpandedSections}
            className="w-full"
          >
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-left">
                  <div className="flex items-center justify-between w-full pr-4">
                    <span>{section.title}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        onRegenerateSection(section.id)
                      }}
                      disabled={isProcessing}
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-4">
                    <Textarea
                      value={section.content}
                      onChange={(e) => onUpdateSection(section.id, e.target.value)}
                      className="min-h-[200px]"
                      disabled={isProcessing}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}