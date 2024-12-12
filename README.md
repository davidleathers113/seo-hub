# Code Analyzer

A sophisticated static code analysis tool designed to help developers and teams improve code quality, security, and maintainability. This tool provides comprehensive analysis capabilities including architectural pattern detection, security vulnerability scanning, dependency tracking, and code quality metrics.

## Features

### Static Analysis Capabilities

- **Architectural Pattern Detection**
  - Identifies common design patterns and anti-patterns
  - Analyzes code structure and organization
  - Provides recommendations for architectural improvements

- **Security Analysis**
  - Detects potential security vulnerabilities
  - Identifies unsafe API usage
  - Checks for common security anti-patterns
  - Provides security best practice recommendations

- **Dependency Analysis**
  - Generates comprehensive dependency graphs
  - Tracks internal module dependencies
  - Analyzes external package usage
  - Identifies circular dependencies

- **API Usage Tracking**
  - Monitors OpenAI API endpoint usage
  - Tracks API call patterns and frequency
  - Provides usage statistics and optimization suggestions

- **Code Complexity Metrics**
  - Calculates cyclomatic complexity
  - Measures code maintainability
  - Analyzes function and class complexity
  - Provides detailed metric reports

- **Refactoring Suggestions**
  - Identifies code duplication
  - Suggests potential refactoring opportunities
  - Provides automated improvement recommendations

## Tech Stack

- **Core Technologies**
  - Node.js
  - TypeScript
  - @babel/parser for AST parsing
  - estraverse for AST traversal
  - Jest for testing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

## Usage

Run the analyzer:
```bash
npm run analyze
```

Run tests:
```bash
npm test
```

Generate coverage report:
```bash
npm run test:coverage
```

## Project Structure

- `/server/analysis` - Core analysis logic and tools
- `/test` - Test suites and fixtures
- `/docs` - Documentation and guides
- `/cypress` - End-to-end tests
- `/__mocks__` - Test mocks and fixtures

## Testing

The project includes:
- Unit tests
- Integration tests
- End-to-end tests using Cypress
- Test coverage reporting

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## Prerequisites

- Node.js (v16 or higher)
- MongoDB instance
- Redis server (for caching)
- OpenAI API key (for API usage analysis)
- Anthropic API key (optional, for additional LLM features)

## Configuration

1. Create a `.env` file in the server directory with the following variables:
```env
PORT=3001
DATABASE_URL=mongodb://localhost/your_database
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
```

2. Configure MongoDB:
   - Install MongoDB locally or use a cloud instance
   - Update the `DATABASE_URL` in your `.env` file

3. Configure Redis:
   - Install Redis locally or use a cloud instance
   - Update the `REDIS_URL` in your `.env` file

## Usage

### Example Analysis

Run analysis on a specific directory:
```bash
npm run analyze -- --dir=/path/to/project
```

Generate a focused report:
```bash
npm run analyze -- --type=security,patterns
```

Available analysis types:
- `security` - Security vulnerability scanning
- `patterns` - Architectural pattern detection
- `dependencies` - Dependency graph generation
- `api` - API usage analysis
- `complexity` - Code complexity metrics
- `all` - Run all analyzers (default)

### Output

The analyzer generates several types of reports:
1. JSON report (`analysis-report.json`)
2. HTML visualization (in `reports/html`)
3. Dependency graphs (in `reports/graphs`)
4. Console summary

## Deployment

The project includes PM2 ecosystem configuration for deployment:

1. For development:
```bash
npm run dev
```

2. For production:
```bash
npm run build
npm run start:prod
```

## Troubleshooting

Common issues and solutions:

1. **MongoDB Connection Issues**
   - Verify MongoDB is running
   - Check DATABASE_URL in .env
   - Ensure network connectivity

2. **Redis Connection Issues**
   - Verify Redis server is running
   - Check REDIS_URL in .env

3. **Analysis Timeout**
   - Increase the timeout in config
   - Split analysis into smaller chunks

## API Documentation

Detailed API documentation is available in the `/docs` directory:
- Analysis API endpoints
- Report generation
- Configuration options

## License

This project is licensed under the MIT License - see the LICENSE file for details.