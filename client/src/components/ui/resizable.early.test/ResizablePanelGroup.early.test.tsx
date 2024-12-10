
// Unit tests for: ResizablePanelGroup

import { render } from '@testing-library/react';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '../resizable';
import "@testing-library/jest-dom";

describe('ResizablePanelGroup() ResizablePanelGroup method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the ResizablePanelGroup with default props', () => {
      // Test to ensure the component renders with default props
      const { container } = render(<ResizablePanelGroup />);
      expect(container.firstChild).toHaveClass('flex h-full w-full');
    });

    it('should apply custom className to the ResizablePanelGroup', () => {
      // Test to ensure custom className is applied
      const customClass = 'custom-class';
      const { container } = render(<ResizablePanelGroup className={customClass} />);
      expect(container.firstChild).toHaveClass(customClass);
    });

    it('should render ResizablePanel as a child of ResizablePanelGroup', () => {
      // Test to ensure ResizablePanel can be rendered as a child
      const { getByTestId } = render(
        <ResizablePanelGroup>
          <ResizablePanel data-testid="resizable-panel" />
        </ResizablePanelGroup>
      );
      expect(getByTestId('resizable-panel')).toBeInTheDocument();
    });

    it('should render ResizableHandle with handle when withHandle is true', () => {
      // Test to ensure ResizableHandle renders with handle when withHandle is true
      const { getByRole } = render(<ResizableHandle withHandle />);
      expect(getByRole('img')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should handle missing className gracefully', () => {
      // Test to ensure component handles missing className gracefully
      const { container } = render(<ResizablePanelGroup className={undefined} />);
      expect(container.firstChild).toHaveClass('flex h-full w-full');
    });

    it('should handle additional props passed to ResizablePanelGroup', () => {
      // Test to ensure additional props are passed down correctly
      const { container } = render(<ResizablePanelGroup data-testid="panel-group" />);
      expect(container.firstChild).toHaveAttribute('data-testid', 'panel-group');
    });

    it('should render ResizableHandle without handle when withHandle is false', () => {
      // Test to ensure ResizableHandle renders without handle when withHandle is false
      const { queryByRole } = render(<ResizableHandle withHandle={false} />);
      expect(queryByRole('img')).not.toBeInTheDocument();
    });

    it('should handle vertical direction class correctly', () => {
      // Test to ensure vertical direction class is applied correctly
      const { container } = render(
        <ResizablePanelGroup className="data-[panel-group-direction=vertical]" />
      );
      expect(container.firstChild).toHaveClass('flex-col');
    });
  });
});

// End of unit tests for: ResizablePanelGroup
