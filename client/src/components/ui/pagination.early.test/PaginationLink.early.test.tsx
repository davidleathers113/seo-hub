
// Unit tests for: PaginationLink

import { render } from '@testing-library/react';
import { PaginationLink } from '../pagination';
import "@testing-library/jest-dom";

describe('PaginationLink() PaginationLink method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render a link with default properties', () => {
      // Test to ensure the component renders with default properties
      const { getByRole } = render(<PaginationLink href="#" />);
      const link = getByRole('link');
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass('variant-ghost size-icon');
    });

    it('should render an active link with outline variant', () => {
      // Test to ensure the component renders as active with outline variant
      const { getByRole } = render(<PaginationLink href="#" isActive />);
      const link = getByRole('link');
      expect(link).toHaveAttribute('aria-current', 'page');
      expect(link).toHaveClass('variant-outline');
    });

    it('should apply custom class names', () => {
      // Test to ensure custom class names are applied
      const { getByRole } = render(<PaginationLink href="#" className="custom-class" />);
      const link = getByRole('link');
      expect(link).toHaveClass('custom-class');
    });

    it('should render with a specified size', () => {
      // Test to ensure the component renders with a specified size
      const { getByRole } = render(<PaginationLink href="#" size="large" />);
      const link = getByRole('link');
      expect(link).toHaveClass('size-large');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle missing href gracefully', () => {
      // Test to ensure the component handles missing href gracefully
      const { getByRole } = render(<PaginationLink />);
      const link = getByRole('link');
      expect(link).toHaveAttribute('href', '#');
    });

    it('should not set aria-current when isActive is false', () => {
      // Test to ensure aria-current is not set when isActive is false
      const { getByRole } = render(<PaginationLink href="#" isActive={false} />);
      const link = getByRole('link');
      expect(link).not.toHaveAttribute('aria-current');
    });

    it('should handle undefined size gracefully', () => {
      // Test to ensure the component handles undefined size gracefully
      const { getByRole } = render(<PaginationLink href="#" size={undefined} />);
      const link = getByRole('link');
      expect(link).toHaveClass('size-icon'); // Default size
    });

    it('should handle null className gracefully', () => {
      // Test to ensure the component handles null className gracefully
      const { getByRole } = render(<PaginationLink href="#" className={null} />);
      const link = getByRole('link');
      expect(link).not.toHaveClass('null');
    });
  });
});

// End of unit tests for: PaginationLink
