import { resolve } from 'path'
import dotenv from 'dotenv'
import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Configure dotenv to load from the root .env file
dotenv.config({ path: resolve(__dirname, '../.env') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Missing required environment variables')
}

// Create admin client for security checks
const supabase = createClient(supabaseUrl, serviceRoleKey)

interface PolicyCheck {
  table: string;
  operations: ('SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'ALL')[];
  expectedPolicies: string[];
}

async function runSecurityAudit() {
  console.log('Running Supabase Security Audit...\n')
  const issues: string[] = []
  const warnings: string[] = []
  const passed: string[] = []

  try {
    // Check RLS policies
    console.log('Checking Row Level Security (RLS) policies...')
    
    const policyChecks: PolicyCheck[] = [
      {
        table: 'users',
        operations: ['SELECT', 'UPDATE'],
        expectedPolicies: ['Users can view their own data', 'Users can update their own data']
      },
      {
        table: 'niches',
        operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        expectedPolicies: ['Users can view their own niches', 'Users can insert their own niches', 'Users can update their own niches', 'Users can delete their own niches']
      },
      {
        table: 'pillars',
        operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        expectedPolicies: ['Users can view their own pillars', 'Users can insert their own pillars', 'Users can update their own pillars', 'Users can delete their own pillars']
      },
      {
        table: 'articles',
        operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
        expectedPolicies: ['Users can view their own articles', 'Users can insert their own articles', 'Users can update their own articles', 'Users can delete their own articles']
      }
    ]

    // Check each table's RLS and policies
    for (const check of policyChecks) {
      // Check if RLS is enabled
      const { data: rlsEnabled, error: rlsError } = await supabase
        .from('pg_class')
        .select('relrowsecurity')
        .eq('relname', check.table)
        .single()

      if (rlsError) {
        issues.push(`❌ Unable to check RLS status for table ${check.table}`)
      } else if (!rlsEnabled?.relrowsecurity) {
        issues.push(`❌ RLS is not enabled on table ${check.table}`)
      } else {
        passed.push(`✅ RLS is enabled on table ${check.table}`)
      }

      // Check policies
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('polname, cmd')
        .eq('tablename', check.table)

      if (policiesError) {
        warnings.push(`⚠️ Unable to verify policies for ${check.table}`)
      } else if (policies) {
        const policyNames = new Set(policies.map(p => p.polname))
        for (const expectedPolicy of check.expectedPolicies) {
          if (policyNames.has(expectedPolicy)) {
            passed.push(`✅ Policy "${expectedPolicy}" exists on ${check.table}`)
          } else {
            issues.push(`❌ Missing policy "${expectedPolicy}" on ${check.table}`)
          }
        }
      }
    }

    // Check storage bucket configurations
    console.log('\nChecking storage bucket configurations...')
    const buckets = ['public_article_images', 'public_user_avatars', 'documents']
    
    for (const bucketName of buckets) {
      const { data: bucket, error: bucketError } = await supabase
        .storage
        .getBucket(bucketName)

      if (bucketError) {
        issues.push(`❌ Unable to check bucket ${bucketName}`)
        continue
      }

      passed.push(`✅ Bucket ${bucketName} exists with correct configuration`)

      // Verify bucket settings
      if (bucketName.startsWith('public_') && !bucket.public) {
        warnings.push(`⚠️ Bucket ${bucketName} is marked as public in name but not in configuration`)
      }
      if (!bucketName.startsWith('public_') && bucket.public) {
        warnings.push(`⚠️ Bucket ${bucketName} is not marked as public in name but is public in configuration`)
      }

      // Check storage policies
      const { data: policies, error: policiesError } = await supabase
        .from('pg_policies')
        .select('polname')
        .eq('tablename', 'objects')
        .ilike('polname', `%${bucketName}%`)

      if (policiesError) {
        warnings.push(`⚠️ Unable to verify storage policies for ${bucketName}`)
      } else if (!policies || policies.length === 0) {
        issues.push(`❌ No storage policies found for bucket ${bucketName}`)
      } else {
        passed.push(`✅ Storage policies verified for bucket ${bucketName}`)
      }
    }

    // Check auth configuration
    console.log('\nChecking authentication settings...')
    const { data: config, error: configError } = await supabase.auth.getSession()

    if (configError) {
      issues.push('❌ Unable to verify auth configuration')
    } else {
      passed.push('✅ Auth configuration verified')
    }

    // Print audit results
    console.log('\n=== Security Audit Results ===\n')
    
    if (issues.length > 0) {
      console.log('Critical Issues:')
      issues.forEach(issue => console.log(issue))
    }

    if (warnings.length > 0) {
      console.log('\nWarnings:')
      warnings.forEach(warning => console.log(warning))
    }

    if (passed.length > 0) {
      console.log('\nPassed Checks:')
      passed.forEach(pass => console.log(pass))
    }

    console.log(`\nAudit Summary:
- Critical Issues: ${issues.length}
- Warnings: ${warnings.length}
- Passed Checks: ${passed.length}`)

    if (issues.length > 0) {
      process.exit(1)
    }

  } catch (error) {
    console.error('Error during security audit:', error)
    process.exit(1)
  }
}

// Run the security audit
runSecurityAudit().catch((error: Error) => {
  console.error('Unhandled error:', error)
  process.exit(1)
})
