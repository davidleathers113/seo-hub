// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

// Then import Supabase configuration
import { supabase, initializeSupabase } from './config/supabase';

async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    console.log('Using URL:', process.env.SUPABASE_URL);
    
    // Initialize Supabase connection
    await initializeSupabase();
    console.log('Successfully connected to Supabase!');

    // Try to query users table
    const { data, error } = await supabase
      .from('users')
      .select('count');

    if (error) {
      console.error('Query failed:', error.message);
      return;
    }

    console.log('Query result:', data);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit();
  }
}

testSupabaseConnection();
