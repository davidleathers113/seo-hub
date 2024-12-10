
// Unit tests for: DialogHeader

import { render } from '@testing-library/react';
import { DialogHeader } from '../dialog';



describe('DialogHeader() DialogHeader method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render without crashing', () => {
      // Test to ensure the component renders without any errors
      const { container } = render(<DialogHeader />);
      expect(container).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      // Test to ensure the default classes are applied
      const { container } = render(<DialogHeader />);
      const divElement = container.firstChild;
      expect(divElement).toHaveClass('flex flex-col space-y-1.5 text-center sm:text-left');
    });

    it('should accept and apply additional className', () => {
      // Test to ensure additional className is applied
      const additionalClass = 'custom-class';
      const { container } = render(<DialogHeader className={additionalClass} />);
      const divElement = container.firstChild;
      expect(divElement).toHaveClass(additionalClass);
    });

    it('should forward other props to the div element', () => {
      // Test to ensure other props are forwarded to the div element
      const { container } = render(<DialogHeader data-testid="dialog-header" />);
      const divElement = container.firstChild;
      expect(divElement).toHaveAttribute('data-testid', 'dialog-header');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // Test to ensure null className does not cause errors
      const { container } = render(<DialogHeader className={null as any} />);
      const divElement = container.firstChild;
      expect(divElement).toHaveClass('flex flex-col space-y-1.5 text-center sm:text-left');
    });

    it('should handle undefined className gracefully', () => {
      // Test to ensure undefined className does not cause errors
      const { container } = render(<DialogHeader className={undefined} />);
      const divElement = container.firstChild;
      expect(divElement).toHaveClass('flex flex-col space-y-1.5 text-center sm:text-left');
    });

    it('should render children correctly', () => {
      // Test to ensure children are rendered correctly
      const { getByText } = render(<DialogHeader>Test Child</DialogHeader>);
      expect(getByText('Test Child')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: DialogHeader
