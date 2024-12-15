import React, { ReactElement, ReactNode } from 'react'
import { vi } from 'vitest'
import { render, RenderOptions } from '@testing-library/react'
import { PillarStatus, SubpillarStatus } from '../../../utils/statusUtils'
import { BrowserRouter } from 'react-router-dom'

export const createMockPillar = (
  id: string,
  title: string,
  status: PillarStatus = 'pending',
  subpillars: Array<{
    id: string;
    title: string;
    status: SubpillarStatus;
    progress: number;
  }> = []
) => ({
  id,
  title,
  status,
  subpillars
})

export const createMockSubpillar = (
  id: string,
  title: string,
  status: SubpillarStatus = 'research',
  progress: number = 0
) => ({
  id,
  title,
  status,
  progress
})

export const mockHandlers = {
  onPillarUpdate: vi.fn(),
  onSubpillarUpdate: vi.fn(),
  onAddSubpillar: vi.fn(),
  onDeletePillar: vi.fn(),
  onDeleteSubpillar: vi.fn(),
  onNavigateToSubpillar: vi.fn()
}

export const createMockTreeProps = () => ({
  pillars: [
    createMockPillar('pillar-1', 'Test Pillar 1', 'pending', [
      createMockSubpillar('sub-1', 'Test Subpillar 1', 'research', 20),
      createMockSubpillar('sub-2', 'Test Subpillar 2', 'outline', 40)
    ]),
    createMockPillar('pillar-2', 'Test Pillar 2', 'approved')
  ],
  onPillarUpdate: mockHandlers.onPillarUpdate,
  onSubpillarUpdate: mockHandlers.onSubpillarUpdate,
  onAddSubpillar: mockHandlers.onAddSubpillar,
  onDeletePillar: mockHandlers.onDeletePillar,
  onDeleteSubpillar: mockHandlers.onDeleteSubpillar,
  onNavigateToSubpillar: mockHandlers.onNavigateToSubpillar
})

// Reset all mock handlers between tests
export const resetMocks = () => {
  Object.values(mockHandlers).forEach(mock => mock.mockReset())
}

interface WrapperProps {
  children: ReactNode
}

// Wrapper component for router context
const Wrapper = ({ children }: WrapperProps) => {
  return <BrowserRouter>{children}</BrowserRouter>
}

type CustomRenderOptions = Omit<RenderOptions, 'wrapper'>

// Custom render with router wrapper
export const renderWithProviders = (
  ui: ReactElement,
  options?: CustomRenderOptions
) => {
  return {
    ...render(ui, { ...options, wrapper: Wrapper }),
    mockHandlers
  }
}
