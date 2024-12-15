import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

async function runMigration() {
  try {
    console.log('Reading migration file...');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20240314000000_initial_schema.sql'),
      'utf8'
    );

    console.log('Executing migration...');
    const { data, error } = await supabase.rpc('exec_sql', {
      query: migrationSQL
    });

    if (error) {
      console.error('Migration failed:', error);
      return;
    }

    console.log('Migration successful!');
    console.log('Data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

runMigration();
