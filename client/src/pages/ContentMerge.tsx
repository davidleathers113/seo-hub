import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import {
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
  RefreshCw,
  Wand2,
  AlertCircle,
  FileText,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

type ContentPoint = {
  id: string
  outlinePoint: string
  draftedContent: string
  status: 'pending' | 'approved' | 'needs_revision'
  order: number
}

type PipelineStep = {
  id: string
  label: string
  status: 'completed' | 'in_progress' | 'pending'
}

export function ContentMerge() {
  const navigate = useNavigate()
  const { subpillarId } = useParams()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [merging, setMerging] = useState(false)
  const [contentPoints, setContentPoints] = useState<ContentPoint[]>([])
  const [expandedPoints, setExpandedPoints] = useState<Set<string>>(new Set())
  const [pipelineSteps] = useState<PipelineStep[]>([
    { id: 'research', label: 'Research', status: 'completed' },
    { id: 'outline', label: 'Outline', status: 'completed' },
    { id: 'points', label: 'Content Points', status: 'completed' },
    { id: 'merge', label: 'Merge & Refine', status: 'in_progress' },
    { id: 'final', label: 'Final Draft', status: 'pending' },
  ])

  useEffect(() => {
    const fetchContentPoints = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        setContentPoints([
          {
            id: 'cp1',
            outlinePoint: 'Introduction to On-Page SEO',
            draftedContent: 'On-page SEO remains one of the fundamental pillars of successful search engine optimization. Unlike off-page factors, these elements are entirely within your control and can significantly impact your website\'s visibility in search results...',
            status: 'approved',
            order: 1
          },
          {
            id: 'cp2',
            outlinePoint: 'Title Tag Optimization',
            draftedContent: 'Title tags serve as the primary clickable headline in search engine results pages (SERPs). A well-crafted title tag should balance keyword optimization with user appeal, incorporating your target keywords naturally while maintaining readability...',
            status: 'needs_revision',
            order: 2
          },
          // More content points...
        ])
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch content points"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchContentPoints()
  }, [subpillarId, toast])

  const togglePoint = (pointId: string) => {
    const newExpanded = new Set(expandedPoints)
    if (newExpanded.has(pointId)) {
      newExpanded.delete(pointId)
    } else {
      newExpanded.add(pointId)
    }
    setExpandedPoints(newExpanded)
  }

  const handleStatusChange = async (pointId: string, newStatus: ContentPoint['status']) => {
    try {
      // TODO: API call to update status
      setContentPoints(points =>
        points.map(point =>
          point.id === pointId ? { ...point, status: newStatus } : point
        )
      )
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update point status"
      })
    }
  }

  const handleMergeContent = async () => {
    try {
      setMerging(true)
      // TODO: API call to merge content
      toast({
        title: "Success",
        description: "Content merged successfully"
      })
      navigate(`/subpillars/${subpillarId}/final-draft`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to merge content"
      })
    } finally {
      setMerging(false)
    }
  }

  const getStatusBadge = (status: ContentPoint['status']) => {
    const config = {
      approved: { label: 'Approved', className: 'bg-green-500/10 text-green-500' },
      needs_revision: { label: 'Needs Revision', className: 'bg-yellow-500/10 text-yellow-500' },
      pending: { label: 'Pending Review', className: 'bg-blue-500/10 text-blue-500' }
    }
    return config[status]
  }

  const handleBackClick = () => {
    if (subpillarId) {
      navigate(`/subpillar-detail/${subpillarId}`)
    } else {
      navigate('/pillars')
    }
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading content points...</div>
      </div>
    )
  }

  const completedPoints = contentPoints.filter(p => p.status === 'approved').length
  const progress = (completedPoints / contentPoints.length) * 100

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={handleBackClick}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Subpillar
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Content Review & Merge</h2>
            <p className="text-sm text-muted-foreground">
              Review and approve content points before merging
            </p>
          </div>
        </div>
        <Button
          onClick={handleMergeContent}
          disabled={merging || progress < 100}
          className="gap-2"
        >
          <Wand2 className="h-4 w-4" />
          {merging ? "Merging..." : "Merge & Refine"}
        </Button>
      </div>

      {/* Pipeline Progress */}
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between gap-2 pt-2">
              {pipelineSteps.map((step) => (
                <div
                  key={step.id}
                  className="flex flex-col items-center gap-2 text-center"
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "w-8 h-8 rounded-full p-0 flex items-center justify-center",
                      step.status === 'completed' && "bg-green-500/10 text-green-500",
                      step.status === 'in_progress' && "bg-blue-500/10 text-blue-500",
                      step.status === 'pending' && "bg-gray-500/10 text-gray-500"
                    )}
                  >
                    {step.status === 'completed' && <Check className="h-4 w-4" />}
                    {step.status === 'in_progress' && <RefreshCw className="h-4 w-4" />}
                    {step.status === 'pending' && <FileText className="h-4 w-4" />}
                  </Badge>
                  <span className="text-xs">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Points */}
      <div className="space-y-4">
        {contentPoints.map((point) => (
          <Card key={point.id}>
            <Collapsible
              open={expandedPoints.has(point.id)}
              onOpenChange={() => togglePoint(point.id)}
            >
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-accent/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">
                        {point.order}. {point.outlinePoint}
                      </CardTitle>
                      <CardDescription>
                        Click to {expandedPoints.has(point.id) ? 'collapse' : 'expand'} content
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className={getStatusBadge(point.status).className}
                      >
                        {getStatusBadge(point.status).label}
                      </Badge>
                      {expandedPoints.has(point.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                      <p className="text-sm">{point.draftedContent}</p>
                    </ScrollArea>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleStatusChange(point.id, 'needs_revision')}
                        disabled={point.status === 'needs_revision'}
                      >
                        <AlertCircle className="mr-2 h-4 w-4" />
                        Needs Revision
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusChange(point.id, 'approved')}
                        disabled={point.status === 'approved'}
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        ))}
      </div>
    </div>
  )
}
