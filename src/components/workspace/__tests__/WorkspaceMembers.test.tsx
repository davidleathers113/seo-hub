import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { WorkspaceMembers } from '../WorkspaceMembers';
import * as workspaceHooks from '@/providers/workspace';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';
import '@testing-library/jest-dom';

// Mock the workspace provider
jest.mock('@/providers/workspace');
jest.mock('@supabase/auth-helpers-nextjs');

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

interface Workspace {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  user_id: string;
}

type MockSupabaseClient = ReturnType<typeof createClientComponentClient<Database>>;

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return children;
};

describe('WorkspaceMembers', () => {
  const mockWorkspace: Workspace = {
    id: '1',
    name: 'Test Workspace',
    slug: 'test-workspace',
    owner_id: 'owner-123',
    user_id: 'owner-123',
  };

  const mockMembers: Member[] = [
    {
      id: '1',
      user_id: 'owner-123',
      workspace_id: '1',
      role: 'owner',
      email: 'owner@test.com',
      name: 'Owner User',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      user_id: 'admin-123',
      workspace_id: '1',
      role: 'admin',
      email: 'admin@test.com',
      name: 'Admin User',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '3',
      user_id: 'member-123',
      workspace_id: '1',
      role: 'member',
      email: 'member@test.com',
      name: 'Member User',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ];

  const createMockSupabaseClient = (overrides = {}) => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        callback({ data: mockMembers, error: null });
        return Promise.resolve({ data: mockMembers, error: null });
      }),
      ...overrides,
    } as unknown as MockSupabaseClient;

    return mockClient;
  };

  beforeEach(() => {
    // Mock Supabase client
    (createClientComponentClient as jest.Mock).mockImplementation(() => createMockSupabaseClient());

    // Mock workspace context
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: mockWorkspace,
      workspaces: [mockWorkspace],
      isLoading: false,
      error: null,
    } as ReturnType<typeof workspaceHooks.useWorkspace>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <TestWrapper>
        <WorkspaceMembers />
      </TestWrapper>
    );
  };

  it('renders workspace members list', async () => {
    renderComponent();

    await waitFor(() => {
      mockMembers.forEach(member => {
        expect(screen.getByText(member.name!)).toBeInTheDocument();
        expect(screen.getByText(member.email)).toBeInTheDocument();
        expect(screen.getByText(member.role, { exact: false })).toBeInTheDocument();
      });
    });
  });

  it('shows loading state', () => {
    renderComponent();
    expect(screen.getAllByTestId('member-loading-skeleton')).toHaveLength(3);
  });

  it('shows error state when workspace is not selected', () => {
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: null,
      workspaces: [],
      isLoading: false,
      error: null,
    } as ReturnType<typeof workspaceHooks.useWorkspace>);

    renderComponent();
    expect(screen.getByText(/no workspace selected/i)).toBeInTheDocument();
  });

  it('shows empty state when no members', async () => {
    (createClientComponentClient as jest.Mock).mockImplementation(() =>
      createMockSupabaseClient({
        then: jest.fn().mockImplementation((callback) => {
          callback({ data: [], error: null });
          return Promise.resolve({ data: [], error: null });
        }),
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/no members found/i)).toBeInTheDocument();
    });
  });

  it('handles member role update', async () => {
    const mockUpdateFn = jest.fn().mockResolvedValue({ error: null });
    (createClientComponentClient as jest.Mock).mockImplementation(() =>
      createMockSupabaseClient({
        update: mockUpdateFn,
      })
    );

    renderComponent();

    await waitFor(() => {
      const adminMember = mockMembers.find(m => m.role === 'admin');
      const memberActions = screen.getByTestId(`member-actions-${adminMember?.id}`);
      fireEvent.click(memberActions);
      const makeAdminButton = screen.getByText(/make member/i);
      fireEvent.click(makeAdminButton);
    });

    expect(mockUpdateFn).toHaveBeenCalledWith({ role: 'member' });
  });

  it('handles member removal with confirmation', async () => {
    const mockDeleteFn = jest.fn().mockResolvedValue({ error: null });
    (createClientComponentClient as jest.Mock).mockImplementation(() =>
      createMockSupabaseClient({
        delete: mockDeleteFn,
      })
    );

    renderComponent();

    await waitFor(() => {
      const memberToRemove = mockMembers.find(m => m.role === 'member');
      const memberActions = screen.getByTestId(`member-actions-${memberToRemove?.id}`);
      fireEvent.click(memberActions);
      const removeButton = screen.getByText(/remove member/i);
      fireEvent.click(removeButton);
    });

    // Confirm removal
    const confirmButton = screen.getByRole('button', { name: /remove member/i });
    fireEvent.click(confirmButton);

    expect(mockDeleteFn).toHaveBeenCalled();
  });

  it('handles errors during member operations', async () => {
    (createClientComponentClient as jest.Mock).mockImplementation(() =>
      createMockSupabaseClient({
        then: jest.fn().mockImplementation((callback) => {
          callback({ data: null, error: new Error('Failed to load members') });
          return Promise.resolve({ data: null, error: new Error('Failed to load members') });
        }),
      })
    );

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/failed to load members/i)).toBeInTheDocument();
    });
  });
});