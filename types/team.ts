import { Database } from './supabase';

export interface TeamGroup {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamGroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'member' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface TeamDiscussion {
  id: string;
  workspace_id: string;
  group_id: string | null;
  title: string;
  content: string;
  is_pinned: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DiscussionComment {
  id: string;
  discussion_id: string;
  content: string;
  created_by: string;
  parent_comment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface TeamTask {
  id: string;
  workspace_id: string;
  group_id: string | null;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  assigned_to: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TaskComment {
  id: string;
  task_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TeamDocument {
  id: string;
  workspace_id: string;
  group_id: string | null;
  title: string;
  content: string;
  is_template: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  content: string;
  version_number: number;
  created_by: string;
  created_at: string;
}

// Add to Database interface
declare global {
  type Database = Database & {
    public: {
      Tables: {
        team_groups: {
          Row: TeamGroup;
          Insert: Omit<TeamGroup, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<TeamGroup, 'id'>>;
        };
        team_group_members: {
          Row: TeamGroupMember;
          Insert: Omit<TeamGroupMember, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<TeamGroupMember, 'id'>>;
        };
        team_discussions: {
          Row: TeamDiscussion;
          Insert: Omit<TeamDiscussion, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<TeamDiscussion, 'id'>>;
        };
        discussion_comments: {
          Row: DiscussionComment;
          Insert: Omit<DiscussionComment, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<DiscussionComment, 'id'>>;
        };
        team_tasks: {
          Row: TeamTask;
          Insert: Omit<TeamTask, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<TeamTask, 'id'>>;
        };
        task_comments: {
          Row: TaskComment;
          Insert: Omit<TaskComment, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<TaskComment, 'id'>>;
        };
        team_documents: {
          Row: TeamDocument;
          Insert: Omit<TeamDocument, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<TeamDocument, 'id'>>;
        };
        document_versions: {
          Row: DocumentVersion;
          Insert: Omit<DocumentVersion, 'id' | 'created_at'>;
          Update: never;
        };
      };
    };
  };
}