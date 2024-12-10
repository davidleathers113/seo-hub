
// Unit tests for: Badge

import { render } from '@testing-library/react';
import { Badge } from '../badge';
import "@testing-library/jest-dom";

describe('Badge() Badge method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render with default variant', () => {
      // Test to ensure the Badge renders with the default variant styles
      const { container } = render(<Badge>Default Badge</Badge>);
      expect(container.firstChild).toHaveClass('bg-primary text-primary-foreground');
    });

    it('should render with secondary variant', () => {
      // Test to ensure the Badge renders with the secondary variant styles
      const { container } = render(<Badge variant="secondary">Secondary Badge</Badge>);
      expect(container.firstChild).toHaveClass('bg-secondary text-secondary-foreground');
    });

    it('should render with destructive variant', () => {
      // Test to ensure the Badge renders with the destructive variant styles
      const { container } = render(<Badge variant="destructive">Destructive Badge</Badge>);
      expect(container.firstChild).toHaveClass('bg-destructive text-destructive-foreground');
    });

    it('should render with outline variant', () => {
      // Test to ensure the Badge renders with the outline variant styles
      const { container } = render(<Badge variant="outline">Outline Badge</Badge>);
      expect(container.firstChild).toHaveClass('text-foreground');
    });

    it('should apply additional class names', () => {
      // Test to ensure additional class names are applied correctly
      const { container } = render(<Badge className="extra-class">Badge with Extra Class</Badge>);
      expect(container.firstChild).toHaveClass('extra-class');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle no children gracefully', () => {
      // Test to ensure the Badge component can render without children
      const { container } = render(<Badge />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle unknown variant gracefully', () => {
      // Test to ensure the Badge component handles an unknown variant gracefully
      const { container } = render(<Badge variant="unknown">Unknown Variant Badge</Badge>);
      expect(container.firstChild).toHaveClass('bg-primary text-primary-foreground'); // Fallback to default
    });

    it('should not break with empty className', () => {
      // Test to ensure the Badge component does not break with an empty className
      const { container } = render(<Badge className="">Badge with Empty Class</Badge>);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

// End of unit tests for: Badge
