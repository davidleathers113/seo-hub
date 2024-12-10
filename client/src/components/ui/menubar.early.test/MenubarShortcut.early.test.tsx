
// Unit tests for: MenubarShortcut

import { render } from '@testing-library/react';
import { MenubarShortcut } from '../menubar';
import "@testing-library/jest-dom";

// menubarShortcut.test.tsx
// menubarShortcut.test.tsx
describe('MenubarShortcut() MenubarShortcut method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the MenubarShortcut component with default classes', () => {
      // Test to ensure the component renders with default classes
      const { getByText } = render(<MenubarShortcut>Shortcut</MenubarShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toBeInTheDocument();
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should apply additional class names passed via className prop', () => {
      // Test to ensure additional class names are applied
      const { getByText } = render(<MenubarShortcut className="extra-class">Shortcut</MenubarShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveClass('extra-class');
    });

    it('should pass additional props to the span element', () => {
      // Test to ensure additional props are passed to the span element
      const { getByText } = render(<MenubarShortcut data-testid="shortcut">Shortcut</MenubarShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveAttribute('data-testid', 'shortcut');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should render correctly when no children are provided', () => {
      // Test to ensure the component renders even if no children are provided
      const { container } = render(<MenubarShortcut />);
      expect(container.firstChild).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should handle null className gracefully', () => {
      // Test to ensure null className does not cause errors
      const { getByText } = render(<MenubarShortcut className={null}>Shortcut</MenubarShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toBeInTheDocument();
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should handle undefined className gracefully', () => {
      // Test to ensure undefined className does not cause errors
      const { getByText } = render(<MenubarShortcut className={undefined}>Shortcut</MenubarShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toBeInTheDocument();
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });
  });
});

// End of unit tests for: MenubarShortcut
