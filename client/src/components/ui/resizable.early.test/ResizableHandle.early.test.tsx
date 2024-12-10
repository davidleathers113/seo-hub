
// Unit tests for: ResizableHandle

import { render } from '@testing-library/react';
import { ResizableHandle } from '../resizable';
import "@testing-library/jest-dom";

describe('ResizableHandle() ResizableHandle method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render without crashing', () => {
      // Test to ensure the component renders without errors
      const { container } = render(<ResizableHandle />);
      expect(container).toBeInTheDocument();
    });

    it('should render with default classes', () => {
      // Test to check if the component has the default classes applied
      const { container } = render(<ResizableHandle />);
      expect(container.firstChild).toHaveClass('relative flex w-px items-center justify-center bg-border');
    });

    it('should render with custom className', () => {
      // Test to ensure custom className is applied
      const customClass = 'custom-class';
      const { container } = render(<ResizableHandle className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should render with handle when withHandle is true', () => {
      // Test to check if the handle is rendered when withHandle is true
      const { getByRole } = render(<ResizableHandle withHandle />);
      expect(getByRole('img')).toBeInTheDocument(); // Assuming GripVertical renders an SVG with role 'img'
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should not render handle when withHandle is false', () => {
      // Test to ensure the handle is not rendered when withHandle is false
      const { queryByRole } = render(<ResizableHandle withHandle={false} />);
      expect(queryByRole('img')).not.toBeInTheDocument();
    });

    it('should handle missing props gracefully', () => {
      // Test to ensure the component handles missing props without crashing
      const { container } = render(<ResizableHandle />);
      expect(container).toBeInTheDocument();
    });

    it('should apply additional props to the root element', () => {
      // Test to ensure additional props are passed to the root element
      const { container } = render(<ResizableHandle data-testid="resizable-handle" />);
      expect(container.firstChild).toHaveAttribute('data-testid', 'resizable-handle');
    });
  });
});

// End of unit tests for: ResizableHandle
