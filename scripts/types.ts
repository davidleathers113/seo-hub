export type ValidationSeverity = 'error' | 'warning' | 'info';

export interface ValidationError {
  file: string;
  line: number;
  message: string;
  severity: ValidationSeverity;
  code: string;
  context?: Record<string, unknown>;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidationContext {
  schemaName: string;
  migrationPath: string;
  srcPath: string;
}

export interface DatabaseValidationResult {
  table: string;
  valid: boolean;
  missing: string[];
  severity: ValidationSeverity;
  context?: {
    requiredConstraints?: string[];
    recommendedConstraints?: string[];
    foreignKeyConstraints?: Array<{
      name: string;
      referencedTable: string;
      referencedColumn: string;
    }>;
  };
}

export interface RLSValidationResult {
  table: string;
  valid: boolean;
  missing: string[];
  severity: ValidationSeverity;
  policies?: {
    name: string;
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE';
    using?: string;
    with_check?: string;
    roles?: string[];
  }[];
}

export interface TypeValidationResult {
  type: string;
  valid: boolean;
  issues: string[];
  severity: ValidationSeverity;
  context?: {
    expectedType?: string;
    actualType?: string;
    location?: string;
  };
}

export interface FunctionValidationResult {
  function: string;
  valid: boolean;
  issues: string[];
  severity: ValidationSeverity;
  context?: {
    parameters?: string[];
    returnType?: string;
    security?: 'INVOKER' | 'DEFINER';
    volatility?: 'VOLATILE' | 'STABLE' | 'IMMUTABLE';
  };
}

export interface IndexValidationResult {
  table: string;
  valid: boolean;
  issues: string[];
  severity: ValidationSeverity;
  context?: {
    missingIndexes?: Array<{
      columns: string[];
      type?: 'BTREE' | 'HASH' | 'GiST' | 'GIN';
      where?: string;
    }>;
    suboptimalIndexes?: Array<{
      name: string;
      reason: string;
      suggestion: string;
    }>;
  };
}

export interface ValidationStats {
  totalTables: number;
  tablesWithIssues: number;
  constraintIssues: number;
  rlsIssues: number;
  typeIssues: number;
  functionIssues: number;
  indexIssues: number;
  severity: {
    error: number;
    warning: number;
    info: number;
  };
}
