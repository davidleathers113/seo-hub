
// Unit tests for: useToast


import { act, renderHook } from '@testing-library/react-hooks';
import * as React from "react";
import { useToast } from '../useToast';



// Mock types
type MockToastActionElement = {
  type: string;
  payload?: any;
};

type MockToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: MockToastActionElement;
};

type MockToast = Omit<MockToasterToast, 'id'>;

describe('useToast() useToast method', () => {
  // Happy path tests
  describe('Happy Paths', () => {
    it('should add a toast correctly', () => {
      // Test to ensure a toast is added correctly
      const { result } = renderHook(() => useToast());

      const mockToast: MockToast = {
        title: 'Test Toast',
        description: 'This is a test toast',
      } as any;

      act(() => {
        result.current.toast(mockToast as any);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].title).toBe('Test Toast');
    });

    it('should dismiss a toast correctly', () => {
      // Test to ensure a toast is dismissed correctly
      const { result } = renderHook(() => useToast());

      const mockToast: MockToasterToast = {
        id: '1',
        title: 'Test Toast',
        description: 'This is a test toast',
      } as any;

      act(() => {
        result.current.toast(mockToast as any);
        result.current.dismiss('1');
      });

      expect(result.current.toasts).toHaveLength(0);
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle dismissing a non-existent toast gracefully', () => {
      // Test to ensure dismissing a non-existent toast does not cause errors
      const { result } = renderHook(() => useToast());

      act(() => {
        result.current.dismiss('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should not exceed the toast limit', () => {
      // Test to ensure the toast limit is not exceeded
      const { result } = renderHook(() => useToast());

      const mockToast1: MockToasterToast = {
        id: '1',
        title: 'Toast 1',
        description: 'First toast',
      } as any;

      const mockToast2: MockToasterToast = {
        id: '2',
        title: 'Toast 2',
        description: 'Second toast',
      } as any;

      act(() => {
        result.current.toast(mockToast1 as any);
        result.current.toast(mockToast2 as any);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBe('2');
    });
  });
});

// End of unit tests for: useToast
