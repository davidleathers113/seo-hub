import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { mockConfig } from './test-config'

afterEach(cleanup)

// Unified mock setup
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockConfig.router.navigate,
    useLocation: mockConfig.router.location,
    useParams: mockConfig.router.params,
    BrowserRouter: ({ children }) => children
  }
})

vi.mock('@/api/Api', () => ({
  api: mockConfig.api,
  default: mockConfig.api
}))

vi.mock('@/hooks/useToast', () => ({
  useToast: () => ({ toast: mockConfig.toast })
}))

vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockConfig.auth
}))

// Browser APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

