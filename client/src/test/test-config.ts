import { vi } from 'vitest'

// Centralized mock configuration
export const mockConfig = {
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  },
  router: {
    navigate: vi.fn(),
    location: vi.fn(() => ({ pathname: '/' })),
    params: vi.fn(() => ({}))
  },
  toast: vi.fn(),
  auth: {
    isAuthenticated: true,
    login: vi.fn(),
    logout: vi.fn()
  }
}

// Type-safe mock exports
export type MockAPI = typeof mockConfig.api
export type MockRouter = typeof mockConfig.router
export type MockToast = typeof mockConfig.toast
export type MockAuth = typeof mockConfig.auth
