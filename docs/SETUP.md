# Content Creation App Setup Guide

## Prerequisites
- Node.js
- MongoDB
- Redis

## Environment Setup
1. MongoDB
   - MongoDB should be running on default port (27017)
   - Database will be automatically created at: `mongodb://localhost/pythagora`

2. Redis
   - Redis should be running on default port (6379)
   - Test connection with: `redis-cli ping` (should return PONG)

## Starting the Application

### 1. Start the Backend (Server)
```bash
cd server
npm install
npm run dev
```
Server will run on: http://localhost:3001

### 2. Start the Frontend (Client)
```bash
cd client
npm install
npm run dev
```
Frontend will run on: http://localhost:5174

## Environment Variables
The following environment variables are required in `server/.env`:
```
PORT=3001
DATABASE_URL=mongodb://localhost/pythagora
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

## Verification Steps
1. Backend is running when you see:
   - "Server is now running and listening on port 3001"
   - "Database connected successfully"
   - "Redis connected successfully"

2. Frontend is running when you see:
   - "VITE ready"
   - Local URL available at http://localhost:5174

## Common Issues
1. Port 3001 already in use
   - This usually means the server is already running
   - Check existing processes: `lsof -i :3001`

2. MongoDB Connection Issues
   - Verify MongoDB is running: `mongod --version`
   - Check database connection: `mongosh`

3. Redis Connection Issues
   - Verify Redis is running: `redis-cli ping`

## Development Tools
- Backend runs with ts-node
- Frontend uses Vite
- MongoDB for database
- Redis for session management