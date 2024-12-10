
// Unit tests for: reducer


import type {
    ToastActionElement,
    ToastProps,
} from "@/components/ui/toast";
import * as React from "react";
import { reducer } from '../useToast';


type MockToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};


describe('reducer() reducer method', () => {
  let initialState: { toasts: MockToasterToast[] };

  beforeEach(() => {
    initialState = { toasts: [] };
  });

  describe('Happy paths', () => {
    it('should add a toast when ADD_TOAST action is dispatched', () => {
      const mockToast: MockToasterToast = {
        id: '1',
        title: 'Test Toast',
        description: 'This is a test toast',
        open: true,
      } as any;

      const action = { type: 'ADD_TOAST', toast: mockToast } as any;
      const newState = reducer(initialState, action);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0]).toEqual(mockToast);
    });

    it('should update a toast when UPDATE_TOAST action is dispatched', () => {
      const existingToast: MockToasterToast = {
        id: '1',
        title: 'Old Title',
        description: 'Old Description',
        open: true,
      } as any;

      initialState.toasts.push(existingToast);

      const updatedToast: Partial<MockToasterToast> = {
        id: '1',
        title: 'New Title',
      } as any;

      const action = { type: 'UPDATE_TOAST', toast: updatedToast } as any;
      const newState = reducer(initialState, action);

      expect(newState.toasts[0].title).toBe('New Title');
      expect(newState.toasts[0].description).toBe('Old Description');
    });

    it('should dismiss a toast when DISMISS_TOAST action is dispatched', () => {
      const existingToast: MockToasterToast = {
        id: '1',
        title: 'Test Toast',
        description: 'This is a test toast',
        open: true,
      } as any;

      initialState.toasts.push(existingToast);

      const action = { type: 'DISMISS_TOAST', toastId: '1' } as any;
      const newState = reducer(initialState, action);

      expect(newState.toasts[0].open).toBe(false);
    });

    it('should remove a toast when REMOVE_TOAST action is dispatched', () => {
      const existingToast: MockToasterToast = {
        id: '1',
        title: 'Test Toast',
        description: 'This is a test toast',
        open: true,
      } as any;

      initialState.toasts.push(existingToast);

      const action = { type: 'REMOVE_TOAST', toastId: '1' } as any;
      const newState = reducer(initialState, action);

      expect(newState.toasts).toHaveLength(0);
    });
  });

  describe('Edge cases', () => {
    it('should not add more than TOAST_LIMIT toasts', () => {
      const mockToast1: MockToasterToast = {
        id: '1',
        title: 'Toast 1',
        description: 'This is toast 1',
        open: true,
      } as any;

      const mockToast2: MockToasterToast = {
        id: '2',
        title: 'Toast 2',
        description: 'This is toast 2',
        open: true,
      } as any;

      const action1 = { type: 'ADD_TOAST', toast: mockToast1 } as any;
      const action2 = { type: 'ADD_TOAST', toast: mockToast2 } as any;

      let newState = reducer(initialState, action1);
      newState = reducer(newState, action2);

      expect(newState.toasts).toHaveLength(1);
      expect(newState.toasts[0].id).toBe('2');
    });

    it('should handle DISMISS_TOAST with undefined toastId', () => {
      const existingToast1: MockToasterToast = {
        id: '1',
        title: 'Toast 1',
        description: 'This is toast 1',
        open: true,
      } as any;

      const existingToast2: MockToasterToast = {
        id: '2',
        title: 'Toast 2',
        description: 'This is toast 2',
        open: true,
      } as any;

      initialState.toasts.push(existingToast1, existingToast2);

      const action = { type: 'DISMISS_TOAST', toastId: undefined } as any;
      const newState = reducer(initialState, action);

      expect(newState.toasts[0].open).toBe(false);
      expect(newState.toasts[1].open).toBe(false);
    });

    it('should handle REMOVE_TOAST with undefined toastId', () => {
      const existingToast1: MockToasterToast = {
        id: '1',
        title: 'Toast 1',
        description: 'This is toast 1',
        open: true,
      } as any;

      const existingToast2: MockToasterToast = {
        id: '2',
        title: 'Toast 2',
        description: 'This is toast 2',
        open: true,
      } as any;

      initialState.toasts.push(existingToast1, existingToast2);

      const action = { type: 'REMOVE_TOAST', toastId: undefined } as any;
      const newState = reducer(initialState, action);

      expect(newState.toasts).toHaveLength(0);
    });
  });
});

// End of unit tests for: reducer
