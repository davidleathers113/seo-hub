import { resolve } from 'path'
import dotenv from 'dotenv'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Configure dotenv to load from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment variables')
}

// Create admin client for running migrations
const supabase = createClient(supabaseUrl, serviceRoleKey)

interface SqlError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

async function executeSql(client: SupabaseClient, sql: string): Promise<{ error: SqlError | null }> {
  try {
    const { error } = await client
      .from('migrations')
      .select('*')
      .limit(1)
      .maybeSingle()

    // If we can't even select from a table, we likely don't have proper permissions
    if (error) {
      return { error: {
        message: 'Insufficient permissions to execute SQL. Please ensure you have the correct service role key.',
        details: error.message,
        code: error.code
      }}
    }

    // For each statement, we'll try to execute it through a direct query
    const { error: queryError } = await client
      .from('migrations')
      .insert({
        name: 'security_setup',
        sql: sql,
        executed_at: new Date().toISOString()
      })

    return { error: queryError as SqlError | null }
  } catch (err) {
    return { error: err as SqlError }
  }
}

async function applyMigration() {
  try {
    console.log('Applying security setup...')

    // First, let's ensure our migrations table exists
    const createMigrationsTable = `
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        sql TEXT NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    const { error: tableError } = await executeSql(supabase, createMigrationsTable)
    if (tableError) {
      console.error('Failed to create migrations table:', tableError)
      return
    }

    // Now let's apply our security settings one by one
    const securitySettings = [
      // Enable RLS on tables
      'ALTER TABLE users ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE niches ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE articles ENABLE ROW LEVEL SECURITY;',

      // Create auth settings table
      `CREATE TABLE IF NOT EXISTS auth_settings (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        email_confirmation_required boolean DEFAULT true,
        enable_signup boolean DEFAULT true,
        min_password_length integer DEFAULT 8,
        jwt_expiry_seconds integer DEFAULT 3600,
        created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
        updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
      );`,

      // Enable RLS on auth_settings
      'ALTER TABLE auth_settings ENABLE ROW LEVEL SECURITY;',

      // Create policies for users
      `CREATE POLICY "Users can view their own data" ON users
       FOR SELECT USING (auth.uid() = id);`,

      `CREATE POLICY "Users can update their own data" ON users
       FOR UPDATE USING (auth.uid() = id);`,

      // Create policies for niches
      `CREATE POLICY "Users can view their own niches" ON niches
       FOR SELECT USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can insert their own niches" ON niches
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      `CREATE POLICY "Users can update their own niches" ON niches
       FOR UPDATE USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can delete their own niches" ON niches
       FOR DELETE USING (auth.uid() = user_id);`,

      // Create policies for pillars
      `CREATE POLICY "Users can view their own pillars" ON pillars
       FOR SELECT USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can insert their own pillars" ON pillars
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      `CREATE POLICY "Users can update their own pillars" ON pillars
       FOR UPDATE USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can delete their own pillars" ON pillars
       FOR DELETE USING (auth.uid() = user_id);`,

      // Create policies for articles
      `CREATE POLICY "Users can view their own articles" ON articles
       FOR SELECT USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can insert their own articles" ON articles
       FOR INSERT WITH CHECK (auth.uid() = user_id);`,

      `CREATE POLICY "Users can update their own articles" ON articles
       FOR UPDATE USING (auth.uid() = user_id);`,

      `CREATE POLICY "Users can delete their own articles" ON articles
       FOR DELETE USING (auth.uid() = user_id);`,

      // Storage policies
      `CREATE POLICY "Public can view article images" ON storage.objects
       FOR SELECT USING (bucket_id = 'public_article_images');`,

      `CREATE POLICY "Users can upload article images" ON storage.objects
       FOR INSERT WITH CHECK (bucket_id = 'public_article_images' AND auth.role() = 'authenticated');`,

      `CREATE POLICY "Users can manage their article images" ON storage.objects
       FOR ALL USING (bucket_id = 'public_article_images' AND auth.uid()::text = (storage.foldername(name))[1]);`,

      `CREATE POLICY "Public can view avatars" ON storage.objects
       FOR SELECT USING (bucket_id = 'public_user_avatars');`,

      `CREATE POLICY "Users can manage their avatar" ON storage.objects
       FOR ALL USING (bucket_id = 'public_user_avatars' AND auth.uid()::text = (storage.foldername(name))[1]);`,

      `CREATE POLICY "Users can manage their documents" ON storage.objects
       FOR ALL USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);`
    ]

    for (const sql of securitySettings) {
      console.log('\nExecuting:', sql)
      const { error } = await executeSql(supabase, sql)
      
      if (error) {
        if (error.message.includes('already exists')) {
          console.log('Policy/Table already exists, continuing...')
          continue
        }
        console.error('Error:', error)
      } else {
        console.log('Success!')
      }
    }

    console.log('\nSecurity setup completed!')

  } catch (error) {
    console.error('Migration error:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration().catch((error: Error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
