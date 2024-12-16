import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface WorkflowStep {
  id: string
  title: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  description: string
}

interface PillarData {
  id: string;
  title: string;
  // Add other fields as needed
}

interface ValidationMetrics {
  relevance: number;
  coherence: number;
  completeness: number;
}

interface ValidationData {
  score: number;
  status: 'passed' | 'failed';
  details?: string;
  metrics?: ValidationMetrics;
}

export function AutomatedWorkflow() {
  const [activeStep, setActiveStep] = useState(0)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pillarData, setPillarData] = useState<PillarData | null>(null)
  const [validationData, setValidationData] = useState<ValidationData | null>(null)
  const [steps, setSteps] = useState<WorkflowStep[]>([
    {
      id: 'pillar-generation',
      title: 'Pillar Generation',
      status: 'pending',
      description: 'Generate the main pillar content structure'
    },
    {
      id: 'pillar-validation',
      title: 'Pillar Validation',
      status: 'pending',
      description: 'Review and validate the generated pillar'
    },
    {
      id: 'subpillar-generation',
      title: 'Subpillar Generation',
      status: 'pending',
      description: 'Generate subpillars based on the main pillar'
    },
    {
      id: 'subpillar-validation',
      title: 'Subpillar Validation',
      status: 'pending',
      description: 'Review and validate the generated subpillars'
    },
    {
      id: 'outline-generation',
      title: 'Outline Generation',
      status: 'pending',
      description: 'Generate content outlines for each subpillar'
    },
    {
      id: 'outline-validation',
      title: 'Outline Validation',
      status: 'pending',
      description: 'Review and validate the generated outlines'
    },
    {
      id: 'content-generation',
      title: 'Content Generation',
      status: 'pending',
      description: 'Generate the final content based on validated outlines'
    },
    {
      id: 'content-review',
      title: 'Content Review',
      status: 'pending',
      description: 'Final review and approval of generated content'
    }
  ])
  const { toast } = useToast()

  const updateStepStatus = (stepId: string, status: WorkflowStep['status']) => {
    setSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, status } : step
      )
    )
  }

  const handleGeneratePillar = async () => {
    setIsProcessing(true)
    setError(null)
    updateStepStatus('pillar-generation', 'in-progress')

    try {
      const response = await fetch('/api/generate/pillars', {
        method: 'POST'
      })
      if (!response.ok) throw new Error('Failed to generate pillar')

      const responseData = await response.json()
      setPillarData(responseData)
      updateStepStatus('pillar-generation', 'completed')
      setActiveStep(prev => prev + 1)

      toast({
        title: 'Success',
        description: `Pillar "${responseData.title}" generated successfully`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      updateStepStatus('pillar-generation', 'error')

      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleValidatePillar = async () => {
    setIsProcessing(true)
    setError(null)
    updateStepStatus('pillar-validation', 'in-progress')

    try {
      const response = await fetch('/api/generate/pillars/validate', {
        method: 'POST',
        body: JSON.stringify({ pillarId: pillarData?.id })
      })
      if (!response.ok) throw new Error('Failed to validate pillar')

      const responseData = await response.json()
      setValidationData(responseData)
      updateStepStatus('pillar-validation', 'completed')
      setActiveStep(prev => prev + 1)

      toast({
        title: 'Success',
        description: `Pillar validation completed with score: ${responseData.score}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      setError(message)
      updateStepStatus('pillar-validation', 'error')

      toast({
        variant: 'destructive',
        title: 'Error',
        description: message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleGenerateSubpillars = async () => {
    // Similar implementation for subpillar generation
  }

  const handleValidateSubpillars = async () => {
    // Similar implementation for subpillar validation
  }

  const handleGenerateOutlines = async () => {
    // Similar implementation for outline generation
  }

  const handleValidateOutlines = async () => {
    // Similar implementation for outline validation
  }

  const handleGenerateContent = async () => {
    // Similar implementation for content generation
  }

  const handleReviewContent = async () => {
    // Similar implementation for content review
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Automated Content Generation Workflow</CardTitle>
          {pillarData && (
            <div className="text-sm text-muted-foreground">
              Current Pillar: {pillarData.title}
            </div>
          )}
          {validationData && (
            <div className="text-sm text-muted-foreground">
              Validation Score: {validationData.score}
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-4 ${
                  index === activeStep ? 'bg-muted p-4 rounded-lg' : ''
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : step.status === 'error'
                      ? 'bg-red-500 text-white'
                      : step.status === 'in-progress'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200'
                  }`}
                >
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {step.description}
                  </p>
                </div>
                {index === activeStep && (
                  <Button
                    onClick={() => {
                      switch (step.id) {
                        case 'pillar-generation':
                          void handleGeneratePillar()
                          break
                        case 'pillar-validation':
                          void handleValidatePillar()
                          break
                        case 'subpillar-generation':
                          handleGenerateSubpillars()
                          break
                        case 'subpillar-validation':
                          handleValidateSubpillars()
                          break
                        case 'outline-generation':
                          handleGenerateOutlines()
                          break
                        case 'outline-validation':
                          handleValidateOutlines()
                          break
                        case 'content-generation':
                          handleGenerateContent()
                          break
                        case 'content-review':
                          handleReviewContent()
                          break
                      }
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start'
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}