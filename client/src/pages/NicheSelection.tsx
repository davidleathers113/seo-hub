import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/useToast"
import { Plus, ArrowRight, Target, BarChart } from "lucide-react"

type NicheForm = {
  nicheName: string
}

type Niche = {
  id: string
  name: string
  pillarsCount: number
  progress: number
  status: 'new' | 'in-progress' | 'completed'
  lastUpdated: string
}

export function NicheSelection() {
  const [loading, setLoading] = useState(false)
  const [niches, setNiches] = useState<Niche[]>([])
  const { toast } = useToast()
  const navigate = useNavigate()
  const { register, handleSubmit, reset } = useForm<NicheForm>()

  useEffect(() => {
    // TODO: Fetch niches from API
    const fetchNiches = async () => {
      // Mock data for now
      setNiches([
        {
          id: '1',
          name: 'Digital Marketing',
          pillarsCount: 5,
          progress: 60,
          status: 'in-progress',
          lastUpdated: '2024-03-15'
        },
        {
          id: '2',
          name: 'Personal Finance',
          pillarsCount: 3,
          progress: 30,
          status: 'new',
          lastUpdated: '2024-03-14'
        }
      ])
    }
    fetchNiches()
  }, [])

  const onSubmit = async (data: NicheForm) => {
    try {
      setLoading(true)
      // TODO: API call to create niche
      toast({
        title: "Success",
        description: "Niche created successfully",
      })
      reset()
      navigate(`/content?niche=${encodeURIComponent(data.nicheName)}`)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create niche",
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: Niche['status']) => {
    switch (status) {
      case 'new': return 'text-blue-500'
      case 'in-progress': return 'text-yellow-500'
      case 'completed': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Niche</CardTitle>
          <CardDescription>Enter a niche to generate content pillars</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nicheName">Niche Name</Label>
              <Input
                id="nicheName"
                placeholder="e.g., Digital Marketing"
                {...register("nicheName", { required: true })}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? (
                "Creating..."
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Niche
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Niches</CardTitle>
          <CardDescription>Select a niche to view its content pillars</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {niches.map((niche) => (
              <Card key={niche.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardContent className="p-4" onClick={() => navigate(`/pillars/${niche.id}`)}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold">{niche.name}</h3>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Target className="h-4 w-4 mr-2" />
                      {niche.pillarsCount} Pillars
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <BarChart className="h-4 w-4 mr-2" />
                      {niche.progress}% Complete
                    </div>
                    <div className={`text-sm ${getStatusColor(niche.status)}`}>
                      {niche.status.charAt(0).toUpperCase() + niche.status.slice(1)}
                    </div>
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
