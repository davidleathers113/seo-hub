
// Unit tests for: Skeleton

import { render } from '@testing-library/react';
import { Skeleton } from '../skeleton';
import "@testing-library/jest-dom";

// Mock interfaces to simulate HTML attributes and elements
interface MockHTMLAttributes {
  className?: string;
  [key: string]: any;
}


describe('Skeleton() Skeleton method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render with default classes', () => {
      // Test to ensure the component renders with default classes
      const { container } = render(<Skeleton />);
      expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
    });

    it('should render with additional className', () => {
      // Test to ensure the component accepts and renders additional className
      const additionalClass = 'extra-class';
      const { container } = render(<Skeleton className={additionalClass} />);
      expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
      expect(container.firstChild).toHaveClass(additionalClass);
    });

    it('should pass additional props to the div', () => {
      // Test to ensure additional props are passed to the div
      const mockProps: MockHTMLAttributes = {
        'data-testid': 'skeleton-div',
        'aria-label': 'loading',
      } as any;
      const { getByTestId } = render(<Skeleton {...mockProps} />);
      const skeletonDiv = getByTestId('skeleton-div');
      expect(skeletonDiv).toHaveAttribute('aria-label', 'loading');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle empty className gracefully', () => {
      // Test to ensure the component handles an empty className gracefully
      const { container } = render(<Skeleton className="" />);
      expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
    });

    it('should handle undefined className gracefully', () => {
      // Test to ensure the component handles an undefined className gracefully
      const { container } = render(<Skeleton className={undefined} />);
      expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
    });

    it('should handle null className gracefully', () => {
      // Test to ensure the component handles a null className gracefully
      const { container } = render(<Skeleton className={null as any} />);
      expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
    });

    it('should handle unexpected props gracefully', () => {
      // Test to ensure the component handles unexpected props gracefully
      const mockProps: MockHTMLAttributes = {
        unexpectedProp: 'unexpected',
      } as any;
      const { container } = render(<Skeleton {...mockProps} />);
      expect(container.firstChild).toHaveClass('animate-pulse rounded-md bg-muted');
    });
  });
});

// End of unit tests for: Skeleton
