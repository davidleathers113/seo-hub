# API Routes Documentation

## Overview

This document outlines the API routes available in the content creation application. All routes follow a consistent pattern and are organized by resource type.

## Authentication

All routes require authentication using a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Route Structure

Routes are organized into the following directories:
- `/pillars` - Content pillar management
- `/subpillars` - Subpillar management
- `/outlines` - Content outline management

Each route module follows a consistent structure:
- `handlers/` - Individual route handlers
- `types.ts` - Type definitions and validation schemas
- `middleware.ts` - Route-specific middleware
- `index.ts` - Route registration and configuration

## Pillars API

### GET /pillars
List all pillars for the authenticated user.
- Query Parameters:
  - `nicheId` (optional): Filter pillars by niche

### POST /pillars
Create a new pillar.
- Body:
  ```typescript
  {
    title: string;
    nicheId: string;
    status?: 'pending' | 'approved' | 'rejected' | 'in_progress';
  }
  ```

### GET /pillars/:id
Get a specific pillar by ID.

### PUT /pillars/:id
Update a pillar.
- Body:
  ```typescript
  {
    title?: string;
    status?: 'pending' | 'approved' | 'rejected' | 'in_progress';
  }
  ```

### DELETE /pillars/:id
Delete a pillar.

### PUT /pillars/:id/approve
Approve a pillar.

## Subpillars API

### GET /pillars/:pillarId/subpillars
List all subpillars for a pillar.

### POST /pillars/:pillarId/subpillars
Create a new subpillar.
- Body:
  ```typescript
  {
    title: string;
    status?: 'draft' | 'active' | 'archived';
  }
  ```

### PUT /subpillars/:id
Update a subpillar.
- Body:
  ```typescript
  {
    title?: string;
    status?: 'draft' | 'active' | 'archived';
  }
  ```

### DELETE /subpillars/:id
Delete a subpillar.

### POST /pillars/:pillarId/subpillars/generate
Generate subpillars using AI.

## Outlines API

### POST /subpillars/:subpillarId/outline
Create an outline for a subpillar.
- Body:
  ```typescript
  {
    title: string;
    description?: string;
  }
  ```

### GET /subpillars/:subpillarId/outline
Get the outline for a subpillar.

### GET /outlines/:id
Get a specific outline by ID.

### PUT /outlines/:id
Update outline sections.
- Body:
  ```typescript
  {
    sections: Array<{
      title: string;
      contentPoints: Array<{
        point: string;
        generated: boolean;
      }>;
      order: number;
    }>;
  }
  ```

### POST /outlines/:id/sections
Add a section to an outline.
- Body:
  ```typescript
  {
    title: string;
    content: string;
    keywords?: string[];
  }
  ```

### PUT /outlines/:id/status
Update outline status.
- Body:
  ```typescript
  {
    status: 'draft' | 'approved' | 'in_progress';
  }
  ```

### DELETE /outlines/:id
Delete an outline.

## Error Handling

All routes follow a consistent error response format:
```typescript
{
  error: string;
  message?: string;
  details?: unknown;
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 204: No Content (successful deletion)
- 400: Bad Request (validation error)
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 500: Internal Server Error

## Testing

Each route handler has corresponding tests in the `__tests__` directory. Tests follow a consistent pattern using the test helpers in `test/helpers/route-testing.ts`.

Example test structure:
```typescript
describe('Handler Name', () => {
  // Mock setup
  const mockService = mockService<Service>({...});
  const handler = createTestHandler(createHandler(mockService));

  it('should handle successful case', async () => {
    const req = mockAuthenticatedRequest(...);
    const res = createMockResponse();
    await handler(req, res);
    expectSuccess(res, expectedData);
  });

  it('should handle error case', async () => {
    const req = mockAuthenticatedRequest(...);
    const res = createMockResponse();
    await handler(req, res);
    expectError(res, statusCode, errorMessage);
  });
});
