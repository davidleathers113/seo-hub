# Database Abstraction Layer

This directory contains the database abstraction layer for the Content Creation App. The abstraction allows us to switch between different database implementations without changing the application code.

## Structure

```
database/
├── interfaces/        # TypeScript interfaces defining our data contracts
├── mongodb/          # MongoDB implementation
│   ├── models/       # Mongoose models
│   └── client.ts     # MongoDB client implementation
├── index.ts          # Database factory and main exports
├── MIGRATION.md      # Migration tracking
└── README.md         # This file
```

## Usage

```typescript
// Initialize the database
import { DatabaseFactory } from './database';

await DatabaseFactory.createClient('mongodb', {
  uri: process.env.DATABASE_URL
});

// Use in services/routes
import { getDatabase } from './database';

async function createUser(userData) {
  const db = getDatabase();
  return await db.createUser(userData);
}
```

## Adding New Database Support

1. Create a new directory for your database (e.g., `postgres/`)
2. Implement the `DatabaseClient` interface
3. Add the new type to `DatabaseType` in `index.ts`
4. Add the implementation to the factory

Example:
```typescript
export class PostgresClient implements DatabaseClient {
  // Implement all required methods
}

// In index.ts
case 'postgres':
  return new PostgresClient(config);
```

## Testing

Each database implementation should have its own test suite. Use the shared test suite in `__tests__/shared` to ensure consistent behavior across implementations.

## Error Handling

All database operations should:
1. Use proper TypeScript types
2. Handle common errors gracefully
3. Log errors appropriately
4. Return consistent error types

## Migration

See `MIGRATION.md` for the status of our migration from direct MongoDB usage to this abstraction layer.