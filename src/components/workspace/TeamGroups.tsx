'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/providers/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Settings, Trash } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface TeamGroup {
  id: string;
  name: string;
  description: string;
  memberCount: number;
}

export function TeamGroups() {
  const { workspace } = useWorkspace();
  const [groups, setGroups] = useState<TeamGroup[]>([]);
  const [showNewGroupDialog, setShowNewGroupDialog] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (workspace) {
      loadGroups();
    }
  }, [workspace]);

  const loadGroups = async () => {
    if (!workspace) return;
    try {
      const { data: groupsData, error } = await supabase
        .from('team_groups')
        .select(`
          id,
          name,
          description,
          team_group_members (count)
        `)
        .eq('workspace_id', workspace.id);

      if (error) throw error;

      setGroups(
        groupsData.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description,
          memberCount: group.team_group_members[0].count
        }))
      );
    } catch (error) {
      toast.error('Failed to load team groups');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('team_groups')
        .insert([{
          workspace_id: workspace.id,
          name: newGroup.name,
          description: newGroup.description,
        }]);

      if (error) throw error;

      setShowNewGroupDialog(false);
      setNewGroup({ name: '', description: '' });
      toast.success('Team group created successfully');
      await loadGroups();
    } catch (error) {
      toast.error('Failed to create team group');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('team_groups')
        .delete()
        .eq('id', groupId);

      if (error) throw error;

      toast.success('Team group deleted successfully');
      await loadGroups();
    } catch (error) {
      toast.error('Failed to delete team group');
    } finally {
      setIsLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Groups</h2>
          <p className="text-muted-foreground">
            Organize your team members into groups
          </p>
        </div>
        <Dialog open={showNewGroupDialog} onOpenChange={setShowNewGroupDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Team Group</DialogTitle>
              <DialogDescription>
                Create a new group to organize team members
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateGroup}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Group Name</Label>
                  <Input
                    id="name"
                    value={newGroup.name}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, name: e.target.value })
                    }
                    placeholder="Enter group name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newGroup.description}
                    onChange={(e) =>
                      setNewGroup({ ...newGroup, description: e.target.value })
                    }
                    placeholder="Enter group description"
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewGroupDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Create Group
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[600px]">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{group.name}</span>
                  </CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {/* TODO: Implement group settings */}}
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteGroup(group.id)}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>{group.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">
                    {group.memberCount} members
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {/* TODO: Implement manage members */}}
                  >
                    Manage Members
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}