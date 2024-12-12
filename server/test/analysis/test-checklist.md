# Test Analysis Checklist

## 1. Test Infrastructure Dependencies

### Global Setup
- [ ] Check jest.setup.js for any global test configuration
- [ ] Verify no duplicate setup in individual test files
- [ ] Check for potential port conflicts in services (MongoDB, Redis, etc.)
- [ ] Verify cleanup handlers are properly registered

### Mocking Strategy
- [ ] Check mock locations and import paths
- [ ] Verify mock implementations match real service interfaces
- [ ] Ensure mocks are properly reset between tests
- [ ] Check for duplicate mock definitions

## 2. Authentication Chain

### Token Flow
- [ ] Verify JWT mock implementation matches route expectations
- [ ] Check token format consistency across tests
- [ ] Verify user ID format matches database expectations
- [ ] Check auth middleware mock behavior

### User Context
- [ ] Verify UserService mock returns expected user object
- [ ] Check user object structure matches route requirements
- [ ] Verify user permissions/roles if required
- [ ] Check user-related error scenarios

## 3. Database Operations

### MongoDB
- [ ] Check MongoDB connection handling
- [ ] Verify schema matches test data
- [ ] Check indexes if performance sensitive
- [ ] Verify cleanup between tests

### Redis
- [ ] Check Redis mock implementation
- [ ] Verify connection handling
- [ ] Check data persistence expectations
- [ ] Verify cleanup between tests

## 4. Route-Specific Checks

### Request Flow
- [ ] Verify route parameters match schema
- [ ] Check query string handling
- [ ] Verify request body validation
- [ ] Check response format

### Error Handling
- [ ] Verify error status codes
- [ ] Check error message format
- [ ] Verify error logging
- [ ] Check error monitoring

## 5. Test Data Management

### Test Data
- [ ] Check test data matches schema
- [ ] Verify relationships between entities
- [ ] Check data cleanup
- [ ] Verify data isolation between tests

### State Management
- [ ] Check state reset between tests
- [ ] Verify no state leakage
- [ ] Check async operations completion
- [ ] Verify cleanup handlers

## 6. Monitoring and Logging

### Test Events
- [ ] Check event recording
- [ ] Verify event format
- [ ] Check event cleanup
- [ ] Verify event context

### Logging
- [ ] Check log levels
- [ ] Verify log format
- [ ] Check log cleanup
- [ ] Verify error logging

## Common Issues to Check First

1. **Port Conflicts**
   ```javascript
   // Bad: Multiple MongoDB instances
   mongoServer = await MongoMemoryServer.create();
   // Good: Use global instance from jest.setup.js
   ```

2. **Auth Token Mismatch**
   ```javascript
   // Bad: Inconsistent token format
   .set('Authorization', 'Bearer random-token');
   // Good: Match JWT mock format
   .set('Authorization', `Bearer mock_token_${userId}`);
   ```

3. **User ID Format**
   ```javascript
   // Bad: String ID
   const userId = 'user123';
   // Good: MongoDB ObjectId
   const userId = new mongoose.Types.ObjectId().toString();
   ```

4. **Mock Reset**
   ```javascript
   // Bad: No mock reset
   beforeEach(() => {});
   // Good: Reset all mocks
   beforeEach(() => {
     jest.clearAllMocks();
     UserService.get.mockResolvedValue(testUser);
   });
   ```

5. **Cleanup Order**
   ```javascript
   // Bad: Wrong cleanup order
   afterAll(async () => {
     await mongoServer.stop();
     await mongoose.disconnect();
   });
   // Good: Correct cleanup order
   afterAll(async () => {
     await mongoose.disconnect();
     await mongoServer.stop();
   });
   ```

## Using This Checklist

1. Before making changes:
   - Review relevant sections of the checklist
   - Check for common issues first
   - Verify test infrastructure setup

2. While making changes:
   - Keep checklist open for reference
   - Document any new patterns discovered
   - Update checklist as needed

3. After making changes:
   - Verify against checklist
   - Run tests to confirm
   - Document any new learnings

This checklist should be updated as new patterns and issues are discovered.
