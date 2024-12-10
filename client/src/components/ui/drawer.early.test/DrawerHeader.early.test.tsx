
// Unit tests for: DrawerHeader

import { render } from '@testing-library/react';
import { DrawerHeader } from '../drawer';
import "@testing-library/jest-dom";

describe('DrawerHeader() DrawerHeader method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render with default class names', () => {
      // This test checks if the DrawerHeader renders with default class names
      const { container } = render(<DrawerHeader />);
      expect(container.firstChild).toHaveClass('grid gap-1.5 p-4 text-center sm:text-left');
    });

    it('should render with additional class names', () => {
      // This test checks if the DrawerHeader renders with additional class names
      const { container } = render(<DrawerHeader className="extra-class" />);
      expect(container.firstChild).toHaveClass('grid gap-1.5 p-4 text-center sm:text-left extra-class');
    });

    it('should render children correctly', () => {
      // This test checks if the DrawerHeader renders children correctly
      const { getByText } = render(<DrawerHeader>Test Content</DrawerHeader>);
      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the DrawerHeader handles a null className gracefully
      const { container } = render(<DrawerHeader className={null as any} />);
      expect(container.firstChild).toHaveClass('grid gap-1.5 p-4 text-center sm:text-left');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the DrawerHeader handles an undefined className gracefully
      const { container } = render(<DrawerHeader className={undefined} />);
      expect(container.firstChild).toHaveClass('grid gap-1.5 p-4 text-center sm:text-left');
    });

    it('should render without children', () => {
      // This test checks if the DrawerHeader renders correctly without children
      const { container } = render(<DrawerHeader />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});

// End of unit tests for: DrawerHeader
