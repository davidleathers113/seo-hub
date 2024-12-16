import { createClient } from '@supabase/supabase-js';
import { ValidationError, ValidationResult } from './types';
import { formatValidationOutput } from './utils/format';
import { validateDatabaseConstraints } from './validators/database-validator';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

interface ValidationConfig {
  migrationPath?: string;
  srcPath?: string;
  verbose?: boolean;
}

async function validateAll(config: ValidationConfig = {}): Promise<ValidationResult> {
  const {
    migrationPath = 'supabase/migrations',
    srcPath = 'src',
    verbose = false,
  } = config;

  if (!process.env.VITE_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing required environment variables');
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: { persistSession: false },
    }
  );

  try {
    // Run database constraint validation
    const constraintResult = await validateDatabaseConstraints(supabase);

    // You can add other validators back as they're updated
    const errors: ValidationError[] = [...constraintResult.errors];

    const warnings: ValidationError[] = [...constraintResult.warnings];

    if (verbose) {
      formatValidationOutput(errors, warnings);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    return {
      isValid: false,
      errors: [
        {
          file: 'unknown',
          line: 0,
          message: `Validation failed: ${message}`,
          severity: 'error',
          code: 'VALIDATION_FAILED',
        },
      ],
      warnings: [],
    };
  }
}

validateAll({ verbose: true }).then((result) => {
  if (!result.isValid) {
    process.exit(1);
  }
});
