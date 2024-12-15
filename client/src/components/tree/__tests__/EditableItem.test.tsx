import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EditableItem } from '../EditableItem'
import { renderWithProviders } from './test-utils'
import { vi } from 'vitest'

describe('EditableItem', () => {
  const mockOnSave = vi.fn()
  const defaultProps = {
    title: 'Test Title',
    onSave: mockOnSave,
  }

  beforeEach(() => {
    mockOnSave.mockClear()
  })

  it('renders the title in display mode', () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument()
  })

  it('switches to edit mode when edit button is clicked', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('textbox')).toHaveValue('Test Title')
  })

  it('saves changes when Enter is pressed', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'New Title{enter}')
    
    expect(mockOnSave).toHaveBeenCalledWith('New Title')
    expect(screen.getByText('Test Title')).toBeInTheDocument() // Shows original until parent updates
  })

  it('cancels editing when Escape is pressed', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'New Title{escape}')
    
    expect(mockOnSave).not.toHaveBeenCalled()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })

  it('does not save if the title is empty', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, '{enter}')
    
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('does not save if the title is unchanged', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    const input = screen.getByRole('textbox')
    await userEvent.type(input, '{enter}')
    
    expect(mockOnSave).not.toHaveBeenCalled()
  })

  it('applies custom className', () => {
    const { container } = renderWithProviders(
      <EditableItem {...defaultProps} className="custom-class" />
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('shows save and cancel buttons in edit mode', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('saves changes when clicking save button', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'New Title')
    await userEvent.click(screen.getByRole('button', { name: /save/i }))
    
    expect(mockOnSave).toHaveBeenCalledWith('New Title')
  })

  it('cancels editing when clicking cancel button', async () => {
    renderWithProviders(<EditableItem {...defaultProps} />)
    await userEvent.click(screen.getByRole('button', { name: /edit/i }))
    
    const input = screen.getByRole('textbox')
    await userEvent.clear(input)
    await userEvent.type(input, 'New Title')
    await userEvent.click(screen.getByRole('button', { name: /cancel/i }))
    
    expect(mockOnSave).not.toHaveBeenCalled()
    expect(screen.getByText('Test Title')).toBeInTheDocument()
  })
})
