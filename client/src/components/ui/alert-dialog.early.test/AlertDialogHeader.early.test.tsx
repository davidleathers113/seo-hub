
// Unit tests for: AlertDialogHeader

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { AlertDialogHeader } from '../alert-dialog';



describe('AlertDialogHeader() AlertDialogHeader method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render without crashing', () => {
      // This test ensures that the component renders without any errors.
      const { container } = render(<AlertDialogHeader />);
      expect(container).toBeInTheDocument();
    });

    it('should apply default classes', () => {
      // This test checks if the default classes are applied correctly.
      const { container } = render(<AlertDialogHeader />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('should accept and apply additional className', () => {
      // This test verifies that additional class names are appended correctly.
      const additionalClass = 'custom-class';
      const { container } = render(<AlertDialogHeader className={additionalClass} />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should pass additional props to the div', () => {
      // This test ensures that additional props are passed to the div element.
      const { container } = render(<AlertDialogHeader data-testid="header" />);
      expect(container.firstChild).toHaveAttribute('data-testid', 'header');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the component handles a null className without errors.
      const { container } = render(<AlertDialogHeader className={null as any} />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the component handles an undefined className without errors.
      const { container } = render(<AlertDialogHeader className={undefined} />);
      expect(container.firstChild).toHaveClass('flex flex-col space-y-2 text-center sm:text-left');
    });

    it('should render correctly with no props', () => {
      // This test ensures that the component renders correctly even when no props are provided.
      const { container } = render(<AlertDialogHeader />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});

// End of unit tests for: AlertDialogHeader
