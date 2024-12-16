'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Niche = Database['public']['Tables']['niches']['Row']

export default function NichesPage() {
  const [niches, setNiches] = useState<Niche[]>([])
  const [newNiche, setNewNiche] = useState({ name: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNiches()
  }, [])

  async function fetchNiches() {
    const { data } = await supabase
      .from('niches')
      .select('*')
      .order('created_at', { ascending: false })

    if (data) {
      setNiches(data)
    }
  }

  async function handleCreateNiche(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase
      .from('niches')
      .insert([
        {
          name: newNiche.name,
          description: newNiche.description,
        },
      ])

    if (!error) {
      setNewNiche({ name: '', description: '' })
      fetchNiches()
    }

    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Niches</h1>
        <p className="text-muted-foreground">
          Create and manage your content niches
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Create New Niche</h2>
        <form onSubmit={handleCreateNiche} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={newNiche.name}
              onChange={(e) => setNewNiche({ ...newNiche, name: e.target.value })}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newNiche.description}
              onChange={(e) =>
                setNewNiche({ ...newNiche, description: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Niche'}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Your Niches</h2>
          {niches.length > 0 ? (
            <div className="space-y-4">
              {niches.map((niche) => (
                <div
                  key={niche.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <h3 className="font-medium">{niche.name}</h3>
                    {niche.description && (
                      <p className="text-sm text-muted-foreground">
                        {niche.description}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" asChild>
                    <a href={`/dashboard/niches/${niche.id}`}>View Details</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t created any niches yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}