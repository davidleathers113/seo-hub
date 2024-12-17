import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Database } from '@/types/supabase';

interface InvitationAcceptanceProps {
  searchParams: {
    token?: string;
  };
}

async function InvitationAcceptance({ token }: { token: string }) {
  const supabase = createServerComponentClient<Database>({ cookies });

  // Get the invitation details
  const { data: invitation, error: invitationError } = await supabase
    .from('workspace_invitations')
    .select(`
      *,
      workspace:workspaces (
        name,
        owner:owner_id (
          email,
          name
        )
      )
    `)
    .eq('token', token)
    .single();

  if (invitationError || !invitation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>
            This invitation link is invalid or has expired.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Check if invitation has expired
  if (new Date(invitation.expires_at) < new Date()) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Expired Invitation</CardTitle>
          <CardDescription>
            This invitation has expired. Please request a new invitation.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to sign in page with return URL
    const returnUrl = `/workspace/invite?token=${encodeURIComponent(token)}`;
    redirect(`/auth/signin?returnUrl=${encodeURIComponent(returnUrl)}`);
  }

  // Check if user is already a member
  const { data: existingMember } = await supabase
    .from('members')
    .select()
    .eq('workspace_id', invitation.workspace_id)
    .eq('user_id', user.id)
    .single();

  if (existingMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Already a Member</CardTitle>
          <CardDescription>
            You are already a member of this workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => redirect(`/workspace/${invitation.workspace_id}`)}
          >
            Go to Workspace
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Accept invitation
  const { error: acceptError } = await supabase.rpc('accept_workspace_invitation', {
    invitation_token: token
  });

  if (acceptError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>
            Failed to accept invitation. Please try again.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Redirect to workspace
  redirect(`/workspace/${invitation.workspace_id}`);
}

export default function InvitePage({ searchParams }: InvitationAcceptanceProps) {
  const { token } = searchParams;

  if (!token) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Invalid Invitation</CardTitle>
          <CardDescription>
            No invitation token provided.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container max-w-lg py-10">
      <Suspense
        fallback={
          <Card>
            <CardHeader>
              <CardTitle>Loading...</CardTitle>
              <CardDescription>
                Verifying your invitation...
              </CardDescription>
            </CardHeader>
          </Card>
        }
      >
        <InvitationAcceptance token={token} />
      </Suspense>
    </div>
  );
}