import { createClient } from '@supabase/supabase-js';
import { ValidationResult } from '../types';

// Interfaces
interface DatabaseFunction {
  name: string;
  returnType: string;
  arguments: string;
  volatility: string;
  security: string;
  definition: string;
}

interface SecurityValidationResult {
  function: string;
  valid: boolean;
  issues: Array<{
    issue: string;
    severity: string;
    recommendation: string;
  }>;
}

interface PerformanceValidationResult {
  function: string;
  valid: boolean;
  issues: Array<{
    issue: string;
    recommendation: string;
    impact: string;
  }>;
}

// Main Validation Function
export async function validate(supabase: ReturnType<typeof createClient>): Promise<ValidationResult> {
  try {
    const functions = await fetchDatabaseFunctions(supabase);
    const securityValidation = validateFunctionSecurity(functions);
    const performanceValidation = validateFunctionPerformance(functions);

    const errors = [];
    const warnings = [];

    // Process security validation results
    for (const result of securityValidation) {
      if (!result.valid) {
        result.issues.forEach(issue => {
          const message = {
            file: result.function,
            line: 0,
            message: `${issue.issue}: ${issue.recommendation}`,
            severity: issue.severity === 'critical' ? 'error' : 'warning',
            code: 'FUNCTION_SECURITY_ISSUE'
          };
          issue.severity === 'critical' ? errors.push(message) : warnings.push(message);
        });
      }
    }

    // Process performance validation results
    for (const result of performanceValidation) {
      if (!result.valid) {
        result.issues.forEach(issue => {
          warnings.push({
            file: result.function,
            line: 0,
            message: `${issue.issue}: ${issue.recommendation} (Impact: ${issue.impact})`,
            severity: 'warning',
            code: 'FUNCTION_PERFORMANCE_ISSUE'
          });
        });
      }
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
        message: `Failed to validate database functions: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
        code: 'FUNCTION_VALIDATION_FAILED'
      }],
      warnings: []
    };
  }
}

// Helper Functions
async function fetchDatabaseFunctions(supabase: ReturnType<typeof createClient>): Promise<DatabaseFunction[]> {
  const { data: functions, error } = await supabase
    .from('information_schema.routines')
    .select(`
      routine_name,
      data_type,
      routine_definition,
      external_language,
      security_type,
      volatility
    `)
    .eq('routine_schema', 'public');

  if (error) {
    throw new Error(`Failed to fetch database functions: ${error.message}`);
  }

  return functions.map((func): DatabaseFunction => ({
    name: func.routine_name,
    returnType: func.data_type,
    arguments: func.routine_definition.split('(')[1]?.split(')')[0] || '',
    volatility: func.volatility,
    security: func.security_type,
    definition: func.routine_definition,
  }));
}

function validateFunctionSecurity(functions: DatabaseFunction[]): SecurityValidationResult[] {
  const securityChecks = [
    {
      pattern: /SECURITY DEFINER/i,
      description: 'Security definer usage',
      severity: 'high',
      recommendation: 'Use SECURITY INVOKER unless absolutely necessary',
    },
    {
      pattern: /EXECUTE\s+IMMEDIATE/i,
      description: 'Dynamic SQL execution',
      severity: 'critical',
      recommendation: 'Avoid dynamic SQL to prevent SQL injection',
    },
  ];

  return functions.map(func => {
    const issues = securityChecks
      .filter(check => check.pattern.test(func.definition))
      .map(check => ({
        issue: check.description,
        severity: check.severity,
        recommendation: check.recommendation,
      }));

    return {
      function: func.name,
      valid: issues.length === 0,
      issues,
    };
  });
}

function validateFunctionPerformance(functions: DatabaseFunction[]): PerformanceValidationResult[] {
  return functions.map(func => {
    const issues = [];

    if (func.volatility === 'VOLATILE' && !func.name.includes('update')) {
      issues.push({
        issue: 'Function marked as VOLATILE',
        recommendation: 'Consider using STABLE or IMMUTABLE if function is deterministic',
        impact: 'Medium - May affect query planning and caching',
      });
    }

    if (func.definition.includes('SELECT *')) {
      issues.push({
        issue: 'Using SELECT *',
        recommendation: 'Explicitly list required columns',
        impact: 'Low - May affect performance and maintainability',
      });
    }

    return {
      function: func.name,
      valid: issues.length === 0,
      issues,
    };
  });
}