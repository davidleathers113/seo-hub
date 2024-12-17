# Database Validation System Enhancement

## Core Problem
We're working on fixing validation issues in the database migration system, specifically:
1. Inability to access system tables for validation
2. Missing ON DELETE clauses in foreign keys
3. Incorrect policy and index naming patterns

## Current Implementation Status

### Completed Work
1. Created series of migrations to fix issues:
   - 20240326000000_fix_validation_issues.sql: Fixed ON DELETE clauses
   - 20240326000001_grant_validator_access.sql: Granted system table access
   - 20240326000002_add_exec_function.sql: Added exec function
   - 20240326000003_setup_validation_helpers.sql: Created validation views

2. Updated validators to use helper views:
   - rls-validator.ts: Uses validation_policies view
   - type-validator.ts: Uses validation_columns view
   - index-validator.ts: Uses validation_indexes view

### Current Issues
1. Views not accessible:
   ```
   relation "public.validation_policies" does not exist
   relation "public.validation_columns" does not exist
   relation "public.validation_indexes" does not exist
   ```

2. Function not found:
   ```
   Could not find the function public.exec(query) in the schema cache
   ```

## Key Files

### Migrations
1. `supabase/migrations/20240326000001_grant_validator_access.sql`
   - Grants SELECT permissions on system tables
   - Working correctly

2. `supabase/migrations/20240326000002_add_exec_function.sql`
   - Creates exec function for dynamic SQL
   - Returns TABLE (result json)
   - Appears to be working

3. `supabase/migrations/20240326000003_setup_validation_helpers.sql`
   - Creates helper views
   - Currently failing to create views properly

### Validators
1. `scripts/validators/rls-validator.ts`
   - Validates RLS policies
   - Updated to use validation_policies view
   - Added type safety with type guards

2. `scripts/validators/type-validator.ts`
   - Validates column types
   - Updated to use validation_columns view
   - Added type safety

3. `scripts/validators/index-validator.ts`
   - Validates index naming and structure
   - Updated to use validation_indexes view
   - Added type safety

## Technical Context

### System Table Access
- Need access to:
  - pg_catalog.pg_policies
  - information_schema.columns
  - pg_catalog.pg_indexes
  - information_schema.table_constraints

### Helper Views
- validation_policies: Maps pg_policies for RLS validation
- validation_columns: Maps information_schema.columns for type validation
- validation_indexes: Maps pg_indexes for index validation

### Exec Function
- Purpose: Execute dynamic SQL with JSON results
- Security: Uses SECURITY DEFINER
- Search Path: Set to public schema

## Next Steps

1. Debug View Creation
   - Verify SQL syntax in setup_validation_helpers.sql
   - Check if views are being created in correct schema
   - Verify permissions after view creation

2. Verify Function Access
   - Check if exec function is accessible to service_role
   - Verify function signature matches validator expectations

3. Test Individual Components
   - Test system table access directly
   - Test exec function with simple query
   - Test view creation separately

## Failed Approaches
1. Using direct system table access (failed due to permissions)
2. Using REST API calls (too complex, preferred direct DB access)
3. Multiple exec function implementations (settled on JSON results)

## Developer Notes

### Important Considerations
1. Order of operations is critical:
   - Grant permissions first
   - Create exec function
   - Create views last

2. Type safety:
   - All validators now use type guards
   - Runtime validation of query results
   - Proper TypeScript interfaces

3. Permissions:
   - service_role needs SELECT on system tables
   - service_role needs EXECUTE on exec function
   - service_role needs SELECT on helper views

### Areas Needing Attention
1. View creation in setup_validation_helpers.sql
2. Function schema caching issue
3. Permission verification after migration
