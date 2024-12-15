import { useState, useCallback, useEffect } from 'react'
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  Node,
  Edge,
  ConnectionMode,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
  Connection,
  addEdge,
  Panel,
  NodeMouseHandler
} from 'reactflow'
import { Plus, MinusCircle, Maximize2, Minimize2, ChevronDown } from 'lucide-react'
import { Button } from "./ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { PillarNode } from './PillarNode'
import { calculateNodesAndEdges } from '../utils/nodeCalculations'
import { Pillar, PillarUpdateData } from '../types/pillar'
import 'reactflow/dist/style.css'

interface NicheOption {
  id: string
  name: string
}

interface PillarWhiteboardViewProps {
  pillars: Pillar[]
  niches: NicheOption[]
  currentNicheId: string
  onNicheChange: (nicheId: string) => void
  onNodeClick: (nodeId: string) => void
  onPillarUpdate: (nodeId: string, newData: PillarUpdateData) => void
  onPillarsChange: (updatedPillars: Pillar[]) => void
}

const nodeTypes = {
  custom: PillarNode,
}

function PillarWhiteboardViewContent({
  pillars,
  niches,
  currentNicheId,
  onNicheChange,
  onNodeClick,
  onPillarUpdate,
  onPillarsChange
}: PillarWhiteboardViewProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [history, setHistory] = useState<Pillar[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  const reactFlowInstance = useReactFlow()

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullScreen(true)
    } else {
      document.exitFullscreen()
      setIsFullScreen(false)
    }
  }, [])

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }
    document.addEventListener('fullscreenchange', handleFullScreenChange)
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange)
    }
  }, [])

  const addToHistory = useCallback((newPillars: Pillar[]) => {
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newPillars])
    setHistoryIndex(prev => prev + 1)
  }, [historyIndex])

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-lg">Loading whiteboard...</div>
      </div>
    )
  }

  const currentNiche = niches.find(niche => niche.id === currentNicheId)

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-[800px]'} border rounded-lg bg-background`}>
      <Panel position="top-left" className="flex gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              {currentNiche?.name || 'Select Niche'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {niches.map(niche => (
              <DropdownMenuItem
                key={niche.id}
                onClick={() => onNicheChange(niche.id)}
              >
                {niche.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Button
          onClick={addNewPillar}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Pillar
        </Button>

        {selectedNodes.length > 0 && (
          <Button
            onClick={deleteSelectedNodes}
            variant="destructive"
            size="sm"
            className="gap-2"
          >
            <MinusCircle className="h-4 w-4" />
            Delete Selected
          </Button>
        )}

        <Button
          onClick={toggleFullScreen}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {isFullScreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </Panel>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true
        }}
        fitView
        onSelectionChange={(params) => {
          setSelectedNodes(params.nodes || [])
        }}
        selectNodesOnDrag={false}
      >
        <Controls />
        <Background />
        <MiniMap 
          nodeColor={(node) => {
            return node.data?.type === 'pillar' ? '#3b82f6' : '#10b981'
          }}
        />
      </ReactFlow>
    </div>
  )
}

export function PillarWhiteboardView(props: PillarWhiteboardViewProps) {
  return (
    <ReactFlowProvider>
      <PillarWhiteboardViewContent {...props} />
    </ReactFlowProvider>
  )
}
