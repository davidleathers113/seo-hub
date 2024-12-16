'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Database } from '@/types/database'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Niche = Database['public']['Tables']['niches']['Row']
type Pillar = Database['public']['Tables']['pillars']['Row']

export default function NichePage() {
  const params = useParams()
  const nicheId = params.id as string

  const [niche, setNiche] = useState<Niche | null>(null)
  const [pillars, setPillars] = useState<Pillar[]>([])
  const [newPillar, setNewPillar] = useState({ title: '', description: '' })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNicheAndPillars()
  }, [nicheId])

  async function fetchNicheAndPillars() {
    // Fetch niche details
    const { data: nicheData } = await supabase
      .from('niches')
      .select('*')
      .eq('id', nicheId)
      .single()

    if (nicheData) {
      setNiche(nicheData)
    }

    // Fetch pillars for this niche
    const { data: pillarsData } = await supabase
      .from('pillars')
      .select('*')
      .eq('niche_id', nicheId)
      .order('created_at', { ascending: false })

    if (pillarsData) {
      setPillars(pillarsData)
    }
  }

  async function handleCreatePillar(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    const { error } = await supabase
      .from('pillars')
      .insert([
        {
          niche_id: nicheId,
          title: newPillar.title,
          description: newPillar.description,
        },
      ])

    if (!error) {
      setNewPillar({ title: '', description: '' })
      fetchNicheAndPillars()
    }

    setIsLoading(false)
  }

  if (!niche) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{niche.name}</h1>
        {niche.description && (
          <p className="text-muted-foreground">{niche.description}</p>
        )}
      </div>

      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold mb-4">Create New Pillar</h2>
        <form onSubmit={handleCreatePillar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newPillar.title}
              onChange={(e) =>
                setNewPillar({ ...newPillar, title: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newPillar.description}
              onChange={(e) =>
                setNewPillar({ ...newPillar, description: e.target.value })
              }
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Pillar'}
          </Button>
        </form>
      </div>

      <div className="rounded-lg border">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Content Pillars</h2>
          {pillars.length > 0 ? (
            <div className="space-y-4">
              {pillars.map((pillar) => (
                <div
                  key={pillar.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div>
                    <h3 className="font-medium">{pillar.title}</h3>
                    {pillar.description && (
                      <p className="text-sm text-muted-foreground">
                        {pillar.description}
                      </p>
                    )}
                  </div>
                  <Button variant="outline" asChild>
                    <a href={`/dashboard/pillars/${pillar.id}`}>View Articles</a>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">
              You haven&apos;t created any pillars for this niche yet.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}