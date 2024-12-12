import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TestMonitor } from './test-monitor';

interface ValidationResult {
  passed: boolean;
  issues: string[];
  warnings: string[];
}

export class TestValidator {
  private static instance: TestValidator;
  private mongoServer?: MongoMemoryServer;

  private constructor() {}

  static getInstance(): TestValidator {
    if (!TestValidator.instance) {
      TestValidator.instance = new TestValidator();
    }
    return TestValidator.instance;
  }

  /**
   * Register the global MongoDB Memory Server instance
   */
  setGlobalMongoServer(server: MongoMemoryServer) {
    this.mongoServer = server;
  }

  /**
   * Wait for mongoose connection to be ready
   */
  private async waitForConnection(timeoutMs: number = 5000): Promise<boolean> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (mongoose.connection.readyState === 1) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    return false;
  }

  /**
   * Validate test setup for common issues
   */
  async validateTestSetup(): Promise<ValidationResult> {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check MongoDB server
    if (!this.mongoServer) {
      issues.push('No MongoDB Memory Server registered with TestValidator');
    }

    // Check mongoose connection state and wait if needed
    if (mongoose.connection.readyState !== 1) {
      const isConnected = await this.waitForConnection();
      if (!isConnected) {
        issues.push('Mongoose connection is not established');
      }
    }

    // Check for memory leaks
    const heapUsed = process.memoryUsage().heapUsed / 1024 / 1024;
    if (heapUsed > 500) {
      warnings.push(`High memory usage detected: ${Math.round(heapUsed)}MB`);
    }

    // Check MongoDB URI
    if (this.mongoServer && mongoose.connection.readyState === 1) {
      const currentUri = (mongoose.connection as any).getClient().s.url;
      const expectedUri = await this.mongoServer.getUri();
      if (currentUri !== expectedUri) {
        warnings.push('MongoDB URI mismatch - possible multiple server instances');
      }
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
    if (context.afterAll && !context.afterAll.toString().includes('mongoose.disconnect')) {
      warnings.push('No mongoose disconnect found in afterAll');
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
    if (userId && !mongoose.Types.ObjectId.isValid(userId)) {
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
