import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PillarItem } from '../PillarItem'
import { 
  renderWithProviders, 
  createMockPillar, 
  createMockSubpillar,
  mockHandlers, 
  resetMocks 
} from './test-utils'

describe('PillarItem', () => {
  const defaultProps = {
    ...createMockPillar('pillar-1', 'Test Pillar', 'pending', [
      createMockSubpillar('sub-1', 'Test Subpillar 1', 'research', 20),
      createMockSubpillar('sub-2', 'Test Subpillar 2', 'outline', 40)
    ]),
    isExpanded: false,
    onToggleExpand: mockHandlers.onPillarUpdate,
    onUpdate: mockHandlers.onPillarUpdate,
    onSubpillarUpdate: mockHandlers.onSubpillarUpdate,
    onAddSubpillar: mockHandlers.onAddSubpillar,
    onDelete: mockHandlers.onDeletePillar,
    onDeleteSubpillar: mockHandlers.onDeleteSubpillar,
    onNavigateToSubpillar: mockHandlers.onNavigateToSubpillar
  }

  beforeEach(() => {
    resetMocks()
  })

  it('renders pillar information correctly', () => {
    renderWithProviders(<PillarItem {...defaultProps} />)
    
    expect(screen.getByText('Test Pillar')).toBeInTheDocument()
    expect(screen.getByText('pending')).toBeInTheDocument()
    expect(screen.getByText('2 subpillars')).toBeInTheDocument()
  })

  it('toggles expansion when clicked', async () => {
    renderWithProviders(<PillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByText('Test Pillar'))
    expect(mockHandlers.onPillarUpdate).toHaveBeenCalledWith('pillar-1')
  })

  it('shows subpillars when expanded', () => {
    renderWithProviders(<PillarItem {...defaultProps} isExpanded={true} />)
    
    expect(screen.getByText('Test Subpillar 1')).toBeInTheDocument()
    expect(screen.getByText('Test Subpillar 2')).toBeInTheDocument()
  })

  it('calls onAddSubpillar when add button is clicked', async () => {
    renderWithProviders(<PillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByRole('button', { name: /add subpillar/i }))
    expect(mockHandlers.onAddSubpillar).toHaveBeenCalledWith('pillar-1')
  })

  it('calls onDelete when delete button is clicked', async () => {
    renderWithProviders(<PillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByRole('button', { name: /delete pillar/i }))
    expect(mockHandlers.onDeletePillar).toHaveBeenCalledWith('pillar-1')
  })

  it('calls onUpdate when title is edited', async () => {
    renderWithProviders(<PillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated Pillar{enter}')
    
    expect(mockHandlers.onPillarUpdate).toHaveBeenCalledWith('pillar-1', { title: 'Updated Pillar' })
  })

  it('shows correct chevron icon based on expansion state', () => {
    const { rerender } = renderWithProviders(<PillarItem {...defaultProps} />)
    expect(screen.getByTestId('chevron-right')).toBeInTheDocument()
    
    rerender(<PillarItem {...defaultProps} isExpanded={true} />)
    expect(screen.getByTestId('chevron-down')).toBeInTheDocument()
  })

  it('handles subpillar actions correctly when expanded', async () => {
    renderWithProviders(<PillarItem {...defaultProps} isExpanded={true} />)
    
    // Test subpillar update
    await userEvent.click(screen.getAllByRole('button', { name: /edit/i })[1])
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated Subpillar{enter}')
    
    expect(mockHandlers.onSubpillarUpdate).toHaveBeenCalledWith(
      'pillar-1',
      'sub-1',
      { title: 'Updated Subpillar' }
    )

    // Test subpillar navigation
    await userEvent.click(screen.getAllByRole('button', { name: /navigate to subpillar/i })[0])
    expect(mockHandlers.onNavigateToSubpillar).toHaveBeenCalledWith('sub-1')
    
    // Test subpillar deletion
    await userEvent.click(screen.getAllByRole('button', { name: /delete subpillar/i })[0])
    expect(mockHandlers.onDeleteSubpillar).toHaveBeenCalledWith('pillar-1', 'sub-1')
  })

  it('prevents event propagation for action buttons', async () => {
    renderWithProviders(<PillarItem {...defaultProps} />)
    
    const addButton = screen.getByRole('button', { name: /add subpillar/i })
    const deleteButton = screen.getByRole('button', { name: /delete pillar/i })
    
    await userEvent.click(addButton)
    await userEvent.click(deleteButton)
    
    // The toggle handler should not be called when clicking action buttons
    expect(mockHandlers.onPillarUpdate).not.toHaveBeenCalled()
    expect(mockHandlers.onAddSubpillar).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onDeletePillar).toHaveBeenCalledTimes(1)
  })

  it('applies correct status colors', () => {
    const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected']
    
    statuses.forEach(status => {
      const props = {
        ...defaultProps,
        status
      }
      const { rerender } = renderWithProviders(<PillarItem {...props} />)
      
      const statusBadge = screen.getByText(status)
      expect(statusBadge).toHaveClass(
        status === 'approved' ? 'bg-green-500' :
        status === 'pending' ? 'bg-yellow-500' :
        'bg-red-500'
      )
      
      rerender(<></>)
    })
  })
})
