import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/supabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper functions for common operations
export async function getCurrentUser() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  return session?.user
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  // Clear any local storage or state if needed
  localStorage.removeItem('supabase.auth.token')
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data
}

export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error

  // If email confirmation is required
  if (data.user && !data.session) {
    return {
      ...data,
      message: 'Please check your email for confirmation link'
    }
  }

  return data
}

// Add session state check
export async function hasValidSession(): Promise<boolean> {
  const { data: { session }, error } = await supabase.auth.getSession()
  return !error && !!session
}