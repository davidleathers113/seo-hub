
// Unit tests for: PillarModifyDialog

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { PillarModifyDialog } from '../PillarModifyDialog';
import "@testing-library/jest-dom";

describe('PillarModifyDialog() PillarModifyDialog method', () => {
  const mockOnOpenChange = jest.fn();
  const mockOnSave = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render the dialog with initial title', () => {
      // Test to ensure the dialog renders with the initial title
      render(
        <PillarModifyDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          initialTitle="Initial Title"
          onSave={mockOnSave}
        />
      );

      expect(screen.getByDisplayValue('Initial Title')).toBeInTheDocument();
    });

    it('should call onSave with the new title when save button is clicked', async () => {
      // Test to ensure onSave is called with the new title
      render(
        <PillarModifyDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          initialTitle="Initial Title"
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText('Enter pillar title');
      fireEvent.change(input, { target: { value: 'New Title' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith('New Title');
      });
    });

    it('should close the dialog after successful save', async () => {
      // Test to ensure the dialog closes after a successful save
      mockOnSave.mockResolvedValueOnce(undefined);

      render(
        <PillarModifyDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          initialTitle="Initial Title"
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText('Enter pillar title');
      fireEvent.change(input, { target: { value: 'New Title' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should disable save button if title is empty', () => {
      // Test to ensure the save button is disabled if the title is empty
      render(
        <PillarModifyDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          initialTitle="Initial Title"
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText('Enter pillar title');
      fireEvent.change(input, { target: { value: '' } });

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    it('should disable save button if title is unchanged', () => {
      // Test to ensure the save button is disabled if the title is unchanged
      render(
        <PillarModifyDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          initialTitle="Initial Title"
          onSave={mockOnSave}
        />
      );

      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    it('should handle save error gracefully', async () => {
      // Test to ensure the component handles save errors gracefully
      mockOnSave.mockRejectedValueOnce(new Error('Save failed'));

      render(
        <PillarModifyDialog
          isOpen={true}
          onOpenChange={mockOnOpenChange}
          initialTitle="Initial Title"
          onSave={mockOnSave}
        />
      );

      const input = screen.getByPlaceholderText('Enter pillar title');
      fireEvent.change(input, { target: { value: 'New Title' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockOnOpenChange).not.toHaveBeenCalled();
      });
    });
  });
});

// End of unit tests for: PillarModifyDialog
