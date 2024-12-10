
// Unit tests for: AuthProvider


import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../../api/auth";
import { AuthProvider } from '../AuthContext';



jest.mock("../../api/auth");

type MockReactNode = {
  type: string;
  props: any;
  children: any;
};

class MockErrorBoundary extends React.Component {
  render() {
    return this.props.children;
  }
}

describe('AuthProvider() AuthProvider method', () => {
  let mockChildren: MockReactNode;

  beforeEach(() => {
    mockChildren = { type: 'div', props: {}, children: null } as any;
    localStorage.clear();
  });

  describe('Happy paths', () => {
    it('should initialize with isAuthenticated as false and isLoading as true', async () => {
      // Test the initial state of AuthProvider
      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
      });
    });

    it('should login successfully and set isAuthenticated to true', async () => {
      // Mock successful login response
      (apiLogin as jest.Mock).mockResolvedValue({
        data: { token: 'mockToken' },
      } as any as never);

      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await act(async () => {
        const context = React.useContext(AuthContext);
        await context?.login('test@example.com', 'password');
      });

      expect(localStorage.getItem('token')).toBe('mockToken');
    });

    it('should register successfully and set isAuthenticated to true', async () => {
      // Mock successful registration response
      (apiRegister as jest.Mock).mockResolvedValue({
        data: { token: 'mockToken' },
      } as any as never);

      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await act(async () => {
        const context = React.useContext(AuthContext);
        await context?.register('test@example.com', 'password');
      });

      expect(localStorage.getItem('token')).toBe('mockToken');
    });

    it('should logout successfully and set isAuthenticated to false', async () => {
      // Mock successful logout
      (apiLogout as jest.Mock).mockResolvedValue({} as any as never);

      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await act(async () => {
        const context = React.useContext(AuthContext);
        await context?.logout();
      });

      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Edge cases', () => {
    it('should handle login failure and set isAuthenticated to false', async () => {
      // Mock failed login response
      (apiLogin as jest.Mock).mockRejectedValue(new Error('Login failed') as never);

      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await act(async () => {
        const context = React.useContext(AuthContext);
        await expect(context?.login('test@example.com', 'wrongpassword')).rejects.toThrow('Login failed');
      });

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle registration failure and set isAuthenticated to false', async () => {
      // Mock failed registration response
      (apiRegister as jest.Mock).mockRejectedValue(new Error('Registration failed') as never);

      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await act(async () => {
        const context = React.useContext(AuthContext);
        await expect(context?.register('test@example.com', 'password')).rejects.toThrow('Registration failed');
      });

      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle logout failure gracefully', async () => {
      // Mock failed logout
      (apiLogout as jest.Mock).mockRejectedValue(new Error('Logout failed') as never);

      const { getByText } = render(
        <AuthProvider>
          <MockErrorBoundary>
            <div>Test</div>
          </MockErrorBoundary>
        </AuthProvider>
      );

      await act(async () => {
        const context = React.useContext(AuthContext);
        await context?.logout();
      });

      expect(localStorage.getItem('token')).toBeNull();
    });
  });
});

// End of unit tests for: AuthProvider
