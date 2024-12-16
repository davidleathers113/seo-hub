import { supabase } from '../supabase'
import { uploadFile, type UploadOptions } from '../storage'

export interface MigrationProgress {
  total: number
  processed: number
  succeeded: number
  failed: number
  errors: Array<{ file: string; error: string }>
}

export interface MigrationOptions {
  onProgress?: (progress: MigrationProgress) => void
  contentType: string
  metadata?: Record<string, string>
}

export async function migrateAssets(
  files: File[],
  options: MigrationOptions
): Promise<MigrationProgress> {
  const progress: MigrationProgress = {
    total: files.length,
    processed: 0,
    succeeded: 0,
    failed: 0,
    errors: []
  }

  const uploadOptions: UploadOptions = {
    contentType: options.contentType,
    metadata: options.metadata
  }

  for (const file of files) {
    try {
      const result = await uploadFile(file, uploadOptions)

      if (result) {
        progress.succeeded++
      } else {
        progress.failed++
        progress.errors.push({
          file: file.name,
          error: 'Upload failed'
        })
      }
    } catch (error) {
      progress.failed++
      progress.errors.push({
        file: file.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }

    progress.processed++
    options.onProgress?.(progress)
  }

  return progress
}

export async function downloadAsset(path: string): Promise<Blob | null> {
  try {
    const { data, error } = await supabase.storage
      .from('content-creation-app')
      .download(path)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error downloading asset:', error)
    return null
  }
}

export async function listAssets(
  contentType: string,
  prefix?: string
): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('User not authenticated')
    }

    const path = prefix
      ? `${user.id}/${contentType}/${prefix}`
      : `${user.id}/${contentType}`

    const { data, error } = await supabase.storage
      .from('content-creation-app')
      .list(path)

    if (error) {
      throw error
    }

    return data.map(file => file.name)
  } catch (error) {
    console.error('Error listing assets:', error)
    return []
  }
}

export async function deleteAsset(path: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('content-creation-app')
      .remove([path])

    if (error) {
      throw error
    }

    return true
  } catch (error) {
    console.error('Error deleting asset:', error)
    return false
  }
}