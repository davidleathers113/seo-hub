import { Database as AppDatabase } from '../../types/supabase'

export type AdminFunctionDefinitions = {
  admin_get_table_constraints: {
    Args: Record<string, never>
    Returns: Array<{
      table_name: string
      constraint_name: string
      constraint_type: string
    }>
  }
  admin_get_foreign_keys: {
    Args: Record<string, never>
    Returns: Array<{
      constraint_name: string
      table_name: string
      referenced_table_name: string
      referenced_column_name: string
    }>
  }
}

export interface AdminDatabase extends Omit<AppDatabase, 'public'> {
  public: Omit<AppDatabase['public'], 'Functions'> & {
    Functions: AdminFunctionDefinitions
  }
}

// Helper type for RPC function responses
export type RPCResponse<T> = {
  data: T | null
  error: Error | null
}

// Helper type for RPC function parameters
export type RPCArgs<T extends keyof AdminFunctionDefinitions> = AdminFunctionDefinitions[T]['Args']

// Helper type for RPC function returns
export type RPCReturns<T extends keyof AdminFunctionDefinitions> = AdminFunctionDefinitions[T]['Returns']
