import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Helper functions for common operations
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) throw error
  return user
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

export async function getNichesByUserId(userId: string) {
  const { data, error } = await supabase
    .from('niches')
    .select('*')
    .eq('user_id', userId)

  if (error) throw error
  return data
}

export async function getPillarsByNicheId(nicheId: string) {
  const { data, error } = await supabase
    .from('pillars')
    .select('*')
    .eq('niche_id', nicheId)

  if (error) throw error
  return data
}

export async function getArticlesByPillarId(pillarId: string) {
  const { data, error } = await supabase
    .from('articles')
    .select('*')
    .eq('pillar_id', pillarId)

  if (error) throw error
  return data
}

// Real-time subscription helpers
type NicheRow = Database['public']['Tables']['niches']['Row']
type PillarRow = Database['public']['Tables']['pillars']['Row']
type ArticleRow = Database['public']['Tables']['articles']['Row']

interface SubscriptionCallbacks<T> {
  onInsert?: (payload: T) => void
  onUpdate?: (payload: T) => void
  onDelete?: (payload: T) => void
  onError?: (error: Error) => void
}

export function subscribeToNicheChanges(
  userId: string,
  callbacks: SubscriptionCallbacks<NicheRow>
): RealtimeChannel {
  return supabase
    .channel('niche-changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'niches',
      filter: `user_id=eq.${userId}`,
    }, (payload) => callbacks.onInsert?.(payload.new as NicheRow))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'niches',
      filter: `user_id=eq.${userId}`,
    }, (payload) => callbacks.onUpdate?.(payload.new as NicheRow))
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'niches',
      filter: `user_id=eq.${userId}`,
    }, (payload) => callbacks.onDelete?.(payload.old as NicheRow))
    .subscribe((status, error) => {
      if (error && callbacks.onError) {
        callbacks.onError(error)
      }
    })
}

export function subscribeToPillarChanges(
  nicheId: string,
  callbacks: SubscriptionCallbacks<PillarRow>
): RealtimeChannel {
  return supabase
    .channel('pillar-changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'pillars',
      filter: `niche_id=eq.${nicheId}`,
    }, (payload) => callbacks.onInsert?.(payload.new as PillarRow))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'pillars',
      filter: `niche_id=eq.${nicheId}`,
    }, (payload) => callbacks.onUpdate?.(payload.new as PillarRow))
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'pillars',
      filter: `niche_id=eq.${nicheId}`,
    }, (payload) => callbacks.onDelete?.(payload.old as PillarRow))
    .subscribe((status, error) => {
      if (error && callbacks.onError) {
        callbacks.onError(error)
      }
    })
}

export function subscribeToArticleChanges(
  pillarId: string,
  callbacks: SubscriptionCallbacks<ArticleRow>
): RealtimeChannel {
  return supabase
    .channel('article-changes')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'articles',
      filter: `pillar_id=eq.${pillarId}`,
    }, (payload) => callbacks.onInsert?.(payload.new as ArticleRow))
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'articles',
      filter: `pillar_id=eq.${pillarId}`,
    }, (payload) => callbacks.onUpdate?.(payload.new as ArticleRow))
    .on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'articles',
      filter: `pillar_id=eq.${pillarId}`,
    }, (payload) => callbacks.onDelete?.(payload.old as ArticleRow))
    .subscribe((status, error) => {
      if (error && callbacks.onError) {
        callbacks.onError(error)
      }
    })
}
