
// Unit tests for: ContextMenuShortcut

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { ContextMenuShortcut } from '../context-menu';



describe('ContextMenuShortcut() ContextMenuShortcut method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the ContextMenuShortcut with default class', () => {
      // Test to ensure the component renders with the default class
      const { getByText } = render(<ContextMenuShortcut>Shortcut</ContextMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toBeInTheDocument();
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should render the ContextMenuShortcut with additional custom class', () => {
      // Test to ensure the component renders with additional custom class
      const { getByText } = render(
        <ContextMenuShortcut className="custom-class">Shortcut</ContextMenuShortcut>
      );
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toBeInTheDocument();
      expect(shortcutElement).toHaveClass('custom-class');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle empty children gracefully', () => {
      // Test to ensure the component handles empty children gracefully
      const { container } = render(<ContextMenuShortcut></ContextMenuShortcut>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should handle null children gracefully', () => {
      // Test to ensure the component handles null children gracefully
      const { container } = render(<ContextMenuShortcut>{null}</ContextMenuShortcut>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should handle undefined children gracefully', () => {
      // Test to ensure the component handles undefined children gracefully
      const { container } = render(<ContextMenuShortcut>{undefined}</ContextMenuShortcut>);
      expect(container.firstChild).toBeEmptyDOMElement();
    });

    it('should apply only the default class if no additional class is provided', () => {
      // Test to ensure only the default class is applied if no additional class is provided
      const { getByText } = render(<ContextMenuShortcut>Shortcut</ContextMenuShortcut>);
      const shortcutElement = getByText('Shortcut');
      expect(shortcutElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
      expect(shortcutElement).not.toHaveClass('custom-class');
    });
  });
});

// End of unit tests for: ContextMenuShortcut
