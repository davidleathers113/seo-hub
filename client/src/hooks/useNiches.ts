import { useState, useCallback } from "react"
import { useToast } from "./useToast"
import { getNiches } from "../api/niches"
import type { Niche } from "../types/niche"

export function useNiches(initialNicheId: string | undefined) {
  const { toast } = useToast()
  const [niches, setNiches] = useState<Niche[]>([])
  const [currentNicheId, setCurrentNicheId] = useState(initialNicheId || '')

  const fetchNiches = useCallback(async () => {
    console.log('PillarsList: Fetching niches')
    try {
      const response = await getNiches()
      const fetchedNiches = Array.isArray(response.data) ? response.data : response.data.data
      console.log('PillarsList: Setting niches', fetchedNiches)
      setNiches(fetchedNiches || [])
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error fetching niches'
      console.error('PillarsList: Error fetching niches:', { error, message: errorMessage })
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch niches"
      })
    }
  }, [toast])

  return {
    niches,
    currentNicheId,
    setCurrentNicheId,
    fetchNiches
  }
}