# Server Architecture

## Overview
The server is built using Express.js and TypeScript, with a modular architecture that separates concerns into distinct components.

## Directory Structure

### Config
- `database.ts` - Database configuration and initialization
- `session.ts` - Session middleware and configuration
- `middleware.ts` - Express middleware setup
- `routes.ts` - Route configuration and setup

### Middleware
- `auth.ts` - Authentication middleware
- `error.ts` - Error handling middleware

### Utils
- `port.ts` - Port availability checking utility
- `log.ts` - Logging utility
- `jwt.ts` - JWT handling utility

### Routes
Contains all route handlers organized by feature:
- `auth.ts` - Authentication routes
- `niches.ts` - Niche management routes
- `pillars.ts` - Pillar management routes
- `articles.ts` - Article management routes
- `workflow.ts` - Workflow management routes

### Services
Contains business logic organized by feature:
- `UserService.ts`
- `NicheService.ts`
- `PillarService.ts`
- `WorkflowService.ts`
etc.

## Main Components

### Server Initialization (`server.ts`)
The main entry point that:
1. Loads environment variables
2. Initializes the database connection
3. Sets up middleware
4. Configures routes
5. Starts the server

### Database Configuration (`config/database.ts`)
Handles:
- Database client initialization
- Connection management
- Fallback mock client for development

### Middleware Setup (`config/middleware.ts`)
Configures:
- Body parsing
- CORS
- Session handling
- Basic security middleware

### Route Configuration (`config/routes.ts`)
Manages:
- Service initialization
- Route handler creation
- Route mounting
- Authentication middleware application

### Error Handling (`middleware/error.ts`)
Provides:
- 404 handler for undefined routes
- Global error handler
- Development vs production error responses

## Starting the Server
```bash
npm run dev  # Development mode
npm start    # Production mode
```

## Environment Variables
Required environment variables:
- `PORT` - Server port (default: 3001)
- `DATABASE_URL` - Database connection string
- `SESSION_SECRET` - Session encryption key
- `NODE_ENV` - Environment (development/production)
- `CLIENT_URL` - Frontend URL for CORS
