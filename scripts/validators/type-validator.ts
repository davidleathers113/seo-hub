import { SupabaseClient } from '@supabase/supabase-js';
import { ValidationResult, ValidationError, ValidationSeverity } from '../types';

// Interfaces
interface ColumnType {
  tableName: string;
  columnName: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
}

interface InformationSchemaColumn {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: any;
}

// Main Validation Function
export async function validate(supabase: SupabaseClient): Promise<ValidationResult> {
  try {
    const columns = await fetchColumnTypes(supabase);
    const typeValidation = validateTypeConsistency(columns);
    const enumValidation = validateEnumTypes(columns);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Process type validation results
    for (const result of typeValidation) {
      if (!result.valid) {
        errors.push({
          file: result.table,
          line: 0,
          message: `Column '${result.column}' type issues: ${result.issues.join('; ')}`,
          severity: 'error',
          code: 'INVALID_COLUMN_TYPE',
        });
      }
    }

    // Process enum validation results
    for (const result of enumValidation) {
      warnings.push({
        file: result.table,
        line: 0,
        message: `Column '${result.column}': ${result.recommendation} (Impact: ${result.impact})`,
        severity: 'warning',
        code: 'ENUM_TYPE_USAGE',
      });
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
          message: `Failed to validate column types: ${
            error instanceof Error ? error.message : 'Unknown error'
          }`,
          severity: 'error',
          code: 'TYPE_VALIDATION_FAILED',
        },
      ],
      warnings: [],
    };
  }
}

// Helper Functions
async function fetchColumnTypes(supabase: SupabaseClient): Promise<ColumnType[]> {
  const { data, error } = await supabase
    .from('information_schema.columns')
    .select('table_name, column_name, data_type, is_nullable, column_default')
    .eq('table_schema', 'public');

  if (error || !data) {
    throw new Error(`Failed to fetch column types: ${error?.message || 'Unknown error'}`);
  }

  // Assert the type of 'data' as InformationSchemaColumn[]
  const columns = data as InformationSchemaColumn[];

  return columns.map((column): ColumnType => ({
    tableName: column.table_name,
    columnName: column.column_name,
    dataType: column.data_type,
    isNullable: column.is_nullable === 'YES',
    hasDefault: column.column_default !== null,
  }));
}

interface TypeValidationResult {
  table: string;
  column: string;
  valid: boolean;
  issues: string[];
}

function validateTypeConsistency(columns: ColumnType[]): TypeValidationResult[] {
  const typeRules: Record<
    string,
    { expectedType: string; nullable: boolean; requireDefault: boolean }
  > = {
    id: {
      expectedType: 'uuid',
      nullable: false,
      requireDefault: true,
    },
    created_at: {
      expectedType: 'timestamp with time zone',
      nullable: false,
      requireDefault: true,
    },
    updated_at: {
      expectedType: 'timestamp with time zone',
      nullable: false,
      requireDefault: true,
    },
    email: {
      expectedType: 'character varying',
      nullable: false,
      requireDefault: false,
    },
  };

  return columns
    .map((column) => {
      const rule = typeRules[column.columnName];
      if (!rule) return null;

      const issues: string[] = [];
      if (column.dataType !== rule.expectedType) {
        issues.push(`Expected type ${rule.expectedType}, got ${column.dataType}`);
      }
      if (column.isNullable !== rule.nullable) {
        issues.push(`Expected nullable=${rule.nullable}, got ${column.isNullable}`);
      }
      if (column.hasDefault !== rule.requireDefault) {
        issues.push(`Expected default=${rule.requireDefault}, got ${column.hasDefault}`);
      }

      return {
        table: column.tableName,
        column: column.columnName,
        valid: issues.length === 0,
        issues,
      };
    })
    .filter((result): result is TypeValidationResult => result !== null);
}

interface EnumValidationResult {
  table: string;
  column: string;
  recommendation: string;
  impact: string;
}

function validateEnumTypes(columns: ColumnType[]): EnumValidationResult[] {
  const enumColumns = columns.filter((col) => col.dataType === 'USER-DEFINED');

  return enumColumns.map((column) => ({
    table: column.tableName,
    column: column.columnName,
    recommendation:
      'Consider using a check constraint instead of enum type for better flexibility',
    impact: 'Medium - Enums are harder to modify in production',
  }));
}