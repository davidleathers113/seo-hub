
// Unit tests for: DialogFooter

import { render } from '@testing-library/react';
import { DialogFooter } from '../dialog';
import "@testing-library/jest-dom";

describe('DialogFooter() DialogFooter method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the DialogFooter with default classes', () => {
      // This test checks if the DialogFooter renders with the default class names.
      const { container } = render(<DialogFooter />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('should render the DialogFooter with additional custom class', () => {
      // This test checks if the DialogFooter can accept and render additional custom class names.
      const customClass = 'custom-class';
      const { container } = render(<DialogFooter className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should render children inside the DialogFooter', () => {
      // This test checks if the DialogFooter correctly renders its children.
      const { getByText } = render(<DialogFooter><span>Child Element</span></DialogFooter>);
      expect(getByText('Child Element')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the DialogFooter handles a null className without errors.
      const { container } = render(<DialogFooter className={null as any} />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the DialogFooter handles an undefined className without errors.
      const { container } = render(<DialogFooter className={undefined} />);
      expect(container.firstChild).toHaveClass('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2');
    });

    it('should render without children', () => {
      // This test checks if the DialogFooter can render without any children.
      const { container } = render(<DialogFooter />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});

// End of unit tests for: DialogFooter
