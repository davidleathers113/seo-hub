import { Metadata } from "next"
import { ContentGenerationWizard } from "@/components/content/content-generation-wizard"

export const metadata: Metadata = {
  title: "Content Generation",
  description: "Generate high-quality content for your articles",
}

export default function ContentGenerationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Content Generation</h1>
        <p className="text-muted-foreground mt-2">
          Create high-quality content with AI assistance
        </p>
      </div>
      <ContentGenerationWizard />
    </div>
  )
}