import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function verifyTables() {
  try {
    console.log('Checking tables...');
    
    // Try to select from each table
    const tables = ['users', 'niches', 'pillars', 'subpillars', 'articles', 'research', 'outlines', 'sessions'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count');
      
      if (error) {
        console.error(`Error checking ${table}:`, error.message);
      } else {
        console.log(`✓ Table ${table} exists`);
      }
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyTables();
