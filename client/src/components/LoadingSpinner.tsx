import { Loader2 } from "lucide-react"

export function LoadingSpinner() {
  return (
    <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  )
}