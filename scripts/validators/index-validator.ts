import { SupabaseClient } from '@supabase/supabase-js';
import { ValidationResult, ValidationSeverity } from '../types';

interface TableIndexConfig {
  required: string[];
}

const tableIndexes: Record<string, TableIndexConfig> = {
  app_users: {
    required: ['email', 'created_at']
  },
  profiles: {
    required: ['user_id', 'updated_at']
  }
};

export async function validate(
  supabase: SupabaseClient
): Promise<ValidationResult> {
  try {
    // Fetch indexes using validation view
    const { data: indexData, error: indexError } = await supabase
      .from('validation_indexes')
      .select('*');

    if (indexError || !indexData) {
      throw new Error(`Failed to fetch indexes: ${indexError?.message || 'Unknown error'}`);
    }

    const errors: any[] = [];
    const warnings: any[] = [];

    // Check for required indexes
    Object.entries(tableIndexes).forEach(([table, config]) => {
      const tableIndexes = indexData.filter((idx: any) => idx.table_name === table);
      const missingIndexes = config.required.filter(
        (required) => !tableIndexes.some((idx: any) => idx.column_name === required)
      );

      if (missingIndexes.length > 0) {
        errors.push({
          file: table,
          line: 0,
          message: `Missing required indexes: ${missingIndexes.join('; ')}`,
          severity: 'error' as ValidationSeverity,
          code: 'MISSING_REQUIRED_INDEX',
          context: {},
        });
      }
    });

    // Check index naming convention
    indexData.forEach((idx: any) => {
      if (idx && idx.table_name && idx.column_name) {
        const expectedPattern = `idx_${idx.table_name}_${idx.column_name}`;
        if (idx.indexname !== expectedPattern) {
          warnings.push({
            file: idx.migration_file || 'unknown',
            line: idx.line_number || 0,
            message: `Index name should follow pattern: idx_{table}_{column(s)}`,
            severity: 'warning' as ValidationSeverity,
            code: 'INVALID_INDEX_NAME',
            context: {
              indexName: idx.indexname,
              expectedPattern,
            },
          });
        }
      }
    });

    // Check for potentially redundant indexes
    const indexesByTable = indexData.reduce((acc: any, idx: any) => {
      if (!acc[idx.table_name]) {
        acc[idx.table_name] = [];
      }
      if (idx.column_name) {
        acc[idx.table_name].push(idx.column_name);
      }
      return acc;
    }, {});

    Object.entries(indexesByTable).forEach(([table, columns]: [string, any]) => {
      if (Array.isArray(columns)) {
        const sortedColumns = columns.sort();
        for (let i = 0; i < sortedColumns.length; i++) {
          for (let j = i + 1; j < sortedColumns.length; j++) {
            if (sortedColumns[i] && sortedColumns[j] && sortedColumns[j].startsWith(sortedColumns[i])) {
              warnings.push({
                file: table,
                line: 0,
                message: `Potentially redundant index: Other indexes starting with ${sortedColumns[i]} exist`,
                severity: 'warning' as ValidationSeverity,
                code: 'INDEX_EFFICIENCY_ISSUE',
                context: {
                  table,
                  column: sortedColumns[i],
                },
              });
            }
          }
        }
      }
    });

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
          message: `Index validation failed: ${message}`,
          severity: 'error',
          code: 'VALIDATION_FAILED',
        },
      ],
      warnings: [],
    };
  }
}
