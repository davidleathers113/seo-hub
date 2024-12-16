import { SupabaseClient } from '@supabase/supabase-js';
import { ValidationResult, ValidationError, ValidationSeverity } from '../types';

export enum ConstraintType {
  PrimaryKey = 'PRIMARY KEY',
  ForeignKey = 'FOREIGN KEY',
  Unique = 'UNIQUE',
  Check = 'CHECK',
  NotNull = 'NOT NULL'
}

interface DatabaseConstraint {
  table_name: string;
  constraint_name: string;
  constraint_type: ConstraintType;
  definition?: string;
  referenced_table?: string;
  referenced_column?: string;
}

interface TableConstraintConfig {
  required: string[];
  recommended?: string[];
  foreignKeys?: Array<{
    name: string;
    referencedTable: string;
    referencedColumn: string;
  }>;
}

const tableConstraints: Record<string, TableConstraintConfig> = {
  users: {
    required: ['users_pkey', 'users_email_key'],
    recommended: ['users_username_key'],
    foreignKeys: []
  },
  profiles: {
    required: ['profiles_pkey', 'fk_profiles_user'],
    foreignKeys: [
      {
        name: 'fk_profiles_user',
        referencedTable: 'users',
        referencedColumn: 'id',
      },
    ],
  },
  workspaces: {
    required: ['workspaces_pkey', 'fk_workspaces_owner'],
    foreignKeys: [
      {
        name: 'fk_workspaces_owner',
        referencedTable: 'users',
        referencedColumn: 'id',
      },
    ],
  },
};

export async function validateDatabaseConstraints(
  supabase: SupabaseClient
): Promise<ValidationResult> {
  try {
    // Fetch constraints from information_schema
    const { data: constraintsData, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('table_name, constraint_name, constraint_type')
      .eq('constraint_schema', 'public');

    if (constraintsError || !constraintsData) {
      throw new Error(`Failed to fetch constraints: ${constraintsError?.message || 'Unknown error'}`);
    }

    const { data: keyUsageData, error: keyUsageError } = await supabase
      .from('information_schema.key_column_usage')
      .select('constraint_name, table_name, column_name, referenced_table_name, referenced_column_name')
      .eq('constraint_schema', 'public');

    if (keyUsageError || !keyUsageData) {
      throw new Error(`Failed to fetch key column usage: ${keyUsageError?.message || 'Unknown error'}`);
    }

    // Map constraints and foreign keys
    const constraintsMap = new Map<string, DatabaseConstraint>();

    constraintsData.forEach((constraint) => {
      constraintsMap.set(constraint.constraint_name, {
        table_name: constraint.table_name,
        constraint_name: constraint.constraint_name,
        constraint_type: constraint.constraint_type as ConstraintType,
      });
    });

    keyUsageData.forEach((keyUsage) => {
      const constraint = constraintsMap.get(keyUsage.constraint_name);
      if (constraint && constraint.constraint_type === ConstraintType.ForeignKey) {
        constraint.referenced_table = keyUsage.referenced_table_name;
        constraint.referenced_column = keyUsage.referenced_column_name;
      }
    });

    const dbConstraints = Array.from(constraintsMap.values());

    // Validate constraints based on the configuration
    const tableResults = Object.entries(tableConstraints).map(([table, config]) => {
      const tableConstraints = dbConstraints.filter((c) => c.table_name === table);
      const missingRequired = config.required.filter(
        (required) => !tableConstraints.some((c) => c.constraint_name === required)
      );

      const missingRecommended =
        config.recommended?.filter(
          (recommended) => !tableConstraints.some((c) => c.constraint_name === recommended)
        ) || [];

      const invalidForeignKeys = (config.foreignKeys || []).filter((fk) => {
        const constraint = tableConstraints.find((c) => c.constraint_name === fk.name);
        return (
          !constraint ||
          constraint.constraint_type !== ConstraintType.ForeignKey ||
          constraint.referenced_table !== fk.referencedTable ||
          constraint.referenced_column !== fk.referencedColumn
        );
      });

      const missing = [
        ...missingRequired.map((name) => `required: ${name}`),
        ...missingRecommended.map((name) => `recommended: ${name}`),
        ...invalidForeignKeys.map(
          (fk) => `invalid foreign key: ${fk.name} -> ${fk.referencedTable}(${fk.referencedColumn})`
        ),
      ];

      return {
        table,
        missing,
        severity: missingRequired.length > 0 ? 'error' : 'warning',
        context: {},
      };
    });

    const errors = tableResults
      .filter((result) => result.severity === 'error')
      .flatMap((result) =>
        result.missing.map((issue) => ({
          file: result.table,
          line: 0,
          message: issue,
          severity: 'error' as ValidationSeverity,
          code: issue.startsWith('invalid foreign key') ? 'INVALID_FOREIGN_KEY' : 'MISSING_REQUIRED_CONSTRAINT',
          context: result.context,
        }))
      );

    const warnings = tableResults
      .filter((result) => result.severity === 'warning')
      .flatMap((result) =>
        result.missing.map((issue) => ({
          file: result.table,
          line: 0,
          message: issue,
          severity: 'warning' as ValidationSeverity,
          code: 'MISSING_RECOMMENDED_CONSTRAINT',
          context: result.context,
        }))
      );

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
          message: `Database constraint validation failed: ${message}`,
          severity: 'error',
          code: 'VALIDATION_FAILED',
        },
      ],
      warnings: [],
    };
  }
}
