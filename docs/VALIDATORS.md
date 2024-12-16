# Validators Documentation

## Directory Structure
```
scripts/
├── validators/
│   ├── database-validator.ts
│   ├── function-validator.ts
│   ├── index-validator.ts
│   ├── migration-validator.ts
│   ├── rls-validator.ts
│   ├── type-validator.ts
│   └── typescript-validator.ts
└── types.ts
```

## Validator Files Overview

### 1. `database-validator.ts`
**Purpose**: Validates database constraints and table relationships.

**Imports**:
```typescript
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';
import { DatabaseValidationResult } from '../types';
```

**Key Functions**:
- `validateDatabaseConstraints(supabase: SupabaseClient<Database>): Promise<DatabaseConstraint[]>`
- `validateRequiredConstraints(constraints: DatabaseConstraint[]): Promise<DatabaseValidationResult[]>`

### 2. `function-validator.ts`
**Purpose**: Validates database functions and their security configurations.

**Imports**:
```typescript
import { createClient } from '@supabase/supabase-js';
```

**Key Functions**:
- `validateDatabaseFunctions(supabase: ReturnType<typeof createClient>)`
- `validateFunctionSecurity(functions: DatabaseFunction[])`

### 3. `index-validator.ts`
**Purpose**: Validates database indexes and their efficiency.

**Imports**:
```typescript
import { createClient } from '@supabase/supabase-js';
```

**Key Functions**:
- `validateDatabaseIndexes(supabase: ReturnType<typeof createClient>)`
- `validateRequiredIndexes(indexes: DatabaseIndex[])`
- `validateIndexEfficiency(indexes: DatabaseIndex[])`

### 4. `migration-validator.ts`
**Purpose**: Validates migration files and their content.

**Imports**:
```typescript
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';
import { ValidationResult, ValidationError, ValidationContext } from '../types';
```

**Key Functions**:
- `validate(migrationsDir: string): Promise<ValidationResult>`
- `validateFile(file: string, content: string): ValidationError[]`

### 5. `rls-validator.ts`
**Purpose**: Validates Row Level Security (RLS) policies.

**Imports**:
```typescript
import { createClient } from '@supabase/supabase-js';
```

**Key Functions**:
- `validateRLSPolicies(supabase: ReturnType<typeof createClient>)`
- `validateRequiredRLSPolicies(policies: RLSPolicy[])`
- `validatePolicyDefinitions(policies: RLSPolicy[])`

### 6. `type-validator.ts`
**Purpose**: Validates column types and type consistency.

**Imports**:
```typescript
import { createClient } from '@supabase/supabase-js';
```

**Key Functions**:
- `validateColumnTypes(supabase: ReturnType<typeof createClient>)`
- `validateTypeConsistency(columns: ColumnType[])`
- `validateEnumTypes(columns: ColumnType[])`

### 7. `typescript-validator.ts`
**Purpose**: Validates TypeScript code and type definitions.

**Imports**:
```typescript
import { ValidationResult } from '../types';
import { exec } from 'child_process';
import { promisify } from 'util';
```

**Key Functions**:
- `validate(directory: string): Promise<ValidationResult>`
- `parseTypeScriptErrors(output: string)`

## Validator Template

Each validator should follow this template structure:

```typescript
// 1. Imports
import { createClient } from '@supabase/supabase-js';
import { ValidationResult } from '../types';

// 2. Interfaces
interface ValidatorSpecificType {
  // Type definition
}

// 3. Main Validation Function
export async function validateSpecificFeature(
  supabase: ReturnType<typeof createClient>
): Promise<ValidationResult> {
  try {
    // Validation logic
    return {
      isValid: true,
      errors: [],
      warnings: []
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [{
        file: 'unknown',
        line: 0,
        message: `Validation failed: ${error.message}`,
        severity: 'error',
        code: 'VALIDATION_FAILED'
      }],
      warnings: []
    };
  }
}

// 4. Helper Functions
function helperFunction() {
  // Helper logic
}
```

## Common Validation Result Structure

All validators should return results following this structure:

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

interface ValidationError {
  file: string;
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
  context?: Record<string, unknown>;
}
```

## Best Practices

1. **Error Handling**:
   - Always wrap database queries in try-catch blocks
   - Return meaningful error messages
   - Include context in error objects

2. **Validation Logic**:
   - Keep validation functions pure and focused
   - Separate concerns between different validators
   - Use meaningful error codes and messages

3. **Performance**:
   - Batch database queries where possible
   - Use efficient data structures for validation
   - Cache results when appropriate

4. **Extensibility**:
   - Keep validation rules configurable
   - Use interfaces for type definitions
   - Follow consistent naming conventions

5. **Testing**:
   - Write unit tests for each validator
   - Include edge cases in test coverage
   - Mock database calls in tests