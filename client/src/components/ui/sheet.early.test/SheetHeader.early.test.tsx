
// Unit tests for: SheetHeader

import { render } from '@testing-library/react';
import { SheetHeader } from '../sheet';
import "@testing-library/jest-dom";

describe('SheetHeader() SheetHeader method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render without crashing', () => {
      // Test to ensure the component renders without any errors
      const { container } = render(<SheetHeader />);
      expect(container).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      // Test to ensure the default classes are applied
      const { container } = render(<SheetHeader />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('should accept and apply additional className', () => {
      // Test to ensure additional className is applied
      const additionalClass = 'custom-class';
      const { container } = render(<SheetHeader className={additionalClass} />);
      expect(container.firstChild).toHaveClass(additionalClass);
    });

    it('should pass additional props to the div', () => {
      // Test to ensure additional props are passed to the div
      const { container } = render(<SheetHeader data-testid="sheet-header" />);
      expect(container.firstChild).toHaveAttribute('data-testid', 'sheet-header');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // Test to ensure null className does not cause errors
      const { container } = render(<SheetHeader className={null as any} />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('should handle undefined className gracefully', () => {
      // Test to ensure undefined className does not cause errors
      const { container } = render(<SheetHeader className={undefined} />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('should render children correctly', () => {
      // Test to ensure children are rendered correctly
      const { getByText } = render(<SheetHeader>Test Content</SheetHeader>);
      expect(getByText('Test Content')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: SheetHeader
