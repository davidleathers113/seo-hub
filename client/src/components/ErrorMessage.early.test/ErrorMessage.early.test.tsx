
// Unit tests for: ErrorMessage


import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { ErrorMessage } from '../ErrorMessage';
import "@testing-library/jest-dom";

// Import necessary libraries
// Import necessary libraries
// Mock components
class MockAlert extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

class MockAlertDescription extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

class MockAlertTitle extends React.Component {
  render() {
    return <div>{this.props.children}</div>;
  }
}

class MockButton extends React.Component {
  render() {
    return <button onClick={this.props.onClick}>{this.props.children}</button>;
  }
}

// Mock imports
jest.mock("../ui/alert", () => ({
  Alert: MockAlert as any,
  AlertDescription: MockAlertDescription as any,
  AlertTitle: MockAlertTitle as any,
}));

jest.mock("../ui/button", () => ({
  Button: MockButton as any,
}));

describe('ErrorMessage() ErrorMessage method', () => {
  // Happy path tests
  describe('Happy Paths', () => {
    it('should render with default title and provided message', () => {
      // Test to ensure the component renders with default title and provided message
      render(<ErrorMessage message="An error occurred" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('should render with custom title and provided message', () => {
      // Test to ensure the component renders with custom title and provided message
      render(<ErrorMessage title="Custom Error" message="An error occurred" />);
      expect(screen.getByText('Custom Error')).toBeInTheDocument();
      expect(screen.getByText('An error occurred')).toBeInTheDocument();
    });

    it('should render retry button when onRetry is provided', () => {
      // Test to ensure the retry button is rendered when onRetry is provided
      const onRetryMock = jest.fn();
      render(<ErrorMessage message="An error occurred" onRetry={onRetryMock} />);
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });

    it('should call onRetry when retry button is clicked', () => {
      // Test to ensure onRetry is called when the retry button is clicked
      const onRetryMock = jest.fn();
      render(<ErrorMessage message="An error occurred" onRetry={onRetryMock} />);
      fireEvent.click(screen.getByText('Try Again'));
      expect(onRetryMock).toHaveBeenCalled();
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should render without retry button when onRetry is not provided', () => {
      // Test to ensure the retry button is not rendered when onRetry is not provided
      render(<ErrorMessage message="An error occurred" />);
      expect(screen.queryByText('Try Again')).not.toBeInTheDocument();
    });

    it('should handle empty message gracefully', () => {
      // Test to ensure the component handles an empty message gracefully
      render(<ErrorMessage message="" />);
      expect(screen.getByText('Error')).toBeInTheDocument();
      expect(screen.getByText('')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: ErrorMessage
