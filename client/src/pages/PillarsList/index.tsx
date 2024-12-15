import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Button } from "../../components/ui/button"
import { ChevronLeft, XCircle } from "lucide-react"
import { PillarTreeView } from "../../components/tree/PillarTreeView"
import { PillarModifyDialog } from "../../components/PillarModifyDialog"
import { PillarWhiteboardView } from "../../components/PillarWhiteboardView"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { ErrorBoundary } from "../../components/ErrorBoundary"
import { usePillarsState } from "../../hooks/usePillarsState"
import { useNiches } from "../../hooks/useNiches"
import { usePillarModifications } from "../../hooks/usePillarModifications"

export function PillarsList() {
  console.log('PillarsList: Component mounting')
  const navigate = useNavigate()
  const { nicheId: initialNicheId } = useParams<{ nicheId: string }>()
  const [activeView, setActiveView] = useState<'tree' | 'whiteboard'>('tree')

  const {
    niches,
    currentNicheId,
    setCurrentNicheId,
    fetchNiches
  } = useNiches(initialNicheId)

  const {
    state,
    setState,
    generating,
    fetchPillars,
    handleGeneratePillars
  } = usePillarsState(currentNicheId)

  const {
    modifyingPillar,
    setModifyingPillar,
    handleModify,
    handlePillarUpdate,
    handleSubpillarUpdate,
    handlePillarsChange,
    handleAddSubpillar,
    handleDeletePillar,
    handleDeleteSubpillar
  } = usePillarModifications()

  useEffect(() => {
    console.log('PillarsList: Running fetchNiches effect')
    fetchNiches()
  }, [fetchNiches])

  useEffect(() => {
    console.log('PillarsList: Running fetchPillars effect', { currentNicheId })
    if (currentNicheId) {
      fetchPillars(currentNicheId)
    }
  }, [currentNicheId, fetchPillars])

  const handleNicheChange = (nicheId: string) => {
    console.log('PillarsList: Handling niche change', { nicheId })
    setCurrentNicheId(nicheId)
  }

  const handleNodeClick = (nodeId: string) => {
    console.log('PillarsList: Handling node click', { nodeId })
    // Check if it's a subpillar node
    const subpillar = state.data.flatMap(p => p.subpillars).find(s => s.id === nodeId)
    if (subpillar) {
      navigate(`/subpillar-detail/${nodeId}`)
    }
  }

  if (!currentNicheId) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="text-muted-foreground">Please select a niche</div>
      </div>
    )
  }

  if (state.isLoading) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <div className="text-sm text-muted-foreground">Loading pillars...</div>
        </div>
      </div>
    )
  }

  if (state.isError) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <XCircle className="h-8 w-4 text-destructive" />
          <div className="text-sm text-destructive">{state.errorMessage}</div>
          <Button onClick={() => fetchPillars(currentNicheId)}>
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const currentNiche = niches.find(niche => niche.id === currentNicheId)
  console.log('PillarsList: Current niche', currentNiche)

  return (
    <ErrorBoundary>
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
            <h2 className="text-2xl font-bold">{currentNiche?.name}</h2>
          </div>
          <Button
            onClick={handleGeneratePillars}
            disabled={generating}
          >
            {generating ? "Generating..." : "Generate Pillars"}
          </Button>
        </div>

        <Tabs value={activeView} onValueChange={(value) => setActiveView(value as 'tree' | 'whiteboard')}>
          <TabsList>
            <TabsTrigger value="tree">Tree View</TabsTrigger>
            <TabsTrigger value="whiteboard">Whiteboard View</TabsTrigger>
          </TabsList>

          <TabsContent value="tree" className="border rounded-lg p-4">
            <PillarTreeView
              pillars={state.data}
              onPillarUpdate={(pillarId, newData) => handlePillarUpdate(pillarId, newData, setState)}
              onSubpillarUpdate={(pillarId, subpillarId, newData) =>
                handleSubpillarUpdate(pillarId, subpillarId, newData, setState)}
              onAddSubpillar={(pillarId) => handleAddSubpillar(pillarId, setState)}
              onDeletePillar={(pillarId) => handleDeletePillar(pillarId, setState)}
              onDeleteSubpillar={(pillarId, subpillarId) =>
                handleDeleteSubpillar(pillarId, subpillarId, setState)}
            />
          </TabsContent>

          <TabsContent value="whiteboard" className="border rounded-lg">
            <PillarWhiteboardView
              pillars={state.data}
              niches={niches}
              currentNicheId={currentNicheId}
              onNicheChange={handleNicheChange}
              onNodeClick={handleNodeClick}
              onPillarUpdate={(pillarId, newData) => handlePillarUpdate(pillarId, newData, setState)}
              onPillarsChange={(updatedPillars) => handlePillarsChange(updatedPillars, setState)}
            />
          </TabsContent>
        </Tabs>

        <PillarModifyDialog
          isOpen={!!modifyingPillar}
          onOpenChange={(open) => !open && setModifyingPillar(null)}
          initialTitle={modifyingPillar?.title || ""}
          onSave={(title) => handleModify(title, setState)}
        />
      </div>
    </ErrorBoundary>
  )
}