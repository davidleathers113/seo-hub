import { render, act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import { login, register, logout } from '../../api/auth';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock the auth API
vi.mock('../../api/auth', () => ({
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Clear all mocks
    vi.clearAllMocks();
  });

  describe('Initial state', () => {
    it('should start with isAuthenticated false when no token exists', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should start with isAuthenticated true when token exists', () => {
      localStorage.setItem('token', 'test-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('login', () => {
    it('should set isAuthenticated to true on successful login', async () => {
      const mockToken = 'test-token';
      (login as jest.Mock).mockResolvedValueOnce({
        data: { token: mockToken, user: { id: '1', email: 'test@example.com' } },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should handle login failure', async () => {
      const errorMessage = 'Invalid credentials';
      (login as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let error: Error | null = null;
      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrong-password');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('register', () => {
    it('should set isAuthenticated to true on successful registration', async () => {
      const mockToken = 'test-token';
      (register as jest.Mock).mockResolvedValueOnce({
        data: { token: mockToken, user: { id: '1', email: 'test@example.com' } },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.register('test@example.com', 'password');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    it('should handle registration failure', async () => {
      const errorMessage = 'Email already exists';
      (register as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let error: Error | null = null;
      await act(async () => {
        try {
          await result.current.register('existing@example.com', 'password');
        } catch (e) {
          error = e as Error;
        }
      });

      expect(error).toBeTruthy();
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('logout', () => {
    it('should set isAuthenticated to false and remove token on logout', async () => {
      // Setup initial authenticated state
      localStorage.setItem('token', 'test-token');
      (logout as jest.Mock).mockResolvedValueOnce({ data: { success: true } });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('should handle logout failure gracefully', async () => {
      localStorage.setItem('token', 'test-token');
      (logout as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear auth state even if API call fails
      expect(result.current.isAuthenticated).toBe(false);
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('Error handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      const consoleError = console.error;
      console.error = vi.fn(); // Suppress React error logging

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      console.error = consoleError; // Restore console.error
    });
  });
});
