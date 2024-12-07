import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/hooks/useToast"
import {
  ChevronLeft,
  Search,
  FileText,
  PenTool,
  CheckCircle2,
  ArrowRight,
  BookOpen,
  Sparkles,
  AlertCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

type ResearchPoint = {
  id: string
  content: string
  source?: string
  relevance: number
}

type OutlineSection = {
  id: string
  title: string
  subsections: Array<{
    id: string
    content: string
    keyPoints: string[]
  }>
}

type SubpillarDetail = {
  id: string
  title: string
  description: string
  status: 'research' | 'outline' | 'draft' | 'complete'
  research: ResearchPoint[]
  outline: OutlineSection[]
  lastUpdated: string
}

export function SubpillarDetail() {
  const { subpillarId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [detail, setDetail] = useState<SubpillarDetail | null>(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        setDetail({
          id: '1',
          title: 'On-Page SEO Fundamentals',
          description: 'Essential elements of on-page optimization for better search rankings',
          status: 'outline',
          research: [
            {
              id: 'r1',
              content: 'Title tags remain one of the most important on-page SEO elements',
              source: 'Moz Blog',
              relevance: 0.95
            },
            {
              id: 'r2',
              content: 'Meta descriptions, while not a direct ranking factor, significantly impact click-through rates',
              source: 'Search Engine Journal',
              relevance: 0.88
            },
            // More research points...
          ],
          outline: [
            {
              id: 'o1',
              title: 'Introduction to On-Page SEO',
              subsections: [
                {
                  id: 'o1s1',
                  content: 'Definition and importance of on-page SEO',
                  keyPoints: [
                    'What is on-page SEO?',
                    'Why is it crucial for rankings?',
                    'Key components overview'
                  ]
                }
              ]
            },
            // More outline sections...
          ],
          lastUpdated: '2024-03-15T10:00:00Z'
        })
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subpillar details"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [subpillarId, toast])

  const handleGenerateContent = async () => {
    try {
      setGenerating(true)
      // TODO: API call to generate content
      toast({
        title: "Success",
        description: "Content generation started"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start content generation"
      })
    } finally {
      setGenerating(false)
    }
  }

  if (loading || !detail) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading subpillar details...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Subpillars
          </Button>
          <div>
            <h2 className="text-2xl font-bold">{detail.title}</h2>
            <p className="text-sm text-muted-foreground">
              {detail.description}
            </p>
          </div>
        </div>
        <Button
          onClick={handleGenerateContent}
          disabled={generating || detail.status === 'complete'}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {generating ? "Generating..." : "Generate Content"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Research Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Research
              </CardTitle>
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-500">
                {detail.research.length} Sources
              </Badge>
            </div>
            <CardDescription>
              Key findings and reference materials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-4">
                {detail.research.map((point) => (
                  <Card key={point.id} className="bg-muted/50">
                    <CardContent className="p-4 space-y-2">
                      <p className="text-sm">{point.content}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {point.source && (
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {point.source}
                          </span>
                        )}
                        <Badge variant="secondary" className="text-xs">
                          {(point.relevance * 100).toFixed(0)}% Relevant
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Outline Panel */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Content Outline
              </CardTitle>
              <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-500">
                {detail.outline.length} Sections
              </Badge>
            </div>
            <CardDescription>
              Structured outline for content creation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <Accordion type="single" collapsible className="space-y-4">
                {detail.outline.map((section) => (
                  <AccordionItem key={section.id} value={section.id}>
                    <AccordionTrigger className="text-base font-semibold">
                      {section.title}
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                      {section.subsections.map((subsection) => (
                        <div key={subsection.id} className="space-y-2">
                          <h4 className="font-medium">{subsection.content}</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {subsection.keyPoints.map((point, index) => (
                              <li key={index} className="flex items-center gap-2">
                                <ArrowRight className="h-3 w-3" />
                                {point}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
