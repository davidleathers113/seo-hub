
// Unit tests for: ViewToggle

import { fireEvent, render, screen } from '@testing-library/react';
import { ViewToggle } from '../ViewToggle';
import "@testing-library/jest-dom";

describe('ViewToggle() ViewToggle method', () => {
  // Happy paths
  describe('Happy paths', () => {
    it('should render the LayoutGrid icon when isWhiteboard is true', () => {
      // Arrange
      const onToggleMock = jest.fn();

      // Act
      render(<ViewToggle isWhiteboard={true} onToggle={onToggleMock} />);

      // Assert
      expect(screen.getByRole('button')).toContainElement(screen.getByTestId('layout-grid-icon'));
    });

    it('should render the Network icon when isWhiteboard is false', () => {
      // Arrange
      const onToggleMock = jest.fn();

      // Act
      render(<ViewToggle isWhiteboard={false} onToggle={onToggleMock} />);

      // Assert
      expect(screen.getByRole('button')).toContainElement(screen.getByTestId('network-icon'));
    });

    it('should call onToggle when the button is clicked', () => {
      // Arrange
      const onToggleMock = jest.fn();

      // Act
      render(<ViewToggle isWhiteboard={true} onToggle={onToggleMock} />);
      fireEvent.click(screen.getByRole('button'));

      // Assert
      expect(onToggleMock).toHaveBeenCalledTimes(1);
    });

    it('should display the correct tooltip content when isWhiteboard is true', () => {
      // Arrange
      const onToggleMock = jest.fn();

      // Act
      render(<ViewToggle isWhiteboard={true} onToggle={onToggleMock} />);
      fireEvent.mouseOver(screen.getByRole('button'));

      // Assert
      expect(screen.getByText('Switch to List View')).toBeInTheDocument();
    });

    it('should display the correct tooltip content when isWhiteboard is false', () => {
      // Arrange
      const onToggleMock = jest.fn();

      // Act
      render(<ViewToggle isWhiteboard={false} onToggle={onToggleMock} />);
      fireEvent.mouseOver(screen.getByRole('button'));

      // Assert
      expect(screen.getByText('Switch to Whiteboard View')).toBeInTheDocument();
    });
  });

  // Edge cases
  describe('Edge cases', () => {
    it('should handle rapid toggling without errors', () => {
      // Arrange
      const onToggleMock = jest.fn();

      // Act
      render(<ViewToggle isWhiteboard={true} onToggle={onToggleMock} />);
      const button = screen.getByRole('button');
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Assert
      expect(onToggleMock).toHaveBeenCalledTimes(3);
    });

    it('should render without crashing when onToggle is a no-op function', () => {
      // Arrange
      const onToggleMock = () => {};

      // Act
      const { container } = render(<ViewToggle isWhiteboard={true} onToggle={onToggleMock} />);

      // Assert
      expect(container).toBeInTheDocument();
    });
  });
});

// End of unit tests for: ViewToggle
