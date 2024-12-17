'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { AlertTriangle, MoreVertical, Shield, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWorkspace } from '@/providers/workspace';
import type { Database } from '@/types/supabase';

interface Member {
  id: string;
  user_id: string;
  workspace_id: string;
  role: 'owner' | 'admin' | 'member';
  email: string;
  name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export function WorkspaceMembers() {
  const router = useRouter();
  const { workspace } = useWorkspace();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<Member | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    if (workspace?.id) {
      fetchMembers();
    }
  }, [workspace?.id]);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from('members')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('workspace_id', workspace?.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMembers(data || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load members';
      setError(message);
      toast.error('Failed to load members');
      console.error('Members fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member') => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast.success('Member role updated');
      await fetchMembers();
    } catch (error) {
      toast.error('Failed to update member role');
      console.error('Role update error:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const removeMember = async (member: Member) => {
    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', member.id);

      if (error) throw error;

      toast.success('Member removed');
      await fetchMembers();
    } catch (error) {
      toast.error('Failed to remove member');
      console.error('Member removal error:', error);
    } finally {
      setIsUpdating(false);
      setMemberToRemove(null);
    }
  };

  if (!workspace) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          No workspace selected. Please select a workspace to manage members.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your workspace team members and their roles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    data-testid="member-loading-skeleton"
                    className="h-16 bg-muted animate-pulse rounded-lg"
                  />
                ))}
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No members found
              </div>
            ) : (
              <div className="divide-y">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between py-4"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name || member.email}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <User className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {member.name || member.email}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {member.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center space-x-1 rounded-full bg-muted px-2 py-1">
                        <Shield className="h-3 w-3" />
                        <span className="text-xs capitalize">{member.role}</span>
                      </div>
                      {member.role !== 'owner' && workspace?.owner_id === workspace?.user_id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isUpdating}
                              data-testid={`member-actions-${member.id}`}
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => updateMemberRole(
                                member.id,
                                member.role === 'admin' ? 'member' : 'admin'
                              )}
                              disabled={isUpdating}
                            >
                              Make {member.role === 'admin' ? 'Member' : 'Admin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => setMemberToRemove(member)}
                              disabled={isUpdating}
                            >
                              Remove Member
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToRemove?.name || memberToRemove?.email} from the workspace?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => memberToRemove && removeMember(memberToRemove)}
              disabled={isUpdating}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}