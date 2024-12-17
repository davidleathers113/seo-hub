-- Create function to accept workspace invitations
CREATE OR REPLACE FUNCTION accept_workspace_invitation(invitation_token UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_invitation RECORD;
    v_user_id UUID;
BEGIN
    -- Get the current user ID
    v_user_id := auth.uid();

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    -- Get invitation details
    SELECT
        wi.id,
        wi.workspace_id,
        wi.email,
        wi.role,
        wi.expires_at,
        u.email as user_email
    INTO v_invitation
    FROM workspace_invitations wi
    CROSS JOIN auth.users u
    WHERE wi.token = invitation_token
    AND u.id = v_user_id;

    -- Check if invitation exists
    IF v_invitation.id IS NULL THEN
        RAISE EXCEPTION 'Invalid invitation token';
    END IF;

    -- Check if invitation has expired
    IF v_invitation.expires_at < NOW() THEN
        RAISE EXCEPTION 'Invitation has expired';
    END IF;

    -- Check if email matches
    IF v_invitation.email != v_invitation.user_email THEN
        RAISE EXCEPTION 'Email mismatch';
    END IF;

    -- Begin transaction
    BEGIN
        -- Create member record
        INSERT INTO members (
            workspace_id,
            user_id,
            role,
            created_at,
            updated_at
        ) VALUES (
            v_invitation.workspace_id,
            v_user_id,
            v_invitation.role,
            NOW(),
            NOW()
        );

        -- Delete the invitation
        DELETE FROM workspace_invitations
        WHERE token = invitation_token;

        -- Create audit log entry
        INSERT INTO workspace_audit_logs (
            workspace_id,
            user_id,
            action,
            resource_type,
            resource_id,
            metadata,
            created_at
        ) VALUES (
            v_invitation.workspace_id,
            v_user_id,
            'accept_invitation',
            'member',
            v_user_id,
            jsonb_build_object(
                'role', v_invitation.role,
                'email', v_invitation.email
            ),
            NOW()
        );

        RETURN TRUE;
    EXCEPTION WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to accept invitation: %', SQLERRM;
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION accept_workspace_invitation(UUID) TO authenticated;

-- Create policy for workspace invitations
CREATE POLICY "Users can view their own invitations"
    ON workspace_invitations
    FOR SELECT
    USING (
        email IN (
            SELECT email
            FROM auth.users
            WHERE id = auth.uid()
        )
    );

-- Enable RLS on workspace invitations
ALTER TABLE workspace_invitations ENABLE ROW LEVEL SECURITY;