import { createClient } from '@supabase/supabase-js';
import { logger } from '../utils/log';

const log = logger('supabase-config');

if (!process.env.SUPABASE_URL) {
  throw new Error('SUPABASE_URL is required');
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error('SUPABASE_ANON_KEY is required');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
    },
  }
);

export async function initializeSupabase() {
  try {
    log.info('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').single();
    
    if (error) {
      throw error;
    }
    
    log.info('Supabase connection successful');
    return supabase;
  } catch (error) {
    log.error('Supabase connection failed:', error);
    throw error;
  }
}
