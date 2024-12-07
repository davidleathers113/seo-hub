import { LucideFileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

export function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col items-center justify-center">
      <LucideFileQuestion className="h-16 w-16 text-muted-foreground" />
      <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
      <p className="mt-2 text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Button
        className="mt-4"
        onClick={() => navigate("/")}
      >
        Go to Dashboard
      </Button>
    </div>
  )
}