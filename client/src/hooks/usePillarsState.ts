import { useState } from "react"
import { Pillar } from "../types/pillar"
import { useToast } from "./useToast"
import api from "../api/api"

export interface PillarsState {
  isLoading: boolean
  isError: boolean
  errorMessage: string | null
  data: Pillar[]
}

export function usePillarsState(nicheId: string) {
  const { toast } = useToast()
  const [state, setState] = useState<PillarsState>({
    isLoading: true,
    isError: false,
    errorMessage: null,
    data: []
  })
  const [generating, setGenerating] = useState(false)

  const fetchPillars = async (nicheId: string) => {
    if (!nicheId) {
      setState(prev => ({ ...prev, isLoading: false }))
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, isError: false }))
      const response = await api.get(`/api/niches/${nicheId}/pillars`)
      console.log('PillarsList: Fetched pillars response', response)

      const pillarsData = Array.isArray(response.data) ? response.data : response.data.data
      setState(prev => ({
        ...prev,
        isLoading: false,
        data: pillarsData || []
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pillars'
      console.error('PillarsList: Error:', { error, message: errorMessage })

      setState(prev => ({
        ...prev,
        isLoading: false,
        isError: true,
        errorMessage
      }))

      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch pillars"
      })
    }
  }

  const handleGeneratePillars = async () => {
    if (!nicheId) return
    console.log('PillarsList: Generating pillars for niche', nicheId)
    setGenerating(true)
    try {
      const response = await api.post(`/api/niches/${nicheId}/pillars/generate`)
      console.log('PillarsList: Generated pillars response', response)

      const pillarsData = Array.isArray(response.data) ? response.data : response.data.data
      setState({
        isLoading: false,
        isError: false,
        errorMessage: null,
        data: pillarsData || []
      })
      toast({
        title: "Success",
        description: "Pillars generated successfully"
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating pillars'
      console.error('PillarsList: Error generating pillars:', { error, message: errorMessage })
      setState({
        isLoading: false,
        isError: true,
        errorMessage: errorMessage,
        data: []
      })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate pillars"
      })
    } finally {
      setGenerating(false)
    }
  }

  return {
    state,
    setState,
    generating,
    fetchPillars,
    handleGeneratePillars
  }
}