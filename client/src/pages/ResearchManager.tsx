import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/useToast"
import {
  ChevronLeft,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  BookOpen,
  Star,
  StarHalf,
  Filter,
} from "lucide-react"

interface ResearchItem {
  id: string
  title: string
  content: string
  source: string
  url?: string
  relevance: number
  tags: string[]
  dateAdded: string
}

export function ResearchManager() {
  const { subpillarId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [researchItems, setResearchItems] = useState<ResearchItem[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    fetchResearchItems()
  }, [subpillarId])

  const fetchResearchItems = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call
      const mockData: ResearchItem[] = [
        {
          id: "1",
          title: "SEO Best Practices 2024",
          content: "Key findings about modern SEO practices...",
          source: "Moz Blog",
          url: "https://moz.com/blog/example",
          relevance: 0.95,
          tags: ["seo", "best-practices"],
          dateAdded: new Date().toISOString(),
        },
        // Add more mock data
      ]
      setResearchItems(mockData)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch research items",
      })
    } finally {
      setLoading(false)
    }
  }

  const getRelevanceIcon = (relevance: number) => {
    if (relevance >= 0.8) return <Star className="h-4 w-4 text-yellow-500" />
    if (relevance >= 0.5) return <StarHalf className="h-4 w-4 text-yellow-500" />
    return <Star className="h-4 w-4 text-muted" />
  }

  const filteredItems = researchItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesTags = selectedTags.length === 0 ||
      selectedTags.every(tag => item.tags.includes(tag))
    return matchesSearch && matchesTags
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Research Manager</h2>
            <p className="text-sm text-muted-foreground">
              Organize and analyze your research findings
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Research
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="w-full">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search research items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                    prefix={<Search className="h-4 w-4 text-muted-foreground" />}
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredItems.map((item) => (
                    <Card key={item.id} className="hover:bg-accent/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.title}</h3>
                              {getRelevanceIcon(item.relevance)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {item.content}
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                              <BookOpen className="h-4 w-4" />
                              <span>{item.source}</span>
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="secondary"
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
