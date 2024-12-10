
// Unit tests for: CommandShortcut

import { render } from '@testing-library/react';
import { CommandShortcut } from '../command';
import "@testing-library/jest-dom";

describe('CommandShortcut() CommandShortcut method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the CommandShortcut component with default classes', () => {
      // This test checks if the component renders with the default classes
      const { container } = render(<CommandShortcut />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should render the CommandShortcut component with additional custom classes', () => {
      // This test checks if the component renders with additional custom classes
      const customClass = 'custom-class';
      const { container } = render(<CommandShortcut className={customClass} />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
      expect(spanElement).toHaveClass(customClass);
    });

    it('should pass additional props to the span element', () => {
      // This test checks if additional props are passed to the span element
      const { container } = render(<CommandShortcut data-testid="shortcut" />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveAttribute('data-testid', 'shortcut');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle null className gracefully', () => {
      // This test checks if the component handles a null className gracefully
      const { container } = render(<CommandShortcut className={null as any} />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should handle undefined className gracefully', () => {
      // This test checks if the component handles an undefined className gracefully
      const { container } = render(<CommandShortcut className={undefined} />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
      expect(spanElement).toHaveClass('ml-auto text-xs tracking-widest text-muted-foreground');
    });

    it('should render without crashing when no props are provided', () => {
      // This test checks if the component renders without crashing when no props are provided
      const { container } = render(<CommandShortcut />);
      const spanElement = container.querySelector('span');
      expect(spanElement).toBeInTheDocument();
    });
  });
});

// End of unit tests for: CommandShortcut
