import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/useToast"
import {
  ChevronLeft,
  FileText,
  Search,
  PenTool,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SubpillarStatus = 'research' | 'outline' | 'draft' | 'complete'

type Subpillar = {
  id: string
  title: string
  description: string
  status: SubpillarStatus
  progress: number
  lastUpdated: string
}

export function Subpillars() {
  const { pillarId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [pillarTitle, setPillarTitle] = useState("")
  const [subpillars, setSubpillars] = useState<Subpillar[]>([])

  useEffect(() => {
    const fetchSubpillars = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        setPillarTitle("SEO Strategies")
        setSubpillars([
          {
            id: '1',
            title: 'On-Page SEO Fundamentals',
            description: 'Essential elements of on-page optimization for better search rankings',
            status: 'complete',
            progress: 100,
            lastUpdated: '2024-03-15T10:00:00Z'
          },
          {
            id: '2',
            title: 'Technical SEO Audit Guide',
            description: 'Comprehensive approach to identifying and fixing technical SEO issues',
            status: 'draft',
            progress: 75,
            lastUpdated: '2024-03-15T11:00:00Z'
          },
          {
            id: '3',
            title: 'Link Building Strategies',
            description: 'Modern techniques for building high-quality backlinks',
            status: 'outline',
            progress: 50,
            lastUpdated: '2024-03-15T12:00:00Z'
          },
          // ... more subpillars
        ])
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch subpillars"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSubpillars()
  }, [pillarId, toast])

  const getStatusInfo = (status: SubpillarStatus) => {
    const statusConfig = {
      research: {
        icon: Search,
        label: 'Research',
        className: 'bg-blue-500/10 text-blue-500',
      },
      outline: {
        icon: FileText,
        label: 'Outline',
        className: 'bg-yellow-500/10 text-yellow-500',
      },
      draft: {
        icon: PenTool,
        label: 'Draft',
        className: 'bg-purple-500/10 text-purple-500',
      },
      complete: {
        icon: CheckCircle2,
        label: 'Complete',
        className: 'bg-green-500/10 text-green-500',
      },
    }
    return statusConfig[status]
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading subpillars...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Pillars
        </Button>
        <div>
          <h2 className="text-2xl font-bold">{pillarTitle}</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your content subpillars
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {subpillars.map((subpillar) => {
          const statusInfo = getStatusInfo(subpillar.status)
          const StatusIcon = statusInfo.icon

          return (
            <Card
              key={subpillar.id}
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/subpillars/${subpillar.id}/details`)}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{subpillar.title}</h3>
                      <Badge
                        variant="secondary"
                        className={cn("gap-1", statusInfo.className)}
                      >
                        <StatusIcon className="h-3 w-3" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {subpillar.description}
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <Progress value={subpillar.progress} className="h-1" />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {subpillar.progress}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
