
// Unit tests for: useTheme

import { render } from '@testing-library/react';
import { ThemeProviderContext, useTheme } from '../theme-provider';



describe('useTheme() useTheme method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should return the default theme when used within a ThemeProvider', () => {
      // Arrange
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div>{theme}</div>;
      };

      const { getByText } = render(
        <ThemeProviderContext.Provider value={{ theme: 'light', setTheme: jest.fn() }}>
          <TestComponent />
        </ThemeProviderContext.Provider>
      );

      // Assert
      expect(getByText('light')).toBeInTheDocument();
    });

    it('should allow setting a new theme', () => {
      // Arrange
      const setThemeMock = jest.fn();
      const TestComponent = () => {
        const { setTheme } = useTheme();
        return <button onClick={() => setTheme('dark')}>Set Dark Theme</button>;
      };

      const { getByText } = render(
        <ThemeProviderContext.Provider value={{ theme: 'light', setTheme: setThemeMock }}>
          <TestComponent />
        </ThemeProviderContext.Provider>
      );

      // Act
      getByText('Set Dark Theme').click();

      // Assert
      expect(setThemeMock).toHaveBeenCalledWith('dark');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should throw an error if useTheme is used outside of a ThemeProvider', () => {
      // Arrange
      const TestComponent = () => {
        try {
          useTheme();
        } catch (error) {
          return <div>{error.message}</div>;
        }
        return null;
      };

      const { getByText } = render(<TestComponent />);

      // Assert
      expect(getByText('useTheme must be used within a ThemeProvider')).toBeInTheDocument();
    });

    it('should handle undefined theme gracefully', () => {
      // Arrange
      const TestComponent = () => {
        const { theme } = useTheme();
        return <div>{theme}</div>;
      };

      const { getByText } = render(
        <ThemeProviderContext.Provider value={{ theme: undefined as any, setTheme: jest.fn() }}>
          <TestComponent />
        </ThemeProviderContext.Provider>
      );

      // Assert
      expect(getByText('system')).toBeInTheDocument(); // Assuming 'system' is the fallback
    });
  });
});

// End of unit tests for: useTheme
