"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Icons } from "@/components/ui/icons"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

interface KeywordResult {
  keyword: string
  searchVolume: number
  difficulty: number
  cpc: number
  competition: number
}

export function KeywordResearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<KeywordResult[]>([])

  const { mutate: searchKeywords, isLoading } = useMutation({
    mutationFn: async (searchQuery: string) => {
      const response = await fetch("/api/research/keywords", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      })
      if (!response.ok) throw new Error("Failed to fetch keywords")
      return response.json()
    },
    onSuccess: (data) => {
      setResults(data.keywords)
    },
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      searchKeywords(query)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-medium">Keyword Research</h2>
        <p className="text-sm text-muted-foreground">
          Find relevant keywords and their metrics for your content
        </p>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="keyword">Seed Keyword</Label>
          <div className="flex space-x-2">
            <Input
              id="keyword"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter a seed keyword"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>
      </form>

      {results.length > 0 && (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Keyword</TableHead>
              <TableHead className="text-right">Search Volume</TableHead>
              <TableHead className="text-right">Difficulty</TableHead>
              <TableHead className="text-right">CPC</TableHead>
              <TableHead className="text-right">Competition</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.map((result) => (
              <TableRow key={result.keyword}>
                <TableCell>{result.keyword}</TableCell>
                <TableCell className="text-right">{result.searchVolume}</TableCell>
                <TableCell className="text-right">{result.difficulty}%</TableCell>
                <TableCell className="text-right">${result.cpc}</TableCell>
                <TableCell className="text-right">{result.competition}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}