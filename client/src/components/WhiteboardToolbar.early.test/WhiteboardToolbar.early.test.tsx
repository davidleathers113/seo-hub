
// Unit tests for: WhiteboardToolbar

import { fireEvent, render, screen } from '@testing-library/react';
import { WhiteboardToolbar } from '../WhiteboardToolbar';
import "@testing-library/jest-dom";

describe('WhiteboardToolbar() WhiteboardToolbar method', () => {
  // Mock functions for the props
  const mockOnAddPillar = jest.fn();
  const mockOnAddSubpillar = jest.fn();
  const mockOnDeleteNodes = jest.fn();

  beforeEach(() => {
    // Clear all instances and calls to constructor and all methods:
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    test('should render all buttons with correct labels', () => {
      // Render the component
      render(
        <WhiteboardToolbar
          onAddPillar={mockOnAddPillar}
          onAddSubpillar={mockOnAddSubpillar}
          onDeleteNodes={mockOnDeleteNodes}
        />
      );

      // Check if all buttons are rendered with correct text
      expect(screen.getByText('Add Pillar')).toBeInTheDocument();
      expect(screen.getByText('Add Subpillar')).toBeInTheDocument();
      expect(screen.getByText('Delete Node')).toBeInTheDocument();
    });

    test('should call onAddPillar when "Add Pillar" button is clicked', () => {
      // Render the component
      render(
        <WhiteboardToolbar
          onAddPillar={mockOnAddPillar}
          onAddSubpillar={mockOnAddSubpillar}
          onDeleteNodes={mockOnDeleteNodes}
        />
      );

      // Simulate button click
      fireEvent.click(screen.getByText('Add Pillar'));

      // Check if the mock function was called
      expect(mockOnAddPillar).toHaveBeenCalledTimes(1);
    });

    test('should call onAddSubpillar when "Add Subpillar" button is clicked', () => {
      // Render the component
      render(
        <WhiteboardToolbar
          onAddPillar={mockOnAddPillar}
          onAddSubpillar={mockOnAddSubpillar}
          onDeleteNodes={mockOnDeleteNodes}
        />
      );

      // Simulate button click
      fireEvent.click(screen.getByText('Add Subpillar'));

      // Check if the mock function was called
      expect(mockOnAddSubpillar).toHaveBeenCalledTimes(1);
    });

    test('should call onDeleteNodes when "Delete Node" button is clicked', () => {
      // Render the component
      render(
        <WhiteboardToolbar
          onAddPillar={mockOnAddPillar}
          onAddSubpillar={mockOnAddSubpillar}
          onDeleteNodes={mockOnDeleteNodes}
        />
      );

      // Simulate button click
      fireEvent.click(screen.getByText('Delete Node'));

      // Check if the mock function was called
      expect(mockOnDeleteNodes).toHaveBeenCalledTimes(1);
    });
  });

  describe('Edge Cases', () => {
    test('should not throw error if no handlers are provided', () => {
      // Render the component without any handlers
      render(<WhiteboardToolbar onAddPillar={undefined} onAddSubpillar={undefined} onDeleteNodes={undefined} />);

      // Simulate button clicks
      fireEvent.click(screen.getByText('Add Pillar'));
      fireEvent.click(screen.getByText('Add Subpillar'));
      fireEvent.click(screen.getByText('Delete Node'));

      // No assertions needed, just ensuring no errors are thrown
    });

    test('should handle rapid consecutive clicks gracefully', () => {
      // Render the component
      render(
        <WhiteboardToolbar
          onAddPillar={mockOnAddPillar}
          onAddSubpillar={mockOnAddSubpillar}
          onDeleteNodes={mockOnDeleteNodes}
        />
      );

      // Simulate rapid button clicks
      fireEvent.click(screen.getByText('Add Pillar'));
      fireEvent.click(screen.getByText('Add Pillar'));
      fireEvent.click(screen.getByText('Add Subpillar'));
      fireEvent.click(screen.getByText('Add Subpillar'));
      fireEvent.click(screen.getByText('Delete Node'));
      fireEvent.click(screen.getByText('Delete Node'));

      // Check if the mock functions were called the correct number of times
      expect(mockOnAddPillar).toHaveBeenCalledTimes(2);
      expect(mockOnAddSubpillar).toHaveBeenCalledTimes(2);
      expect(mockOnDeleteNodes).toHaveBeenCalledTimes(2);
    });
  });
});

// End of unit tests for: WhiteboardToolbar
