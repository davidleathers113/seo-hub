import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
};

const customRender = (ui: React.ReactElement) =>
  render(ui, { wrapper: AllTheProviders });

export * from '@testing-library/react';
export { customRender as render };
