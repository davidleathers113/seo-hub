import { supabase } from './supabase'

// Storage bucket names
export const STORAGE_BUCKETS = {
  ARTICLE_IMAGES: 'public_article_images',
  USER_AVATARS: 'public_user_avatars',
  DOCUMENTS: 'documents',
} as const

// Maximum file sizes in bytes
export const MAX_FILE_SIZES = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
  AVATAR: 2 * 1024 * 1024, // 2MB
} as const

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']

interface UploadOptions {
  bucketName: keyof typeof STORAGE_BUCKETS
  path: string
  file: File
}

interface DownloadOptions {
  bucketName: keyof typeof STORAGE_BUCKETS
  path: string
}

// Validate file before upload
function validateFile(file: File, bucketName: keyof typeof STORAGE_BUCKETS): void {
  // Check file size
  const maxSize = bucketName === 'DOCUMENTS' 
    ? MAX_FILE_SIZES.DOCUMENT 
    : bucketName === 'USER_AVATARS'
    ? MAX_FILE_SIZES.AVATAR
    : MAX_FILE_SIZES.IMAGE

  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum allowed size of ${maxSize / (1024 * 1024)}MB`)
  }

  // Check file type
  const allowedTypes = bucketName === 'DOCUMENTS'
    ? ALLOWED_DOCUMENT_TYPES
    : ALLOWED_IMAGE_TYPES

  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
  }
}

// Upload file to storage
export async function uploadFile({ bucketName, path, file }: UploadOptions): Promise<string> {
  try {
    validateFile(file, bucketName)

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucketName])
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (error) throw error

    // Get public URL for the uploaded file
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS[bucketName])
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error uploading file:', error)
    throw error
  }
}

// Download file from storage
export async function downloadFile({ bucketName, path }: DownloadOptions): Promise<Blob> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucketName])
      .download(path)

    if (error) throw error
    if (!data) throw new Error('No data received')

    return data
  } catch (error) {
    console.error('Error downloading file:', error)
    throw error
  }
}

// Delete file from storage
export async function deleteFile({ bucketName, path }: DownloadOptions): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucketName])
      .remove([path])

    if (error) throw error
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

// List files in a bucket/folder
export async function listFiles(bucketName: keyof typeof STORAGE_BUCKETS, folderPath?: string): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucketName])
      .list(folderPath || '')

    if (error) throw error
    if (!data) return []

    return data.map(file => file.name)
  } catch (error) {
    console.error('Error listing files:', error)
    throw error
  }
}

// Create signed URL for temporary access
export async function createSignedUrl(
  bucketName: keyof typeof STORAGE_BUCKETS,
  path: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS[bucketName])
      .createSignedUrl(path, expiresIn)

    if (error) throw error
    if (!data?.signedUrl) throw new Error('No signed URL generated')

    return data.signedUrl
  } catch (error) {
    console.error('Error creating signed URL:', error)
    throw error
  }
}
