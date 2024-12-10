
// Unit tests for: Footer

import { Footer } from '../Footer';
import { render, screen } from '@testing-library/react';
import "@testing-library/jest-dom";

describe('Footer() Footer method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the footer element', () => {
      // This test checks if the footer element is rendered correctly.
      render(<Footer />);
      const footerElement = screen.getByRole('contentinfo');
      expect(footerElement).toBeInTheDocument();
    });

    it('should contain the correct text', () => {
      // This test verifies that the footer contains the expected text.
      render(<Footer />);
      const textElement = screen.getByText(/Built by/i);
      expect(textElement).toBeInTheDocument();
    });

    it('should have a link to Pythagora with correct attributes', () => {
      // This test ensures the link to Pythagora is present and has the correct attributes.
      render(<Footer />);
      const linkElement = screen.getByRole('link', { name: /Pythagora/i });
      expect(linkElement).toHaveAttribute('href', 'https://pythagora.ai');
      expect(linkElement).toHaveAttribute('target', '_blank');
      expect(linkElement).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should render with the correct class names for styling', () => {
      // This test checks if the footer has the correct class names for styling.
      render(<Footer />);
      const footerElement = screen.getByRole('contentinfo');
      expect(footerElement).toHaveClass('border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60');
    });

    it('should render the container with the correct flex properties', () => {
      // This test verifies that the container inside the footer has the correct flex properties.
      render(<Footer />);
      const containerElement = screen.getByRole('contentinfo').firstChild;
      expect(containerElement).toHaveClass('container flex h-14 items-center justify-between');
    });
  });
});

// End of unit tests for: Footer
