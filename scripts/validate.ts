import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { ValidationResult } from './types';
import { formatValidationOutput } from './utils/format';
import { validate as validateMigrations } from './validators/migration-validator';
import { validate as validateTypeScript } from './validators/typescript-validator';
import { validate as validateRLS } from './validators/rls-validator';
import { validate as validateTypes } from './validators/type-validator';
import { validate as validateIndexes } from './validators/index-validator';
import { validateDatabaseConstraints } from './validators/database-validator';
import { AdminDatabase } from './types/supabase-admin';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env files
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

interface ValidationConfig {
  migrationPath?: string;
  srcPath?: string;
  schemaName?: string;
  verbose?: boolean;
}

async function validateAll(config: ValidationConfig = {}): Promise<ValidationResult> {
  const {
    migrationPath = 'supabase/migrations',
    srcPath = 'src',
    schemaName = 'public',
    verbose = false
  } = config;

  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required environment variables for Supabase connection');
  }

  // Create Supabase client with service role key for administrative tasks
  const supabase = createClient<AdminDatabase>(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  try {
    // Run all validations concurrently
    const [
      migrationResult,
      typeScriptResult,
      rlsResult,
      typeResult,
      indexResult,
      constraintResult
    ] = await Promise.all([
      validateMigrations(migrationPath),
      validateTypeScript(srcPath),
      validateRLS(supabase as any), // Type assertion to bypass strict typing
      validateTypes(supabase as any), // Type assertion to bypass strict typing
      validateIndexes(supabase as any), // Type assertion to bypass strict typing
      validateDatabaseConstraints(supabase)
    ]);

    // Aggregate all validation results
    const errors = [
      ...migrationResult.errors,
      ...typeScriptResult.errors,
      ...rlsResult.errors,
      ...typeResult.errors,
      ...indexResult.errors,
      ...constraintResult.errors
    ];

    const warnings = [
      ...migrationResult.warnings,
      ...typeScriptResult.warnings,
      ...rlsResult.warnings,
      ...typeResult.warnings,
      ...indexResult.warnings,
      ...constraintResult.warnings
    ];

    if (verbose) {
      formatValidationOutput(errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        file: 'unknown',
        line: 0,
        message: `Validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        code: 'VALIDATION_FAILED'
      }],
      warnings: []
    };
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateAll({ verbose: true })
    .then(result => {
      if (!result.isValid) {
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}

export { validateAll };
