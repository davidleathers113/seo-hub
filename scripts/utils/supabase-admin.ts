import { createClient } from '@supabase/supabase-js'
import { InformationSchemaDatabase } from '../types/supabase-admin'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase admin configuration environment variables')
}

// Create a Supabase client with service role key for administrative tasks
export const supabaseAdmin = createClient<InformationSchemaDatabase>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false
    }
  }
)
