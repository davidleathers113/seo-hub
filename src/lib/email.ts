import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { html, text } from '@/config/email-templates/workspace-invitation';
import type { Database } from '@/types/supabase';

interface SendInvitationEmailProps {
  workspaceName: string;
  inviterName: string;
  inviterEmail: string;
  recipientEmail: string;
  token: string;
}

export async function sendInvitationEmail({
  workspaceName,
  inviterName,
  inviterEmail,
  recipientEmail,
  token,
}: SendInvitationEmailProps) {
  const supabase = createClientComponentClient<Database>();

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        to: recipientEmail,
        subject: `Invitation to join ${workspaceName} workspace`,
        html: html({ workspaceName, inviterName, inviterEmail, token }),
        text: text({ workspaceName, inviterName, inviterEmail, token }),
      },
    });

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Failed to send invitation email:', error);
    return { success: false, error };
  }
}

export async function sendInvitationEmails(invitations: SendInvitationEmailProps[]) {
  const results = await Promise.allSettled(
    invitations.map(invitation => sendInvitationEmail(invitation))
  );

  const succeeded = results.filter(
    (result): result is PromiseFulfilledResult<{ success: true }> =>
      result.status === 'fulfilled' && result.value.success
  ).length;

  const failed = results.filter(
    result => result.status === 'rejected' ||
    (result.status === 'fulfilled' && !result.value.success)
  ).length;

  return {
    succeeded,
    failed,
    total: invitations.length
  };
}