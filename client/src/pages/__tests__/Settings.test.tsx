import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Settings } from '../Settings'
import { describe, it, expect, beforeEach } from 'vitest'

const renderWithProviders = (component: React.ReactNode) => {
  console.log('Rendering with providers...')
  try {
    return render(
      <BrowserRouter>
        <ThemeProvider defaultTheme="light" storageKey="ui-theme">
          {component}
        </ThemeProvider>
      </BrowserRouter>
    )
  } catch (error) {
    console.error('Error rendering component:', error)
    throw error
  }
}

describe('Settings Component', () => {
  beforeEach(() => {
    console.log('Starting new test...')
  })

  it('renders without crashing', () => {
    console.log('Testing basic render...')
    try {
      renderWithProviders(<Settings />)
      const element = screen.getByText('Account Settings')
      console.log('Found element:', element)
      expect(element).toBeInTheDocument()
    } catch (error) {
      console.error('Test failed:', error)
      throw error
    }
  })

  it('shows all tab options', () => {
    console.log('Testing tab options...')
    try {
      renderWithProviders(<Settings />)
      const tabs = ['Account', 'API', 'Notifications']
      tabs.forEach(tab => {
        const element = screen.getByText(tab)
        console.log(`Found tab: ${tab}`)
        expect(element).toBeInTheDocument()
      })
    } catch (error) {
      console.error('Test failed:', error)
      throw error
    }
  })
})
