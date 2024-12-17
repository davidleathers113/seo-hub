import { resolve } from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment variables')
}

// Create admin client
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  db: { schema: 'public' }
})

async function executeSql(sql: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`
  }

  if (serviceRoleKey) {
    headers.apikey = serviceRoleKey
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query: sql })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to execute SQL: ${text}`)
  }
}

async function resetDatabase() {
  console.log('Resetting database...')

  try {
    // First create the exec function if it doesn't exist
    console.log('Setting up exec function...')
    const setupExecSQL = `
      create or replace function exec(query text)
      returns setof record
      language plpgsql
      security definer
      set search_path = public
      as $$
      begin
        return query execute query;
      end;
      $$;
      
      grant execute on function exec(text) to service_role;
    `
    
    // Use RPC call to create the exec function
    const { error: setupError } = await supabase.rpc('exec', {
      query: setupExecSQL
    }).single()

    if (setupError) {
      console.warn('Warning setting up exec function:', setupError)
      // Continue anyway as the function might already exist
    }

    // Drop all tables in the public schema
    console.log('Dropping all tables...')
    const dropTablesSQL = `
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `
    await executeSql(dropTablesSQL)
    console.log('✅ All tables dropped successfully')

    // Get all SQL files in the migrations directory
    const migrationsDir = path.join(__dirname, '../supabase/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    // Run all migrations
    for (const file of files) {
      console.log(`\nRunning migration: ${file}`)
      const filePath = path.join(migrationsDir, file)
      const sql = fs.readFileSync(filePath, 'utf8')

      // Split SQL into individual statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0)

      // Execute each statement
      for (const statement of statements) {
        try {
          await executeSql(statement)
        } catch (error) {
          console.error(`Error executing statement in ${file}:`, error)
          console.error('Statement:', statement)
          throw error
        }
      }

      console.log(`✅ Migration ${file} completed successfully`)
    }

    console.log('\nDatabase reset completed successfully!')

  } catch (error) {
    console.error('\nDatabase reset error:', error)
    process.exit(1)
  }
}

// Run the database reset
resetDatabase().catch(console.error)
