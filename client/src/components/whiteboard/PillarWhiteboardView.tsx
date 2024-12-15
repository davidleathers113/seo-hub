import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  ReactFlowProvider,
  ConnectionMode
} from 'reactflow'
import { PillarNode } from '../PillarNode'
import { WhiteboardToolbar } from './WhiteboardToolbar'
import { useFullscreen } from './hooks/useFullscreen'
import { useHistory } from './hooks/useHistory'
import { useWhiteboardNodes } from './hooks/useWhiteboardNodes'
import { Pillar, PillarUpdateData } from '../../types/pillar'
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
  const { isFullScreen, toggleFullScreen } = useFullscreen()
  const { addToHistory, undo, canUndo } = useHistory()
  const {
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
  } = useWhiteboardNodes(pillars, onNodeClick, onPillarsChange, addToHistory)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse text-lg">Loading whiteboard...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${isFullScreen ? 'fixed inset-0 z-50 bg-background' : 'w-full h-[800px]'} border rounded-lg bg-background`}>
      <WhiteboardToolbar
        niches={niches}
        currentNicheId={currentNicheId}
        onNicheChange={onNicheChange}
        onAddPillar={addNewPillar}
        onDeleteSelected={deleteSelectedNodes}
        onToggleFullscreen={toggleFullScreen}
        isFullScreen={isFullScreen}
        hasSelectedNodes={selectedNodes.length > 0}
      />

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
