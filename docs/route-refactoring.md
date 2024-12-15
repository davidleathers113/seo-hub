# Route Refactoring Analysis

[Previous content remains the same until "Next Steps" section]

## Next Steps

1. **Complete Pillars Route Refactoring**
   - Create remaining handlers:
     ```
     pillars/handlers/
     ├── list.ts       // GET /pillars
     ├── create.ts     // POST /pillars
     ├── get.ts        // GET /pillars/:id
     ├── delete.ts     // DELETE /pillars/:id
     └── approve.ts    // PUT /pillars/:id/approve
     ```
   - Add tests for each handler
   - Update main router to include all handlers

2. **Apply Pattern to Subpillars**
   - Create directory structure:
     ```
     subpillars/
     ├── index.ts
     ├── types.ts
     ├── middleware.ts
     └── handlers/
         ├── list.ts
         ├── create.ts
         ├── update.ts
         ├── delete.ts
         └── generate.ts
     ```
   - Move existing logic to appropriate files
   - Add validation schemas
   - Update tests

3. **Apply Pattern to Outlines**
   - Create directory structure:
     ```
     outlines/
     ├── index.ts
     ├── types.ts
     ├── middleware.ts
     └── handlers/
         ├── create.ts
         ├── get.ts
         ├── update.ts
         ├── delete.ts
         ├── update-sections.ts
         ├── add-section.ts
         └── update-status.ts
     ```
   - Move existing logic to appropriate files
   - Add validation schemas
   - Update tests

4. **Testing Infrastructure**
   - Create test helpers for common operations:
     ```typescript
     // test/helpers/route-testing.ts
     export const createTestHandler = (handler: BaseHandler) => {
       // Setup for testing individual handlers
     };

     export const mockAuthenticatedRequest = (
       userId: string,
       params = {},
       body = {}
     ) => {
       // Create mock authenticated request
     };
     ```
   - Add test cases for shared middleware
   - Create integration test suite

5. **Documentation Updates**
   - Update API documentation to reflect new structure
   - Create handler template for new routes
   - Document testing patterns
   - Update contribution guidelines

6. **Cleanup and Standardization**
   - Remove old route files
   - Update imports in dependent files
   - Apply consistent naming conventions
   - Add type checking for all handlers

## Implementation Details

### Handler Pattern
```typescript
// handlers/create.ts
export function createHandler(service: Service): BaseHandler {
  return async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // Handler logic
    } catch (error) {
      handleRouteError(error, res);
    }
  };
}
```

### Validation Pattern
```typescript
// types.ts
export const validationSchema: ValidationSchema = {
  type: 'object',
  properties: {
    // Schema definition
  },
  required: []
};
```

### Router Pattern
```typescript
// index.ts
export function createRouter(services: Services): Router {
  const router = express.Router();
  
  // Create handlers
  const handlers = {
    create: createHandler(services),
    update: updateHandler(services),
    // ...
  };

  // Register routes
  router.post('/', 
    validateRequest(schemas.create),
    handleAsyncRoute(handlers.create)
  );
  
  return router;
}
```

## Testing Pattern
```typescript
// __tests__/handlers/create.test.ts
describe('Create Handler', () => {
  const handler = createHandler(mockService);
  
  it('should create resource with valid input', async () => {
    const req = mockAuthenticatedRequest('userId', {}, validInput);
    const res = mockResponse();
    
    await handler(req, res);
    
    expect(res.status).toHaveBeenCalledWith(201);
    // Additional assertions
  });
});
```

## Timeline

1. Week 1:
   - Complete pillars route refactoring
   - Set up testing infrastructure
   - Review with team

2. Week 2:
   - Refactor subpillars routes
   - Add tests
   - Update documentation

3. Week 3:
   - Refactor outlines routes
   - Add tests
   - Final cleanup

4. Week 4:
   - Team training
   - Documentation updates
   - Monitoring and fixes

## Success Criteria

1. All route files follow new structure
2. Test coverage > 80%
3. No TypeScript errors
4. Documentation updated
5. Team trained on new patterns
6. No regression bugs
7. Improved code review process

## Monitoring and Maintenance

1. Set up metrics for:
   - Route handler performance
   - Error rates by route
   - Test coverage

2. Regular reviews:
   - Code quality checks
   - Performance monitoring
   - Documentation updates

3. Feedback loop:
   - Team retrospectives
   - Pattern improvements
   - Documentation updates
