
// Unit tests for: BreadcrumbSeparator

import { render } from '@testing-library/react';
import { BreadcrumbSeparator } from '../breadcrumb';



describe('BreadcrumbSeparator() BreadcrumbSeparator method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render with default ChevronRight icon when no children are provided', () => {
      // Render the component without children
      const { container } = render(<BreadcrumbSeparator />);

      // Check if the default ChevronRight icon is rendered
      expect(container.querySelector('svg')).toBeInTheDocument();
      expect(container.querySelector('svg')).toHaveAttribute('width', '3.5');
      expect(container.querySelector('svg')).toHaveAttribute('height', '3.5');
    });

    it('should render with custom children when provided', () => {
      // Render the component with custom children
      const customChild = <span>Custom Separator</span>;
      const { getByText } = render(<BreadcrumbSeparator>{customChild}</BreadcrumbSeparator>);

      // Check if the custom child is rendered
      expect(getByText('Custom Separator')).toBeInTheDocument();
    });

    it('should apply additional class names when provided', () => {
      // Render the component with an additional class name
      const { container } = render(<BreadcrumbSeparator className="custom-class" />);

      // Check if the additional class name is applied
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null children gracefully', () => {
      // Render the component with null children
      const { container } = render(<BreadcrumbSeparator>{null}</BreadcrumbSeparator>);

      // Check if the default ChevronRight icon is rendered
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      // Render the component with undefined children
      const { container } = render(<BreadcrumbSeparator>{undefined}</BreadcrumbSeparator>);

      // Check if the default ChevronRight icon is rendered
      expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('should not throw error when no props are provided', () => {
      // Render the component without any props
      const renderComponent = () => render(<BreadcrumbSeparator />);

      // Check if the component renders without throwing an error
      expect(renderComponent).not.toThrow();
    });
  });
});

// End of unit tests for: BreadcrumbSeparator
