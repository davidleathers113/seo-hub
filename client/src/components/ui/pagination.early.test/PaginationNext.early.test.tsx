
// Unit tests for: PaginationNext

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { PaginationNext } from '../pagination';



describe('PaginationNext() PaginationNext method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the PaginationNext component with default props', () => {
      // This test checks if the component renders correctly with default properties
      const { getByText, getByLabelText } = render(<PaginationNext />);
      expect(getByText('Next')).toBeInTheDocument();
      expect(getByLabelText('Go to next page')).toBeInTheDocument();
    });

    it('should apply custom className to the PaginationNext component', () => {
      // This test checks if a custom className is applied correctly
      const customClass = 'custom-class';
      const { container } = render(<PaginationNext className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should render the ChevronRight icon within the PaginationNext component', () => {
      // This test checks if the ChevronRight icon is rendered within the component
      const { container } = render(<PaginationNext />);
      const chevronIcon = container.querySelector('svg');
      expect(chevronIcon).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle additional props passed to the PaginationNext component', () => {
      // This test checks if additional props are passed and handled correctly
      const { getByLabelText } = render(<PaginationNext data-testid="pagination-next" />);
      expect(getByLabelText('Go to next page')).toHaveAttribute('data-testid', 'pagination-next');
    });

    it('should not have aria-current attribute when isActive is not set', () => {
      // This test checks that aria-current is not set when isActive is not provided
      const { getByLabelText } = render(<PaginationNext />);
      expect(getByLabelText('Go to next page')).not.toHaveAttribute('aria-current');
    });

    it('should have aria-current attribute set to "page" when isActive is true', () => {
      // This test checks that aria-current is set to "page" when isActive is true
      const { getByLabelText } = render(<PaginationNext isActive />);
      expect(getByLabelText('Go to next page')).toHaveAttribute('aria-current', 'page');
    });
  });
});

// End of unit tests for: PaginationNext
