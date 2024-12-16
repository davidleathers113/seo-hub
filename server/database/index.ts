import { DatabaseClient } from './types';
import { IWorkflowClient } from './interfaces/workflow';
import { NicheClient } from './supabase/clients/niche-client';
import { UserClient } from './supabase/clients/user-client';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);

// Export database clients
export const nicheClient = new NicheClient(supabase);
export const userClient = new UserClient(supabase);

// Export other clients as needed
export * from './types';
export * from './interfaces/workflow';
