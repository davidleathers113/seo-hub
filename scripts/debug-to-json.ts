import * as fs from 'fs';
import * as path from 'path';

interface DatabaseOperation {
  type: string;
  details: any;
  timestamp?: string;
}

interface NetworkOperation {
  type: string;
  host?: string;
  headers?: Record<string, string>;
  status?: string;
  timestamp?: string;
}

interface MigrationStep {
  name: string;
  sql_operations?: string[];
  status: string;
}

interface StorageOperation {
  type: string;
  bucket_name: string;
  status?: string;
}

interface DebugLog {
  command: string;
  timestamp: string;
  database_operations: DatabaseOperation[];
  network_operations: NetworkOperation[];
  migrations: MigrationStep[];
  storage_operations: StorageOperation[];
  status: string;
  completion_message: string;
}

function parseTimestamp(line: string): string | undefined {
  const match = line.match(/^\d{4}\/\d{2}\/\d{2}\s\d{2}:\d{2}:\d{2}/);
  return match ? match[0] : undefined;
}

function parseDebugLog(content: string): DebugLog {
  const lines = content.split('\n');
  const debugLog: DebugLog = {
    command: '',
    timestamp: '',
    database_operations: [],
    network_operations: [],
    migrations: [],
    storage_operations: [],
    status: 'completed',
    completion_message: ''
  };

  let currentMigration: MigrationStep | null = null;
  let currentSqlOperations: string[] = [];

  for (const line of lines) {
    if (line.trim() === '') continue;

    // Parse command and version
    if (line.startsWith('Supabase CLI')) {
      debugLog.command = line.trim();
      continue;
    }

    // Parse timestamp
    const timestamp = parseTimestamp(line);
    if (timestamp) {
      if (!debugLog.timestamp) {
        debugLog.timestamp = timestamp;
      }
    }

    // Parse network operations
    if (line.includes('Sent Header:')) {
      const headerMatch = line.match(/Sent Header: (.*?) \[(.*?)\]/);
      if (headerMatch) {
        debugLog.network_operations.push({
          type: 'header_sent',
          timestamp: timestamp,
          headers: {
            [headerMatch[1]]: headerMatch[2]
          }
        });
      }
      continue;
    }

    // Parse database operations
    if (line.includes('CREATE TABLE') || line.includes('CREATE EXTENSION') || 
        line.includes('ALTER TABLE') || line.includes('CREATE INDEX')) {
      debugLog.database_operations.push({
        type: line.includes('CREATE TABLE') ? 'table_creation' :
              line.includes('CREATE EXTENSION') ? 'extension_creation' :
              line.includes('ALTER TABLE') ? 'table_alteration' :
              'index_creation',
        details: line.trim(),
        timestamp: timestamp
      });
      if (currentMigration) {
        currentSqlOperations.push(line.trim());
      }
      continue;
    }

    // Parse migrations
    if (line.includes('Applying migration')) {
      if (currentMigration && currentSqlOperations.length > 0) {
        currentMigration.sql_operations = currentSqlOperations;
        debugLog.migrations.push(currentMigration);
      }
      
      const migrationName = line.split(' ').pop()?.replace('...', '');
      if (migrationName) {
        currentMigration = {
          name: migrationName,
          sql_operations: [],
          status: 'applied'
        };
        currentSqlOperations = [];
      }
      continue;
    }

    // Parse storage operations
    if (line.includes('Creating Storage bucket:')) {
      const bucketName = line.split(':')[1]?.trim();
      if (bucketName) {
        debugLog.storage_operations.push({
          type: 'bucket_creation',
          bucket_name: bucketName,
          status: 'created'
        });
      }
      continue;
    }

    // Parse completion message
    if (line.includes('Finished')) {
      debugLog.completion_message = line.trim();
      // Add the last migration if exists
      if (currentMigration && currentSqlOperations.length > 0) {
        currentMigration.sql_operations = currentSqlOperations;
        debugLog.migrations.push(currentMigration);
      }
    }
  }

  return debugLog;
}

function main() {
  try {
    const debugFilePath = path.join(process.cwd(), 'debug.txt');
    const outputFilePath = path.join(process.cwd(), 'debug.json');

    if (!fs.existsSync(debugFilePath)) {
      console.error('debug.txt file not found');
      process.exit(1);
    }

    const content = fs.readFileSync(debugFilePath, 'utf8');
    const parsedLog = parseDebugLog(content);
    
    fs.writeFileSync(
      outputFilePath,
      JSON.stringify(parsedLog, null, 2),
      'utf8'
    );

    console.log('Successfully converted debug.txt to debug.json');
  } catch (error) {
    console.error('Error processing debug log:', error);
    process.exit(1);
  }
}

main();
