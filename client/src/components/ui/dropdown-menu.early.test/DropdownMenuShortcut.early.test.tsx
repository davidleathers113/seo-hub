
// Unit tests for: DropdownMenuShortcut

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { DropdownMenuShortcut } from '../dropdown-menu';



describe('DropdownMenuShortcut() DropdownMenuShortcut method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the component with default styles', () => {
      // This test checks if the component renders with default styles
      const { getByText } = render(<DropdownMenuShortcut>Shortcut</DropdownMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toBeInTheDocument();
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest opacity-60');
    });

    it('should apply additional class names when provided', () => {
      // This test checks if additional class names are applied correctly
      const { getByText } = render(<DropdownMenuShortcut className="extra-class">Shortcut</DropdownMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveClass('extra-class');
    });

    it('should pass additional props to the span element', () => {
      // This test checks if additional props are passed to the span element
      const { getByText } = render(<DropdownMenuShortcut data-testid="shortcut">Shortcut</DropdownMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveAttribute('data-testid', 'shortcut');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should render without children', () => {
      // This test checks if the component can render without children
      const { container } = render(<DropdownMenuShortcut />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle null className gracefully', () => {
      // This test checks if the component handles a null className gracefully
      const { getByText } = render(<DropdownMenuShortcut className={null}>Shortcut</DropdownMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest opacity-60');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the component handles an undefined className gracefully
      const { getByText } = render(<DropdownMenuShortcut className={undefined}>Shortcut</DropdownMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest opacity-60');
    });
  });
});

// End of unit tests for: DropdownMenuShortcut
