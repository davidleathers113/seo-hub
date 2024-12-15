import { logger } from '../utils/logger';
import path from 'path';
import fs from 'fs';

// Create a test logger
const log = logger('TestModule');

// Test different log levels and formats
console.log('\nTesting logger implementation:\n');

// Test basic logging
log.info('Basic info message');
log.debug('Debug message with object', { key: 'value' });
log.warn('Warning message with multiple args', 'arg1', 'arg2', { key: 'value' });

// Test error logging
try {
    throw new Error('Test error with custom property');
} catch (error) {
    if (error instanceof Error) {
        (error as any).customProp = 'custom value';
        log.error('Caught an error', error);
    }
}

// Test structured logging
log.info('Structured log message', {
    userId: '123',
    action: 'test',
    metadata: {
        timestamp: new Date(),
        environment: process.env.NODE_ENV
    }
});

// Test long messages
log.info('Long message test\n' + 'x'.repeat(100));

// Force production mode temporarily to test file logging
const originalEnv = process.env.NODE_ENV;
process.env.NODE_ENV = 'production';

// Create a production logger
const prodLog = logger('ProductionTest');

// Test production logging
prodLog.info('Production log test');
prodLog.error('Production error test');

// Check if log files were created
const logsDir = path.join(process.cwd(), 'logs');
console.log('\nChecking log files in:', logsDir);

if (fs.existsSync(logsDir)) {
    const files = fs.readdirSync(logsDir);
    console.log('Log files created:', files);
} else {
    console.log('Logs directory not found (expected in production mode)');
}

// Restore original environment
process.env.NODE_ENV = originalEnv;

console.log('\nLogger test complete. Check the output above for proper formatting and colors.');
