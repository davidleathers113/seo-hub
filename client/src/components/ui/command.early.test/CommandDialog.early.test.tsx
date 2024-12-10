
// Unit tests for: CommandDialog

import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { CommandDialog } from '../command';



describe('CommandDialog() CommandDialog method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the CommandDialog with children', () => {
      // Test to ensure the CommandDialog renders correctly with children
      const { getByText } = render(
        <CommandDialog>
          <div>Test Child</div>
        </CommandDialog>
      );
      expect(getByText('Test Child')).toBeInTheDocument();
    });

    it('should apply additional props to the Dialog component', () => {
      // Test to ensure additional props are passed to the Dialog component
      const { getByRole } = render(
        <CommandDialog open>
          <div>Test Child</div>
        </CommandDialog>
      );
      expect(getByRole('dialog')).toBeVisible();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should render without children', () => {
      // Test to ensure the CommandDialog can render without children
      const { container } = render(<CommandDialog />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle null children gracefully', () => {
      // Test to ensure the CommandDialog handles null children gracefully
      const { container } = render(<CommandDialog>{null}</CommandDialog>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should handle undefined children gracefully', () => {
      // Test to ensure the CommandDialog handles undefined children gracefully
      const { container } = render(<CommandDialog>{undefined}</CommandDialog>);
      expect(container.firstChild).toBeInTheDocument();
    });

    it('should apply custom class names correctly', () => {
      // Test to ensure custom class names are applied correctly
      const { container } = render(
        <CommandDialog className="custom-class">
          <div>Test Child</div>
        </CommandDialog>
      );
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });
});

// End of unit tests for: CommandDialog
