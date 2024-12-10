
// Unit tests for: ThemeProvider


import { render } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from '../theme-provider';
import "@testing-library/jest-dom";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('ThemeProvider() ThemeProvider method', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  // Happy Path Tests
  describe('Happy Paths', () => {
    test('should apply the default theme when no theme is stored in localStorage', () => {
      render(
        <ThemeProvider defaultTheme="light">
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('light');
    });

    test('should apply the theme from localStorage if available', () => {
      localStorage.setItem('vite-ui-theme', 'dark');

      render(
        <ThemeProvider defaultTheme="light">
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('dark');
    });

    test('should update the theme when setTheme is called', () => {
      const { rerender } = render(
        <ThemeProvider defaultTheme="light">
          <div>Test Content</div>
        </ThemeProvider>
      );

      const context = React.useContext(ThemeProviderContext);
      context.setTheme('dark');

      rerender(
        <ThemeProvider defaultTheme="light">
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('dark');
      expect(localStorage.getItem('vite-ui-theme')).toBe('dark');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    test('should handle system theme preference correctly', () => {
      window.matchMedia = jest.fn().mockImplementation(query => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
      }));

      render(
        <ThemeProvider defaultTheme="system">
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('dark');
    });

    test('should not fail if an invalid theme is stored in localStorage', () => {
      localStorage.setItem('vite-ui-theme', 'invalid-theme' as any);

      render(
        <ThemeProvider defaultTheme="light">
          <div>Test Content</div>
        </ThemeProvider>
      );

      expect(document.documentElement).toHaveClass('light');
    });
  });
});

// End of unit tests for: ThemeProvider
