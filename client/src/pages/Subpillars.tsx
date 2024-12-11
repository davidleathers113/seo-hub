import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/useToast"
import api from "@/api/api"
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

interface Subpillar {
  _id: string
  title: string
  description: string
  status: SubpillarStatus
  progress: number
  lastUpdated: string
}

interface Pillar {
  _id: string
  title: string
  status: string
  subpillars: Subpillar[]
}

interface APIError {
  error: string
  details?: string
  currentStatus?: string
}

export function Subpillars() {
  const { pillarId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [pillar, setPillar] = useState<Pillar | null>(null)
  const [subpillars, setSubpillars] = useState<Subpillar[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPillarAndSubpillars = async () => {
      if (!pillarId) {
        console.error('No pillarId provided');
        setError('Missing pillar ID');
        setLoading(false);
        return;
      }

      try {
        setLoading(true)
        setError(null)
        console.log('Fetching pillar data:', { pillarId });
        const response = await api.get(`/pillars/${pillarId}`)
        console.log('Pillar response:', response.data);

        if (!response.data || !response.data.data) {
          throw new Error('Invalid response format from server');
        }

        const pillarData = response.data.data;
        setPillar(pillarData)
        setSubpillars(pillarData.subpillars || [])
      } catch (error: unknown) {
        const err = error as { response?: { data?: APIError, status?: number } };
        console.error('Error fetching pillar data:', {
          pillarId,
          error: err.response?.data || error,
          status: err.response?.status
        });

        let errorMessage = 'Failed to fetch pillar data';
        if (err.response?.status === 404) {
          errorMessage = 'Pillar not found';
        } else if (err.response?.status === 403) {
          errorMessage = 'Not authorized to access this pillar';
        } else if (err.response?.data?.error) {
          errorMessage = err.response.data.error;
        }

        setError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        });
      } finally {
        setLoading(false)
      }
    }
    fetchPillarAndSubpillars()
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

  const handleGenerateSubpillars = async () => {
    if (!pillarId) {
      console.error('No pillarId available for generating subpillars');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      console.log('Generating subpillars:', { pillarId });
      const response = await api.post(`/pillars/${pillarId}/subpillars/generate`);
      console.log('Generation response:', response.data);

      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format from server');
      }

      const newSubpillars = response.data.data;
      setSubpillars(newSubpillars);
      toast({
        title: "Success",
        description: "Subpillars generated successfully",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: APIError, status?: number } };
      console.error('Error generating subpillars:', {
        pillarId,
        error: err.response?.data || error,
        status: err.response?.status
      });

      let errorMessage = 'Failed to generate subpillars';
      if (err.response?.status === 400 && err.response?.data?.currentStatus) {
        errorMessage = `Cannot generate subpillars: Pillar status is ${err.response.data.currentStatus}`;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading subpillars...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="text-lg text-destructive">Error: {error}</div>
      </div>
    )
  }

  if (!pillar) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="text-lg text-destructive">Pillar not found</div>
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
          <h2 className="text-2xl font-bold">{pillar.title}</h2>
          <p className="text-sm text-muted-foreground">
            Manage and track your content subpillars
          </p>
        </div>
        {subpillars.length === 0 && (
          <Button
            data-testid="generate-subpillars-button"
            onClick={handleGenerateSubpillars}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Subpillars"}
          </Button>
        )}
      </div>

      {subpillars.length === 0 ? (
        <div className="text-center text-muted-foreground">
          No subpillars yet. Click "Generate Subpillars" to create some.
        </div>
      ) : (
        <div className="grid gap-4">
          {subpillars.map((subpillar) => {
            const statusInfo = getStatusInfo(subpillar.status)
            const StatusIcon = statusInfo.icon

            return (
              <Card
                key={subpillar._id}
                data-testid={`subpillar-card-${subpillar._id}`}
                className="hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/subpillar-detail/${subpillar._id}`)}
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
      )}
    </div>
  )
}
