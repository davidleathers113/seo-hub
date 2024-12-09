import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { mockConfig } from './test-config'
import type { RenderOptions } from '@testing-library/react'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string
  theme?: 'light' | 'dark'
}

export const renderWithProviders = (
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) => {
  const {
    route = '/',
    theme = 'light',
    ...renderOptions
  } = options

  window.history.pushState({}, 'Test page', route)

  return render(
    <BrowserRouter>
      <ThemeProvider defaultTheme={theme} storageKey="ui-theme">
        {ui}
      </ThemeProvider>
    </BrowserRouter>,
    renderOptions
  )
}

// Export mocks
export const { api: mockApi, toast: mockToast } = mockConfig

// Re-export everything
export * from '@testing-library/react'
