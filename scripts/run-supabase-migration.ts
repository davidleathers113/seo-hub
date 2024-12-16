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

// Create admin client for running migrations
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function runMigrations() {
  console.log('Running Supabase migrations...')

  try {
    // Create migrations table if it doesn't exist
    const { error: createTableError } = await supabase.rpc('create_migrations_table', {
      sql: `
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL UNIQUE,
          executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    })

    if (createTableError) {
      console.log('Creating migrations table directly...')
      const { error } = await supabase.from('migrations').select('id').limit(1)
      if (error && error.message.includes('does not exist')) {
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: `
            CREATE TABLE IF NOT EXISTS migrations (
              id SERIAL PRIMARY KEY,
              name VARCHAR(255) NOT NULL UNIQUE,
              executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
          `
        })
        if (createError) {
          throw new Error(`Failed to create migrations table: ${createError.message}`)
        }
      }
    }

    // Get executed migrations
    const { data: executedMigrations, error: selectError } = await supabase
      .from('migrations')
      .select('name')

    if (selectError) {
      throw new Error(`Failed to get executed migrations: ${selectError.message}`)
    }

    const executedMigrationNames = new Set(executedMigrations?.map(m => m.name) || [])

    // Get all SQL files in the migrations directory
    const migrationsDir = path.join(__dirname, '../supabase/migrations')
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort()

    // Run pending migrations
    for (const file of files) {
      if (!executedMigrationNames.has(file)) {
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
          const { error: execError } = await supabase.rpc('exec_sql', {
            sql: statement
          })

          if (execError) {
            throw new Error(`Failed to execute statement in ${file}: ${execError.message}\nStatement: ${statement}`)
          }
        }

        // Record migration
        const { error: insertError } = await supabase
          .from('migrations')
          .insert({ name: file })

        if (insertError) {
          throw new Error(`Failed to record migration ${file}: ${insertError.message}`)
        }

        console.log(`✅ Migration ${file} completed successfully`)
      } else {
        console.log(`Skipping already executed migration: ${file}`)
      }
    }

    console.log('\nAll migrations completed successfully!')

  } catch (error) {
    console.error('\nMigration error:', error)
    process.exit(1)
  }
}

// Run the migrations
runMigrations().catch(console.error)
