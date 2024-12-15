import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

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