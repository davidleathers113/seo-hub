'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Article = Database['public']['Tables']['articles']['Row']
type Outline = Database['public']['Tables']['outlines']['Row']

interface OutlineSection {
  title: string
  content: string
  subsections?: OutlineSection[]
}

export default function ArticleOutlinePage() {
  const params = useParams()
  const articleId = params.id as string

  const [article, setArticle] = useState<Article | null>(null)
  const [outline, setOutline] = useState<Outline | null>(null)
  const [outlineContent, setOutlineContent] = useState<OutlineSection[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchArticleAndOutline()
  }, [articleId])

  async function fetchArticleAndOutline() {
    // Fetch article details
    const { data: articleData } = await supabase
      .from('articles')
      .select('*')
      .eq('id', articleId)
      .single()

    if (articleData) {
      setArticle(articleData)
    }

    // Fetch outline
    const { data: outlineData } = await supabase
      .from('outlines')
      .select('*')
      .eq('article_id', articleId)
      .single()

    if (outlineData) {
      setOutline(outlineData)
      setOutlineContent(outlineData.content as OutlineSection[])
    } else {
      // Create a new outline if it doesn't exist
      const { data: newOutline } = await supabase
        .from('outlines')
        .insert([
          {
            article_id: articleId,
            content: [],
          },
        ])
        .select()
        .single()

      if (newOutline) {
        setOutline(newOutline)
        setOutlineContent([])
      }
    }
  }

  async function handleAddSection() {
    const newSection: OutlineSection = {
      title: 'New Section',
      content: '',
      subsections: [],
    }

    const updatedContent = [...outlineContent, newSection]
    setOutlineContent(updatedContent)

    const { error } = await supabase
      .from('outlines')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', outline?.id)

    if (error) {
      console.error('Error saving outline:', error)
    }
  }

  async function handleUpdateSection(
    index: number,
    updates: Partial<OutlineSection>
  ) {
    const updatedContent = [...outlineContent]
    updatedContent[index] = { ...updatedContent[index], ...updates }
    setOutlineContent(updatedContent)

    const { error } = await supabase
      .from('outlines')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', outline?.id)

    if (error) {
      console.error('Error saving outline:', error)
    }
  }

  async function handleDeleteSection(index: number) {
    const updatedContent = outlineContent.filter((_, i) => i !== index)
    setOutlineContent(updatedContent)

    const { error } = await supabase
      .from('outlines')
      .update({
        content: updatedContent,
        updated_at: new Date().toISOString(),
      })
      .eq('id', outline?.id)

    if (error) {
      console.error('Error saving outline:', error)
    }
  }

  if (!article || !outline) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Article Outline</h1>
        <p className="text-muted-foreground">{article.title}</p>
      </div>

      <div className="space-y-4">
        <div className="flex justify-end">
          <Button onClick={handleAddSection}>Add Section</Button>
        </div>

        {outlineContent.map((section, index) => (
          <div key={index} className="space-y-4 p-4 rounded-lg border">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 mr-4">
                <Label htmlFor={`section-${index}-title`}>Section Title</Label>
                <Input
                  id={`section-${index}-title`}
                  value={section.title}
                  onChange={(e) =>
                    handleUpdateSection(index, { title: e.target.value })
                  }
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDeleteSection(index)}
              >
                Delete
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`section-${index}-content`}>Content Notes</Label>
              <textarea
                id={`section-${index}-content`}
                value={section.content}
                onChange={(e) =>
                  handleUpdateSection(index, { content: e.target.value })
                }
                className="w-full min-h-[100px] p-2 rounded-md border"
              />
            </div>
          </div>
        ))}

        {outlineContent.length === 0 && (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">
              No sections yet. Click &quot;Add Section&quot; to get started.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}