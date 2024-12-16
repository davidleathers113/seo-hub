import { Database as DatabaseGenerated } from './database'
import { SupabaseClient, User } from '@supabase/supabase-js'

export type Database = DatabaseGenerated;
export type Tables = Database['public']['Tables']

export interface WorkspaceSettings {
  theme: string;
  notifications_enabled: boolean;
  default_language: string;
  custom_domain?: string;
  features: Record<string, any>;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  settings: WorkspaceSettings;
  created_at: string;
  updated_at: string;
  categories?: string[];
  isArchived?: boolean;
  members?: {
    id: string;
    email: string;
    role: 'owner' | 'admin' | 'member';
    status: 'active' | 'pending' | 'inactive';
  }[];
}

export interface SupabaseAuthClient extends SupabaseClient {
  user: User | null;
}

export interface EmailDomain {
  id: string;
  workspace_id: string;
  domain_name: string;
  mx_record: string | null;
  spf_record: string | null;
  dkim_selector: string | null;
  dkim_private_key: string | null;
  dkim_public_key: string | null;
  verified: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmailDomainVerification {
  id: string;
  email_domain_id: string;
  verification_type: 'MX' | 'SPF' | 'DKIM';
  verification_value: string;
  verified: boolean;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DKIMKeyPair {
  private_key: string;
  public_key: string;
}

export interface EmailDomainSetupStatus {
  mx_verified: boolean;
  spf_verified: boolean;
  dkim_verified: boolean;
  all_verified: boolean;
}

export interface EmailDomainWithVerifications extends EmailDomain {
  verifications: EmailDomainSetupStatus;
}

// Use this type for local state to match database fields
export interface VerificationStatus {
  mx_verified: boolean;
  spf_verified: boolean;
  dkim_verified: boolean;
  all_verified: boolean;
}
