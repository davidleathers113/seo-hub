import { useCallback, useEffect, useState } from 'react'
import { Node, useNodesState, useEdgesState, Connection, addEdge, NodeMouseHandler } from 'reactflow'
import { Pillar, PillarUpdateData } from '../../../types/pillar'
import { calculateNodesAndEdges } from '../../../utils/nodeCalculations'

export function useWhiteboardNodes(
  pillars: Pillar[],
  onNodeClick: (nodeId: string) => void,
  onPillarsChange: (updatedPillars: Pillar[]) => void,
  addToHistory: (pillars: Pillar[]) => void
) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleNodeClick: NodeMouseHandler = useCallback((event, node) => {
    const nodeId = node.id.split('-')[1]
    onNodeClick(nodeId)
  }, [onNodeClick])

  const handleNodeUpdate = useCallback((nodeId: string, newData: PillarUpdateData) => {
    if (!newData.title) return

    const [type, id] = nodeId.split('-')
    const updatedPillars: Pillar[] = pillars.map(pillar => {
      if (type === 'pillar' && pillar.id === id) {
        return { ...pillar, title: newData.title! }
      }
      if (type === 'subpillar') {
        return {
          ...pillar,
          subpillars: pillar.subpillars.map(sub =>
            sub.id === id ? { ...sub, title: newData.title! } : sub
          )
        }
      }
      return pillar
    })
    onPillarsChange(updatedPillars)
    addToHistory(updatedPillars)
  }, [pillars, onPillarsChange, addToHistory])

  const deleteNodeById = useCallback((nodeId: string) => {
    const [type, id] = nodeId.split('-')
    const updatedPillars: Pillar[] = pillars.filter(pillar => {
      if (type === 'pillar') {
        return pillar.id !== id
      }
      return {
        ...pillar,
        subpillars: pillar.subpillars.filter(sub => sub.id !== id)
      }
    })
    onPillarsChange(updatedPillars)
    addToHistory(updatedPillars)
  }, [pillars, onPillarsChange, addToHistory])

  const onConnect = useCallback((params: Connection) => {
    setEdges(eds => addEdge({ ...params, type: 'smoothstep', animated: true }, eds))
  }, [setEdges])

  const addNewPillar = useCallback(() => {
    const newPillar: Pillar = {
      id: `new-${Date.now()}`,
      title: 'New Pillar',
      status: 'pending',
      updatedAt: new Date().toISOString(),
      subpillars: []
    }
    const updatedPillars = [...pillars, newPillar]
    onPillarsChange(updatedPillars)
    addToHistory(updatedPillars)
  }, [pillars, onPillarsChange, addToHistory])

  const deleteSelectedNodes = useCallback(() => {
    const updatedPillars: Pillar[] = pillars.filter(pillar => {
      const keepPillar = !selectedNodes.some(node => 
        node.id === `pillar-${pillar.id}`
      )
      if (keepPillar) {
        return {
          ...pillar,
          subpillars: pillar.subpillars.filter(sub => 
            !selectedNodes.some(node => node.id === `subpillar-${sub.id}`)
          )
        }
      }
      return false
    })
    onPillarsChange(updatedPillars)
    addToHistory(updatedPillars)
    setSelectedNodes([])
  }, [selectedNodes, pillars, onPillarsChange, addToHistory])

  useEffect(() => {
    try {
      setIsLoading(true)
      const result = calculateNodesAndEdges(
        pillars,
        handleNodeUpdate,
        deleteNodeById,
        (nodeId: string) => console.log('Add child to:', nodeId)
      )
      setNodes(result.initialNodes)
      setEdges(result.initialEdges)
    } catch (error) {
      console.error('Error setting up whiteboard:', error)
    } finally {
      setIsLoading(false)
    }
  }, [pillars, handleNodeUpdate, deleteNodeById, setNodes, setEdges])

  return {
    nodes,
    edges,
    selectedNodes,
    isLoading,
    onNodesChange,
    onEdgesChange,
    onConnect,
    handleNodeClick,
    addNewPillar,
    deleteSelectedNodes,
    setSelectedNodes
  }
}
