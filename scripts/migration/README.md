# MongoDB to Supabase Migration Guide

This directory contains scripts and instructions for migrating from MongoDB to Supabase.

## Prerequisites

1. Supabase Project
   - Create a new Supabase project at https://app.supabase.com
   - Get your project URL and API keys
   - Create a `.env` file with the following variables:
     ```
     NEXT_PUBLIC_SUPABASE_URL=your_project_url
     NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
     SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
     ```

2. Dependencies
   - Install required packages:
     ```bash
     npm install @supabase/supabase-js dotenv glob
     ```

## Migration Steps

1. **Prepare Database Schema**
   - The schema is defined in `supabase/migrations/20240101000000_initial_schema.sql`
   - Apply this schema to your Supabase project using the Supabase Dashboard SQL Editor

2. **Migrate Data**
   - Run the data migration script:
     ```bash
     npx ts-node scripts/migration/migrate-to-supabase.ts
     ```
   - This will transfer all data from MongoDB to Supabase
   - Check the console output for any errors

3. **Update Code References**
   - Run the reference update script:
     ```bash
     npx ts-node scripts/migration/update-references.ts
     ```
   - This will:
     - Create backups of modified files (*.bak)
     - Update MongoDB patterns to Supabase equivalents
     - Log all changes made

4. **Manual Review**
   - Review all modified files
   - Check for any remaining MongoDB references
   - Update test files to use Supabase
   - Update environment variables in deployment configs

5. **Testing**
   - Run the test suite to ensure everything works
   - Test authentication flows
   - Verify data access and permissions

## Rollback Plan

If issues occur during migration:

1. Restore MongoDB
   - Keep MongoDB running until migration is verified
   - Backup data is preserved in the original database

2. Restore Code
   - Use the .bak files created during the update process
   - Run `find . -name "*.bak" -exec sh -c 'mv "$1" "${1%.bak}"' _ {} \;`

## Post-Migration

1. Clean up:
   - Remove MongoDB dependencies
   - Remove MongoDB configuration files
   - Update documentation

2. Update CI/CD:
   - Update environment variables
   - Update deployment scripts
   - Update test configurations

## Troubleshooting

Common issues and solutions:

1. **Data Type Mismatches**
   - MongoDB ObjectIds are converted to UUID strings
   - Dates are converted to ISO strings
   - Check data types in Supabase schema

2. **Authentication Issues**
   - Verify Supabase API keys
   - Check RLS policies
   - Test user authentication flows

3. **Performance Issues**
   - Review indexes in Supabase
   - Check query patterns
   - Monitor Supabase dashboard

For additional help, consult:
- Supabase Documentation: https://supabase.com/docs
- Project maintainers
- Migration script logs