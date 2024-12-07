import { Node, Edge } from 'reactflow'
import { PillarItem } from '@/types/pillar'

export function calculateNodesAndEdges(
  pillars: PillarItem[],
  handleNodeUpdate: any,
  onDelete: (nodeId: string) => void,
  onAddChild: (nodeId: string) => void
): { initialNodes: Node[]; initialEdges: Edge[] } {
  if (!pillars || !Array.isArray(pillars)) {
    console.warn('No pillars provided or invalid pillars data:', pillars)
    return { initialNodes: [], initialEdges: [] }
  }

  const newNodes: Node[] = []
  const newEdges: Edge[] = []

  const pillarXPosition = 100
  const subpillarXPosition = 500
  const pillarYSpacing = 300
  const subpillarYSpacing = 80
  let yOffset = 50

  const savedPositions = JSON.parse(localStorage.getItem('nodePositions') || '{}')

  pillars.forEach((pillar, pillarIndex) => {
    if (!pillar || !pillar.id) {
      console.warn('Invalid pillar data:', pillar)
      return
    }

    const pillarNodeId = `pillar-${pillar.id}`
    const pillarY = yOffset + pillarIndex * pillarYSpacing
    const pillarCenterOffset = ((pillar.subpillars?.length || 0) * subpillarYSpacing) / 2

    newNodes.push({
      id: pillarNodeId,
      position: savedPositions[pillarNodeId] || {
        x: pillarXPosition,
        y: pillarY + pillarCenterOffset
      },
      data: {
        label: pillar.title || 'Untitled Pillar',
        status: pillar.status || 'pending',
        type: 'pillar',
        onNodeUpdate: handleNodeUpdate,
        onDelete,
        onAddChild
      },
      type: 'custom',
      draggable: true,
    })

    if (pillar.subpillars && Array.isArray(pillar.subpillars)) {
      pillar.subpillars.forEach((subpillar, subIndex) => {
        if (!subpillar || !subpillar.id) {
          console.warn('Invalid subpillar data:', subpillar)
          return
        }

        const subpillarNodeId = `subpillar-${subpillar.id}`

        newNodes.push({
          id: subpillarNodeId,
          position: savedPositions[subpillarNodeId] || {
            x: subpillarXPosition,
            y: pillarY + (subIndex * subpillarYSpacing)
          },
          data: {
            label: subpillar.title || 'Untitled Subpillar',
            status: subpillar.status || 'research',
            type: 'subpillar',
            progress: subpillar.progress || 0,
            onNodeUpdate: handleNodeUpdate,
            onDelete
          },
          type: 'custom',
          draggable: true,
        })

        newEdges.push({
          id: `edge-${pillar.id}-${subpillar.id}`,
          source: pillarNodeId,
          target: subpillarNodeId,
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#999' },
        })
      })
    }
  })

  return { initialNodes: newNodes, initialEdges: newEdges }
}
