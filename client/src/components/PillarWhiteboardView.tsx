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
} from 'reactflow'
import { Plus, MinusCircle, Link } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { PillarNode } from './PillarNode'
import { calculateNodesAndEdges } from '@/utils/nodeCalculations'
import { PillarWhiteboardViewProps } from '@/types/pillar'
import 'reactflow/dist/style.css'

const nodeTypes = {
  custom: PillarNode,
}

function PillarWhiteboardViewContent({
  pillars,
  onNodeClick,
  onPillarUpdate,
  onPillarsChange
}: PillarWhiteboardViewProps) {
  // All state hooks first
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [selectedNodes, setSelectedNodes] = useState<Node[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const reactFlowInstance = useReactFlow()

  // All callbacks next
  const handleNodeClick = useCallback((_, node: Node) => {
    const nodeId = node.id.split('-')[1]
    onNodeClick(nodeId)
  }, [onNodeClick])

  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node))
    )
    onPillarUpdate?.(nodeId, newData)
  }, [setNodes, onPillarUpdate])

  const deleteNodeById = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter(n => n.id !== nodeId))
    setEdges((eds) => eds.filter(e => e.source !== nodeId && e.target !== nodeId))
  }, [setNodes, setEdges])

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge({ ...params, animated: true }, eds))
  }, [setEdges])

  const onNodeDragStop = useCallback(() => {
    const positions = nodes.reduce((acc, node) => ({
      ...acc,
      [node.id]: node.position
    }), {})
    localStorage.setItem('nodePositions', JSON.stringify(positions))
  }, [nodes])

  const addNewPillar = useCallback(() => {
    const newPillar = {
      id: `new-${Date.now()}`,
      title: 'New Pillar',
      status: 'pending',
      subpillars: []
    }
    onPillarsChange([...pillars, newPillar])
  }, [pillars, onPillarsChange])

  const addNewSubpillar = useCallback(() => {
    if (selectedNodes.length !== 1) return
    const selectedNode = selectedNodes[0]
    if (!selectedNode.id.startsWith('pillar-')) return

    const pillarId = selectedNode.id.split('-')[1]
    const newSubpillar = {
      id: `new-${Date.now()}`,
      title: 'New Subpillar',
      status: 'research',
      progress: 0
    }

    const updatedPillars = pillars.map(pillar => {
      if (pillar.id === pillarId) {
        return {
          ...pillar,
          subpillars: [...(pillar.subpillars || []), newSubpillar]
        }
      }
      return pillar
    })

    onPillarsChange(updatedPillars)
  }, [selectedNodes, pillars, onPillarsChange])

  const deleteSelectedNodes = useCallback(() => {
    selectedNodes.forEach(node => deleteNodeById(node.id))
  }, [selectedNodes, deleteNodeById])

  // Effect hook last
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
    return <div>Loading...</div>
  }

  return (
    <div className="w-full h-[800px] border rounded-lg bg-background relative">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          onClick={addNewPillar}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Pillar
        </Button>
        <Button
          onClick={addNewSubpillar}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Link className="h-4 w-4" />
          Add Subpillar
        </Button>
        <Button
          onClick={deleteSelectedNodes}
          variant="destructive"
          size="sm"
          className="gap-2"
        >
          <MinusCircle className="h-4 w-4" />
          Delete Node
        </Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        onNodeDragStop={onNodeDragStop}
        onSelectionChange={(params) => {
          if (params.nodes) {
            setSelectedNodes(params.nodes)
          }
        }}
      >
        <Controls />
        <Background />
        <MiniMap />
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
