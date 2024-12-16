import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { RotateCw, Plus, Trash2 } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface ResearchSource {
  id: string
  title: string
  url: string
  notes: string
}

interface ResearchSection {
  id: string
  title: string
  content: string
  sources: ResearchSource[]
}

interface ResearchViewProps {
  sections: ResearchSection[]
  onUpdateSection: (sectionId: string, content: string) => void
  onAddSource: (sectionId: string, source: Omit<ResearchSource, 'id'>) => void
  onRemoveSource: (sectionId: string, sourceId: string) => void
  onRegenerateResearch: (sectionId: string) => void
  isProcessing: boolean
}

export function ResearchView({
  sections,
  onUpdateSection,
  onAddSource,
  onRemoveSource,
  onRegenerateResearch,
  isProcessing
}: ResearchViewProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>([])
  const [newSources, setNewSources] = useState<Record<string, Omit<ResearchSource, 'id'>>>({})

  const handleAddSource = (sectionId: string) => {
    const newSource = newSources[sectionId]
    if (newSource) {
      onAddSource(sectionId, newSource)
      setNewSources((prev) => {
        const updated = { ...prev }
        delete updated[sectionId]
        return updated
      })
    }
  }

  const updateNewSource = (
    sectionId: string,
    field: keyof Omit<ResearchSource, 'id'>,
    value: string
  ) => {
    setNewSources((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || { title: '', url: '', notes: '' }),
        [field]: value,
      },
    }))
  }

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
                        onRegenerateResearch(section.id)
                      }}
                      disabled={isProcessing}
                    >
                      <RotateCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-6 pt-4">
                    <div>
                      <h4 className="font-medium mb-2">Research Notes</h4>
                      <Textarea
                        value={section.content}
                        onChange={(e) => onUpdateSection(section.id, e.target.value)}
                        className="min-h-[200px]"
                        placeholder="Add your research notes here..."
                        disabled={isProcessing}
                      />
                    </div>

                    <div>
                      <h4 className="font-medium mb-4">Sources</h4>
                      <div className="space-y-4">
                        {section.sources.map((source) => (
                          <Card key={source.id}>
                            <CardContent className="p-4">
                              <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                  <div className="font-medium">{source.title}</div>
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm text-blue-500 hover:underline break-all"
                                  >
                                    {source.url}
                                  </a>
                                  <p className="text-sm text-muted-foreground">
                                    {source.notes}
                                  </p>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onRemoveSource(section.id, source.id)}
                                  disabled={isProcessing}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}

                        <Card>
                          <CardContent className="p-4">
                            <div className="space-y-4">
                              <Input
                                placeholder="Source Title"
                                value={newSources[section.id]?.title || ''}
                                onChange={(e) =>
                                  updateNewSource(section.id, 'title', e.target.value)
                                }
                                disabled={isProcessing}
                              />
                              <Input
                                placeholder="URL"
                                value={newSources[section.id]?.url || ''}
                                onChange={(e) =>
                                  updateNewSource(section.id, 'url', e.target.value)
                                }
                                disabled={isProcessing}
                              />
                              <Textarea
                                placeholder="Notes"
                                value={newSources[section.id]?.notes || ''}
                                onChange={(e) =>
                                  updateNewSource(section.id, 'notes', e.target.value)
                                }
                                disabled={isProcessing}
                              />
                              <Button
                                className="w-full"
                                onClick={() => handleAddSource(section.id)}
                                disabled={
                                  isProcessing ||
                                  !newSources[section.id]?.title ||
                                  !newSources[section.id]?.url
                                }
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Source
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
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