-- Create email_domains table
CREATE TABLE IF NOT EXISTS email_domains (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    domain_name TEXT NOT NULL,
    mx_record TEXT,
    spf_record TEXT,
    dkim_selector TEXT,
    dkim_private_key TEXT,
    dkim_public_key TEXT,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(workspace_id, domain_name)
);

-- Create email_domain_verifications table
CREATE TABLE IF NOT EXISTS email_domain_verifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email_domain_id UUID NOT NULL REFERENCES email_domains(id) ON DELETE CASCADE,
    verification_type TEXT NOT NULL, -- 'MX', 'SPF', 'DKIM'
    verification_value TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add RLS policies
ALTER TABLE email_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_domain_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for email_domains
CREATE POLICY "Enable read access for workspace members" ON email_domains
    FOR SELECT
    USING (
        workspace_id IN (
            SELECT workspace_id
            FROM workspace_users
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Enable write access for workspace admins" ON email_domains
    FOR ALL
    USING (
        workspace_id IN (
            SELECT workspace_id
            FROM workspace_users
            WHERE user_id = auth.uid()
            AND role = 'admin'
        )
    );

-- Policies for email_domain_verifications
CREATE POLICY "Enable read access for workspace members" ON email_domain_verifications
    FOR SELECT
    USING (
        email_domain_id IN (
            SELECT id
            FROM email_domains
            WHERE workspace_id IN (
                SELECT workspace_id
                FROM workspace_users
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Enable write access for workspace admins" ON email_domain_verifications
    FOR ALL
    USING (
        email_domain_id IN (
            SELECT id
            FROM email_domains
            WHERE workspace_id IN (
                SELECT workspace_id
                FROM workspace_users
                WHERE user_id = auth.uid()
                AND role = 'admin'
            )
        )
    );

-- Create functions for email domain management
CREATE OR REPLACE FUNCTION generate_dkim_keypair()
RETURNS TABLE (private_key TEXT, public_key TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
    -- This is a placeholder. In production, you would implement actual RSA key generation
    -- or integrate with a key management service
    RETURN QUERY SELECT
        'private_key_placeholder'::TEXT AS private_key,
        'public_key_placeholder'::TEXT AS public_key;
END;
$$;

-- Create function to verify email domain setup
CREATE OR REPLACE FUNCTION verify_email_domain(domain_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
    all_verified BOOLEAN;
BEGIN
    -- Check if all verifications are complete
    SELECT bool_and(verified)
    INTO all_verified
    FROM email_domain_verifications
    WHERE email_domain_id = domain_id;

    -- Update the email_domain verified status
    IF all_verified THEN
        UPDATE email_domains
        SET verified = TRUE,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = domain_id;
    END IF;

    RETURN all_verified;
END;
$$;