import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, AlertTriangle, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'

interface SEOMetric {
  name: string
  score: number
  status: 'good' | 'warning' | 'error'
  recommendation?: string
}

interface SEOValidationProps {
  metrics: SEOMetric[]
  onApprove: () => void
  onRegenerate: () => void
  isProcessing: boolean
}

export function SEOValidation({
  metrics,
  onApprove,
  onRegenerate,
  isProcessing
}: SEOValidationProps) {
  const overallScore = Math.round(
    metrics.reduce((acc, metric) => acc + metric.score, 0) / metrics.length
  )

  const getStatusIcon = (status: SEOMetric['status']) => {
    switch (status) {
      case 'good':
        return <Check className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <X className="h-4 w-4 text-red-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-medium mb-2">Overall SEO Score</h3>
              <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
                {overallScore}%
              </div>
              <Progress
                value={overallScore}
                className="h-2 mt-4"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Status</TableHead>
                  <TableHead>Metric</TableHead>
                  <TableHead className="w-[100px] text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {metrics.map((metric) => (
                  <TableRow key={metric.name}>
                    <TableCell>{getStatusIcon(metric.status)}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{metric.name}</div>
                        {metric.recommendation && (
                          <div className="text-sm text-muted-foreground">
                            {metric.recommendation}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={getScoreColor(metric.score)}>
                        {metric.score}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button
          variant="outline"
          onClick={onRegenerate}
          disabled={isProcessing}
        >
          Regenerate Content
        </Button>
        <Button
          onClick={onApprove}
          disabled={isProcessing || overallScore < 70}
        >
          {overallScore >= 70 ? 'Approve' : 'Score Too Low'}
        </Button>
      </div>
    </div>
  )
}