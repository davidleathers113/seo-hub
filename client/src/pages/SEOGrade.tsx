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
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/useToast"
import {
  ChevronLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Check,
  Target,
  BookOpen,
  LineChart,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

type SEOMetric = {
  id: string
  name: string
  score: number
  importance: 'high' | 'medium' | 'low'
  status: 'good' | 'warning' | 'poor'
}

type SEOSuggestion = {
  id: string
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  automated: boolean
  applied: boolean
}

type ContentStats = {
  wordCount: number
  readingTime: number
  keywordDensity: number
  readabilityScore: number
}

export function SEOGrade() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [improving, setImproving] = useState(false)
  const [metrics, setMetrics] = useState<SEOMetric[]>([])
  const [suggestions, setSuggestions] = useState<SEOSuggestion[]>([])
  const [stats, setStats] = useState<ContentStats | null>(null)
  const [overallScore, setOverallScore] = useState(0)

  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        setMetrics([
          {
            id: 'm1',
            name: 'Keyword Optimization',
            score: 85,
            importance: 'high',
            status: 'good'
          },
          {
            id: 'm2',
            name: 'Content Structure',
            score: 65,
            importance: 'high',
            status: 'warning'
          },
          {
            id: 'm3',
            name: 'Meta Description',
            score: 45,
            importance: 'medium',
            status: 'poor'
          },
          // More metrics...
        ])

        setSuggestions([
          {
            id: 's1',
            title: 'Optimize Meta Description',
            description: 'Current meta description is too short. Add more relevant keywords and make it more compelling for users.',
            impact: 'high',
            automated: true,
            applied: false
          },
          {
            id: 's2',
            title: 'Improve Heading Structure',
            description: 'Add more H2 and H3 headings to break up content and improve readability.',
            impact: 'medium',
            automated: true,
            applied: false
          },
          // More suggestions...
        ])

        setStats({
          wordCount: 1250,
          readingTime: 5,
          keywordDensity: 2.3,
          readabilityScore: 75
        })

        setOverallScore(72)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch SEO data"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchSEOData()
  }, [articleId, toast])

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const getImpactBadge = (impact: SEOSuggestion['impact']) => {
    const config = {
      high: { className: "bg-red-500/10 text-red-500", label: "High Impact" },
      medium: { className: "bg-yellow-500/10 text-yellow-500", label: "Medium Impact" },
      low: { className: "bg-blue-500/10 text-blue-500", label: "Low Impact" }
    }
    return config[impact]
  }

  const handleApplySuggestions = async () => {
    try {
      setImproving(true)
      // TODO: API call to apply suggestions
      toast({
        title: "Success",
        description: "SEO improvements applied successfully"
      })
      // Simulate score improvement
      setOverallScore(prev => Math.min(100, prev + 10))
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to apply SEO improvements"
      })
    } finally {
      setImproving(false)
    }
  }

  if (loading || !stats) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Analyzing content...</div>
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
            Back to Content
          </Button>
          <div>
            <h2 className="text-2xl font-bold">SEO Analysis</h2>
            <p className="text-sm text-muted-foreground">
              Optimize your content for better search rankings
            </p>
          </div>
        </div>
        <Button
          onClick={handleApplySuggestions}
          disabled={improving || suggestions.every(s => s.applied)}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {improving ? "Improving..." : "Apply All Suggestions"}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Score Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Overall SEO Score</CardTitle>
            <CardDescription>Based on multiple ranking factors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="relative flex items-center">
                <div className={cn(
                  "text-7xl font-bold",
                  getScoreColor(overallScore)
                )}>
                  {overallScore}
                </div>
                <div className="text-xl font-medium text-muted-foreground ml-1">
                  /100
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Word Count</div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-semibold">{stats.wordCount}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Reading Time</div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-semibold">{stats.readingTime} min</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Keyword Density</div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-semibold">{stats.keywordDensity}%</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Readability</div>
                <div className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" />
                  <span className="font-semibold">{stats.readabilityScore}/100</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Metrics Breakdown</CardTitle>
            <CardDescription>Individual SEO factor scores</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[230px] pr-4">
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className={cn(
                        "text-sm font-semibold",
                        getScoreColor(metric.score)
                      )}>
                        {metric.score}%
                      </span>
                    </div>
                    <Progress value={metric.score} className="h-2" />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Suggestions</CardTitle>
          <CardDescription>
            Actionable recommendations to improve your SEO score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} className="bg-muted/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{suggestion.title}</h3>
                        <Badge
                          variant="secondary"
                          className={getImpactBadge(suggestion.impact).className}
                        >
                          {getImpactBadge(suggestion.impact).label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.description}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={suggestion.applied}
                      onClick={() => {
                        // TODO: Apply individual suggestion
                      }}
                    >
                      {suggestion.applied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Applied
                        </>
                      ) : (
                        <>
                          {suggestion.automated ? (
                            <Sparkles className="mr-2 h-4 w-4" />
                          ) : (
                            <AlertCircle className="mr-2 h-4 w-4" />
                          )}
                          {suggestion.automated ? "Auto-Apply" : "Manual Fix"}
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
