
// Unit tests for: AlertDialogFooter

import { render } from '@testing-library/react';
import { AlertDialogFooter } from '../alert-dialog';
import "@testing-library/jest-dom";

describe('AlertDialogFooter() AlertDialogFooter method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render without crashing', () => {
      // This test ensures that the component renders without any errors.
      const { container } = render(<AlertDialogFooter />);
      expect(container).toBeInTheDocument();
    });

    it('should apply default class names', () => {
      // This test checks if the default class names are applied correctly.
      const { container } = render(<AlertDialogFooter />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('should accept and apply additional class names', () => {
      // This test verifies that additional class names are applied correctly.
      const additionalClass = 'extra-class';
      const { container } = render(<AlertDialogFooter className={additionalClass} />);
      expect(container.firstChild).toHaveClass('extra-class');
    });

    it('should spread additional props onto the div', () => {
      // This test ensures that additional props are spread onto the div element.
      const dataTestId = 'footer';
      const { getByTestId } = render(<AlertDialogFooter data-testid={dataTestId} />);
      expect(getByTestId(dataTestId)).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the component handles a null className without errors.
      const { container } = render(<AlertDialogFooter className={null as any} />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the component handles an undefined className without errors.
      const { container } = render(<AlertDialogFooter className={undefined} />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('should handle empty string className gracefully', () => {
      // This test checks if the component handles an empty string className without errors.
      const { container } = render(<AlertDialogFooter className="" />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });
  });
});

// End of unit tests for: AlertDialogFooter
