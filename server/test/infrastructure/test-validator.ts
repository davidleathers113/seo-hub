import { DatabaseClient } from '../../database/interfaces';
import { getDatabase } from '../../database';
import { TestMonitor } from './test-monitor';

interface ValidationResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

export class TestValidator {
  private static instance: TestValidator;
  private db: DatabaseClient;

  private constructor() {
    this.db = getDatabase();
  }

  static getInstance(): TestValidator {
    if (!TestValidator.instance) {
      TestValidator.instance = new TestValidator();
    }
    return TestValidator.instance;
  }

  /**
   * Wait for database connection to be ready
   */
  private async waitForConnection(timeoutMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      try {
        await this.db.ping();
        return true;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return false;
  }

  /**
   * Validate test setup for common issues
   */
  async validateTestSetup(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check database connection
    try {
      await this.db.ping();
    } catch {
      const isConnected = await this.waitForConnection();
      if (!isConnected) {
        issues.push('Database connection is not established');
      }
    }

    // Check for memory leaks
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    if (heapUsed > 500) {
      warnings.push(`High memory usage detected: ${Math.round(heapUsed)}MB`);
    }

    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate test context for proper setup
   */
  validateTestContext(context: any): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for proper beforeAll/afterAll hooks
    if (!context.beforeAll || !context.afterAll) {
      issues.push('Missing test lifecycle hooks (beforeAll/afterAll)');
    }

    // Check for proper cleanup in afterAll
    if (context.afterAll && !context.afterAll.toString().includes('cleanup')) {
      warnings.push('No database cleanup found in afterAll');
    }

    // Check for proper mock cleanup
    if (!context.beforeEach || !context.beforeEach.toString().includes('jest.clearAllMocks')) {
      warnings.push('No mock cleanup found in beforeEach');
    }

    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Validate authentication setup
   */
  validateAuthSetup(req: any): ValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check auth header format
    const authHeader = req.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer mock_token_')) {
      issues.push('Invalid auth token format');
    }

    // Check user ID format
    const userId = authHeader?.split('_')[2];
    if (userId && !this.isValidId(userId)) {
      issues.push('Invalid user ID format');
    }

    return {
      passed: issues.length === 0,
      issues,
      warnings
    };
  }

  /**
   * Record validation result in test monitor
   */
  recordValidationResult(testName: string, result: ValidationResult) {
    TestMonitor.recordEvent('test_validation', {
      test: testName,
      passed: result.passed,
      issues: result.issues,
      warnings: result.warnings,
      timestamp: new Date()
    });
  }

  /**
   * Helper method to validate ID format
   */
  private isValidId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }
}

export const testValidator = TestValidator.getInstance();

/**
 * Test decorator that validates setup before running
 */
export function validateTest(description: string, testFn: () => void) {
  return async () => {
    const validator = TestValidator.getInstance();
    const setupResult = await validator.validateTestSetup();
    
    if (!setupResult.passed) {
      console.error('Test validation failed:', setupResult.issues);
      throw new Error(`Test validation failed: ${setupResult.issues.join(', ')}`);
    }

    if (setupResult.warnings.length > 0) {
      console.warn('Test warnings:', setupResult.warnings);
    }

    validator.recordValidationResult(description, setupResult);
    return testFn();
  };
}
