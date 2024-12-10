
// Unit tests for: LoadingSpinner

import { render } from '@testing-library/react';
import { LoadingSpinner } from '../LoadingSpinner';
import "@testing-library/jest-dom";

// LoadingSpinner.test.tsx
// LoadingSpinner.test.tsx
describe('LoadingSpinner() LoadingSpinner method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the LoadingSpinner component correctly', () => {
      // This test checks if the LoadingSpinner component renders without crashing.
      const { container } = render(<LoadingSpinner />);
      expect(container).toBeInTheDocument();
    });

    it('should render a div with the correct class names', () => {
      // This test checks if the div has the correct class names for styling.
      const { container } = render(<LoadingSpinner />);
      const divElement = container.querySelector('div');
      expect(divElement).toHaveClass('flex h-[calc(100vh-12rem)] items-center justify-center');
    });

    it('should render the Loader2 component with the correct class names', () => {
      // This test checks if the Loader2 component is rendered with the correct class names.
      const { container } = render(<LoadingSpinner />);
      const loaderElement = container.querySelector('svg'); // Assuming Loader2 renders an SVG
      expect(loaderElement).toHaveClass('h-8 w-8 animate-spin text-primary');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should render without any props or state', () => {
      // This test ensures that the component renders correctly even though it doesn't use props or state.
      const { container } = render(<LoadingSpinner />);
      expect(container).toBeInTheDocument();
    });

    // Since the component is simple and doesn't have props or state, there are limited edge cases to test.
    // If the component had props or state, we would test edge cases related to those.
  });
});

// End of unit tests for: LoadingSpinner
