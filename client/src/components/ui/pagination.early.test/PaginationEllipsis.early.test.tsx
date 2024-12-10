
// Unit tests for: PaginationEllipsis

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { PaginationEllipsis } from '../pagination';



describe('PaginationEllipsis() PaginationEllipsis method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the PaginationEllipsis component correctly', () => {
      // This test checks if the component renders without crashing
      const { getByRole } = render(<PaginationEllipsis />);
      const ellipsisElement = getByRole('presentation');
      expect(ellipsisElement).toBeInTheDocument();
    });

    it('should have the correct default class names', () => {
      // This test checks if the component has the correct default class names
      const { container } = render(<PaginationEllipsis />);
      const ellipsisElement = container.firstChild;
      expect(ellipsisElement).toHaveClass('flex h-9 w-9 items-center justify-center');
    });

    it('should render the MoreHorizontal icon', () => {
      // This test checks if the MoreHorizontal icon is rendered within the component
      const { container } = render(<PaginationEllipsis />);
      const iconElement = container.querySelector('svg');
      expect(iconElement).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should accept and apply additional class names', () => {
      // This test checks if additional class names are applied correctly
      const additionalClass = 'extra-class';
      const { container } = render(<PaginationEllipsis className={additionalClass} />);
      const ellipsisElement = container.firstChild;
      expect(ellipsisElement).toHaveClass(additionalClass);
    });

    it('should handle additional props correctly', () => {
      // This test checks if additional props are passed down correctly
      const { container } = render(<PaginationEllipsis data-testid="ellipsis-test" />);
      const ellipsisElement = container.firstChild;
      expect(ellipsisElement).toHaveAttribute('data-testid', 'ellipsis-test');
    });

    it('should be aria-hidden by default', () => {
      // This test checks if the component is aria-hidden by default
      const { container } = render(<PaginationEllipsis />);
      const ellipsisElement = container.firstChild;
      expect(ellipsisElement).toHaveAttribute('aria-hidden', 'true');
    });
  });
});

// End of unit tests for: PaginationEllipsis
