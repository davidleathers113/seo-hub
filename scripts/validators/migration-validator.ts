import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { ValidationResult, ValidationError } from '../types';

// Interfaces
interface MigrationContext {
  tableNames: Set<string>;
  policies: Set<string>;
  triggers: Set<string>;
  functions: Set<string>;
}

const RESERVED_WORDS = new Set([
  'user',
  'session',
  'account',
  'workspace',
  'subscription',
  'member',
  'team'
]);

// Main Validation Function
export async function validate(migrationsDir: string): Promise<ValidationResult> {
  const result: ValidationResult = {
    isValid: true,
    errors: [],
    warnings: []
  };

  try {
    const files = await glob('*.sql', { cwd: migrationsDir });
    files.sort();

    const context: MigrationContext = {
      tableNames: new Set<string>(),
      policies: new Set<string>(),
      triggers: new Set<string>(),
      functions: new Set<string>()
    };

    // Validate migration file naming convention
    files.forEach((file) => {
      if (!isValidMigrationFileName(file)) {
        result.errors.push({
          file,
          line: 0,
          message: 'Migration file name should follow pattern: YYYYMMDDHHMMSS_description.sql',
          severity: 'error',
          code: 'INVALID_FILENAME'
        });
      }
    });

    // Validate migration contents
    for (const file of files) {
      const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
      const fileErrors = validateFile(file, content, context);
      result.errors.push(...fileErrors.filter(e => e.severity === 'error'));
      result.warnings.push(...fileErrors.filter(e => e.severity === 'warning'));
    }

    result.isValid = result.errors.length === 0;
    return result;
  } catch (error: unknown) {
    result.isValid = false;
    result.errors.push({
      file: 'unknown',
      line: 0,
      message: `Failed to validate migrations: ${error instanceof Error ? error.message : 'Unknown error'}`,
      severity: 'error',
      code: 'VALIDATION_FAILED'
    });
    return result;
  }
}

// Helper Functions
function isValidMigrationFileName(fileName: string): boolean {
  return /^\d{14}_[a-z0-9_]+\.sql$/.test(fileName);
}

function validateFile(file: string, content: string, context: MigrationContext): ValidationError[] {
  const errors: ValidationError[] = [];
  const lines = content.split('\n');

  // Track multi-line statements
  let currentStatement = '';
  let statementStartLine = 0;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();
    
    // Skip empty lines and comments
    if (!trimmedLine || trimmedLine.startsWith('--')) {
      return;
    }

    // Accumulate multi-line statements
    currentStatement += ' ' + trimmedLine;
    if (statementStartLine === 0) {
      statementStartLine = index + 1;
    }

    // If statement is complete
    if (trimmedLine.endsWith(';')) {
      // Schema prefix validation
      if (currentStatement.includes('CREATE TABLE public.')) {
        errors.push({
          file,
          line: statementStartLine,
          message: 'Remove public. schema prefix for better compatibility',
          severity: 'warning',
          code: 'SCHEMA_PREFIX'
        });
      }

      // Reserved table name validation
      const tableMatch = currentStatement.match(/CREATE TABLE (?:public\.)?([a-z_]+)/i);
      if (tableMatch) {
        const tableName = tableMatch[1].toLowerCase();
        if (RESERVED_WORDS.has(tableName)) {
          errors.push({
            file,
            line: statementStartLine,
            message: `Table name '${tableName}' is reserved by Nextacular`,
            severity: 'error',
            code: 'RESERVED_TABLE_NAME'
          });
        }
      }

      // Policy validation with proper naming convention
      const policyMatch = currentStatement.match(/CREATE POLICY "([^"]+)"/);
      if (policyMatch) {
        const policyName = policyMatch[1];
        if (context.policies.has(policyName)) {
          errors.push({
            file,
            line: statementStartLine,
            message: `Duplicate policy name: ${policyName}`,
            severity: 'error',
            code: 'DUPLICATE_POLICY'
          });
        }
        if (!isValidPolicyName(policyName)) {
          errors.push({
            file,
            line: statementStartLine,
            message: 'Policy name should follow pattern: {action}_{table}_policy',
            severity: 'warning',
            code: 'INVALID_POLICY_NAME'
          });
        }
        context.policies.add(policyName);
      }

      // Trigger validation with proper cleanup
      const triggerMatch = currentStatement.match(/CREATE TRIGGER ([^\s]+)/);
      if (triggerMatch) {
        const triggerName = triggerMatch[1];
        if (!content.includes(`DROP TRIGGER IF EXISTS ${triggerName}`)) {
          errors.push({
            file,
            line: statementStartLine,
            message: `Missing DROP TRIGGER IF EXISTS for ${triggerName}`,
            severity: 'warning',
            code: 'MISSING_DROP_TRIGGER'
          });
        }
        if (!isValidTriggerName(triggerName)) {
          errors.push({
            file,
            line: statementStartLine,
            message: 'Trigger name should follow pattern: {table}_{event}_trigger',
            severity: 'warning',
            code: 'INVALID_TRIGGER_NAME'
          });
        }
      }

      // Foreign key validation with proper ON DELETE clause
      if (currentStatement.includes('REFERENCES') && !currentStatement.includes('ON DELETE')) {
        errors.push({
          file,
          line: statementStartLine,
          message: 'Foreign key missing ON DELETE clause',
          severity: 'warning',
          code: 'MISSING_ON_DELETE'
        });
      }

      // RLS policy validation
      if (currentStatement.includes('CREATE TABLE') && !content.includes('ENABLE ROW LEVEL SECURITY')) {
        errors.push({
          file,
          line: statementStartLine,
          message: 'Table missing RLS policy',
          severity: 'error',
          code: 'MISSING_RLS'
        });
      }

      // Index naming convention
      const indexMatch = currentStatement.match(/CREATE (?:UNIQUE )?INDEX ([^\s]+)/);
      if (indexMatch) {
        const indexName = indexMatch[1];
        if (!isValidIndexName(indexName)) {
          errors.push({
            file,
            line: statementStartLine,
            message: 'Index name should follow pattern: idx_{table}_{column(s)}',
            severity: 'warning',
            code: 'INVALID_INDEX_NAME'
          });
        }
      }

      // Reset for next statement
      currentStatement = '';
      statementStartLine = 0;
    }
  });

  return errors;
}

function isValidPolicyName(name: string): boolean {
  return /^(enable|disable|allow|deny)_[a-z_]+_policy$/.test(name);
}

function isValidTriggerName(name: string): boolean {
  return /^[a-z_]+_(insert|update|delete)_trigger$/.test(name);
}

function isValidIndexName(name: string): boolean {
  return /^idx_[a-z_]+$/.test(name);
}
