'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWorkspace } from '@/providers/workspace';
import { sendInvitationEmails } from '@/lib/email';
import type { Database } from '@/types/supabase';

interface Member {
  email: string;
  role: 'admin' | 'member';
}

const INITIAL_MEMBER = { email: '', role: 'member' as const };

export function WorkspaceInvitation() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [members, setMembers] = useState<Member[]>([{ ...INITIAL_MEMBER }]);
  const supabase = createClientComponentClient<Database>();

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, { ...INITIAL_MEMBER }]);
    }
  };

  const removeMember = (index: number) => {
    if (index !== 0) {
      const updatedMembers = members.filter((_, i) => i !== index);
      setMembers(updatedMembers);
    }
  };

  const handleEmailChange = (index: number, email: string) => {
    const updatedMembers = members.map((member, i) => {
      if (i === index) {
        return { ...member, email };
      }
      return member;
    });
    setMembers(updatedMembers);
  };

  const handleRoleChange = (index: number, role: 'admin' | 'member') => {
    const updatedMembers = members.map((member, i) => {
      if (i === index) {
        return { ...member, role };
      }
      return member;
    });
    setMembers(updatedMembers);
  };

  const validateEmails = () => {
    return members.every(member => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(member.email);
    });
  };

  const inviteMembers = async () => {
    if (!workspace?.id) return;

    try {
      setIsSubmitting(true);

      // Generate invitation tokens and create invitations
      const invitations = members.map(member => ({
        workspace_id: workspace.id,
        email: member.email,
        role: member.role,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }));

      // Insert invitations into the database
      const { error: dbError } = await supabase
        .from('workspace_invitations')
        .insert(invitations);

      if (dbError) throw dbError;

      // Send invitation emails
      const { succeeded, failed, total } = await sendInvitationEmails(
        invitations.map(invitation => ({
          workspaceName: workspace.name,
          inviterName: workspace.owner_name || '',
          inviterEmail: workspace.owner_email || '',
          recipientEmail: invitation.email,
          token: invitation.token,
        }))
      );

      // Reset form
      setMembers([{ ...INITIAL_MEMBER }]);

      // Show success/failure message
      if (succeeded === total) {
        toast.success('All invitations sent successfully');
      } else if (succeeded === 0) {
        toast.error('Failed to send invitations');
      } else {
        toast.warning(`${succeeded} of ${total} invitations sent successfully`);
      }

      router.refresh();
    } catch (error) {
      toast.error('Failed to create invitations');
      console.error('Invitation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invite Team Members</CardTitle>
        <CardDescription>
          Add team members to collaborate in your workspace
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member, index) => (
            <div key={index} className="flex items-center gap-4">
              <Input
                type="email"
                placeholder="name@email.com"
                value={member.email}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                disabled={isSubmitting}
                className="flex-1"
              />
              <Select
                value={member.role}
                onValueChange={(value: 'admin' | 'member') => handleRoleChange(index, value)}
                disabled={isSubmitting}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              {index !== 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMember(index)}
                  disabled={isSubmitting}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={addMember}
            disabled={members.length >= 5 || isSubmitting}
            className="mt-2"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add More
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <p className="text-sm text-muted-foreground">
          All invited members will receive an email invitation
        </p>
        <Button
          onClick={inviteMembers}
          disabled={!validateEmails() || isSubmitting}
        >
          Send Invitations
        </Button>
      </CardFooter>
    </Card>
  );
}