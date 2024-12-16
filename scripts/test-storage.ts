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

async function testStorageSetup() {
  console.log('Testing Supabase Storage configuration...')

  try {
    // Test bucket existence and permissions
    for (const bucketName of Object.values(STORAGE_BUCKETS)) {
      console.log(`\nTesting bucket: ${bucketName}`)
      
      // Check if bucket exists
      const { data: bucket, error: bucketError } = await supabase
        .storage
        .getBucket(bucketName)

      if (bucketError) {
        console.error(`❌ Error getting bucket ${bucketName}:`, bucketError.message)
        continue
      }

      console.log(`✅ Bucket ${bucketName} exists`)
      console.log('Bucket configuration:', {
        id: bucket.id,
        name: bucket.name,
        public: bucket.public,
        fileSizeLimit: bucket.file_size_limit,
        allowedMimeTypes: bucket.allowed_mime_types
      })

      // Test listing files (tests read permissions)
      const { data: files, error: listError } = await supabase
        .storage
        .from(bucketName)
        .list()

      if (listError) {
        console.error(`❌ Error listing files in ${bucketName}:`, listError.message)
      } else {
        console.log(`✅ Successfully listed files in ${bucketName}`)
        console.log(`Found ${files.length} files`)
      }

      // Create appropriate test content based on bucket type
      let testContent: Uint8Array
      let mimeType: string
      let fileName: string

      if (bucketName === 'documents') {
        // Create a simple PDF-like content
        testContent = new Uint8Array([0x25, 0x50, 0x44, 0x46]) // PDF magic numbers
        mimeType = 'application/pdf'
        fileName = 'test.pdf'
      } else {
        // Create a minimal valid PNG for image buckets
        testContent = new Uint8Array([
          0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, // PNG signature
          0x00, 0x00, 0x00, 0x0D, // IHDR chunk length
          0x49, 0x48, 0x44, 0x52, // "IHDR"
          0x00, 0x00, 0x00, 0x01, // width: 1
          0x00, 0x00, 0x00, 0x01, // height: 1
          0x08, // bit depth
          0x06, // color type: RGBA
          0x00, // compression method
          0x00, // filter method
          0x00, // interlace method
          0x1f, 0x15, 0xc4, 0x89, // IHDR CRC
          0x00, 0x00, 0x00, 0x00, // IDAT chunk length
          0x49, 0x44, 0x41, 0x54, // "IDAT"
          0x08, 0x1d, 0x01, 0x02, // IDAT CRC
          0x00, 0x00, 0x00, 0x00, // IEND chunk length
          0x49, 0x45, 0x4E, 0x44, // "IEND"
          0xAE, 0x42, 0x60, 0x82  // IEND CRC
        ])
        mimeType = 'image/png'
        fileName = 'test.png'
      }

      // Create test file
      const testBlob = new Blob([testContent], { type: mimeType })
      const testFile = new File([testBlob], fileName, { type: mimeType })
      
      // Test upload
      const { data: uploadData, error: uploadError } = await supabase
        .storage
        .from(bucketName)
        .upload(`test/${fileName}`, testFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error(`❌ Error uploading to ${bucketName}:`, uploadError.message)
      } else {
        console.log(`✅ Successfully uploaded test file to ${bucketName}`)

        // Clean up test file
        const { error: deleteError } = await supabase
          .storage
          .from(bucketName)
          .remove([`test/${fileName}`])

        if (deleteError) {
          console.error(`❌ Error deleting test file from ${bucketName}:`, deleteError.message)
        } else {
          console.log(`✅ Successfully cleaned up test file from ${bucketName}`)
        }
      }
    }

    console.log('\nStorage testing completed!')

  } catch (error) {
    console.error('❌ Unexpected error during storage testing:', error)
    process.exit(1)
  }
}

// Run the tests
testStorageSetup().catch(console.error)
