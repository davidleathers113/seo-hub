# Code Analysis Tools

A comprehensive suite of static code analysis tools for JavaScript/TypeScript projects. This toolkit helps identify architectural patterns, security vulnerabilities, API usage patterns, and code quality issues.

## Features

### 1. Architectural Pattern Detection
- Identifies common design patterns (Singleton, Factory, Observer, etc.)
- Detects architectural anti-patterns
- Provides suggestions for pattern implementation improvements

### 2. Security Analysis
- Identifies potential security vulnerabilities
- Detects unsafe code patterns
- Checks for hardcoded secrets and credentials
- Analyzes RegExp patterns for potential DoS vulnerabilities

### 3. Dependency Analysis
- Generates comprehensive dependency graphs
- Identifies circular dependencies
- Detects orphaned files and unused dependencies
- Visualizes module relationships

### 4. API Usage Tracking
- Monitors OpenAI API endpoint usage
- Tracks API call patterns and frequencies
- Identifies potential API misuse or inefficiencies

### 5. Code Complexity Metrics
- Calculates cyclomatic complexity
- Measures maintainability index
- Computes Halstead metrics
- Tracks function and line counts

### 6. Refactoring Suggestions
- Identifies complex functions that need refactoring
- Detects code duplication
- Suggests potential improvements for maintainability

## Installation

```bash
cd server/analysis
npm install
```

## Usage

### Command Line

Run analysis on the current project:
```bash
npm run analyze
```

Run analysis on a specific directory:
```bash
npm run analyze -- /path/to/project
```

### Programmatic Usage

```javascript
const CodeAnalyzer = require('./codeAnalyzer');

async function analyze() {
    const analyzer = new CodeAnalyzer('/path/to/project');
    const results = await analyzer.analyzeFile('path/to/file.js');
    console.log(results);
}
```

## Output

The analysis generates a comprehensive JSON report (`analysis-report.json`) containing:
- Detected patterns and anti-patterns
- Security vulnerabilities with severity levels
- Dependency relationships and issues
- API usage statistics
- Code complexity metrics
- Refactoring suggestions

## Configuration

You can customize the analysis thresholds and rules by modifying the following files:
- `codeAnalyzer.js`: Main analysis logic and thresholds
- `scripts/analyze.js`: CLI configuration and report generation

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT