import { promises as fs } from 'fs'
import path from 'path'
import { glob } from 'glob'

const MONGODB_PATTERNS = [
  'mongoose',
  'MongoClient',
  'mongodb://',
  'mongoose.connect',
  'mongoose.model',
  'mongoose.Schema',
  'new Schema',
  'Document,',
  'Model<',
  'mongodb-memory-server'
]

const REPLACEMENT_MAP = {
  'mongoose.Schema': 'Database["public"]["Tables"]',
  'mongoose.model': 'supabase.from',
  'mongoose.connect': 'supabase.connect',
  'Document,': 'Database["public"]["Tables"][TableName]["Row"],',
  'Model<': 'SupabaseClient<Database>',
  'mongodb-memory-server': '@supabase/supabase-js'
}

async function findFiles(pattern: string): Promise<string[]> {
  return glob(pattern, { ignore: ['**/node_modules/**', '**/dist/**'] })
}

async function processFile(filePath: string): Promise<void> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    let hasChanges = false
    let newContent = content

    // Check for MongoDB patterns
    for (const pattern of MONGODB_PATTERNS) {
      if (content.includes(pattern)) {
        console.log(`Found MongoDB pattern "${pattern}" in ${filePath}`)
        hasChanges = true

        // Apply replacements if available
        if (REPLACEMENT_MAP[pattern]) {
          newContent = newContent.replace(
            new RegExp(pattern, 'g'),
            REPLACEMENT_MAP[pattern]
          )
        }
      }
    }

    if (hasChanges) {
      // Create a backup of the original file
      const backupPath = `${filePath}.bak`
      await fs.writeFile(backupPath, content)
      console.log(`Created backup at ${backupPath}`)

      // Write the modified content
      await fs.writeFile(filePath, newContent)
      console.log(`Updated ${filePath}`)
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
  }
}

async function main() {
  try {
    // Find all TypeScript and JavaScript files
    const files = await findFiles('**/*.{ts,js}')

    console.log(`Found ${files.length} files to process`)

    // Process each file
    for (const file of files) {
      await processFile(file)
    }

    console.log('Completed processing all files')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

main()