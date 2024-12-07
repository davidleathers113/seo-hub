import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/useToast"
import {
  ChevronLeft,
  Download,
  FileText,
  Share2,
  RefreshCw,
  FileIcon,
  Copy,
  Check,
  Home,
  Clock,
} from "lucide-react"
import { marked } from "marked"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

type ArticleMetadata = {
  title: string
  pillarTitle: string
  wordCount: number
  readingTime: number
  seoScore: number
  lastUpdated: string
}

type ExportFormat = 'txt' | 'docx' | 'html'

export function FinalArticle() {
  const { articleId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [metadata, setMetadata] = useState<ArticleMetadata | null>(null)
  const [content, setContent] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setLoading(true)
        // TODO: Replace with actual API call
        setMetadata({
          title: "Complete Guide to On-Page SEO Optimization",
          pillarTitle: "SEO Fundamentals",
          wordCount: 2500,
          readingTime: 10,
          seoScore: 92,
          lastUpdated: new Date().toISOString()
        })
        setContent(`
# Complete Guide to On-Page SEO Optimization

On-page SEO remains one of the fundamental pillars of successful search engine optimization. Unlike off-page factors, these elements are entirely within your control and can significantly impact your website's visibility in search results.

## Understanding Title Tags

Title tags serve as the primary clickable headline in search engine results pages (SERPs). A well-crafted title tag should balance keyword optimization with user appeal, incorporating your target keywords naturally while maintaining readability.

### Best Practices for Title Tags:
- Keep titles between 50-60 characters
- Include primary keyword near the beginning
- Make it compelling and clickable
- Avoid keyword stuffing

## Meta Descriptions Matter

While meta descriptions don't directly influence rankings, they play a crucial role in click-through rates. A well-written meta description acts as your search result's sales pitch, encouraging users to click through to your content.

[... continued content ...]
        `)
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch article"
        })
      } finally {
        setLoading(false)
      }
    }
    fetchArticle()
  }, [articleId, toast])

  const handleExport = async (format: ExportFormat) => {
    try {
      // TODO: Replace with actual export API call
      toast({
        title: "Success",
        description: `Article exported as ${format.toUpperCase()}`
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to export article"
      })
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast({
        title: "Success",
        description: "Content copied to clipboard"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to copy content"
      })
    }
  }

  const handleRegenerate = async () => {
    try {
      setRegenerating(true)
      // TODO: API call to regenerate content
      toast({
        title: "Success",
        description: "Content regeneration started"
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to regenerate content"
      })
    } finally {
      setRegenerating(false)
    }
  }

  if (loading || !metadata) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading article...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/")}>
                <Home className="h-4 w-4" />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate("/pillars")}>
                {metadata.pillarTitle}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink>Final Article</BreadcrumbLink>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleCopy}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={handleRegenerate}
            disabled={regenerating}
          >
            <RefreshCw className="h-4 w-4" />
            Regenerate
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('txt')}>
                <FileText className="mr-2 h-4 w-4" />
                Text File (.txt)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('docx')}>
                <FileIcon className="mr-2 h-4 w-4" />
                Word Document (.docx)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('html')}>
                <FileIcon className="mr-2 h-4 w-4" />
                HTML File (.html)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Article Metadata */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold">{metadata.title}</h1>
              <p className="text-sm text-muted-foreground">
                Last updated {new Date(metadata.lastUpdated).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {metadata.wordCount} words
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {metadata.readingTime} min read
                </span>
              </div>
              <Badge variant="secondary" className="bg-green-500/10 text-green-500">
                SEO Score: {metadata.seoScore}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Article Content */}
      <Card className="relative">
        <CardContent className="prose prose-slate max-w-none p-6">
          <ScrollArea className="h-[calc(100vh-24rem)]">
            <div
              className="markdown-content"
              dangerouslySetInnerHTML={{
                __html: marked(content, {
                  breaks: true,
                  gfm: true,
                  headerIds: true,
                })
              }}
            />
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
