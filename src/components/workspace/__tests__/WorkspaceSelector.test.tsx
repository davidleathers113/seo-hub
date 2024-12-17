// External dependencies
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Internal modules
import { WorkspaceSelector } from '../WorkspaceSelector'
import * as workspaceHooks from '@/providers/workspace'

// Types
import type { Database, Workspace } from '@/types/supabase'

// Test setup
jest.mock('@/providers/workspace')
jest.mock('@supabase/auth-helpers-nextjs')

// Type definitions
type MockSupabaseClient = ReturnType<typeof createClientComponentClient<Database>>

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return children;
};

describe('WorkspaceSelector', () => {
  const mockWorkspaces: Workspace[] = [
    {
      id: '1',
      name: 'Workspace 1',
      slug: 'workspace-1',
      owner_id: 'owner-123',
      settings: {
        theme: 'light',
        notifications_enabled: true,
        default_language: 'en',
        features: {},
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: '2',
      name: 'Workspace 2',
      slug: 'workspace-2',
      owner_id: 'owner-123',
      settings: {
        theme: 'dark',
        notifications_enabled: true,
        default_language: 'en',
        features: {},
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
  ]

  const createMockSupabaseClient = (overrides = {}) => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        callback({ data: mockWorkspaces, error: null })
        return Promise.resolve({ data: mockWorkspaces, error: null })
      }),
      ...overrides,
    } as unknown as MockSupabaseClient

    return mockClient
  }

  const mockSwitchWorkspace = jest.fn()
  const mockCreateWorkspace = jest.fn()
  const mockSetWorkspace = jest.fn()

  beforeEach(() => {
    // Mock Supabase client
    (createClientComponentClient as jest.Mock).mockImplementation(() => createMockSupabaseClient())

    // Mock workspace context
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: null,
      workspaces: mockWorkspaces,
      switchWorkspace: mockSwitchWorkspace,
      createWorkspace: mockCreateWorkspace,
      setWorkspace: mockSetWorkspace,
      isLoading: false,
      error: null,
    } as ReturnType<typeof workspaceHooks.useWorkspace>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  const renderComponent = () => {
    return render(
      <TestWrapper>
        <WorkspaceSelector />
      </TestWrapper>
    );
  };

  it('renders workspace selector', () => {
    renderComponent();
    expect(screen.getByRole('combobox', { name: 'Select a workspace' })).toBeInTheDocument()
  })

  it('displays workspaces in dropdown', async () => {
    renderComponent();

    // Open dropdown
    fireEvent.click(screen.getByRole('combobox', { name: 'Select a workspace' }))

    // Wait for workspaces to be rendered
    await waitFor(() => {
      mockWorkspaces.forEach(workspace => {
        const item = screen.getByTestId(`workspace-item-${workspace.id}`)
        expect(item).toHaveTextContent(workspace.name)
      })
    })
  })

  it('handles workspace selection', async () => {
    renderComponent();

    // Open dropdown
    fireEvent.click(screen.getByRole('combobox', { name: 'Select a workspace' }))

    // Select workspace
    await waitFor(() => {
      const item = screen.getByTestId(`workspace-item-${mockWorkspaces[0].id}`)
      fireEvent.click(item)
      expect(mockSwitchWorkspace).toHaveBeenCalledWith(mockWorkspaces[0].id)
    })
  })

  it('shows create workspace dialog', async () => {
    renderComponent();

    // Open dropdown
    fireEvent.click(screen.getByRole('combobox', { name: 'Select a workspace' }))

    // Click create workspace button
    await waitFor(() => {
      const createButton = screen.getByTestId('create-workspace-button')
      fireEvent.click(createButton)
      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Workspace name')).toBeInTheDocument()
    })
  })

  it('handles workspace creation', async () => {
    const newWorkspaceName = 'New Workspace'
    const newWorkspace: Workspace = {
      id: '3',
      name: newWorkspaceName,
      slug: 'new-workspace',
      owner_id: 'owner-123',
      settings: {
        theme: 'light',
        notifications_enabled: true,
        default_language: 'en',
        features: {},
      },
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }
    mockCreateWorkspace.mockResolvedValueOnce(newWorkspace)

    renderComponent();

    // Open dropdown and create dialog
    fireEvent.click(screen.getByRole('combobox', { name: 'Select a workspace' }))
    await waitFor(() => {
      const createButton = screen.getByTestId('create-workspace-button')
      fireEvent.click(createButton)
    })

    // Fill and submit form
    const input = screen.getByPlaceholderText('Workspace name')
    fireEvent.change(input, { target: { value: newWorkspaceName } })
    fireEvent.click(screen.getByRole('button', { name: 'Create' }))

    await waitFor(() => {
      expect(mockCreateWorkspace).toHaveBeenCalledWith(newWorkspaceName)
      expect(mockSwitchWorkspace).toHaveBeenCalledWith(newWorkspace.id)
    })
  })

  it('shows loading state', () => {
    // Mock loading state
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: null,
      workspaces: [],
      isLoading: true,
      error: null,
      switchWorkspace: mockSwitchWorkspace,
      createWorkspace: mockCreateWorkspace,
    } as ReturnType<typeof workspaceHooks.useWorkspace>)

    renderComponent();
    expect(screen.getByTestId('workspace-selector-loading')).toBeInTheDocument()
  })

  it('shows error state', () => {
    // Mock error state
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: null,
      workspaces: [],
      isLoading: false,
      error: new Error('Failed to load workspaces'),
      switchWorkspace: mockSwitchWorkspace,
      createWorkspace: mockCreateWorkspace,
    } as ReturnType<typeof workspaceHooks.useWorkspace>)

    renderComponent();
    expect(screen.getByTestId('workspace-selector-error')).toBeInTheDocument()
  })
})