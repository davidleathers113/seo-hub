# Deployment Checklist

## Pre-Deployment

### Environment Setup
- [ ] Copy `.env.example` to `.env.local` for local development
- [ ] Set up Vercel environment variables
- [ ] Set up Supabase environment variables
- [ ] Configure SMTP settings in Supabase Edge Functions

### Supabase Setup
- [ ] Run all database migrations
- [ ] Verify RLS policies are in place
- [ ] Deploy Edge Functions
- [ ] Set up authentication providers
- [ ] Configure storage buckets
- [ ] Enable real-time subscriptions
- [ ] Set up database backups

### Vercel Setup
- [ ] Connect GitHub repository
- [ ] Configure build settings
- [ ] Set up environment variables
- [ ] Configure custom domain (if applicable)
- [ ] Set up preview deployments
- [ ] Configure deployment regions

### Security Checks
- [ ] Verify all environment variables are set
- [ ] Check API key restrictions
- [ ] Validate RLS policies
- [ ] Test authentication flows
- [ ] Verify CORS settings
- [ ] Check rate limiting
- [ ] Review security headers

### Performance Checks
- [ ] Run Lighthouse audit
- [ ] Check bundle sizes
- [ ] Verify image optimization
- [ ] Test API response times
- [ ] Check database query performance
- [ ] Validate caching strategies

## Deployment Steps

1. **Database Migration**
   ```bash
   # Deploy Supabase migrations
   supabase db push
   ```

2. **Edge Function Deployment**
   ```bash
   # Deploy send-email function
   supabase functions deploy send-email
   ```

3. **Frontend Deployment**
   ```bash
   # Deploy to Vercel
   vercel --prod
   ```

## Post-Deployment

### Verification
- [ ] Test authentication flow
- [ ] Verify email sending
- [ ] Check workspace creation
- [ ] Test member invitations
- [ ] Validate real-time updates
- [ ] Check file uploads
- [ ] Test API endpoints

### Monitoring
- [ ] Set up error tracking
- [ ] Configure performance monitoring
- [ ] Set up uptime monitoring
- [ ] Enable database monitoring
- [ ] Configure log aggregation

### Documentation
- [ ] Update API documentation
- [ ] Document deployment process
- [ ] Update environment variable documentation
- [ ] Document troubleshooting steps
- [ ] Update changelog

## Rollback Plan

1. **Database Rollback**
   ```bash
   # Revert last migration
   supabase db reset
   ```

2. **Edge Function Rollback**
   ```bash
   # Revert to previous version
   supabase functions deploy send-email --version v1
   ```

3. **Frontend Rollback**
   ```bash
   # Revert to previous deployment
   vercel rollback
   ```

## Emergency Contacts

- Technical Lead: [Name] ([Email])
- DevOps Engineer: [Name] ([Email])
- Database Admin: [Name] ([Email])