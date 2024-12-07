import { AlertTriangle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Button } from "./ui/button"

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ 
  title = "Error", 
  message, 
  onRetry 
}: ErrorMessageProps) {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRetry}
            className="ml-4"
          >
            Try Again
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}