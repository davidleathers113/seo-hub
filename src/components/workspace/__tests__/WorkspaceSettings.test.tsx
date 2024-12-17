import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { WorkspaceSettings } from '../WorkspaceSettings'
import * as workspaceHooks from '@/providers/workspace'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database, Workspace } from '@/types/supabase'
import '@testing-library/jest-dom'

// Mock the workspace provider
jest.mock('@/providers/workspace')
jest.mock('@supabase/auth-helpers-nextjs')

type MockSupabaseClient = ReturnType<typeof createClientComponentClient<Database>>

describe('WorkspaceSettings', () => {
  const mockWorkspace: Workspace = {
    id: '1',
    name: 'Test Workspace',
    slug: 'test-workspace',
    owner_id: 'owner-123',
    settings: {
      theme: 'light',
      notifications_enabled: true,
      default_language: 'en',
      features: {},
    },
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
    categories: ['test', 'demo'],
  }

  const createMockSupabaseClient = (overrides = {}) => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((callback) => {
        callback({ data: mockWorkspace, error: null })
        return Promise.resolve({ data: mockWorkspace, error: null })
      }),
      ...overrides,
    } as unknown as MockSupabaseClient

    return mockClient
  }

  const mockUpdateWorkspace = jest.fn()
  const mockArchiveWorkspace = jest.fn()
  const mockGetWorkspaceStats = jest.fn().mockResolvedValue({
    totalContent: 100,
    totalUsers: 10,
  })
  const mockGetWorkspaceQuota = jest.fn().mockResolvedValue({
    used: 50,
    total: 100,
  })
  const mockExportWorkspaceData = jest.fn()
  const mockImportWorkspaceData = jest.fn()
  const mockSetWorkspace = jest.fn()

  beforeEach(() => {
    // Mock Supabase client
    (createClientComponentClient as jest.Mock).mockImplementation(() => createMockSupabaseClient())

    // Mock workspace context
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: mockWorkspace,
      workspaces: [mockWorkspace],
      updateWorkspace: mockUpdateWorkspace,
      archiveWorkspace: mockArchiveWorkspace,
      getWorkspaceStats: mockGetWorkspaceStats,
      getWorkspaceQuota: mockGetWorkspaceQuota,
      exportWorkspaceData: mockExportWorkspaceData,
      importWorkspaceData: mockImportWorkspaceData,
      setWorkspace: mockSetWorkspace,
      isLoading: false,
      error: null,
    } as ReturnType<typeof workspaceHooks.useWorkspace>)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders workspace settings form', async () => {
    render(<WorkspaceSettings />)

    await waitFor(() => {
      expect(screen.getByLabelText('Workspace Name')).toBeInTheDocument()
      expect(screen.getByLabelText('Workspace Slug')).toBeInTheDocument()
      expect(screen.getByText('Categories')).toBeInTheDocument()
    })
  })

  it('loads workspace settings', async () => {
    render(<WorkspaceSettings />)

    await waitFor(() => {
      const nameInput = screen.getByLabelText('Workspace Name')
      expect(nameInput).toHaveValue(mockWorkspace.name)
      expect(screen.getByLabelText('Workspace Slug')).toHaveValue(mockWorkspace.slug)
      mockWorkspace.categories?.forEach(category => {
        expect(screen.getByText(category)).toBeInTheDocument()
      })
    })
  })

  it('handles workspace name update', async () => {
    render(<WorkspaceSettings />)

    await waitFor(async () => {
      const nameInput = screen.getByLabelText('Workspace Name')
      fireEvent.change(nameInput, { target: { value: 'Updated Workspace' } })

      expect(mockUpdateWorkspace).toHaveBeenCalledWith(mockWorkspace.id, {
        name: 'Updated Workspace',
      })
    })
  })

  it('handles workspace archive', async () => {
    render(<WorkspaceSettings />)

    await waitFor(async () => {
      // Click the Backup & Restore tab
      fireEvent.click(screen.getByTestId('tab-trigger-backup'))

      // Click the Archive button
      const archiveButton = screen.getByRole('button', { name: /archive workspace/i })
      fireEvent.click(archiveButton)

      expect(mockArchiveWorkspace).toHaveBeenCalledWith(mockWorkspace.id)
    })
  })

  it('handles workspace export', async () => {
    const mockBlob = new Blob(['test data'])
    mockExportWorkspaceData.mockResolvedValue(mockBlob)

    render(<WorkspaceSettings />)

    await waitFor(async () => {
      // Click the Backup & Restore tab
      fireEvent.click(screen.getByTestId('tab-trigger-backup'))

      // Click the Export button
      const exportButton = screen.getByRole('button', { name: /export data/i })
      fireEvent.click(exportButton)

      expect(mockExportWorkspaceData).toHaveBeenCalledWith(mockWorkspace.id)
    })
  })

  it('handles workspace import', async () => {
    const file = new File(['test data'], 'test.json', { type: 'application/json' })

    render(<WorkspaceSettings />)

    await waitFor(async () => {
      // Click the Backup & Restore tab
      fireEvent.click(screen.getByTestId('tab-trigger-backup'))

      // Find the file input and simulate file selection
      const input = screen.getByLabelText(/import data/i)
      fireEvent.change(input, { target: { files: [file] } })

      expect(mockImportWorkspaceData).toHaveBeenCalledWith(mockWorkspace.id, file)
    })
  })

  it('shows loading state', () => {
    // Mock loading state
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: null,
      workspaces: [],
      isLoading: true,
      error: null,
      updateWorkspace: mockUpdateWorkspace,
      archiveWorkspace: mockArchiveWorkspace,
      getWorkspaceStats: mockGetWorkspaceStats,
      getWorkspaceQuota: mockGetWorkspaceQuota,
      exportWorkspaceData: mockExportWorkspaceData,
      importWorkspaceData: mockImportWorkspaceData,
      setWorkspace: mockSetWorkspace,
    } as ReturnType<typeof workspaceHooks.useWorkspace>)

    render(<WorkspaceSettings />)
    expect(screen.getByTestId('workspace-settings-loading')).toBeInTheDocument()
  })

  it('shows error state', () => {
    // Mock error state
    jest.spyOn(workspaceHooks, 'useWorkspace').mockReturnValue({
      workspace: null,
      workspaces: [],
      isLoading: false,
      error: new Error('Failed to load workspace'),
      updateWorkspace: mockUpdateWorkspace,
      archiveWorkspace: mockArchiveWorkspace,
      getWorkspaceStats: mockGetWorkspaceStats,
      getWorkspaceQuota: mockGetWorkspaceQuota,
      exportWorkspaceData: mockExportWorkspaceData,
      importWorkspaceData: mockImportWorkspaceData,
      setWorkspace: mockSetWorkspace,
    } as ReturnType<typeof workspaceHooks.useWorkspace>)

    render(<WorkspaceSettings />)
    expect(screen.getByTestId('workspace-settings-error')).toBeInTheDocument()
  })
})