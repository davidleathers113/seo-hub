'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/providers/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layout, Plus, FileText, Globe, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  category: string;
  is_public: boolean;
}

export function TemplateManagement() {
  const {
    workspace,
    getWorkspaceTemplates,
    createWorkspaceFromTemplate,
    saveAsTemplate,
    updateTemplate,
    deleteTemplate,
  } = useWorkspace();

  const { toast } = useToast();
  const [templates, setTemplates] = useState<WorkspaceTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    isPublic: false,
  });

  useEffect(() => {
    loadTemplates();
  }, [workspace]);

  const loadTemplates = async () => {
    try {
      const templatesData = await getWorkspaceTemplates();
      setTemplates(templatesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    }
  };

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await saveAsTemplate(
        newTemplate.name,
        newTemplate.description,
        newTemplate.isPublic
      );
      await loadTemplates();
      setShowNewTemplateDialog(false);
      setNewTemplate({ name: '', description: '', isPublic: false });
      toast({
        title: 'Success',
        description: 'Template created successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create template');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create template',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateTemplate = async (templateId: string, data: Partial<WorkspaceTemplate>) => {
    setIsLoading(true);
    setError(null);
    try {
      await updateTemplate(templateId, data);
      await loadTemplates();
      toast({
        title: 'Success',
        description: 'Template updated successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update template',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteTemplate(templateId);
      await loadTemplates();
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete template',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseTemplate = async (templateId: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await createWorkspaceFromTemplate(templateId, name);
      toast({
        title: 'Success',
        description: 'Workspace created from template successfully',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to use template');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to create workspace from template',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Workspace Templates</h2>
          <p className="text-muted-foreground">
            Create and manage workspace templates
          </p>
        </div>
        <Dialog open={showNewTemplateDialog} onOpenChange={setShowNewTemplateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Template</DialogTitle>
              <DialogDescription>
                Save your current workspace configuration as a template
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTemplate}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={newTemplate.name}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, name: e.target.value })
                    }
                    placeholder="Enter template name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newTemplate.description}
                    onChange={(e) =>
                      setNewTemplate({ ...newTemplate, description: e.target.value })
                    }
                    placeholder="Enter template description"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPublic"
                    checked={newTemplate.isPublic}
                    onCheckedChange={(checked) =>
                      setNewTemplate({ ...newTemplate, isPublic: checked as boolean })
                    }
                  />
                  <Label htmlFor="isPublic">Make template public</Label>
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowNewTemplateDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  Create Template
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="my">My Templates</TabsTrigger>
          <TabsTrigger value="public">Public Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{template.name}</span>
                      </CardTitle>
                      <Badge variant={template.is_public ? 'default' : 'secondary'}>
                        {template.is_public ? (
                          <Globe className="w-3 h-3 mr-1" />
                        ) : (
                          <Lock className="w-3 h-3 mr-1" />
                        )}
                        {template.is_public ? 'Public' : 'Private'}
                      </Badge>
                    </div>
                    <CardDescription>{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Configuration</Label>
                        <div className="text-sm text-muted-foreground">
                          <pre className="p-2 bg-muted rounded-md">
                            {JSON.stringify(template.configuration, null, 2)}
                          </pre>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(template.id, `New ${template.name}`)}
                          disabled={isLoading}
                        >
                          Use Template
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          disabled={isLoading}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="my">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates
                .filter((t) => !t.is_public)
                .map((template) => (
                  <Card key={template.id}>
                    {/* Same card content as above */}
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="public">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templates
                .filter((t) => t.is_public)
                .map((template) => (
                  <Card key={template.id}>
                    {/* Same card content as above */}
                  </Card>
                ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
