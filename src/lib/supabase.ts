import { createClient } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'
import { Database } from '@/types/database'
import { SupabaseAuthClient } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Create a Supabase client with the service role key for admin operations
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey)

export function useSupabase() {
  const [client, setClient] = useState<SupabaseAuthClient | null>(null)

  useEffect(() => {
    const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey) as SupabaseAuthClient
    
    // Get initial user
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      supabaseClient.user = user
    })

    // Listen for auth changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange((_, session) => {
      supabaseClient.user = session?.user ?? null
    })

    setClient(supabaseClient)

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return client
}
