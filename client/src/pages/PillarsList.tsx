import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/useToast"
import { PillarTreeView } from "@/components/PillarTreeView"
import { PillarModifyDialog } from "@/components/PillarModifyDialog"
import { PillarWhiteboardView } from "@/components/PillarWhiteboardView"
import { generatePillars } from "@/api/content"

interface Subpillar {
  id: string
  title: string
  status: 'research' | 'outline' | 'draft' | 'complete'
  progress: number
}

interface Pillar {
  id: string
  title: string
  status: 'approved' | 'pending' | 'rejected'
  updatedAt: string
  subpillars: Subpillar[]
}

export function PillarsList() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { nicheId } = useParams<{ nicheId: string }>()
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [nicheName, setNicheName] = useState("")
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [modifyingPillar, setModifyingPillar] = useState<Pillar | null>(null)

  useEffect(() => {
    fetchPillars()
  }, [])

  const fetchPillars = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      setNicheName("SEO Content Writing")
      setPillars([
        {
          id: "1",
          title: "Transitioning from Lead Vendors to In-House Teams",
          status: "approved",
          updatedAt: new Date().toISOString(),
          subpillars: [
            {
              id: "1-1",
              title: "How to Evaluate Your Current Lead Vendor Dependency",
              status: "research",
              progress: 20,
            },
            {
              id: "1-2",
              title: "Risks of Over-Reliance on Lead Vendors",
              status: "outline",
              progress: 40,
            },
            {
              id: "1-3",
              title: "Steps to Transition from Lead Vendors to In-House Teams",
              status: "draft",
              progress: 60,
            },
          ],
        },
        {
          id: "2",
          title: "Technical SEO",
          status: "pending",
          updatedAt: new Date().toISOString(),
          subpillars: [
            {
              id: "2-1",
              title: "Site Speed Optimization",
              status: "research",
              progress: 20,
            },
            {
              id: "2-2",
              title: "Mobile Optimization",
              status: "outline",
              progress: 40,
            },
          ],
        },
      ])
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pillars"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGeneratePillars = async () => {
    if (!nicheId) return;
    setGenerating(true);
    try {
      const response = await generatePillars(nicheId);
      setPillars(response.data);
      toast({
        title: "Success",
        description: "Pillars generated successfully",
      });
    } catch (error) {
      console.error('Error generating pillars:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate pillars",
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleModify = async (title: string) => {
    try {
      if (!modifyingPillar) return
      // TODO: API call to modify pillar
      const updatedPillars = pillars.map(pillar =>
        pillar.id === modifyingPillar.id
          ? { ...pillar, title }
          : pillar
      )
      setPillars(updatedPillars)
      toast({
        title: "Success",
        description: "Pillar modified successfully"
      })
      setModifyingPillar(null)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to modify pillar"
      })
    }
  }

  const handleNodeClick = (nodeId: string) => {
    // Check if it's a subpillar node
    const subpillar = pillars.flatMap(p => p.subpillars).find(s => s.id === nodeId)
    if (subpillar) {
      navigate(`/subpillar-detail/${nodeId}`)
    }
  }

  const handlePillarUpdate = (nodeId: string, newData: any) => {
    const [type, id] = nodeId.split('-')

    setPillars(currentPillars =>
      currentPillars.map(pillar => {
        if (type === 'pillar' && pillar.id === id) {
          return { ...pillar, title: newData.label }
        }
        if (type === 'subpillar') {
          const updatedSubpillars = pillar.subpillars.map(subpillar =>
            subpillar.id === id ? { ...subpillar, title: newData.label } : subpillar
          )
          return { ...pillar, subpillars: updatedSubpillars }
        }
        return pillar
      })
    )
  }

  const handlePillarsChange = (updatedPillars: Pillar[]) => {
    // This is called by the whiteboard whenever something changes on that side
    setPillars(updatedPillars)
  }

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading pillars...</div>
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
            onClick={() => navigate('/niche-selection')}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Niches
          </Button>
          <h2 className="text-2xl font-bold">{nicheName}</h2>
        </div>
        <Button
          onClick={handleGeneratePillars}
          disabled={generating}
        >
          {generating ? "Generating..." : "Generate Pillars"}
        </Button>
      </div>

      <div className="flex gap-4" style={{ height: '80vh' }}>
        <div className="w-1/3 overflow-auto border rounded-lg p-2">
          <PillarTreeView
            pillars={pillars}
            onModify={(pillar) => setModifyingPillar(pillar)}
          />
        </div>

        <div className="flex-1 border rounded-lg">
          <PillarWhiteboardView
            pillars={pillars}
            onNodeClick={handleNodeClick}
            onPillarUpdate={handlePillarUpdate}
            onPillarsChange={handlePillarsChange}
          />
        </div>
      </div>

      <PillarModifyDialog
        isOpen={!!modifyingPillar}
        onOpenChange={(open) => !open && setModifyingPillar(null)}
        initialTitle={modifyingPillar?.title || ""}
        onSave={handleModify}
      />
    </div>
  )
}