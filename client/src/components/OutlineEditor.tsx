import React from "react"
import { useState } from "react"
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface OutlineSection {
  id: string
  title: string
  subsections: OutlineSubsection[]
}

interface OutlineSubsection {
  id: string
  content: string
  keyPoints: string[]
}

interface OutlineEditorProps {
  initialOutline: OutlineSection[]
  onChange: (outline: OutlineSection[]) => void
}

export function OutlineEditor({ initialOutline, onChange }: OutlineEditorProps) {
  const [outline, setOutline] = useState<OutlineSection[]>(initialOutline)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const items = Array.from(outline)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setOutline(items)
    onChange(items)
  }

  const addSection = () => {
    const newSection: OutlineSection = {
      id: `section-${Date.now()}`,
      title: "New Section",
      subsections: [],
    }
    setOutline([...outline, newSection])
    onChange([...outline, newSection])
  }

  const addSubsection = (sectionId: string) => {
    const newOutline = outline.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          subsections: [
            ...section.subsections,
            {
              id: `subsection-${Date.now()}`,
              content: "New Subsection",
              keyPoints: [],
            },
          ],
        }
      }
      return section
    })
    setOutline(newOutline)
    onChange(newOutline)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Outline</CardTitle>
        <CardDescription>
          Drag and drop sections to reorder them
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="outline">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-4"
              >
                {outline.map((section, index) => (
                  <Draggable
                    key={section.id}
                    draggableId={section.id}
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <Card>
                          <Collapsible
                            open={expandedSections.has(section.id)}
                            onOpenChange={() => toggleSection(section.id)}
                          >
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer">
                                <div className="flex items-center gap-4">
                                  <div
                                    {...provided.dragHandleProps}
                                    className="cursor-grab"
                                  >
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                  <Input
                                    value={section.title}
                                    onChange={(e) => {
                                      const newOutline = outline.map(s =>
                                        s.id === section.id
                                          ? { ...s, title: e.target.value }
                                          : s
                                      )
                                      setOutline(newOutline)
                                      onChange(newOutline)
                                    }}
                                    className="flex-1"
                                  />
                                  {expandedSections.has(section.id)
                                    ? <ChevronUp className="h-4 w-4" />
                                    : <ChevronDown className="h-4 w-4" />
                                  }
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="space-y-4">
                                {section.subsections.map((subsection, subIndex) => (
                                  <Card key={subsection.id}>
                                    <CardContent className="p-4 space-y-4">
                                      <Textarea
                                        value={subsection.content}
                                        onChange={(e) => {
                                          const newOutline = outline.map(s => {
                                            if (s.id === subsection.id) {
                                              return {
                                                ...s,
                                                content: e.target.value,
                                              }
                                            }
                                            return s
                                          })
                                          setOutline(newOutline)
                                          onChange(newOutline)
                                        }}
                                        className="w-full"
                                      />
                                      <div className="flex flex-wrap gap-2">
                                        {subsection.keyPoints.map((keyPoint) => (
                                          <Badge
                                            key={keyPoint}
                                            variant="secondary"
                                            className="text-xs"
                                          >
                                            {keyPoint}
                                          </Badge>
                                        ))}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </CardContent>
                            </CollapsibleContent>
                          </Collapsible>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </CardContent>
    </Card>
  )
}
