import { useState, useRef } from 'react'
import { Handle, Position } from 'reactflow'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, MinusCircle } from 'lucide-react'
import { cn } from "@/lib/utils"

export function getStatusColor(status: string) {
  switch (status) {
    case 'research': return 'blue'
    case 'outline': return 'yellow'
    case 'draft': return 'purple'
    case 'complete': return 'green'
    default: return 'gray'
  }
}

export function PillarNode({ data, id }: { data: any; id: string }) {
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(data.label)
  const connections = useRef([])

  // ... rest of the PillarNode component code ...
}
