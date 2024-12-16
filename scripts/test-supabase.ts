import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/supabase'
import * as dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
  throw new Error('Required Supabase environment variables are missing')
}

console.log('Using Supabase URL:', supabaseUrl)

// Initialize admin client for privileged operations
const adminClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function testSupabaseSetup() {
  try {
    console.log('Starting Supabase integration test...')

    // Simple connection test
    const { data, error } = await adminClient
      .from('niches')
      .select('*')
      .limit(1)

    if (error) {
      console.error('Connection test failed:', error)
      throw error
    }

    console.log('Successfully connected to Supabase!')
    console.log('Retrieved data:', data)

    return true
  } catch (error) {
    console.error('Test failed:', error)
    return false
  } finally {
    process.exit()
  }
}

testSupabaseSetup()