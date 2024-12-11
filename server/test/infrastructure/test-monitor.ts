/**
 * Test monitoring infrastructure for tracking test execution and debugging
 */

interface TestEvent {
  timestamp: Date
  type: string
  data: any
  context?: {
    testName?: string
    testFile?: string
    stack?: string
  }
}

export class TestMonitor {
  private static events: TestEvent[] = []
  private static currentTest?: string
  private static currentFile?: string

  /**
   * Record a test event with context
   */
  static recordEvent(type: string, data: any): void {
    const error = new Error()
    const stack = error.stack?.split('\n').slice(2).join('\n') // Remove first two lines (Error and recordEvent)

    this.events.push({
      timestamp: new Date(),
      type,
      data,
      context: {
        testName: this.currentTest,
        testFile: this.currentFile,
        stack
      }
    })
  }

  /**
   * Set current test context
   */
  static setContext(testName: string, testFile: string): void {
    this.currentTest = testName
    this.currentFile = testFile
  }

  /**
   * Clear current test context
   */
  static clearContext(): void {
    this.currentTest = undefined
    this.currentFile = undefined
  }

  /**
   * Get all recorded events
   */
  static getEvents(): TestEvent[] {
    return [...this.events]
  }

  /**
   * Get events for a specific test
   */
  static getTestEvents(testName: string): TestEvent[] {
    return this.events.filter(e => e.context?.testName === testName)
  }

  /**
   * Get events of a specific type
   */
  static getEventsByType(type: string): TestEvent[] {
    return this.events.filter(e => e.type === type)
  }

  /**
   * Get event sequence as string array
   */
  static getEventSequence(): string[] {
    return this.events.map(e => e.type)
  }

  /**
   * Get detailed event history with context
   */
  static getEventHistory(): string {
    return this.events
      .map(e => {
        const timestamp = e.timestamp.toISOString()
        const context = e.context?.testName ? ` (${e.context.testName})` : ''
        return `${timestamp} - ${e.type}${context}: ${JSON.stringify(e.data)}`
      })
      .join('\n')
  }

  /**
   * Clear all recorded events
   */
  static clear(): void {
    this.events = []
    this.clearContext()
  }

  /**
   * Create a test wrapper that automatically sets context
   */
  static wrapTest(name: string, fn: () => Promise<void>): () => Promise<void> {
    return async () => {
      const testFile = new Error().stack?.split('\n')[2]?.match(/\((.+?):\d+:\d+\)/)?.[1] || 'unknown'
      this.setContext(name, testFile)
      try {
        await fn()
      } finally {
        this.clearContext()
      }
    }
  }

  /**
   * Create Jest test wrapper
   */
  static createTestWrapper(): (name: string, fn: () => Promise<void>) => void {
    return (name: string, fn: () => Promise<void>) => {
      test(name, this.wrapTest(name, fn))
    }
  }
}

// Export wrapped test function
export const monitoredTest = TestMonitor.createTestWrapper()