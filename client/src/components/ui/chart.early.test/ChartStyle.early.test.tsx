
// Unit tests for: ChartStyle

import { render } from '@testing-library/react';
import { ChartStyle } from '../chart';



describe('ChartStyle() ChartStyle method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render style element with correct CSS variables for light theme', () => {
      // Test description: This test checks if the ChartStyle component correctly renders CSS variables for a light theme configuration.
      const config = {
        series1: { color: '#ff0000' },
        series2: { color: '#00ff00' },
      };

      const { container } = render(<ChartStyle id="test-chart" config={config} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).not.toBeNull();
      expect(styleElement?.innerHTML).toContain('--color-series1: #ff0000;');
      expect(styleElement?.innerHTML).toContain('--color-series2: #00ff00;');
    });

    it('should render style element with correct CSS variables for dark theme', () => {
      // Test description: This test checks if the ChartStyle component correctly renders CSS variables for a dark theme configuration.
      const config = {
        series1: { theme: { dark: '#ff0000' } },
        series2: { theme: { dark: '#00ff00' } },
      };

      const { container } = render(<ChartStyle id="test-chart" config={config} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).not.toBeNull();
      expect(styleElement?.innerHTML).toContain('.dark [data-chart=test-chart] {');
      expect(styleElement?.innerHTML).toContain('--color-series1: #ff0000;');
      expect(styleElement?.innerHTML).toContain('--color-series2: #00ff00;');
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should return null if no color or theme is provided in the config', () => {
      // Test description: This test checks if the ChartStyle component returns null when no color or theme is provided in the configuration.
      const config = {
        series1: {},
        series2: {},
      };

      const { container } = render(<ChartStyle id="test-chart" config={config} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeNull();
    });

    it('should handle empty config gracefully', () => {
      // Test description: This test checks if the ChartStyle component handles an empty configuration gracefully without errors.
      const config = {};

      const { container } = render(<ChartStyle id="test-chart" config={config} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).toBeNull();
    });

    it('should handle mixed theme and color configurations', () => {
      // Test description: This test checks if the ChartStyle component correctly handles configurations with mixed theme and color properties.
      const config = {
        series1: { color: '#ff0000' },
        series2: { theme: { light: '#00ff00', dark: '#0000ff' } },
      };

      const { container } = render(<ChartStyle id="test-chart" config={config} />);
      const styleElement = container.querySelector('style');

      expect(styleElement).not.toBeNull();
      expect(styleElement?.innerHTML).toContain('--color-series1: #ff0000;');
      expect(styleElement?.innerHTML).toContain('--color-series2: #00ff00;');
      expect(styleElement?.innerHTML).toContain('--color-series2: #0000ff;');
    });
  });
});

// End of unit tests for: ChartStyle
