import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PillarTreeView } from '../PillarTreeView'
import { 
  renderWithProviders, 
  createMockTreeProps,
  mockHandlers, 
  resetMocks 
} from './test-utils'

describe('PillarTreeView', () => {
  const defaultProps = createMockTreeProps()

  beforeEach(() => {
    resetMocks()
  })

  it('renders all pillars', () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    expect(screen.getByText('Test Pillar 1')).toBeInTheDocument()
    expect(screen.getByText('Test Pillar 2')).toBeInTheDocument()
  })

  it('expands and collapses pillars independently', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Initially subpillars should not be visible
    expect(screen.queryByText('Test Subpillar 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Test Subpillar 2')).not.toBeInTheDocument()
    
    // Expand first pillar
    await userEvent.click(screen.getByText('Test Pillar 1'))
    expect(screen.getByText('Test Subpillar 1')).toBeInTheDocument()
    expect(screen.getByText('Test Subpillar 2')).toBeInTheDocument()
    
    // Second pillar should still be collapsed
    await userEvent.click(screen.getByText('Test Pillar 2'))
    expect(screen.getByText('Test Subpillar 1')).toBeInTheDocument() // First pillar still expanded
    
    // Collapse first pillar
    await userEvent.click(screen.getByText('Test Pillar 1'))
    expect(screen.queryByText('Test Subpillar 1')).not.toBeInTheDocument()
  })

  it('handles pillar updates', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Edit pillar title
    const editButton = screen.getAllByRole('button', { name: /edit/i })[0]
    await userEvent.click(editButton)
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated Pillar{enter}')
    
    expect(mockHandlers.onPillarUpdate).toHaveBeenCalledWith(
      'pillar-1',
      { title: 'Updated Pillar' }
    )
  })

  it('handles subpillar updates', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Expand pillar first
    await userEvent.click(screen.getByText('Test Pillar 1'))
    
    // Edit subpillar title
    const editButton = screen.getAllByRole('button', { name: /edit/i })[1]
    await userEvent.click(editButton)
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated Subpillar{enter}')
    
    expect(mockHandlers.onSubpillarUpdate).toHaveBeenCalledWith(
      'pillar-1',
      'sub-1',
      { title: 'Updated Subpillar' }
    )
  })

  it('handles adding subpillars', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    await userEvent.click(screen.getAllByRole('button', { name: /add subpillar/i })[0])
    expect(mockHandlers.onAddSubpillar).toHaveBeenCalledWith('pillar-1')
  })

  it('handles deleting pillars', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    await userEvent.click(screen.getAllByRole('button', { name: /delete pillar/i })[0])
    expect(mockHandlers.onDeletePillar).toHaveBeenCalledWith('pillar-1')
  })

  it('handles deleting subpillars', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Expand pillar first
    await userEvent.click(screen.getByText('Test Pillar 1'))
    
    await userEvent.click(screen.getAllByRole('button', { name: /delete subpillar/i })[0])
    expect(mockHandlers.onDeleteSubpillar).toHaveBeenCalledWith('pillar-1', 'sub-1')
  })

  it('navigates to subpillar detail', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Expand pillar first
    await userEvent.click(screen.getByText('Test Pillar 1'))
    
    // Click navigate button
    await userEvent.click(screen.getAllByRole('button', { name: /navigate to subpillar/i })[0])
    expect(mockHandlers.onNavigateToSubpillar).toHaveBeenCalledWith('sub-1')
  })

  it('maintains expanded state when updating pillars', async () => {
    const { rerender } = renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Expand first pillar
    await userEvent.click(screen.getByText('Test Pillar 1'))
    expect(screen.getByText('Test Subpillar 1')).toBeInTheDocument()
    
    // Update props
    const updatedProps = {
      ...defaultProps,
      pillars: defaultProps.pillars.map(pillar => ({
        ...pillar,
        title: pillar.title + ' Updated'
      }))
    }
    
    rerender(<PillarTreeView {...updatedProps} />)
    
    // First pillar should still be expanded
    expect(screen.getByText('Test Subpillar 1')).toBeInTheDocument()
  })

  it('shows correct status badges for all items', async () => {
    renderWithProviders(<PillarTreeView {...defaultProps} />)
    
    // Check pillar statuses
    expect(screen.getByText('pending')).toHaveClass('bg-yellow-500')
    expect(screen.getByText('approved')).toHaveClass('bg-green-500')
    
    // Expand to check subpillar statuses
    await userEvent.click(screen.getByText('Test Pillar 1'))
    
    // Wait for the subpillar statuses to be visible
    const researchBadge = await screen.findByText('research')
    const outlineBadge = await screen.findByText('outline')
    
    expect(researchBadge).toHaveClass('bg-blue-500')
    expect(outlineBadge).toHaveClass('bg-yellow-500')
  })
})
