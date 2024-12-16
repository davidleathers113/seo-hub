import { Metadata } from "next"
import { ResearchTools } from "@/components/research/research-tools"

export const metadata: Metadata = {
  title: "Research Tools",
  description: "Research tools for content optimization",
}

export default function ResearchPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Research Tools</h1>
        <p className="text-muted-foreground mt-2">
          Analyze keywords, competitors, and get content suggestions
        </p>
      </div>
      <ResearchTools />
    </div>
  )
}