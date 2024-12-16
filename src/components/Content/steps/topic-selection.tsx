"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { getNiches } from "@/lib/api"

interface TopicSelectionProps {
  formData: {
    topic: string
    keywords: string[]
    outline: any
    content: string
  }
  setFormData: (data: any) => void
  onNext: () => void
}

export function TopicSelection({
  formData,
  setFormData,
  onNext,
}: TopicSelectionProps) {
  const [keyword, setKeyword] = useState("")
  const { data: niches } = useQuery({
    queryKey: ["niches"],
    queryFn: getNiches,
  })

  const handleAddKeyword = () => {
    if (keyword && !formData.keywords.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keyword],
      })
      setKeyword("")
    }
  }

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter((k) => k !== keywordToRemove),
    })
  }

  const isValid = formData.topic && formData.keywords.length > 0

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="niche">Select Niche</Label>
          <Select
            value={formData.topic}
            onValueChange={(value) =>
              setFormData({ ...formData, topic: value })
            }
          >
            <SelectTrigger id="niche">
              <SelectValue placeholder="Select a niche" />
            </SelectTrigger>
            <SelectContent>
              {niches?.map((niche) => (
                <SelectItem key={niche.id} value={niche.id}>
                  {niche.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keywords">Target Keywords</Label>
          <div className="flex space-x-2">
            <Input
              id="keywords"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Enter a keyword"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddKeyword()
                }
              }}
            />
            <Button onClick={handleAddKeyword}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.keywords.map((k) => (
              <Badge
                key={k}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleRemoveKeyword(k)}
              >
                {k} ×
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!isValid}>
          Next Step
        </Button>
      </div>
    </div>
  )
}