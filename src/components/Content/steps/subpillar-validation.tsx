import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, X, RotateCw } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Subpillar {
  id: string
  title: string
  description: string
  pillarId: string
}

interface SubpillarValidationProps {
  subpillars: Subpillar[]
  onValidate: (subpillarId: string, isValid: boolean) => void
  onRegenerate: (subpillarId: string) => void
  onContinue: () => void
  isProcessing: boolean
}

export function SubpillarValidation({
  subpillars,
  onValidate,
  onRegenerate,
  onContinue,
  isProcessing
}: SubpillarValidationProps) {
  const [feedback, setFeedback] = useState<Record<string, string>>({})
  const [validationStatus, setValidationStatus] = useState<Record<string, boolean>>({})

  const handleValidate = (subpillarId: string, isValid: boolean) => {
    setValidationStatus(prev => ({ ...prev, [subpillarId]: isValid }))
    onValidate(subpillarId, isValid)
  }

  const allValidated = subpillars.every(
    subpillar => validationStatus[subpillar.id] !== undefined
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="w-[200px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subpillars.map((subpillar) => (
                <TableRow key={subpillar.id}>
                  <TableCell className="font-medium">{subpillar.title}</TableCell>
                  <TableCell>{subpillar.description}</TableCell>
                  <TableCell>
                    <Textarea
                      value={feedback[subpillar.id] || ''}
                      onChange={(e) =>
                        setFeedback(prev => ({
                          ...prev,
                          [subpillar.id]: e.target.value
                        }))
                      }
                      placeholder="Add feedback..."
                      className="h-20"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onRegenerate(subpillar.id)}
                        disabled={isProcessing}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          validationStatus[subpillar.id] === false
                            ? "destructive"
                            : "outline"
                        }
                        onClick={() => handleValidate(subpillar.id, false)}
                        disabled={isProcessing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant={
                          validationStatus[subpillar.id] === true
                            ? "default"
                            : "outline"
                        }
                        onClick={() => handleValidate(subpillar.id, true)}
                        disabled={isProcessing}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={onContinue}
          disabled={!allValidated || isProcessing}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}