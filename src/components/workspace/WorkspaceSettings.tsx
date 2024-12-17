'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/providers/workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Download, Upload, Archive, BarChart2, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function WorkspaceSettings() {
  const {
    workspace,
    updateWorkspace,
    archiveWorkspace,
    getWorkspaceStats,
    getWorkspaceQuota,
    exportWorkspaceData,
    importWorkspaceData,
    isLoading,
    error,
  } = useWorkspace();

  const [stats, setStats] = useState<any>(null);
  const [quota, setQuota] = useState<any>(null);
  const [isOperationLoading, setIsOperationLoading] = useState(false);

  useEffect(() => {
    if (workspace) {
      loadWorkspaceData();
    }
  }, [workspace]);

  const loadWorkspaceData = async () => {
    if (!workspace) return;
    try {
      const [statsData, quotaData] = await Promise.all([
        getWorkspaceStats(workspace.id),
        getWorkspaceQuota(workspace.id),
      ]);
      setStats(statsData);
      setQuota(quotaData);
    } catch (error) {
      toast.error('Failed to load workspace data');
    }
  };

  const handleExport = async () => {
    if (!workspace) return;
    try {
      setIsOperationLoading(true);
      const blob = await exportWorkspaceData(workspace.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `workspace-${workspace.slug}-backup.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Workspace data exported successfully');
    } catch (error) {
      toast.error('Failed to export workspace data');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!workspace || !event.target.files?.[0]) return;
    try {
      setIsOperationLoading(true);
      await importWorkspaceData(workspace.id, event.target.files[0]);
      toast.success('Workspace data imported successfully');
      loadWorkspaceData();
    } catch (error) {
      toast.error('Failed to import workspace data');
    } finally {
      setIsOperationLoading(false);
    }
  };

  const handleArchive = async () => {
    if (!workspace) return;
    try {
      setIsOperationLoading(true);
      await archiveWorkspace(workspace.id);
      toast.success('Workspace archived successfully');
    } catch (error) {
      toast.error('Failed to archive workspace');
    } finally {
      setIsOperationLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8" data-testid="workspace-settings-loading">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading workspace settings...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" data-testid="workspace-settings-error">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!workspace) return null;

  return (
    <Tabs defaultValue="general" className="w-full">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
        <TabsTrigger value="backup">Backup & Restore</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <Card>
          <CardHeader>
            <CardTitle>Workspace Information</CardTitle>
            <CardDescription>
              Manage your workspace settings and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                defaultValue={workspace.name}
                onChange={(e) =>
                  updateWorkspace(workspace.id, { name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Workspace Slug</Label>
              <Input id="slug" value={workspace.slug} disabled />
            </div>
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2">
                {workspace.categories?.map((category) => (
                  <Badge key={category} variant="secondary">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="usage">
        <Card>
          <CardHeader>
            <CardTitle>Usage & Limits</CardTitle>
            <CardDescription>
              Monitor your workspace resource usage and limits
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {stats && quota && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Members ({stats.memberCount}/{quota.maxMembers})</span>
                    <span>{((stats.memberCount / quota.maxMembers) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.memberCount / quota.maxMembers) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage ({(stats.storageUsed / 1024 / 1024).toFixed(2)}MB/{(quota.maxStorage / 1024 / 1024).toFixed(2)}MB)</span>
                    <span>{((stats.storageUsed / quota.maxStorage) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.storageUsed / quota.maxStorage) * 100} />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Calls ({stats.apiCalls}/{quota.maxApiCalls})</span>
                    <span>{((stats.apiCalls / quota.maxApiCalls) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(stats.apiCalls / quota.maxApiCalls) * 100} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="backup">
        <Card>
          <CardHeader>
            <CardTitle>Backup & Restore</CardTitle>
            <CardDescription>
              Export and import your workspace data
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-4">
              <Button
                onClick={handleExport}
                disabled={isOperationLoading}
                className="flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
              <div className="relative">
                <Label htmlFor="import-file" className="sr-only">Import Data</Label>
                <input
                  id="import-file"
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isOperationLoading}
                  aria-label="Import Data"
                />
                <Button disabled={isOperationLoading} className="flex items-center">
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data
                </Button>
              </div>
            </div>

            <Alert className="mt-4">
              <Archive className="w-4 h-4" />
              <AlertTitle>Archive Workspace</AlertTitle>
              <AlertDescription>
                Archiving a workspace will make it read-only. This action can be
                reversed by a workspace owner.
              </AlertDescription>
              <Button
                variant="destructive"
                onClick={handleArchive}
                disabled={isOperationLoading}
                className="mt-2"
              >
                Archive Workspace
              </Button>
            </Alert>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}