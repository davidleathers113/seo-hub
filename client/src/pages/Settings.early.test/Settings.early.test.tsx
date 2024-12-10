
// Unit tests for: Settings

import { useToast } from "@/hooks/useToast";
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Settings } from '../Settings';
import "@testing-library/jest-dom";

// Mock the useToast hook
jest.mock("@/hooks/useToast", () => ({
  useToast: jest.fn(),
}));

describe('Settings() Settings method', () => {
  let toastMock: jest.Mock;

  beforeEach(() => {
    toastMock = jest.fn();
    (useToast as jest.Mock).mockReturnValue({ toast: toastMock });
  });

  describe('Happy Paths', () => {
    test('should render the Settings component without errors', () => {
      // Render the Settings component
      render(<Settings />);

      // Check if the component renders the Tabs
      expect(screen.getByText('Account')).toBeInTheDocument();
      expect(screen.getByText('API')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
      expect(screen.getByText('Notifications')).toBeInTheDocument();
      expect(screen.getByText('Appearance')).toBeInTheDocument();
      expect(screen.getByText('Data')).toBeInTheDocument();
    });

    test('should display success toast when saving changes', async () => {
      // Render the Settings component
      render(<Settings />);

      // Simulate clicking the save changes button
      const saveButton = screen.getByRole('button', { name: /save changes/i });
      fireEvent.click(saveButton);

      // Wait for the toast to be called
      await waitFor(() => {
        expect(toastMock).toHaveBeenCalledWith({
          title: 'Success',
          description: 'Your settings have been saved.',
        });
      });
    });

    test('should display copied toast when copying API key', () => {
      // Render the Settings component
      render(<Settings />);

      // Simulate clicking the copy API key button
      const copyButton = screen.getByRole('button', { name: /copy api key/i });
      fireEvent.click(copyButton);

      // Check if the toast is called with the correct message
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Copied',
        description: 'API key copied to clipboard',
      });
    });

    test('should display regenerated toast when regenerating API key', () => {
      // Render the Settings component
      render(<Settings />);

      // Simulate clicking the regenerate API key button
      const regenerateButton = screen.getByRole('button', { name: /regenerate api key/i });
      fireEvent.click(regenerateButton);

      // Check if the toast is called with the correct message
      expect(toastMock).toHaveBeenCalledWith({
        title: 'Regenerated',
        description: 'New API key has been generated',
      });
    });
  });

  describe('Edge Cases', () => {
    test('should display error message if an error occurs during component mount', () => {
      // Mock console.error to suppress error output in test
      const consoleErrorMock = jest.spyOn(console, 'error').mockImplementation(() => {});

      // Simulate an error during component mount
      (useToast as jest.Mock).mockImplementation(() => {
        throw new Error('Test error');
      });

      // Render the Settings component
      render(<Settings />);

      // Check if the error message is displayed
      expect(screen.getByText('Error loading Settings')).toBeInTheDocument();
      expect(screen.getByText('Test error')).toBeInTheDocument();

      // Restore console.error
      consoleErrorMock.mockRestore();
    });
  });
});

// End of unit tests for: Settings
