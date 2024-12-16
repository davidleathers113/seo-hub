import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment variables')
}

// Create admin client for running migrations
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  console.log('Applying workspace migration...')

  try {
    // First test the connection
    const { data: testData, error: testError } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (testError) {
      throw new Error(`Failed to connect to Supabase: ${testError.message}`)
    }

    console.log('Successfully connected to Supabase')

    // Read the migration file
    const migrationPath = path.join(__dirname, '../supabase/migrations/20240320000000_add_workspace_features.sql')
    const sql = fs.readFileSync(migrationPath, 'utf8')

    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)
      .map(s => {
        // Remove comments
        return s.split('\n')
          .filter(line => !line.trim().startsWith('--'))
          .join('\n')
          .trim()
      })
      .filter(s => s.length > 0)

    // Execute each statement
    for (const statement of statements) {
      try {
        // Use raw query execution
        const { error } = await supabase
          .from('_raw_query')
          .insert({ query: statement })

        if (error) {
          throw new Error(`Failed to execute statement: ${error.message}`)
        }

        console.log('Statement executed successfully:', statement.substring(0, 50) + '...')
      } catch (err) {
        const error = err as Error
        console.error(`Failed to execute statement: ${error.message}\nStatement: ${statement}`)
        throw error
      }
    }

    // Create default workspace for existing data
    const { data: existingData, error: existingError } = await supabase
      .from('niches')
      .select('workspace_id')
      .limit(1)

    if (!existingError && (!existingData || existingData.length === 0 || !existingData[0].workspace_id)) {
      console.log('Creating default workspace for existing data...')
      
      // Get the first user as creator
      const { data: firstUser } = await supabase
        .from('users')
        .select('id, email')
        .limit(1)
        .single()

      if (firstUser) {
        // Create default workspace
        const { data: workspace, error: workspaceError } = await supabase
          .from('workspaces')
          .insert({
            name: 'Default Workspace',
            slug: 'default',
            creator_id: firstUser.id
          })
          .select()
          .single()

        if (workspaceError) {
          throw new Error(`Failed to create default workspace: ${workspaceError.message}`)
        }

        if (workspace) {
          // Add creator as member
          await supabase
            .from('members')
            .insert({
              workspace_id: workspace.id,
              email: firstUser.email,
              inviter: firstUser.email,
              status: 'accepted',
              team_role: 'owner',
              joined_at: new Date().toISOString()
            })

          // Update existing data with workspace_id
          const tables = ['niches', 'pillars', 'subpillars', 'articles', 'outlines', 'research', 'todos']
          for (const table of tables) {
            await supabase
              .from(table)
              .update({ workspace_id: workspace.id })
              .is('workspace_id', null)
          }

          console.log(`Created default workspace and migrated existing data`)
        }
      }
    }

    console.log('\nMigration completed successfully!')

  } catch (error) {
    console.error('\nMigration error:', error)
    process.exit(1)
  }
}

// Run the migration
applyMigration().catch(console.error)
