
// Unit tests for: BreadcrumbEllipsis

import { render } from '@testing-library/react';
import { BreadcrumbEllipsis } from '../breadcrumb';
import "@testing-library/jest-dom";

describe('BreadcrumbEllipsis() BreadcrumbEllipsis method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the BreadcrumbEllipsis component with default props', () => {
      // This test checks if the component renders correctly with default properties
      const { getByRole } = render(<BreadcrumbEllipsis />);
      const ellipsis = getByRole('presentation');

      expect(ellipsis).toBeInTheDocument();
      expect(ellipsis).toHaveClass('flex h-9 w-9 items-center justify-center');
      expect(ellipsis).toContainHTML('<span class="sr-only">More</span>');
    });

    it('should apply additional class names passed via props', () => {
      // This test checks if additional class names are applied correctly
      const additionalClass = 'extra-class';
      const { getByRole } = render(<BreadcrumbEllipsis className={additionalClass} />);
      const ellipsis = getByRole('presentation');

      expect(ellipsis).toHaveClass(additionalClass);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle empty className prop gracefully', () => {
      // This test checks if the component handles an empty className prop without errors
      const { getByRole } = render(<BreadcrumbEllipsis className="" />);
      const ellipsis = getByRole('presentation');

      expect(ellipsis).toBeInTheDocument();
      expect(ellipsis).toHaveClass('flex h-9 w-9 items-center justify-center');
    });

    it('should render correctly when no children are provided', () => {
      // This test checks if the component renders correctly even when no children are provided
      const { getByRole } = render(<BreadcrumbEllipsis />);
      const ellipsis = getByRole('presentation');

      expect(ellipsis).toBeInTheDocument();
      expect(ellipsis).toContainHTML('<span class="sr-only">More</span>');
    });
  });
});

// End of unit tests for: BreadcrumbEllipsis
