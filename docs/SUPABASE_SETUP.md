# Supabase Integration Setup Guide

This guide will help you set up Supabase as the database backend for the Content Creation App.

## Prerequisites

1. Create a Supabase account at https://supabase.com
2. Create a new Supabase project
3. Install the Supabase CLI (optional, for local development)

## Setup Steps

1. **Create Supabase Project**
   - Go to https://app.supabase.com
   - Click "New Project"
   - Fill in your project details
   - Note down your project URL and anon key

2. **Initialize Database Schema**
   - Navigate to the SQL editor in your Supabase dashboard
   - Copy the contents of `server/database/migrations/001_initial_schema.sql`
   - Paste and execute in the SQL editor

3. **Environment Variables**
   Add the following environment variables to your `.env` file:

   ```bash
   # Supabase Configuration
   SUPABASE_URL=your_project_url
   SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Update Database Configuration**
   The application is now configured to use Supabase by default. The database client will automatically use the Supabase implementation when the environment variables are present.

## Row Level Security (RLS) Policies

For enhanced security, implement the following RLS policies in your Supabase dashboard:

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE niches ENABLE ROW LEVEL SECURITY;
ALTER TABLE pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE subpillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE research ENABLE ROW LEVEL SECURITY;
ALTER TABLE outlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Niches policies
CREATE POLICY "Users can CRUD their own niches" ON niches
  FOR ALL USING (auth.uid() = user_id);

-- Pillars policies
CREATE POLICY "Users can CRUD pillars they created" ON pillars
  FOR ALL USING (auth.uid() = created_by_id);

-- Similar policies for other tables...
```

## Testing the Integration

1. **Verify Connection**
   ```typescript
   import { supabase } from '../config/supabase';
   
   async function testConnection() {
     const { data, error } = await supabase.from('users').select('count');
     if (error) {
       console.error('Connection failed:', error);
     } else {
       console.log('Connection successful');
     }
   }
   ```

2. **Run Integration Tests**
   ```bash
   npm test
   ```

## Troubleshooting

1. **Connection Issues**
   - Verify your environment variables are correctly set
   - Check if your IP is allowlisted in Supabase dashboard
   - Ensure your project is active in Supabase

2. **Migration Issues**
   - Check the SQL editor logs for any errors
   - Verify all tables were created successfully
   - Ensure RLS policies are properly configured

## Local Development

For local development, you can use the Supabase CLI:

1. Install the CLI:
   ```bash
   npm install -g supabase
   ```

2. Start local Supabase:
   ```bash
   supabase start
   ```

3. Use local environment variables:
   ```bash
   SUPABASE_URL=http://localhost:54321
   SUPABASE_ANON_KEY=your_local_anon_key
   ```

## M1/ARM64 Compatibility

If you're using an M1 Mac or any ARM64-based system, you'll need to configure Docker to use the correct platform:

1. **Set Platform for Docker**
   ```bash
   export DOCKER_DEFAULT_PLATFORM=linux/amd64
   ```

2. **Start Supabase with Platform Setting**
   ```bash
   export DOCKER_DEFAULT_PLATFORM=linux/amd64 && supabase start
   ```

3. **Link Project with Platform Setting**
   ```bash
   export DOCKER_DEFAULT_PLATFORM=linux/amd64 && \
   export SUPABASE_DB_PASSWORD='your_db_password' && \
   supabase link --project-ref your_project_ref
   ```

4. **Push Database Changes**
   ```bash
   export DOCKER_DEFAULT_PLATFORM=linux/amd64 && \
   export SUPABASE_DB_PASSWORD='your_db_password' && \
   supabase db push
   ```

Note: The platform setting is required because Supabase's Docker images are primarily built for AMD64 architecture. Setting this ensures compatibility with ARM-based systems like M1 Macs.

## Production Deployment

1. **Environment Setup**
   - Set production environment variables
   - Configure backup settings in Supabase dashboard
   - Set up monitoring and alerts

2. **Security Checklist**
   - Enable RLS for all tables
   - Review and test all policies
   - Set up audit logs
   - Configure proper authentication settings

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
