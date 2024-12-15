export type PillarStatus = 'approved' | 'pending' | 'rejected'
export type SubpillarStatus = 'research' | 'outline' | 'draft' | 'complete'

export function getStatusColor(status: PillarStatus | SubpillarStatus): string {
  switch (status) {
    // Pillar statuses
    case 'approved':
      return 'bg-green-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'rejected':
      return 'bg-red-500'

    // Subpillar statuses
    case 'research':
      return 'bg-blue-500'
    case 'outline':
      return 'bg-yellow-500'
    case 'draft':
      return 'bg-purple-500'
    case 'complete':
      return 'bg-green-500'

    default:
      return 'bg-gray-500'
  }
}

export function getStatusLabel(status: PillarStatus | SubpillarStatus): string {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

export function isPillarStatus(status: string): status is PillarStatus {
  return ['approved', 'pending', 'rejected'].includes(status)
}

export function isSubpillarStatus(status: string): status is SubpillarStatus {
  return ['research', 'outline', 'draft', 'complete'].includes(status)
}
