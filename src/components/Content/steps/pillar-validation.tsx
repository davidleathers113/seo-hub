import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, RotateCw } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface PillarValidationProps {
  pillar: {
    id: string
    title: string
    description: string
  }
  onValidate: (isValid: boolean) => void
  onRegenerate: () => void
  isProcessing: boolean
}

export function PillarValidation({
  pillar,
  onValidate,
  onRegenerate,
  isProcessing
}: PillarValidationProps) {
  const [feedback, setFeedback] = useState('')

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-1">Title</h3>
              <p className="text-lg">{pillar.title}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Description</h3>
              <p className="text-gray-600">{pillar.description}</p>
            </div>
            <div>
              <h3 className="font-medium mb-1">Feedback (Optional)</h3>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add any feedback or notes about this pillar..."
                className="h-24"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isProcessing}
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Regenerate
        </Button>
        <Button
          variant="destructive"
          onClick={() => onValidate(false)}
          disabled={isProcessing}
        >
          <X className="mr-2 h-4 w-4" />
          Reject
        </Button>
        <Button
          onClick={() => onValidate(true)}
          disabled={isProcessing}
        >
          <Check className="mr-2 h-4 w-4" />
          Approve
        </Button>
      </div>
    </div>
  )
}