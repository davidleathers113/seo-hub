import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
  try {
    // Create the storage bucket
    const { data: bucket, error: createError } = await supabase
      .storage
      .createBucket('content-creation-app', {
        public: false,
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/gif',
          'image/webp',
          'application/pdf',
          'text/plain',
          'text/markdown'
        ],
        fileSizeLimit: 52428800 // 50MB in bytes
      })

    if (createError) {
      throw createError
    }

    console.log('Storage bucket created:', bucket)

    // Set up bucket policies
    const { error: policyError } = await supabase
      .storage
      .from('content-creation-app')
      .createSignedUrl('test.txt', 60)

    if (policyError) {
      throw policyError
    }

    console.log('Storage bucket configured successfully!')
  } catch (error) {
    console.error('Error setting up storage:', error)
  }
}

setupStorage()