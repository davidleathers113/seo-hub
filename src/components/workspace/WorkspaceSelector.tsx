'use client';

import * as React from 'react';
import { Check, ChevronsUpDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { useWorkspace } from '@/providers/workspace';
import { useToast } from '@/components/ui/use-toast';

export function WorkspaceSelector() {
  const [open, setOpen] = React.useState(false);
  const [showNewWorkspaceDialog, setShowNewWorkspaceDialog] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const { toast } = useToast();

  const {
    workspace,
    workspaces,
    switchWorkspace,
    createWorkspace,
    isLoading,
    error,
  } = useWorkspace();

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const workspace = await createWorkspace(newWorkspaceName);
      await switchWorkspace(workspace.id);
      setShowNewWorkspaceDialog(false);
      setNewWorkspaceName('');
      toast({
        title: 'Success',
        description: 'Workspace created successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create workspace',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return <div data-testid="workspace-selector-loading">Loading...</div>;
  }

  if (error) {
    return <div data-testid="workspace-selector-error">Failed to load workspaces</div>;
  }

  return (
    <Dialog open={showNewWorkspaceDialog} onOpenChange={setShowNewWorkspaceDialog}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Select a workspace"
            className="w-[200px] justify-between"
            data-testid="workspace-selector-trigger"
          >
            {workspace ? workspace.name : "Select workspace..."}
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0">
          <Command>
            <CommandInput placeholder="Search workspace..." />
            <CommandList>
              <CommandEmpty>No workspace found.</CommandEmpty>
              <CommandGroup heading="Workspaces">
                {workspaces.map((ws) => (
                  <CommandItem
                    key={ws.id}
                    onSelect={() => {
                      switchWorkspace(ws.id);
                      setOpen(false);
                    }}
                    className="text-sm"
                    data-testid={`workspace-item-${ws.id}`}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        workspace?.id === ws.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {ws.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
              <CommandGroup>
                <CommandItem
                  onSelect={() => {
                    setOpen(false);
                    setShowNewWorkspaceDialog(true);
                  }}
                  data-testid="create-workspace-button"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Workspace
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <DialogContent data-testid="create-workspace-dialog">
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>
            Add a new workspace to manage your content.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateWorkspace}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Input
                id="name"
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                data-testid="workspace-name-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowNewWorkspaceDialog(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!newWorkspaceName.trim()}
              data-testid="create-workspace-submit"
            >
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}