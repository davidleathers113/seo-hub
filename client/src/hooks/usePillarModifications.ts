import { useState } from "react"
import { useToast } from "./useToast"
import { Pillar, PillarUpdateData, SubpillarUpdateData } from "../types/pillar"

export function usePillarModifications() {
  const { toast } = useToast()
  const [modifyingPillar, setModifyingPillar] = useState<Pillar | null>(null)

  const handleModify = async (title: string, setState: (fn: (prev: any) => any) => void) => {
    console.log('PillarsList: Handling pillar modification', { title })
    try {
      if (!modifyingPillar) return
      // TODO: API call to modify pillar
      setState((prev: { data: Pillar[] }) => ({
        ...prev,
        data: prev.data.map(pillar =>
          pillar.id === modifyingPillar.id
            ? { ...pillar, title }
            : pillar
        )
      }))
      toast({
        title: "Success",
        description: "Pillar modified successfully"
      })
      setModifyingPillar(null)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error modifying pillar'
      console.error('PillarsList: Error modifying pillar:', { error, message: errorMessage })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to modify pillar"
      })
    }
  }

  const handlePillarUpdate = (pillarId: string, newData: PillarUpdateData, setState: (fn: (prev: any) => any) => void) => {
    console.log('PillarsList: Handling pillar update', { pillarId, newData })
    setState((currentState: { data: Pillar[] }) => ({
      ...currentState,
      data: currentState.data.map(pillar =>
        pillar.id === pillarId
          ? { ...pillar, ...newData }
          : pillar
      )
    }))
  }

  const handleSubpillarUpdate = (
    pillarId: string,
    subpillarId: string,
    newData: SubpillarUpdateData,
    setState: (fn: (prev: any) => any) => void
  ) => {
    console.log('PillarsList: Handling subpillar update', { pillarId, subpillarId, newData })
    setState((currentState: { data: Pillar[] }) => ({
      ...currentState,
      data: currentState.data.map(pillar =>
        pillar.id === pillarId
          ? {
              ...pillar,
              subpillars: pillar.subpillars.map(sub =>
                sub.id === subpillarId
                  ? { ...sub, ...newData }
                  : sub
              )
            }
          : pillar
      )
    }))
  }

  const handlePillarsChange = (updatedPillars: Pillar[], setState: (fn: (prev: any) => any) => void) => {
    console.log('PillarsList: Handling pillars change', updatedPillars)
    setState((currentState: { data: Pillar[] }) => ({
      ...currentState,
      data: updatedPillars.map(pillar => ({
        ...pillar,
        updatedAt: pillar.updatedAt || new Date().toISOString()
      }))
    }))
  }

  const handleAddSubpillar = (pillarId: string, setState: (fn: (prev: any) => any) => void) => {
    console.log('PillarsList: Handling add subpillar', { pillarId })
    setState((currentState: { data: Pillar[] }) => ({
      ...currentState,
      data: currentState.data.map(pillar =>
        pillar.id === pillarId
          ? {
              ...pillar,
              subpillars: [
                ...pillar.subpillars,
                {
                  id: `new-${Date.now()}`,
                  title: "New Subpillar",
                  status: "research",
                  progress: 0,
                },
              ],
            }
          : pillar
      )
    }))
  }

  const handleDeletePillar = (pillarId: string, setState: (fn: (prev: any) => any) => void) => {
    console.log('PillarsList: Handling delete pillar', { pillarId })
    setState((currentState: { data: Pillar[] }) => ({
      ...currentState,
      data: currentState.data.filter(pillar => pillar.id !== pillarId)
    }))
  }

  const handleDeleteSubpillar = (
    pillarId: string,
    subpillarId: string,
    setState: (fn: (prev: any) => any) => void
  ) => {
    console.log('PillarsList: Handling delete subpillar', { pillarId, subpillarId })
    setState((currentState: { data: Pillar[] }) => ({
      ...currentState,
      data: currentState.data.map(pillar =>
        pillar.id === pillarId
          ? {
              ...pillar,
              subpillars: pillar.subpillars.filter(sub => sub.id !== subpillarId),
            }
          : pillar
      )
    }))
  }

  return {
    modifyingPillar,
    setModifyingPillar,
    handleModify,
    handlePillarUpdate,
    handleSubpillarUpdate,
    handlePillarsChange,
    handleAddSubpillar,
    handleDeletePillar,
    handleDeleteSubpillar
  }
}