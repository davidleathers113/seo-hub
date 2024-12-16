'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Article = Database['public']['Tables']['articles']['Row']

export default function ArticlePage() {
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [editedArticle, setEditedArticle] = useState({
    title: '',
    content: '',
    status: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const fetchArticle = useCallback(async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single()

    if (data) {
      setArticle(data)
      setEditedArticle({
        title: data.title,
        content: data.content || '',
        status: data.status,
      })
    }
  }, [articleId])

  useEffect(() => {
    fetchArticle()
  }, [fetchArticle])

  async function handleSave() {
    setIsLoading(true)

    const { error } = await supabase
      .from('articles')
      .update({
        title: editedArticle.title,
        content: editedArticle.content,
        status: editedArticle.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', articleId)

    if (!error) {
      fetchArticle()
    }

    setIsLoading(false)
  }

  async function handleStatusChange(newStatus: 'draft' | 'review' | 'published') {
    setIsLoading(true)

    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (newStatus === 'published') {
      updates.published_at = new Date().toISOString()
    }

    const { error } = await supabase
      .from('articles')
      .update(updates)
      .eq('id', articleId)

    if (!error) {
      fetchArticle()
    }

    setIsLoading(false)
  }

  if (!article) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Article</h1>
          <p className="text-muted-foreground">
            Status: {article.status}
            {article.published_at && (
              <> • Published on {new Date(article.published_at).toLocaleDateString()}</>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {article.status === 'draft' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('review')}
              disabled={isLoading}
            >
              Submit for Review
            </Button>
          )}
          {article.status === 'review' && (
            <Button
              variant="outline"
              onClick={() => handleStatusChange('published')}
              disabled={isLoading}
            >
              Publish
            </Button>
          )}
          <Button
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={editedArticle.title}
            onChange={(e) =>
              setEditedArticle({ ...editedArticle, title: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <textarea
            id="content"
            value={editedArticle.content}
            onChange={(e) =>
              setEditedArticle({ ...editedArticle, content: e.target.value })
            }
            className="w-full min-h-[400px] p-2 rounded-md border"
          />
        </div>
      </div>
    </div>
  )
}