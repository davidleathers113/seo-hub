import { SupabaseClient } from '@supabase/supabase-js';
import { ValidationResult, ValidationError, ValidationSeverity } from '../types';

// Interfaces
interface DatabaseIndex {
  tableName: string;
  indexName: string;
  columns: string[];
  isUnique: boolean;
  indexType: string;
}

interface IndexValidationResult {
  table: string;
  valid: boolean;
  missing: Array<{ columns: string[]; unique: boolean }>;
}

interface IndexEfficiencyResult {
  index: string;
  table: string;
  valid: boolean;
  issues: Array<{
    issue: string;
    description: string;
    recommendation: string;
  }>;
}

// Main Validation Function
export async function validate(supabase: SupabaseClient): Promise<ValidationResult> {
  try {
    const indexes = await fetchDatabaseIndexes(supabase);
    const requiredValidation = validateRequiredIndexes(indexes);
    const efficiencyValidation = validateIndexEfficiency(indexes);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Process required index validation results
    for (const result of requiredValidation) {
      if (!result.valid) {
        errors.push({
          file: result.table,
          line: 0,
          message: `Missing required indexes: ${result.missing.map(m => m.columns.join(', ')).join('; ')}`,
          severity: 'error' as ValidationSeverity,
          code: 'MISSING_REQUIRED_INDEX',
        });
      }
    }

    // Process efficiency validation results
    for (const result of efficiencyValidation) {
      if (!result.valid) {
        result.issues.forEach(issue => {
          warnings.push({
            file: result.table,
            line: 0,
            message: `${issue.issue}: ${issue.description}`,
            severity: 'warning' as ValidationSeverity,
            code: 'INDEX_EFFICIENCY_ISSUE',
          });
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [
        {
          file: 'unknown',
          line: 0,
          message: `Failed to validate indexes: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
          code: 'INDEX_VALIDATION_FAILED',
        },
      ],
      warnings: [],
    };
  }
}

// Helper Functions
interface PgIndex {
  tablename: string;
  indexname: string;
  indexdef: string;
}

async function fetchDatabaseIndexes(supabase: SupabaseClient): Promise<DatabaseIndex[]> {
  const { data, error } = await supabase
    .from('pg_indexes')
    .select('tablename, indexname, indexdef')
    .eq('schemaname', 'public');

  if (error || !data) {
    throw new Error(`Failed to fetch database indexes: ${error?.message || 'Unknown error'}`);
  }

  // Assert the type of data as PgIndex[]
  const indexes = data as PgIndex[];

  return indexes.map((index): DatabaseIndex => {
    const indexDef = index.indexdef;
    const columns = indexDef
      .substring(indexDef.indexOf('(') + 1, indexDef.lastIndexOf(')'))
      .split(',')
      .map((col: string) => col.trim());

    return {
      tableName: index.tablename,
      indexName: index.indexname,
      columns,
      isUnique: indexDef.toLowerCase().includes('unique'),
      indexType: indexDef.includes('USING btree')
        ? 'btree'
        : indexDef.includes('USING gin')
        ? 'gin'
        : indexDef.includes('USING gist')
        ? 'gist'
        : 'other',
    };
  });
}

function validateRequiredIndexes(indexes: DatabaseIndex[]): IndexValidationResult[] {
  const requiredIndexes = {
    'users': [
      { columns: ['email'], unique: true },
      { columns: ['created_at'], unique: false },
    ],
    'profiles': [
      { columns: ['user_id'], unique: true },
      { columns: ['updated_at'], unique: false },
    ],
  };

  return Object.entries(requiredIndexes).map(([tableName, required]) => {
    const tableIndexes = indexes.filter(idx => idx.tableName === tableName);

    const missing = required.filter(req => {
      return !tableIndexes.some(idx =>
        idx.isUnique === req.unique &&
        req.columns.every(col => idx.columns.includes(col))
      );
    });

    return {
      table: tableName,
      valid: missing.length === 0,
      missing,
    };
  });
}

function validateIndexEfficiency(indexes: DatabaseIndex[]): IndexEfficiencyResult[] {
  return indexes.map(index => {
    const issues = [];

    // Check for potentially redundant indexes
    if (index.columns.length > 1) {
      const firstColumn = index.columns[0];
      const sameFirstColumn = indexes.filter(idx =>
        idx.tableName === index.tableName &&
        idx.columns[0] === firstColumn &&
        idx.indexName !== index.indexName
      );

      if (sameFirstColumn.length > 0) {
        issues.push({
          issue: 'Potentially redundant index',
          description: `Other indexes starting with ${firstColumn} exist`,
          recommendation: 'Consider consolidating indexes',
        });
      }
    }

    // Check for indexes on low-cardinality columns
    if (index.columns.length === 1) {
      const column = index.columns[0];
      if (column.includes('type') || column.includes('status') || column.includes('boolean')) {
        issues.push({
          issue: 'Low-cardinality column index',
          description: `Index on ${column} might not be efficient`,
          recommendation: 'Consider removing index if not frequently queried',
        });
      }
    }

    return {
      index: index.indexName,
      table: index.tableName,
      valid: issues.length === 0,
      issues,
    };
  });
}