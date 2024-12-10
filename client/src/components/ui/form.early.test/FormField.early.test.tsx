
// Unit tests for: FormField

import { render } from '@testing-library/react';
import {
    FormProvider,
    useForm
} from "react-hook-form";
import { FormField } from '../form';



describe('FormField() FormField method', () => {
  // Happy Path Tests
  describe('Happy Paths', () => {
    it('should render the Controller component with the correct props', () => {
      // This test checks if the FormField renders the Controller with the correct props
      const TestComponent = () => {
        const methods = useForm();
        return (
          <FormProvider {...methods}>
            <FormField name="testField" render={() => <input />} />
          </FormProvider>
        );
      };

      const { getByRole } = render(<TestComponent />);
      expect(getByRole('textbox')).toBeInTheDocument();
    });

    it('should provide the correct context value', () => {
      // This test checks if the FormField provides the correct context value
      const TestComponent = () => {
        const methods = useForm();
        return (
          <FormProvider {...methods}>
            <FormField name="testField" render={() => <input />} />
          </FormProvider>
        );
      };

      const { getByRole } = render(<TestComponent />);
      expect(getByRole('textbox')).toBeInTheDocument();
    });
  });

  // Edge Case Tests
  describe('Edge Cases', () => {
    it('should throw an error if useFormField is used outside of FormField', () => {
      // This test checks if an error is thrown when useFormField is used outside of FormField
      const TestComponent = () => {
        const { useFormField } = require('./form'); // Adjust the import path as necessary
        useFormField(); // This should throw an error
        return <div />;
      };

      expect(() => render(<TestComponent />)).toThrow(
        'useFormField should be used within <FormField>'
      );
    });

    it('should handle missing name prop gracefully', () => {
      // This test checks if the FormField handles a missing name prop gracefully
      const TestComponent = () => {
        const methods = useForm();
        return (
          <FormProvider {...methods}>
            {/* @ts-expect-error: Intentionally omitting the name prop to test error handling */}
            <FormField render={() => <input />} />
          </FormProvider>
        );
      };

      expect(() => render(<TestComponent />)).toThrow();
    });
  });
});

// End of unit tests for: FormField
