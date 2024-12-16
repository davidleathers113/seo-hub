import { resolve } from 'path'
import dotenv from 'dotenv'
import fetch from 'node-fetch'
import * as fs from 'fs'
import * as path from 'path'

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment variables')
}

interface SqlError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

async function executeSql(sql: string): Promise<void> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Prefer': 'return=headers-only'
  }

  if (serviceRoleKey) {
    headers.apikey = serviceRoleKey
  }

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'exec',
      arguments: {
        query: sql
      }
    })
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Failed to execute SQL: ${text}`)
  }
}

async function applyMigration(): Promise<void> {
  console.log('Applying Nextacular migration...')

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20240320000000_add_nextacular_workspaces.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    // Execute each statement
    for (const statement of statements) {
      try {
        await executeSql(statement)
        console.log('Statement executed successfully')
      } catch (err) {
        const error = err as Error
        console.error(`Failed to execute statement: ${error.message}\nStatement: ${statement}`)
        throw error
      }
    }

    console.log('\nMigration completed successfully!')

  } catch (err) {
    const error = err as Error
    console.error('\nMigration error:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration().catch(console.error)
