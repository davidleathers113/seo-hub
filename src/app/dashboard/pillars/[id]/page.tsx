'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Pillar = Database['public']['Tables']['pillars']['Row']
type Article = Database['public']['Tables']['articles']['Row']

export default function PillarPage() {
  const params = useParams()
  const pillarId = params.id as string

  const [pillar, setPillar] = useState<Pillar | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [newArticle, setNewArticle] = useState({ title: '', content: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchPillarAndArticles()
  }, [pillarId])

  async function fetchPillarAndArticles() {
    // Fetch pillar details
    const { data: pillarData } = await supabase
      .from('pillars')
      .select('*')
      .eq('id', pillarId)
      .single()

    if (pillarData) {
      setPillar(pillarData)
    }

    // Fetch articles for this pillar
    const { data: articlesData } = await supabase
      .from('articles')
      .select('*')
      .eq('pillar_id', pillarId)
      .order('created_at', { ascending: false })

    if (articlesData) {
      setArticles(articlesData)
    }
  }

  async function handleCreateArticle(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase
      .from('articles')
      .insert([
        {
          pillar_id: pillarId,
          title: newArticle.title,
          content: newArticle.content,
          status: 'draft',
        },
      ])

    if (!error) {
      setNewArticle({ title: '', content: '' })
      fetchPillarAndArticles()
    }

    setIsLoading(false)
  }

  if (!pillar) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{pillar.title}</h1>
        {pillar.description && (
          <p className="text-muted-foreground">{pillar.description}</p>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Create New Article</h2>
        <form onSubmit={handleCreateArticle} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newArticle.title}
              onChange={(e) =>
                setNewArticle({ ...newArticle, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Initial Content</Label>
            <Input
              id="content"
              value={newArticle.content}
              onChange={(e) =>
                setNewArticle({ ...newArticle, content: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Article'}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Articles</h2>
          {articles.length > 0 ? (
            <div className="space-y-4">
              {articles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <h3 className="font-medium">{article.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      Status: {article.status}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" asChild>
                      <a href={`/dashboard/articles/${article.id}`}>Edit</a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href={`/dashboard/articles/${article.id}/outline`}>
                        Outline
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t created any articles for this pillar yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}