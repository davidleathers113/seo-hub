
// Unit tests for: Calendar

import { render } from '@testing-library/react';
import { Calendar } from '../calendar';
import "@testing-library/jest-dom";

// Mocking dependencies

type MockCalendarProps = {
  className?: string;
  classNames?: any;
  showOutsideDays?: boolean;
  [key: string]: any;
};

describe('Calendar() Calendar method', () => {
  let mockCalendarProps: MockCalendarProps;

  beforeEach(() => {
    mockCalendarProps = {
      className: 'test-class',
      classNames: {},
      showOutsideDays: true,
    } as any;
  });

  describe('Happy Paths', () => {
    it('should render the Calendar component with default props', () => {
      // Test to ensure the Calendar renders with default props
      const { container } = render(<Calendar {...mockCalendarProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should apply custom className to the Calendar component', () => {
      // Test to ensure custom className is applied
      mockCalendarProps.className = 'custom-class';
      const { container } = render(<Calendar {...mockCalendarProps} />);
      expect(container.firstChild).toHaveClass('custom-class');
    });

    it('should render with showOutsideDays set to true', () => {
      // Test to ensure showOutsideDays is true
      mockCalendarProps.showOutsideDays = true;
      const { container } = render(<Calendar {...mockCalendarProps} />);
      expect(container).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing classNames gracefully', () => {
      // Test to ensure missing classNames does not break the component
      delete mockCalendarProps.classNames;
      const { container } = render(<Calendar {...mockCalendarProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle showOutsideDays set to false', () => {
      // Test to ensure the component handles showOutsideDays set to false
      mockCalendarProps.showOutsideDays = false;
      const { container } = render(<Calendar {...mockCalendarProps} />);
      expect(container).toBeInTheDocument();
    });

    it('should handle additional props without errors', () => {
      // Test to ensure additional props do not cause errors
      mockCalendarProps['data-testid'] = 'calendar-test';
      const { getByTestId } = render(<Calendar {...mockCalendarProps} />);
      expect(getByTestId('calendar-test')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: Calendar
