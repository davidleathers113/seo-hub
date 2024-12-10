
// Unit tests for: useAuth

import { act, renderHook } from '@testing-library/react-hooks';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from "../../api/auth";
import { AuthProvider, useAuth } from '../AuthContext';


jest.mock("../../api/auth");

describe('useAuth() useAuth method', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Happy Paths', () => {
    it('should initialize with isAuthenticated as false and isLoading as true', () => {
      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(true);
    });

    it('should set isAuthenticated to true after successful login', async () => {
      const token = 'fake-token';
      (apiLogin as jest.Mock).mockResolvedValue({ data: { token } });

      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await act(async () => {
        await result.current.login('test@example.com', 'password');
      });

      expect(localStorage.getItem('token')).toBe(token);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to true after successful registration', async () => {
      const token = 'fake-token';
      (apiRegister as jest.Mock).mockResolvedValue({ data: { token } });

      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await act(async () => {
        await result.current.register('test@example.com', 'password');
      });

      expect(localStorage.getItem('token')).toBe(token);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false after logout', async () => {
      localStorage.setItem('token', 'fake-token');
      (apiLogout as jest.Mock).mockResolvedValue({});

      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await act(async () => {
        await result.current.logout();
      });

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle login failure gracefully', async () => {
      (apiLogin as jest.Mock).mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrong-password');
        })
      ).rejects.toThrow('Login failed');

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should handle registration failure gracefully', async () => {
      (apiRegister as jest.Mock).mockRejectedValue(new Error('Registration failed'));

      const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

      await expect(
        act(async () => {
          await result.current.register('test@example.com', 'password');
        })
      ).rejects.toThrow('Registration failed');

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should throw an error if useAuth is used outside of AuthProvider', () => {
      const { result } = renderHook(() => useAuth());
      expect(result.error).toEqual(new Error('useAuth must be used within an AuthProvider'));
    });
  });
});

// End of unit tests for: useAuth
