import { resolve } from 'path'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { STORAGE_BUCKETS, ALLOWED_IMAGE_TYPES, ALLOWED_DOCUMENT_TYPES } from '../lib/storage'

// Load environment variables from root .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, serviceRoleKey)

async function setupStorage() {
  console.log('Setting up Supabase Storage...')

  try {
    // Create buckets with their configurations
    const bucketConfigs = {
      'article-images': {
        public: true,
        fileSizeLimit: '5MB',
        allowedMimeTypes: ALLOWED_IMAGE_TYPES
      },
      'user-avatars': {
        public: true,
        fileSizeLimit: '2MB',
        allowedMimeTypes: ALLOWED_IMAGE_TYPES
      },
      'documents': {
        public: false,
        fileSizeLimit: '10MB',
        allowedMimeTypes: ALLOWED_DOCUMENT_TYPES
      }
    }

    for (const [bucketName, config] of Object.entries(bucketConfigs)) {
      console.log(`\nSetting up bucket: ${bucketName}`)

      // Create or update bucket
      const { error: createError } = await supabase
        .storage
        .createBucket(bucketName, {
          public: config.public,
          fileSizeLimit: config.fileSizeLimit,
          allowedMimeTypes: config.allowedMimeTypes
        })

      if (createError) {
        if (createError.message.includes('already exists')) {
          console.log(`✅ Bucket ${bucketName} already exists`)
          
          // Update existing bucket
          const { error: updateError } = await supabase
            .storage
            .updateBucket(bucketName, {
              public: config.public,
              fileSizeLimit: config.fileSizeLimit,
              allowedMimeTypes: config.allowedMimeTypes
            })

          if (updateError) {
            console.error(`❌ Error updating bucket ${bucketName}:`, updateError.message)
          } else {
            console.log(`✅ Updated bucket ${bucketName} configuration`)
          }
        } else {
          console.error(`❌ Error creating bucket ${bucketName}:`, createError.message)
        }
      } else {
        console.log(`✅ Created bucket ${bucketName}`)
      }
    }

    console.log('\nStorage setup completed!')

  } catch (error) {
    console.error('❌ Unexpected error during storage setup:', error)
    process.exit(1)
  }
}

// Run the setup
setupStorage().catch(console.error)
