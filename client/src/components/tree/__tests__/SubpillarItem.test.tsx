import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SubpillarItem } from '../SubpillarItem'
import { renderWithProviders, createMockSubpillar, mockHandlers, resetMocks } from './test-utils'

describe('SubpillarItem', () => {
  const defaultProps = {
    ...createMockSubpillar('sub-1', 'Test Subpillar', 'research', 25),
    pillarId: 'pillar-1',
    onUpdate: mockHandlers.onSubpillarUpdate,
    onDelete: mockHandlers.onDeleteSubpillar,
    onNavigate: mockHandlers.onNavigateToSubpillar
  }

  beforeEach(() => {
    resetMocks()
  })

  it('renders subpillar information correctly', () => {
    renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    expect(screen.getByText('Test Subpillar')).toBeInTheDocument()
    expect(screen.getByText('research')).toBeInTheDocument()
    expect(screen.getByText('25%')).toBeInTheDocument()
  })

  it('calls onNavigate when navigate button is clicked', async () => {
    renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByRole('button', { name: /navigate to subpillar/i }))
    expect(mockHandlers.onNavigateToSubpillar).toHaveBeenCalledWith('sub-1')
  })

  it('calls onDelete when delete button is clicked', async () => {
    renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByRole('button', { name: /delete subpillar/i }))
    expect(mockHandlers.onDeleteSubpillar).toHaveBeenCalledWith('pillar-1', 'sub-1')
  })

  it('calls onUpdate when title is edited', async () => {
    renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'Updated Subpillar{enter}')
    
    expect(mockHandlers.onSubpillarUpdate).toHaveBeenCalledWith(
      'pillar-1',
      'sub-1',
      { title: 'Updated Subpillar' }
    )
  })

  it('applies correct status color class', () => {
    renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    const statusBadge = screen.getByText('research')
    expect(statusBadge).toHaveClass('bg-blue-500')
  })

  it('shows progress percentage', () => {
    renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    const progressText = screen.getByText('25%')
    expect(progressText).toHaveClass('text-muted-foreground')
  })

  it('prevents event propagation when clicking action buttons', async () => {
    const { container } = renderWithProviders(<SubpillarItem {...defaultProps} />)
    
    // Click the container first to ensure event propagation is working
    await userEvent.click(container.firstChild as Element)
    
    // Then click the action buttons and verify they don't propagate
    await userEvent.click(screen.getByRole('button', { name: /delete subpillar/i }))
    await userEvent.click(screen.getByRole('button', { name: /navigate to subpillar/i }))
    
    // The handlers should be called exactly once each
    expect(mockHandlers.onDeleteSubpillar).toHaveBeenCalledTimes(1)
    expect(mockHandlers.onNavigateToSubpillar).toHaveBeenCalledTimes(1)
  })

  it('handles different status types correctly', () => {
    const statuses: Array<'research' | 'outline' | 'draft' | 'complete'> = [
      'research',
      'outline',
      'draft',
      'complete'
    ]

    statuses.forEach(status => {
      const props = {
        ...defaultProps,
        status
      }
      const { rerender } = renderWithProviders(<SubpillarItem {...props} />)
      
      const statusBadge = screen.getByText(status)
      expect(statusBadge).toBeInTheDocument()
      
      // Clean up before next render
      rerender(<></>)
    })
  })
})
