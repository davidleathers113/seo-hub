# Content Creation App

A full-stack application designed to streamline the process of creating high-quality, SEO-optimized content using AI assistance. The app provides a structured workflow from niche selection through to final article publication.

## Features

### Content Creation Workflow
- **Niche Selection:** Define your target audience and content focus
- **Content Research:** Tools to gather and organize research materials
- **Outline Creation:** AI-assisted outline generation and structuring
- **Content Generation:** AI-powered content drafting with human oversight
- **SEO Optimization:** Real-time SEO analysis and improvement suggestions
- **Content Review:** Collaborative review and approval workflow

### AI Integration
- OpenAI GPT-4 integration for content generation
- Anthropic API support for additional LLM features
- Smart content structuring and optimization
- SEO-focused content improvements

### SEO Tools
- Real-time SEO scoring
- Keyword optimization suggestions
- Meta description optimization
- Content structure analysis
- Readability scoring

## Tech Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- Radix UI components
- Vite build system

### Backend
- Node.js
- Express
- Supabase (PostgreSQL database)
- Redis for caching
- JWT authentication

## Prerequisites

- Node.js (v16 or higher)
- Supabase project (see [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md))
- Redis server (for caching)
- OpenAI API key
- Anthropic API key (optional)

## Configuration

1. Create a `.env` file in the server directory:
```env
PORT=3001
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

2. Configure Supabase:
   - Create a Supabase project at https://supabase.com
   - Follow setup instructions in [SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)
   - Update the Supabase configuration in your `.env` file

3. Configure Redis:
   - Install Redis locally or use a cloud instance
   - Update the `REDIS_URL` in your `.env` file

## Installation

### Backend Setup
```bash
cd server
npm install
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Testing

The project includes comprehensive testing:
- Unit tests
- Integration tests
- End-to-end tests using Cypress
- Test coverage reporting

Run tests:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── api/          # API client
│   │   └── hooks/        # Custom React hooks
├── server/                # Backend Node.js application
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   ├── database/         # Database configuration and migrations
│   │   ├── migrations/   # SQL migrations for Supabase
│   │   └── supabase/    # Supabase client implementation
│   └── config/          # Configuration files
├── docs/                 # Documentation
└── cypress/              # End-to-end tests
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Code Quality & Analysis

### Static Analysis Tools
- ESLint for JavaScript/TypeScript linting
- SonarQube for continuous code quality inspection
- Security vulnerability scanning with Snyk
- Dependency analysis with npm audit

### Code Metrics
- Cyclomatic complexity monitoring
- Code coverage tracking
- Technical debt assessment
- API usage patterns analysis

### Architecture Analysis
- Dependency graphs generation using Madge
- Architectural pattern validation
- Code smell detection
- Package coupling analysis

## Deployment

### Production Setup
```bash
# Build frontend
cd client
npm run build

# Build backend
cd ../server
npm run build
```

### Docker Deployment
```bash
# Build containers
docker-compose build

# Run services
docker-compose up -d
```

### CI/CD Pipeline
The project uses GitHub Actions for continuous integration and deployment:
- Automated testing
- Code quality checks
- Security scanning
- Automated deployments to staging/production

## Monitoring & Logging

### Application Monitoring
- Performance metrics tracking with New Relic
- Error tracking with Sentry
- API endpoint monitoring
- Resource usage tracking

### Logging
- Structured logging with Winston
- Log aggregation with ELK stack
- Request/response logging
- Error and debug logging

## API Documentation

The API documentation is available through Swagger UI at `/api-docs` when running the server. It includes:
- Endpoint descriptions
- Request/response schemas
- Authentication requirements
- Rate limiting information

## Security

### Security Measures
- Regular dependency updates
- OWASP security best practices
- Rate limiting
- Input validation
- XSS protection
- CSRF protection
- Security headers
- Row Level Security (RLS) with Supabase

### API Security
- JWT token validation
- API key rotation
- Request signing
- IP whitelisting (optional)

## Troubleshooting

### Common Issues

1. **Supabase Connection Issues**
   ```bash
   # Check Supabase environment variables
   echo $SUPABASE_URL
   echo $SUPABASE_ANON_KEY
   ```

2. **Redis Connection Issues**
   ```bash
   # Check Redis status
   redis-cli ping
   ```

3. **API Rate Limiting**
   - Check your API key usage
   - Verify rate limit headers
   - Implement exponential backoff

### Debug Mode
```bash
# Start server in debug mode
DEBUG=app:* npm run dev
```

## Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation in the `/docs` directory

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for a detailed list of changes between versions.
