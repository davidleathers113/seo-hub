import { createClient } from '@supabase/supabase-js';
import { ValidationResult, ValidationError, ValidationSeverity } from '../types';

// Interfaces
interface RLSPolicy {
  tableName: string;
  policyName: string;
  operation: string;
  definition: string;
  roles: string[];
}

interface PolicyValidationResult {
  table: string;
  valid: boolean;
  missing: Array<{
    operation: string;
    roles: string[];
  }>;
}

interface PolicySecurityResult {
  policy: string;
  table: string;
  operation: string;
  checks: Array<{
    check: string;
    passed: boolean;
    warning: boolean;
  }>;
  valid: boolean;
}

interface PolicyData {
  tablename: string;
  policyname: string;
  operation: string;
  definition: string;
  roles: string[];
}

// Main Validation Function
export async function validate(supabase: ReturnType<typeof createClient>): Promise<ValidationResult> {
  try {
    const policies = await fetchRLSPolicies(supabase);
    const requiredValidation = validateRequiredPolicies(policies);
    const securityValidation = validatePolicyDefinitions(policies);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];

    // Process required policy validation results
    for (const result of requiredValidation) {
      if (!result.valid) {
        errors.push({
          file: result.table,
          line: 0,
          message: `Missing required policies: ${result.missing.map(m =>
            `${m.operation} for roles [${m.roles.join(', ')}]`).join('; ')}`,
          severity: 'error' as ValidationSeverity,
          code: 'MISSING_REQUIRED_POLICY'
        });
      }
    }

    // Process security validation results
    for (const result of securityValidation) {
      if (!result.valid) {
        result.checks
          .filter(check => !check.passed)
          .forEach(check => {
            const issue: ValidationError = {
              file: result.table,
              line: 0,
              message: `Policy '${result.policy}' failed check: ${check.check}`,
              severity: check.warning ? 'warning' as ValidationSeverity : 'error' as ValidationSeverity,
              code: 'POLICY_SECURITY_CHECK'
            };
            check.warning ? warnings.push(issue) : errors.push(issue);
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
        message: `Failed to validate RLS policies: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error' as ValidationSeverity,
        code: 'RLS_VALIDATION_FAILED'
      }],
      warnings: []
    };
  }
}

// Helper Functions
async function fetchRLSPolicies(supabase: ReturnType<typeof createClient>): Promise<RLSPolicy[]> {
  const { data: policies, error } = await supabase
    .from('pg_policies')
    .select(`
      tablename,
      policyname,
      operation,
      definition,
      roles
    `)
    .eq('schemaname', 'public');

  if (error) {
    throw new Error(`Failed to fetch RLS policies: ${error.message}`);
  }

  return (policies as PolicyData[]).map((policy): RLSPolicy => ({
    tableName: policy.tablename,
    policyName: policy.policyname,
    operation: policy.operation,
    definition: policy.definition,
    roles: policy.roles,
  }));
}

function validateRequiredPolicies(policies: RLSPolicy[]): PolicyValidationResult[] {
  const requiredPolicies = {
    'users': [
      { operation: 'SELECT', roles: ['authenticated'] },
      { operation: 'UPDATE', roles: ['authenticated'] },
    ],
    'profiles': [
      { operation: 'SELECT', roles: ['authenticated'] },
      { operation: 'INSERT', roles: ['authenticated'] },
      { operation: 'UPDATE', roles: ['authenticated'] },
    ],
  };

  return Object.entries(requiredPolicies).map(([tableName, required]) => {
    const tablePolicies = policies.filter(p => p.tableName === tableName);

    const missing = required.filter(req => {
      return !tablePolicies.some(policy =>
        policy.operation === req.operation &&
        req.roles.every(role => policy.roles.includes(role))
      );
    });

    return {
      table: tableName,
      valid: missing.length === 0,
      missing,
    };
  });
}

function validatePolicyDefinitions(policies: RLSPolicy[]): PolicySecurityResult[] {
  const securityChecks = [
    {
      pattern: /auth.uid\s*=/,
      description: 'User ID check',
      required: true,
      warning: false,
    },
    {
      pattern: /OR|ANY/,
      description: 'Potentially dangerous OR conditions',
      required: false,
      warning: true,
    },
  ];

  return policies.map(policy => {
    const checkResults = securityChecks.map(check => {
      const matches = check.pattern.test(policy.definition);
      return {
        check: check.description,
        passed: check.required ? matches : !matches,
        warning: check.warning && matches,
      };
    });

    return {
      policy: policy.policyName,
      table: policy.tableName,
      operation: policy.operation,
      checks: checkResults,
      valid: checkResults.every(r => r.passed || r.warning),
    };
  });
}
