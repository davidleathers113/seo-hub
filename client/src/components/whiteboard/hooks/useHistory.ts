import { useState, useCallback } from 'react'
import { Pillar } from '../../../types/pillar'

export function useHistory() {
  const [history, setHistory] = useState<Pillar[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const addToHistory = useCallback((newPillars: Pillar[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newPillars])
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

  const undo = useCallback((onPillarsChange: (pillars: Pillar[]) => void) => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      onPillarsChange(previousState)
      setHistoryIndex(prev => prev - 1)
    }
  }, [history, historyIndex])

  return {
    history,
    historyIndex,
    addToHistory,
    undo,
    canUndo: historyIndex > 0
  }
}
