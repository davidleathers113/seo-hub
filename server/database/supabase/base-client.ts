import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '../../../types/supabase'

export class BaseSupabaseClient {
  protected supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  protected async handleError(error: any, operation: string): Promise<never> {
    console.error(`Failed to perform ${operation}:`, error)
    throw error
  }
}