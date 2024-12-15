import { Node, Edge } from 'reactflow'

interface Subpillar {
  id: string
  title: string
  status: string
  progress: number
}

interface Pillar {
  id: string
  title: string
  status: string
  subpillars: Subpillar[]
}

const PILLAR_SPACING = 300
const SUBPILLAR_SPACING = 200
const VERTICAL_SPACING = 150

export function calculateNodesAndEdges(
  pillars: Pillar[],
  onUpdate: (id: string, data: any) => void,
  onDelete: (id: string) => void,
  onAddChild: (id: string) => void
): { initialNodes: Node[]; initialEdges: Edge[] } {
  const nodes: Node[] = []
  const edges: Edge[] = []
  
  // Calculate pillar positions
  pillars.forEach((pillar, pillarIndex) => {
    const pillarX = pillarIndex * PILLAR_SPACING
    const pillarY = 0

    // Add pillar node
    nodes.push({
      id: `pillar-${pillar.id}`,
      type: 'custom',
      position: { x: pillarX, y: pillarY },
      data: {
        label: pillar.title,
        status: pillar.status,
        type: 'pillar',
        onUpdate,
        onDelete,
        onAddChild
      }
    })

    // Calculate subpillar positions
    pillar.subpillars.forEach((subpillar, subIndex) => {
      const subpillarX = pillarX + ((subIndex - (pillar.subpillars.length - 1) / 2) * SUBPILLAR_SPACING)
      const subpillarY = VERTICAL_SPACING

      // Add subpillar node
      nodes.push({
        id: `subpillar-${subpillar.id}`,
        type: 'custom',
        position: { x: subpillarX, y: subpillarY },
        data: {
          label: subpillar.title,
          status: subpillar.status,
          type: 'subpillar',
          onUpdate,
          onDelete
        }
      })

      // Add edge from pillar to subpillar
      edges.push({
        id: `edge-${pillar.id}-${subpillar.id}`,
        source: `pillar-${pillar.id}`,
        target: `subpillar-${subpillar.id}`,
        type: 'smoothstep',
        animated: true
      })
    })
  })

  return { initialNodes: nodes, initialEdges: edges }
}
