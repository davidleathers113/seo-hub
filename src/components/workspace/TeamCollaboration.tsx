'use client';

import { useState, useEffect } from 'react';
import { useWorkspace } from '@/providers/workspace';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, CheckSquare, FileText, Plus, Pin, Clock } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'sonner';

interface Discussion {
  id: string;
  title: string;
  content: string;
  created_by: string;
  is_pinned: boolean;
  created_at: string;
  comment_count: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  assigned_to: string;
}

interface Document {
  id: string;
  title: string;
  content: string;
  version: number;
  created_by: string;
  created_at: string;
}

export function TeamCollaboration() {
  const { workspace } = useWorkspace();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [showNewDiscussionDialog, setShowNewDiscussionDialog] = useState(false);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (workspace) {
      loadCollaborationData();
    }
  }, [workspace]);

  const loadCollaborationData = async () => {
    if (!workspace) return;
    try {
      // Load discussions
      const { data: discussionsData } = await supabase
        .from('team_discussions')
        .select(`
          *,
          discussion_comments (count)
        `)
        .eq('workspace_id', workspace.id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (discussionsData) {
        setDiscussions(discussionsData.map(d => ({
          ...d,
          comment_count: d.discussion_comments[0].count
        })));
      }

      // Load tasks
      const { data: tasksData } = await supabase
        .from('team_tasks')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('due_date', { ascending: true });

      if (tasksData) {
        setTasks(tasksData);
      }

      // Load documents
      const { data: documentsData } = await supabase
        .from('team_documents')
        .select('*')
        .eq('workspace_id', workspace.id)
        .order('updated_at', { ascending: false });

      if (documentsData) {
        setDocuments(documentsData);
      }
    } catch (error) {
      toast.error('Failed to load collaboration data');
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { error } = await supabase
        .from('team_discussions')
        .insert([{
          workspace_id: workspace.id,
          title: formData.get('title'),
          content: formData.get('content'),
          is_pinned: false,
        }]);

      if (error) throw error;

      setShowNewDiscussionDialog(false);
      toast.success('Discussion created successfully');
      await loadCollaborationData();
    } catch (error) {
      toast.error('Failed to create discussion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { error } = await supabase
        .from('team_tasks')
        .insert([{
          workspace_id: workspace.id,
          title: formData.get('title'),
          description: formData.get('description'),
          status: 'todo',
          priority: formData.get('priority'),
          due_date: formData.get('due_date'),
        }]);

      if (error) throw error;

      setShowNewTaskDialog(false);
      toast.success('Task created successfully');
      await loadCollaborationData();
    } catch (error) {
      toast.error('Failed to create task');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace) return;

    setIsLoading(true);
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const { error } = await supabase
        .from('team_documents')
        .insert([{
          workspace_id: workspace.id,
          title: formData.get('title'),
          content: formData.get('content'),
          version: 1,
        }]);

      if (error) throw error;

      setShowNewDocumentDialog(false);
      toast.success('Document created successfully');
      await loadCollaborationData();
    } catch (error) {
      toast.error('Failed to create document');
    } finally {
      setIsLoading(false);
    }
  };

  if (!workspace) return null;

  return (
    <Tabs defaultValue="discussions" className="w-full">
      <TabsList>
        <TabsTrigger value="discussions">Discussions</TabsTrigger>
        <TabsTrigger value="tasks">Tasks</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
      </TabsList>

      <TabsContent value="discussions">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Team Discussions</h2>
          <Dialog open={showNewDiscussionDialog} onOpenChange={setShowNewDiscussionDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Discussion
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Discussion</DialogTitle>
                <DialogDescription>
                  Start a new discussion with your team
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDiscussion}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Discussion title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your discussion here..."
                      required
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewDiscussionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Create Discussion
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {discussions.map((discussion) => (
              <Card key={discussion.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4" />
                      <span>{discussion.title}</span>
                      {discussion.is_pinned && (
                        <Pin className="w-4 h-4 text-muted-foreground" />
                      )}
                    </CardTitle>
                    <Badge variant="secondary">
                      {discussion.comment_count} comments
                    </Badge>
                  </div>
                  <CardDescription>
                    Started by {discussion.created_by} on{' '}
                    {new Date(discussion.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{discussion.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="tasks">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Team Tasks</h2>
          <Dialog open={showNewTaskDialog} onOpenChange={setShowNewTaskDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Create a new task for your team
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Task title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Task description"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Priority</Label>
                      <select
                        id="priority"
                        name="priority"
                        className="w-full border rounded-md p-2"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="due_date">Due Date</Label>
                      <Input
                        type="date"
                        id="due_date"
                        name="due_date"
                        required
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewTaskDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Create Task
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <CheckSquare className="w-4 h-4" />
                      <span>{task.title}</span>
                    </CardTitle>
                    <Badge
                      variant={
                        task.priority === 'high'
                          ? 'destructive'
                          : task.priority === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>Due {new Date(task.due_date).toLocaleDateString()}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-2">{task.description}</p>
                  <div className="mt-2">
                    <Badge variant="outline">{task.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="documents">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Team Documents</h2>
          <Dialog open={showNewDocumentDialog} onOpenChange={setShowNewDocumentDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Create a new document for your team
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateDocument}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="Document title"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      placeholder="Write your document here..."
                      required
                      className="min-h-[200px]"
                    />
                  </div>
                </div>
                <DialogFooter className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewDocumentDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    Create Document
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="space-y-4">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <FileText className="w-4 h-4" />
                      <span>{document.title}</span>
                    </CardTitle>
                    <Badge variant="secondary">
                      v{document.version}
                    </Badge>
                  </div>
                  <CardDescription>
                    Created by {document.created_by} on{' '}
                    {new Date(document.created_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-3">{document.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}