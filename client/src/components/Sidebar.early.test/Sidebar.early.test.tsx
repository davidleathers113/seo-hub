
// Unit tests for: Sidebar


import { menuItems } from "@/config/menu";
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from '../Sidebar';
import "@testing-library/jest-dom";

// Mocking the necessary hooks and components
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick }: { children: React.ReactNode; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

jest.mock("@/components/ui/scroll-area", () => ({
  ScrollArea: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("@/lib/utils", () => ({
  cn: (...args: string[]) => args.join(' '),
}));

describe('Sidebar() Sidebar method', () => {
  const mockNavigate = jest.fn();
  const mockLocation = { pathname: '/some-path' };

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    (useLocation as jest.Mock).mockReturnValue(mockLocation);
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should render all menu items', () => {
      // Render the Sidebar component
      render(<Sidebar />);

      // Check if all menu items are rendered
      menuItems.forEach((item) => {
        expect(screen.getByText(item.title)).toBeInTheDocument();
      });
    });

    it('should navigate to the correct path when a menu item is clicked', () => {
      // Render the Sidebar component
      render(<Sidebar />);

      // Simulate clicking on the first menu item
      const firstMenuItem = menuItems[0];
      fireEvent.click(screen.getByText(firstMenuItem.title));

      // Check if navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith(firstMenuItem.path);
    });

    it('should highlight the active menu item based on the current location', () => {
      // Render the Sidebar component
      render(<Sidebar />);

      // Check if the active menu item is highlighted
      const activeMenuItem = menuItems.find(item => item.path === mockLocation.pathname);
      if (activeMenuItem) {
        expect(screen.getByText(activeMenuItem.title)).toHaveClass('bg-primary/10 text-primary');
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle an empty menuItems array gracefully', () => {
      // Mock an empty menuItems array
      jest.mock("@/config/menu", () => ({
        menuItems: [],
      }));

      // Render the Sidebar component
      render(<Sidebar />);

      // Check if no menu items are rendered
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('should not break if a menu item has no icon', () => {
      // Mock a menu item without an icon
      const menuItemsWithoutIcon = [{ path: '/no-icon', title: 'No Icon' }];
      jest.mock("@/config/menu", () => ({
        menuItems: menuItemsWithoutIcon,
      }));

      // Render the Sidebar component
      render(<Sidebar />);

      // Check if the menu item without an icon is rendered
      expect(screen.getByText('No Icon')).toBeInTheDocument();
    });
  });
});

// End of unit tests for: Sidebar
