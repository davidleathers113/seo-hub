-- Add NOT NULL constraints to timestamp columns
ALTER TABLE workspace_templates ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_templates ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspace_settings ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_settings ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspace_invoices ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_invoices ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE team_groups ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE team_groups ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE team_group_members ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE team_group_members ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE team_discussions ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE team_discussions ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE discussion_comments ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE discussion_comments ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE team_tasks ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE team_tasks ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE task_comments ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE task_comments ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE team_documents ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE team_documents ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE document_versions ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE domains ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE domains ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE subscription_plans ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE subscription_plans ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE subscriptions ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspaces ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspaces ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE members ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE members ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspace_invitations ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_invitations ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE email_domains ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE email_domains ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE email_domain_verifications ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE email_domain_verifications ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspace_stats ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_stats ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspace_quotas ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_quotas ALTER COLUMN updated_at SET NOT NULL;
ALTER TABLE workspace_audit_logs ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_backups ALTER COLUMN created_at SET NOT NULL;
ALTER TABLE workspace_backups ALTER COLUMN updated_at SET NOT NULL;

-- Fix workspace_invitations.email column type
ALTER TABLE workspace_invitations ALTER COLUMN email TYPE VARCHAR USING email::VARCHAR;