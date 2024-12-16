import { supabase } from './supabase'

export type AllowedMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/gif'
  | 'image/webp'
  | 'application/pdf'
  | 'text/plain'
  | 'text/markdown'

export interface UploadOptions {
  /**
   * The type of content being uploaded (e.g., 'articles', 'images', 'documents')
   */
  contentType: string
  /**
   * Optional metadata to store with the file
   */
  metadata?: Record<string, string>
  /**
   * Maximum file size in bytes (default: 50MB)
   */
  maxSize?: number
}

const DEFAULT_MAX_SIZE = 52428800 // 50MB

/**
 * Uploads a file to Supabase Storage with proper organization and security
 */
export async function uploadFile(
  file: File,
  options: UploadOptions
): Promise<{ path: string; url: string } | null> {
  try {
    // Validate file size
    if (file.size > (options.maxSize || DEFAULT_MAX_SIZE)) {
      throw new Error('File size exceeds maximum allowed size')
    }

    // Validate mime type
    if (!isMimeTypeAllowed(file.type)) {
      throw new Error('File type not allowed')
    }

    // Get the current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    // Create a path with proper organization: userId/contentType/filename
    const path = `${user.id}/${options.contentType}/${file.name}`

    // Upload the file
    const { data, error } = await supabase.storage
      .from('content-creation-app')
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
        metadata: options.metadata
      })

    if (error) {
      throw error
    }

    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-creation-app')
      .getPublicUrl(data.path)

    return {
      path: data.path,
      url: publicUrl
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

/**
 * Deletes a file from Supabase Storage
 */
export async function deleteFile(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('content-creation-app')
      .remove([path])

    return !error
  } catch (error) {
    console.error('Error deleting file:', error)
    return false
  }
}

/**
 * Gets a temporary signed URL for a file
 */
export async function getSignedUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const { data, error } = await supabase.storage
      .from('content-creation-app')
      .createSignedUrl(path, expiresIn)

    if (error) {
      throw error
    }

    return data.signedUrl
  } catch (error) {
    console.error('Error getting signed URL:', error)
    return null
  }
}

/**
 * Lists files in a directory
 */
export async function listFiles(
  prefix: string
): Promise<string[]> {
  try {
    const { data, error } = await supabase.storage
      .from('content-creation-app')
      .list(prefix)

    if (error) {
      throw error
    }

    return data.map(file => file.name)
  } catch (error) {
    console.error('Error listing files:', error)
    return []
  }
}

/**
 * Checks if a mime type is allowed
 */
function isMimeTypeAllowed(mimeType: string): mimeType is AllowedMimeType {
  const allowedTypes: AllowedMimeType[] = [
    'image/png',
    'image/jpeg',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'text/markdown'
  ]
  return allowedTypes.includes(mimeType as AllowedMimeType)
}