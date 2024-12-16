'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Article = Database['public']['Tables']['articles']['Row']

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    review: 0
  })
  const [recentArticles, setRecentArticles] = useState<Article[]>([])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }

    getUser()
  }, [])

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      // Get all articles for the user
      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.id)

      if (articles) {
        setStats({
          total: articles.length,
          published: articles.filter(a => a.status === 'published').length,
          draft: articles.filter(a => a.status === 'draft').length,
          review: articles.filter(a => a.status === 'review').length
        })
      }

      // Get recent articles
      const { data: recent } = await supabase
        .from('articles')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (recent) {
        setRecentArticles(recent)
      }
    }

    fetchStats()
  }, [user])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user?.email}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Articles</h3>
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Published</h3>
          </div>
          <div className="text-2xl font-bold">{stats.published}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Drafts</h3>
          </div>
          <div className="text-2xl font-bold">{stats.draft}</div>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">In Review</h3>
          </div>
          <div className="text-2xl font-bold">{stats.review}</div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-6">
          <h3 className="text-lg font-medium">Recent Articles</h3>
          {recentArticles.length > 0 ? (
            <div className="mt-4 space-y-4">
              {recentArticles.map((article) => (
                <div key={article.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{article.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {article.status}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t created any articles yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}