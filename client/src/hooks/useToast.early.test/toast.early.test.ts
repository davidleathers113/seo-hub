
// Unit tests for: toast


import type {
    ToastActionElement
} from "@/components/ui/toast";
import { act, renderHook } from '@testing-library/react-hooks';
import * as React from "react";
import { useToast } from '../useToast';



// Mock for ToasterToast
type MockToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: jest.MockedFunction<ToastActionElement>;
  open?: boolean;
  onOpenChange?: jest.Mock;
};

describe('toast() toast method', () => {
  let mockToasterToast: MockToasterToast;

  beforeEach(() => {
    // Initialize mockToasterToast
    mockToasterToast = {
      id: '1',
      title: 'Test Title',
      description: 'Test Description',
      action: jest.fn(),
      open: true,
      onOpenChange: jest.fn(),
    };
  });

  describe('Happy Paths', () => {
    it('should add a toast with the correct properties', () => {
      // Test that a toast is added with the correct properties
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.toast(mockToasterToast as any);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0]).toMatchObject({
        id: '1',
        title: 'Test Title',
        description: 'Test Description',
        open: true,
      });
    });

    it('should update a toast correctly', () => {
      // Test that a toast can be updated
      const { result } = renderHook(() => useToast());
      act(() => {
        const toastInstance = result.current.toast(mockToasterToast as any);
        toastInstance.update({ title: 'Updated Title' } as any);
      });

      expect(result.current.toasts[0].title).toBe('Updated Title');
    });

    it('should dismiss a toast correctly', () => {
      // Test that a toast can be dismissed
      const { result } = renderHook(() => useToast());
      act(() => {
        const toastInstance = result.current.toast(mockToasterToast as any);
        toastInstance.dismiss();
      });

      expect(result.current.toasts[0].open).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle adding a toast when the limit is reached', () => {
      // Test behavior when adding a toast exceeds the limit
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.toast(mockToasterToast as any);
        result.current.toast({ ...mockToasterToast, id: '2' } as any);
      });

      expect(result.current.toasts).toHaveLength(1);
      expect(result.current.toasts[0].id).toBe('2');
    });

    it('should handle dismissing a non-existent toast gracefully', () => {
      // Test dismissing a toast that doesn't exist
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.dismiss('non-existent-id');
      });

      expect(result.current.toasts).toHaveLength(0);
    });

    it('should handle updating a non-existent toast gracefully', () => {
      // Test updating a toast that doesn't exist
      const { result } = renderHook(() => useToast());
      act(() => {
        result.current.toast(mockToasterToast as any);
        result.current.toasts[0].update({ id: 'non-existent-id', title: 'New Title' } as any);
      });

      expect(result.current.toasts[0].title).toBe('Test Title');
    });
  });
});

// End of unit tests for: toast
