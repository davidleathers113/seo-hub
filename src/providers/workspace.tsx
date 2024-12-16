'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

interface Member {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending' | 'inactive';
}

interface WorkspaceStats {
  memberCount: number;
  storageUsed: number;
  apiCalls: number;
}

interface WorkspaceQuota {
  maxMembers: number;
  maxStorage: number;
  maxApiCalls: number;
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  members: Member[];
  created_at: string;
  updated_at: string;
  stats?: WorkspaceStats;
  quota?: WorkspaceQuota;
  categories?: string[];
  isArchived?: boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price_monthly: number;
  price_yearly: number;
  features: Record<string, any>;
  limits: Record<string, any>;
  is_active: boolean;
}

interface WorkspaceSubscription {
  id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
}

interface WorkspaceTemplate {
  id: string;
  name: string;
  description: string;
  configuration: Record<string, any>;
  category: string;
  is_public: boolean;
}

interface WorkspaceContextType {
  workspace: Workspace | null;
  workspaces: Workspace[];
  isLoading: boolean;
  error: string | null;
  setWorkspace: (workspace: Workspace | null) => void;
  switchWorkspace: (workspaceId: string) => Promise<void>;
  createWorkspace: (name: string) => Promise<Workspace>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  archiveWorkspace: (id: string) => Promise<void>;
  getWorkspaceStats: (id: string) => Promise<WorkspaceStats>;
  getWorkspaceQuota: (id: string) => Promise<WorkspaceQuota>;
  searchWorkspaces: (query: string) => Promise<Workspace[]>;
  filterWorkspacesByCategory: (category: string) => Promise<Workspace[]>;
  exportWorkspaceData: (id: string) => Promise<Blob>;
  importWorkspaceData: (id: string, data: Blob) => Promise<void>;
  getSubscriptionPlans: () => Promise<SubscriptionPlan[]>;
  getCurrentSubscription: () => Promise<WorkspaceSubscription | null>;
  subscribeToPlan: (planId: string, isYearly: boolean) => Promise<void>;
  cancelSubscription: (atPeriodEnd: boolean) => Promise<void>;
  updatePaymentMethod: (paymentMethodId: string) => Promise<void>;
  getWorkspaceTemplates: () => Promise<WorkspaceTemplate[]>;
  createWorkspaceFromTemplate: (templateId: string, name: string) => Promise<Workspace>;
  saveAsTemplate: (name: string, description: string, isPublic: boolean) => Promise<WorkspaceTemplate>;
  updateTemplate: (templateId: string, data: Partial<WorkspaceTemplate>) => Promise<void>;
  deleteTemplate: (templateId: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType>({
  workspace: null,
  workspaces: [],
  isLoading: true,
  error: null,
  setWorkspace: () => {},
  switchWorkspace: async () => {},
  createWorkspace: async () => ({
    id: '',
    name: '',
    slug: '',
    members: [],
    created_at: '',
    updated_at: ''
  }),
  updateWorkspace: async () => {},
  deleteWorkspace: async () => {},
  refreshWorkspaces: async () => {},
  archiveWorkspace: async () => {},
  getWorkspaceStats: async () => ({
    memberCount: 0,
    storageUsed: 0,
    apiCalls: 0
  }),
  getWorkspaceQuota: async () => ({
    maxMembers: 0,
    maxStorage: 0,
    maxApiCalls: 0
  }),
  searchWorkspaces: async () => [],
  filterWorkspacesByCategory: async () => [],
  exportWorkspaceData: async () => new Blob(),
  importWorkspaceData: async () => {},
  getSubscriptionPlans: async () => [],
  getCurrentSubscription: async () => null,
  subscribeToPlan: async () => {},
  cancelSubscription: async () => {},
  updatePaymentMethod: async () => {},
  getWorkspaceTemplates: async () => [],
  createWorkspaceFromTemplate: async () => ({
    id: '',
    name: '',
    slug: '',
    members: [],
    created_at: '',
    updated_at: ''
  }),
  saveAsTemplate: async () => ({
    id: '',
    name: '',
    description: '',
    configuration: {},
    category: '',
    is_public: false
  }),
  updateTemplate: async () => {},
  deleteTemplate: async () => {}
});

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const [workspaceStats, setWorkspaceStats] = useState<Record<string, WorkspaceStats>>({});
  const [workspaceQuotas, setWorkspaceQuotas] = useState<Record<string, WorkspaceQuota>>({});

  const refreshWorkspaces = async () => {
    try {
      const { data: workspacesData, error: workspacesError } = await supabase
        .from('workspaces')
        .select(`
          *,
          members (
            id,
            email,
            role,
            status
          )
        `)
        .order('created_at', { ascending: false });

      if (workspacesError) throw workspacesError;

      setWorkspaces(workspacesData || []);

      // If no workspace is selected, select the first one
      if (!workspace && workspacesData && workspacesData.length > 0) {
        setWorkspace(workspacesData[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load workspaces');
    }
  };

  const switchWorkspace = async (workspaceId: string) => {
    const newWorkspace = workspaces.find(w => w.id === workspaceId);
    if (newWorkspace) {
      setWorkspace(newWorkspace);
      // Store the selected workspace in localStorage
      localStorage.setItem('selectedWorkspaceId', workspaceId);
      router.refresh();
    }
  };

  const createWorkspace = async (name: string): Promise<Workspace> => {
    try {
      const slug = name.toLowerCase().replace(/\s+/g, '-');

      const { data: workspace, error: createError } = await supabase
        .from('workspaces')
        .insert([{ name, slug }])
        .select()
        .single();

      if (createError) throw createError;

      await refreshWorkspaces();
      return workspace;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
      throw err;
    }
  };

  const updateWorkspace = async (id: string, data: Partial<Workspace>) => {
    try {
      const { error: updateError } = await supabase
        .from('workspaces')
        .update(data)
        .eq('id', id);

      if (updateError) throw updateError;

      await refreshWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update workspace');
      throw err;
    }
  };

  const deleteWorkspace = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;

      await refreshWorkspaces();

      // If the deleted workspace was selected, switch to another one
      if (workspace?.id === id) {
        const remainingWorkspace = workspaces.find(w => w.id !== id);
        if (remainingWorkspace) {
          await switchWorkspace(remainingWorkspace.id);
        } else {
          setWorkspace(null);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete workspace');
      throw err;
    }
  };

  const archiveWorkspace = async (id: string) => {
    try {
      const { error: archiveError } = await supabase
        .from('workspaces')
        .update({ isArchived: true })
        .eq('id', id);

      if (archiveError) throw archiveError;
      await refreshWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive workspace');
      throw err;
    }
  };

  const getWorkspaceStats = async (id: string) => {
    try {
      const { data: stats, error: statsError } = await supabase
        .from('workspace_stats')
        .select('*')
        .eq('workspace_id', id)
        .single();

      if (statsError) throw statsError;
      setWorkspaceStats(prev => ({ ...prev, [id]: stats }));
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspace stats');
      throw err;
    }
  };

  const getWorkspaceQuota = async (id: string) => {
    try {
      const { data: quota, error: quotaError } = await supabase
        .from('workspace_quotas')
        .select('*')
        .eq('workspace_id', id)
        .single();

      if (quotaError) throw quotaError;
      setWorkspaceQuotas(prev => ({ ...prev, [id]: quota }));
      return quota;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch workspace quota');
      throw err;
    }
  };

  const searchWorkspaces = async (query: string) => {
    try {
      const { data: searchResults, error: searchError } = await supabase
        .from('workspaces')
        .select('*')
        .textSearch('name', query)
        .eq('isArchived', false);

      if (searchError) throw searchError;
      return searchResults || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search workspaces');
      throw err;
    }
  };

  const filterWorkspacesByCategory = async (category: string) => {
    try {
      const { data: filteredWorkspaces, error: filterError } = await supabase
        .from('workspaces')
        .select('*')
        .contains('categories', [category])
        .eq('isArchived', false);

      if (filterError) throw filterError;
      return filteredWorkspaces || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to filter workspaces');
      throw err;
    }
  };

  const exportWorkspaceData = async (id: string): Promise<Blob> => {
    try {
      const { data: exportData, error: exportError } = await supabase
        .rpc('export_workspace_data', { workspace_id: id });

      if (exportError) throw exportError;
      return new Blob([JSON.stringify(exportData)], { type: 'application/json' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export workspace data');
      throw err;
    }
  };

  const importWorkspaceData = async (id: string, data: Blob): Promise<void> => {
    try {
      const jsonData = await data.text();
      const { error: importError } = await supabase
        .rpc('import_workspace_data', {
          workspace_id: id,
          import_data: JSON.parse(jsonData)
        });

      if (importError) throw importError;
      await refreshWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import workspace data');
      throw err;
    }
  };

  const getSubscriptionPlans = async () => {
    try {
      const { data: plans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true });

      if (error) throw error;
      return plans;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription plans');
      throw err;
    }
  };

  const getCurrentSubscription = async () => {
    if (!workspace) return null;
    try {
      const { data: subscription, error } = await supabase
        .from('workspace_subscriptions')
        .select('*')
        .eq('workspace_id', workspace.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return subscription;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription');
      throw err;
    }
  };

  const subscribeToPlan = async (planId: string, isYearly: boolean) => {
    if (!workspace) return;
    try {
      const response = await fetch('/api/billing/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          planId,
          isYearly
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to subscribe to plan');
      }

      await refreshWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to subscribe to plan');
      throw err;
    }
  };

  const cancelSubscription = async (atPeriodEnd: boolean) => {
    if (!workspace) return;
    try {
      const response = await fetch('/api/billing/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          atPeriodEnd
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      await refreshWorkspaces();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel subscription');
      throw err;
    }
  };

  const updatePaymentMethod = async (paymentMethodId: string) => {
    if (!workspace) return;
    try {
      const response = await fetch('/api/billing/payment-method', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          paymentMethodId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update payment method');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update payment method');
      throw err;
    }
  };

  const getWorkspaceTemplates = async () => {
    try {
      const { data: templates, error } = await supabase
        .from('workspace_templates')
        .select('*')
        .or(`is_public.eq.true,created_by.eq.${supabase.auth.user()?.id}`);

      if (error) throw error;
      return templates;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
      throw err;
    }
  };

  const createWorkspaceFromTemplate = async (templateId: string, name: string) => {
    try {
      const { data: template, error: templateError } = await supabase
        .from('workspace_templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (templateError) throw templateError;

      const workspace = await createWorkspace(name);

      // Apply template configuration
      await updateWorkspace(workspace.id, {
        ...workspace,
        ...template.configuration
      });

      return workspace;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace from template');
      throw err;
    }
  };

  const saveAsTemplate = async (name: string, description: string, isPublic: boolean) => {
    if (!workspace) throw new Error('No workspace selected');
    try {
      const { data: template, error } = await supabase
        .from('workspace_templates')
        .insert([{
          name,
          description,
          is_public: isPublic,
          configuration: {
            categories: workspace.categories,
            settings: workspace.settings,
            // Add other workspace configuration
          }
        }])
        .single();

      if (error) throw error;
      return template;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
      throw err;
    }
  };

  const updateTemplate = async (templateId: string, data: Partial<WorkspaceTemplate>) => {
    try {
      const { error } = await supabase
        .from('workspace_templates')
        .update(data)
        .eq('id', templateId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      throw err;
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('workspace_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      throw err;
    }
  };

  useEffect(() => {
    const initializeWorkspace = async () => {
      setIsLoading(true);
      try {
        // Check for auth session
        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
          await refreshWorkspaces();

          // Try to load previously selected workspace from localStorage
          const savedWorkspaceId = localStorage.getItem('selectedWorkspaceId');
          if (savedWorkspaceId) {
            const savedWorkspace = workspaces.find(w => w.id === savedWorkspaceId);
            if (savedWorkspace) {
              setWorkspace(savedWorkspace);
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize workspace');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkspace();

    // Set up real-time subscription for workspace changes
    const workspaceSubscription = supabase
      .channel('workspace_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'workspaces'
      }, () => {
        refreshWorkspaces();
      })
      .subscribe();

    return () => {
      workspaceSubscription.unsubscribe();
    };
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspace,
        workspaces,
        isLoading,
        error,
        setWorkspace,
        switchWorkspace,
        createWorkspace,
        updateWorkspace,
        deleteWorkspace,
        refreshWorkspaces,
        archiveWorkspace,
        getWorkspaceStats,
        getWorkspaceQuota,
        searchWorkspaces,
        filterWorkspacesByCategory,
        exportWorkspaceData,
        importWorkspaceData,
        getSubscriptionPlans,
        getCurrentSubscription,
        subscribeToPlan,
        cancelSubscription,
        updatePaymentMethod,
        getWorkspaceTemplates,
        createWorkspaceFromTemplate,
        saveAsTemplate,
        updateTemplate,
        deleteTemplate,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
