import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"
import {
  AlertTriangle,
  BarChart3,
  BookOpen,
  FileText,
  LayoutDashboard,
  Newspaper,
  Search,
  Star
} from "lucide-react"
import { getDashboardStats } from "@/api/dashboard"
import { cn } from "@/lib/utils"

type DashboardStats = {
  niches: {
    total: number
    new: number
    inProgress: number
    completed: number
  }
  pillars: {
    total: number
    approved: number
    pending: number
  }
  subpillars: {
    total: number
    completed: number
  }
  seo: {
    averageScore: number
    above80Percent: number
    trend: Array<{ date: string; score: number }>
  }
  quality: {
    readabilityScore: number
    plagiarismScore: number
    keywordDensity: number
  }
  resources: {
    apiUsage: number
    apiLimit: number
  }
}

const COLORS = ['#1E40AF', '#60A5FA', '#93C5FD', '#BFDBFE']

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getDashboardStats()
        setStats(response.data)
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading || !stats) {
    return (
      <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
        <div className="animate-pulse text-lg">Loading dashboard...</div>
      </div>
    )
  }

  const nichePieData = [
    { name: "New", value: stats.niches.new },
    { name: "In Progress", value: stats.niches.inProgress },
    { name: "Completed", value: stats.niches.completed },
  ]

  return (
    <div className="space-y-8">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Niches</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.niches.total}</div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={nichePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {nichePieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Content Pillars</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pillars.total}</div>
            <div className="mt-4 space-y-2">
              <div className="text-xs text-muted-foreground">
                Approved ({stats.pillars.approved})
              </div>
              <Progress
                value={(stats.pillars.approved / stats.pillars.total) * 100}
                className="h-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">SEO Performance</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.seo.averageScore}</div>
            <div className="h-[100px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.seo.trend}>
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#2563eb"
                    strokeWidth={2}
                  />
                  <XAxis dataKey="date" hide />
                  <YAxis hide domain={[60, 100]} />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((stats.resources.apiUsage / stats.resources.apiLimit) * 100).toFixed(1)}%
            </div>
            <Progress
              value={(stats.resources.apiUsage / stats.resources.apiLimit) * 100}
              className="mt-4"
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.resources.apiUsage.toLocaleString()} / {stats.resources.apiLimit.toLocaleString()} requests
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Content Quality Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">Readability Score</div>
                  <Progress value={stats.quality.readabilityScore} className="h-2" />
                </div>
                <span className="ml-4 text-sm font-medium">
                  {stats.quality.readabilityScore}%
                </span>
              </div>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">Plagiarism Check</div>
                  <Progress value={stats.quality.plagiarismScore} className="h-2" />
                </div>
                <span className="ml-4 text-sm font-medium">
                  {stats.quality.plagiarismScore}%
                </span>
              </div>
              <div className="flex items-center">
                <Newspaper className="mr-2 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm font-medium mb-2">Keyword Density</div>
                  <Progress value={stats.quality.keywordDensity} className="h-2" />
                </div>
                <span className="ml-4 text-sm font-medium">
                  {stats.quality.keywordDensity}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>SEO Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div
                className={cn(
                  "rounded-lg border p-6",
                  stats.seo.averageScore >= 80
                    ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950"
                    : "border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium">Average SEO Score</div>
                  <AlertTriangle
                    className={cn(
                      "h-4 w-4",
                      stats.seo.averageScore >= 80
                        ? "text-green-600 dark:text-green-400"
                        : "text-yellow-600 dark:text-yellow-400"
                    )}
                  />
                </div>
                <div className="mt-4 text-3xl font-bold">
                  {stats.seo.averageScore}%
                </div>
              </div>
              <div className="rounded-lg border p-6">
                <div className="text-sm font-medium">Articles Above 80%</div>
                <div className="mt-4 text-3xl font-bold">
                  {stats.seo.above80Percent}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}