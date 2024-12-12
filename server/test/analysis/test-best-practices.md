# Test Best Practices

## Systematic Testing Approach

### 1. Pre-Test Analysis
Before writing or modifying tests:
- Use test-checklist.md to identify potential issues
- Review test-validator.ts for automated checks
- Analyze dependencies and mocking requirements

### 2. Test Infrastructure
Always verify:
```javascript
// 1. Single MongoDB instance (from jest.setup.js)
beforeAll(async () => {
  // DON'T create new MongoDB instance here
  // DO use existing connection from jest.setup.js
});

// 2. Proper cleanup
beforeEach(async () => {
  await Promise.all([
    mongoose.connection.collection('collection1').deleteMany({}),
    mongoose.connection.collection('collection2').deleteMany({})
  ]);
  jest.clearAllMocks();
});

// 3. Resource cleanup
afterAll(async () => {
  await testServer.close();
});
```

### 3. Authentication Testing
Consistent auth patterns:
```javascript
// 1. User ID format
const testUserId = new mongoose.Types.ObjectId().toString();

// 2. User mock
UserService.get.mockImplementation(async (id) => {
  if (id === testUserId) {
    return {
      _id: testUserId,
      email: 'test@example.com',
      role: 'user'
    };
  }
  return null;
});

// 3. Token format
.set('Authorization', `Bearer mock_token_${testUserId}`);
```

### 4. Error Handling
Proper error validation:
```javascript
// 1. Database errors
try {
  await mongoose.connection.collection('articles').deleteMany({});
} catch (error) {
  console.error('Error clearing collections:', error);
  throw error;
}

// 2. Test validation errors
const setupResult = await testValidator.validateTestSetup();
if (!setupResult.passed) {
  throw new Error(`Test setup validation failed: ${setupResult.issues.join(', ')}`);
}

// 3. Auth validation
const authResult = testValidator.validateAuthSetup(req);
if (!authResult.passed) {
  throw new Error(`Auth validation failed: ${authResult.issues.join(', ')}`);
}
```

### 5. Test Monitoring
Monitor test execution:
```javascript
// 1. Record test events
TestMonitor.recordEvent('http_request', {
  method: 'GET',
  url: '/api/articles',
  headers: expect.any(Object)
});

// 2. Verify events
expect(events).toContainEqual({
  type: 'error',
  data: {
    message: 'Article not found',
    status: 404
  },
  timestamp: expect.any(Date),
  context: expect.any(Object)
});
```

## Common Pitfalls and Solutions

### 1. Resource Conflicts
Problem:
```javascript
// DON'T: Create multiple instances
const mongoServer = await MongoMemoryServer.create();
```

Solution:
```javascript
// DO: Use global instance
// In jest.setup.js only:
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
});
```

### 2. State Leakage
Problem:
```javascript
// DON'T: Partial cleanup
beforeEach(() => {
  jest.clearAllMocks();
});
```

Solution:
```javascript
// DO: Complete cleanup
beforeEach(async () => {
  await Promise.all([
    mongoose.connection.collection('articles').deleteMany({}),
    mongoose.connection.collection('users').deleteMany({})
  ]);
  jest.clearAllMocks();
  TestMonitor.clear();
});
```

### 3. Inconsistent Mocking
Problem:
```javascript
// DON'T: Simple mock
UserService.get.mockResolvedValue({ id: 'user123' });
```

Solution:
```javascript
// DO: Comprehensive mock
UserService.get.mockImplementation(async (id) => {
  if (id === testUserId) {
    return {
      _id: testUserId,
      email: 'test@example.com',
      role: 'user'
    };
  }
  return null;
});
```

## Test Validation Strategy

### 1. Pre-Test Validation
```javascript
const setupResult = await testValidator.validateTestSetup();
if (!setupResult.passed) {
  throw new Error(`Test setup validation failed: ${setupResult.issues.join(', ')}`);
}
```

### 2. Request Validation
```javascript
const req = request(testServer.app).get('/api/articles');
const authResult = testValidator.validateAuthSetup(req);
if (!authResult.passed) {
  throw new Error(`Auth validation failed: ${authResult.issues.join(', ')}`);
}
```

### 3. Response Validation
```javascript
expect(response.status).toBe(200);
expect(response.body).toMatchObject({
  // Define expected shape
});
```

## Benefits of This Approach

1. **Consistency**
   - Standard test structure
   - Predictable behavior
   - Easy to maintain

2. **Reliability**
   - Fewer flaky tests
   - Better error handling
   - Proper cleanup

3. **Maintainability**
   - Clear patterns
   - Self-documenting
   - Easy to update

4. **Performance**
   - No resource conflicts
   - Efficient cleanup
   - Parallel test support
