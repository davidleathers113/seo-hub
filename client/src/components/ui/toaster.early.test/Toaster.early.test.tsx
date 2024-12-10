
// Unit tests for: Toaster

import { useToast } from "@/hooks/useToast";
import { render, screen } from '@testing-library/react';
import { Toaster } from '../toaster';
import "@testing-library/jest-dom";

// Mock the useToast hook
jest.mock("@/hooks/useToast");

describe('Toaster() Toaster method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render a toast with title and description', () => {
      // Mock the useToast hook to return a toast with title and description
      (useToast as jest.Mock).mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'Test Title',
            description: 'Test Description',
            action: null,
          },
        ],
      });

      render(<Toaster />);

      // Check if the title and description are rendered
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('should render a toast with an action', () => {
      // Mock the useToast hook to return a toast with an action
      const actionElement = <button>Action</button>;
      (useToast as jest.Mock).mockReturnValue({
        toasts: [
          {
            id: '2',
            title: 'Action Title',
            description: 'Action Description',
            action: actionElement,
          },
        ],
      });

      render(<Toaster />);

      // Check if the action is rendered
      expect(screen.getByText('Action')).toBeInTheDocument();
    });

    it('should render multiple toasts', () => {
      // Mock the useToast hook to return multiple toasts
      (useToast as jest.Mock).mockReturnValue({
        toasts: [
          {
            id: '1',
            title: 'First Toast',
            description: 'First Description',
            action: null,
          },
          {
            id: '2',
            title: 'Second Toast',
            description: 'Second Description',
            action: null,
          },
        ],
      });

      render(<Toaster />);

      // Check if both toasts are rendered
      expect(screen.getByText('First Toast')).toBeInTheDocument();
      expect(screen.getByText('Second Toast')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle an empty toasts array gracefully', () => {
      // Mock the useToast hook to return an empty array
      (useToast as jest.Mock).mockReturnValue({
        toasts: [],
      });

      render(<Toaster />);

      // Check if no toast is rendered
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should handle a toast without a title or description', () => {
      // Mock the useToast hook to return a toast without title and description
      (useToast as jest.Mock).mockReturnValue({
        toasts: [
          {
            id: '3',
            title: null,
            description: null,
            action: null,
          },
        ],
      });

      render(<Toaster />);

      // Check if the toast is rendered without title and description
      expect(screen.queryByText('Test Title')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Description')).not.toBeInTheDocument();
    });
  });
});

// End of unit tests for: Toaster
