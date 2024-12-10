
// Unit tests for: PaginationPrevious

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { PaginationPrevious } from '../pagination';



describe('PaginationPrevious() PaginationPrevious method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the PaginationPrevious component with default props', () => {
      // This test checks if the component renders correctly with default properties
      const { getByLabelText, getByText } = render(<PaginationPrevious />);
      expect(getByLabelText('Go to previous page')).toBeInTheDocument();
      expect(getByText('Previous')).toBeInTheDocument();
    });

    it('should apply custom className to the component', () => {
      // This test checks if a custom className is applied correctly
      const customClass = 'custom-class';
      const { container } = render(<PaginationPrevious className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should pass additional props to the component', () => {
      // This test checks if additional props are passed correctly
      const { getByLabelText } = render(<PaginationPrevious data-testid="pagination-previous" />);
      expect(getByLabelText('Go to previous page')).toHaveAttribute('data-testid', 'pagination-previous');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the component handles a null className without errors
      const { getByLabelText } = render(<PaginationPrevious className={null as any} />);
      expect(getByLabelText('Go to previous page')).toBeInTheDocument();
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the component handles an undefined className without errors
      const { getByLabelText } = render(<PaginationPrevious className={undefined} />);
      expect(getByLabelText('Go to previous page')).toBeInTheDocument();
    });

    it('should handle empty string className gracefully', () => {
      // This test checks if the component handles an empty string className without errors
      const { getByLabelText } = render(<PaginationPrevious className="" />);
      expect(getByLabelText('Go to previous page')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: PaginationPrevious
