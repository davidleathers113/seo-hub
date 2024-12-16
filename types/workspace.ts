import { Database } from './supabase';

// ... existing code ...

export interface WorkspaceStats {
  id: string;
  workspace_id: string;
  storage_used: number;
  api_calls_count: number;
  active_users_count: number;
  last_activity_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceQuotas {
  id: string;
  workspace_id: string;
  max_storage_gb: number;
  max_members: number;
  max_api_calls: number;
  quota_reset_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceAuditLog {
  id: string;
  workspace_id: string;
  user_id: string;
  action: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: Record<string, any> | null;
  created_at: string;
}

export interface WorkspaceBackup {
  id: string;
  workspace_id: string;
  backup_path: string;
  size_bytes: number | null;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceTemplate {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  content: Record<string, any>;
  is_public: boolean;
  category: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceSettings {
  id: string;
  workspace_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  default_language: string;
  custom_domain: string | null;
  features: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkspaceInvoice {
  id: string;
  workspace_id: string;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  billing_period_start: string | null;
  billing_period_end: string | null;
  paid_at: string | null;
  invoice_url: string | null;
  created_at: string;
  updated_at: string;
}

// Add to Database interface
declare global {
  type Database = Database & {
    public: {
      Tables: {
        workspace_stats: {
          Row: WorkspaceStats;
          Insert: Omit<WorkspaceStats, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<WorkspaceStats, 'id'>>;
        };
        workspace_quotas: {
          Row: WorkspaceQuotas;
          Insert: Omit<WorkspaceQuotas, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<WorkspaceQuotas, 'id'>>;
        };
        workspace_audit_logs: {
          Row: WorkspaceAuditLog;
          Insert: Omit<WorkspaceAuditLog, 'id' | 'created_at'>;
          Update: never;
        };
        workspace_backups: {
          Row: WorkspaceBackup;
          Insert: Omit<WorkspaceBackup, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<WorkspaceBackup, 'id'>>;
        };
        workspace_templates: {
          Row: WorkspaceTemplate;
          Insert: Omit<WorkspaceTemplate, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<WorkspaceTemplate, 'id'>>;
        };
        workspace_settings: {
          Row: WorkspaceSettings;
          Insert: Omit<WorkspaceSettings, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<WorkspaceSettings, 'id'>>;
        };
        workspace_invoices: {
          Row: WorkspaceInvoice;
          Insert: Omit<WorkspaceInvoice, 'id' | 'created_at' | 'updated_at'>;
          Update: Partial<Omit<WorkspaceInvoice, 'id'>>;
        };
      };
    };
  };
}