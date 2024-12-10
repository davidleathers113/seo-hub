
// Unit tests for: render

import { render, screen } from '@testing-library/react';
import { ErrorBoundary } from '../ErrorBoundary';
import "@testing-library/jest-dom";

describe('ErrorBoundary.render() render method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render children when there is no error', () => {
      // Arrange: Define a simple child component
      const ChildComponent = () => <div>Child Component</div>;

      // Act: Render the ErrorBoundary with the child component
      render(
        <ErrorBoundary>
          <ChildComponent />
        </ErrorBoundary>
      );

      // Assert: Verify that the child component is rendered
      expect(screen.getByText('Child Component')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should render error message and button when an error is caught', () => {
      // Arrange: Define a component that throws an error
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };

      // Act: Render the ErrorBoundary with the error-throwing component
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
        </ErrorBoundary>
      );

      // Assert: Verify that the error message and button are rendered
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('should handle multiple children and render them correctly when no error occurs', () => {
      // Arrange: Define multiple child components
      const FirstChild = () => <div>First Child</div>;
      const SecondChild = () => <div>Second Child</div>;

      // Act: Render the ErrorBoundary with multiple children
      render(
        <ErrorBoundary>
          <FirstChild />
          <SecondChild />
        </ErrorBoundary>
      );

      // Assert: Verify that both children are rendered
      expect(screen.getByText('First Child')).toBeInTheDocument();
      expect(screen.getByText('Second Child')).toBeInTheDocument();
    });

    it('should not render children if an error occurs in one of them', () => {
      // Arrange: Define a component that throws an error and a normal component
      const ErrorThrowingComponent = () => {
        throw new Error('Test error');
      };
      const NormalComponent = () => <div>Normal Component</div>;

      // Act: Render the ErrorBoundary with both components
      render(
        <ErrorBoundary>
          <ErrorThrowingComponent />
          <NormalComponent />
        </ErrorBoundary>
      );

      // Assert: Verify that the error message is rendered and the normal component is not
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
      expect(screen.queryByText('Normal Component')).not.toBeInTheDocument();
    });
  });
});

// End of unit tests for: render
