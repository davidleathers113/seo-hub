import { Component, ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error)
    console.error('Error info:', errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-lg font-semibold">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {this.state.error?.message}
            </p>
            <Button
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
