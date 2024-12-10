
// Unit tests for: DrawerFooter

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { DrawerFooter } from '../drawer';



describe('DrawerFooter() DrawerFooter method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the DrawerFooter with default classes', () => {
      // This test checks if the DrawerFooter renders with the default class names.
      const { container } = render(<DrawerFooter />);
      expect(container.firstChild).toHaveClass('mt-auto flex flex-col gap-2 p-4');
    });

    it('should render the DrawerFooter with additional custom class', () => {
      // This test checks if the DrawerFooter can accept and render additional custom class names.
      const customClass = 'custom-class';
      const { container } = render(<DrawerFooter className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should render children inside the DrawerFooter', () => {
      // This test checks if the DrawerFooter correctly renders its children.
      const { getByText } = render(<DrawerFooter>Footer Content</DrawerFooter>);
      expect(getByText('Footer Content')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the DrawerFooter handles a null className without errors.
      const { container } = render(<DrawerFooter className={null} />);
      expect(container.firstChild).toHaveClass('mt-auto flex flex-col gap-2 p-4');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the DrawerFooter handles an undefined className without errors.
      const { container } = render(<DrawerFooter className={undefined} />);
      expect(container.firstChild).toHaveClass('mt-auto flex flex-col gap-2 p-4');
    });

    it('should render without children', () => {
      // This test checks if the DrawerFooter can render without any children.
      const { container } = render(<DrawerFooter />);
      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});

// End of unit tests for: DrawerFooter
