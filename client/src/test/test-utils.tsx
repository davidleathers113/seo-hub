import React from 'react';
import { render } from '@testing-library/react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WorkspaceProvider } from '@/providers/workspace';
import { ThemeProvider } from '@/components/ui/theme-provider';
import { ToastProvider } from '@/components/ui/toast';

interface WrapperProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}

export function TestWrapper({ children, theme = 'light' }: WrapperProps) {
  return (
    <ThemeProvider defaultTheme={theme} storageKey="ui-theme">
      <ToastProvider>
        <AuthProvider>
          <WorkspaceProvider>
            {children}
          </WorkspaceProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export function renderWithProviders(ui: React.ReactElement, options = {}) {
  return render(ui, {
    wrapper: ({ children }) => <TestWrapper>{children}</TestWrapper>,
    ...options,
  });
}

export * from '@testing-library/react';
export { renderWithProviders as render };
