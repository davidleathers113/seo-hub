import { Metadata } from "next"
import { notFound } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

import { WebResearch } from "@/components/research/web-research"
import { SubpillarHeader } from "@/components/subpillars/subpillar-header"
import { SubpillarContent } from "@/components/subpillars/subpillar-content"
import { ResearchResults } from "@/components/research/research-results"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface SubpillarPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: SubpillarPageProps): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies })

  const { data: subpillar } = await supabase
    .from("subpillars")
    .select("title")
    .eq("id", params.id)
    .single()

  if (!subpillar) {
    return {
      title: "Subpillar Not Found",
    }
  }

  return {
    title: subpillar.title,
    description: `Manage and create content for ${subpillar.title}`,
  }
}

export default async function SubpillarPage({ params }: SubpillarPageProps) {
  const supabase = createServerComponentClient({ cookies })

  // Get subpillar details
  const { data: subpillar, error: subpillarError } = await supabase
    .from("subpillars")
    .select(`
      *,
      pillar:pillars(*)
    `)
    .eq("id", params.id)
    .single()

  if (subpillarError || !subpillar) {
    notFound()
  }

  // Get research results
  const { data: research } = await supabase
    .from("research")
    .select("*")
    .eq("subpillar_id", params.id)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <SubpillarHeader subpillar={subpillar} />

      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="research">Research</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          <SubpillarContent subpillar={subpillar} />
        </TabsContent>

        <TabsContent value="research" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <WebResearch
                subpillarId={params.id}
              />
            </div>
            <div>
              <ResearchResults
                research={research || []}
                subpillarId={params.id}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}