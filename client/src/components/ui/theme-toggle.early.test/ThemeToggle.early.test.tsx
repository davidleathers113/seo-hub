
// Unit tests for: ThemeToggle

import { fireEvent, render } from '@testing-library/react';
import { ThemeToggle } from '../theme-toggle';
import "@testing-library/jest-dom";

describe('ThemeToggle() ThemeToggle method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the ThemeToggle component with initial light theme', () => {
      // Render the component
      const { getByRole } = render(<ThemeToggle />);

      // Check if the button is rendered
      const button = getByRole('button', { name: /toggle theme/i });
      expect(button).toBeInTheDocument();

      // Check if the Moon icon is displayed initially
      expect(button.querySelector('svg')).toHaveClass('moon');
    });

    it('should toggle to dark theme when button is clicked', () => {
      // Render the component
      const { getByRole } = render(<ThemeToggle />);
      const button = getByRole('button', { name: /toggle theme/i });

      // Simulate a click to toggle theme
      fireEvent.click(button);

      // Check if the Sun icon is displayed after toggle
      expect(button.querySelector('svg')).toHaveClass('sun');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('should toggle back to light theme when button is clicked again', () => {
      // Render the component
      const { getByRole } = render(<ThemeToggle />);
      const button = getByRole('button', { name: /toggle theme/i });

      // Simulate two clicks to toggle theme back to light
      fireEvent.click(button);
      fireEvent.click(button);

      // Check if the Moon icon is displayed after second toggle
      expect(button.querySelector('svg')).toHaveClass('moon');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should initialize with dark theme if document has dark class', () => {
      // Set up the document with dark class
      document.documentElement.classList.add('dark');

      // Render the component
      const { getByRole } = render(<ThemeToggle />);
      const button = getByRole('button', { name: /toggle theme/i });

      // Check if the Sun icon is displayed initially
      expect(button.querySelector('svg')).toHaveClass('sun');

      // Clean up
      document.documentElement.classList.remove('dark');
    });

    it('should handle rapid toggling without errors', () => {
      // Render the component
      const { getByRole } = render(<ThemeToggle />);
      const button = getByRole('button', { name: /toggle theme/i });

      // Simulate rapid clicks
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      // Check the final state
      expect(button.querySelector('svg')).toHaveClass('sun');
      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });
  });
});

// End of unit tests for: ThemeToggle
