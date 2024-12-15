import { Loader2 } from "lucide-react"

interface LoadingSpinnerProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={className || "flex h-[calc(100vh-12rem)] items-center justify-center"}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}
