
// Unit tests for: useFormField


import { renderHook } from '@testing-library/react-hooks';
import * as React from "react";
import {
    useFormContext
} from "react-hook-form";
import { FormField, FormItem, useFormField } from '../form';



jest.mock("react-hook-form", () => ({
  useFormContext: jest.fn(),
}));

describe('useFormField() useFormField method', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Happy paths', () => {
    it('should return correct field state and context values when used within FormField and FormItem', () => {
      // Mocking useFormContext to return a specific form state
      const mockGetFieldState = jest.fn().mockReturnValue({ isDirty: true, error: null });
      (useFormContext as jest.Mock).mockReturnValue({
        getFieldState: mockGetFieldState,
        formState: {},
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FormItem>
          <FormField name="test">{children}</FormField>
        </FormItem>
      );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current).toEqual({
        id: expect.any(String),
        name: 'test',
        formItemId: expect.stringContaining('-form-item'),
        formDescriptionId: expect.stringContaining('-form-item-description'),
        formMessageId: expect.stringContaining('-form-item-message'),
        isDirty: true,
        error: null,
      });
    });
  });

  describe('Edge cases', () => {
    it('should throw an error if useFormField is used outside of FormField', () => {
      // Mocking useFormContext to return a specific form state
      const mockGetFieldState = jest.fn().mockReturnValue({});
      (useFormContext as jest.Mock).mockReturnValue({
        getFieldState: mockGetFieldState,
        formState: {},
      });

      const { result } = renderHook(() => useFormField());

      expect(result.error).toEqual(new Error('useFormField should be used within <FormField>'));
    });

    it('should handle missing item context gracefully', () => {
      // Mocking useFormContext to return a specific form state
      const mockGetFieldState = jest.fn().mockReturnValue({ isDirty: false, error: null });
      (useFormContext as jest.Mock).mockReturnValue({
        getFieldState: mockGetFieldState,
        formState: {},
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <FormField name="test">{children}</FormField>
      );

      const { result } = renderHook(() => useFormField(), { wrapper });

      expect(result.current).toEqual({
        id: undefined,
        name: 'test',
        formItemId: 'undefined-form-item',
        formDescriptionId: 'undefined-form-item-description',
        formMessageId: 'undefined-form-item-message',
        isDirty: false,
        error: null,
      });
    });
  });
});

// End of unit tests for: useFormField
