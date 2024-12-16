"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { KeywordResearch } from "./keyword-research"
import { CompetitorAnalysis } from "./competitor-analysis"
import { ContentSuggestions } from "./content-suggestions"

export function ResearchTools() {
  const [activeTab, setActiveTab] = useState("keywords")

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="space-y-4"
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="keywords">Keyword Research</TabsTrigger>
        <TabsTrigger value="competitors">Competitor Analysis</TabsTrigger>
        <TabsTrigger value="suggestions">Content Suggestions</TabsTrigger>
      </TabsList>

      <Card className="p-6">
        <TabsContent value="keywords" className="mt-0">
          <KeywordResearch />
        </TabsContent>

        <TabsContent value="competitors" className="mt-0">
          <CompetitorAnalysis />
        </TabsContent>

        <TabsContent value="suggestions" className="mt-0">
          <ContentSuggestions />
        </TabsContent>
      </Card>
    </Tabs>
  )
}