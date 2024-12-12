import * as ts from 'typescript';
import * as path from 'path';

interface APICall {
  type: 'openai' | 'internal' | 'external';
  endpoint: string;
  method: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  parameters: {
    name: string;
    type: string;
  }[];
  rateLimit?: {
    limit: number;
    window: string;
  };
}

interface APIUsagePattern {
  name: string;
  description: string;
  frequency: number;
  locations: string[];
}

interface APIAnalysisReport {
  calls: APICall[];
  patterns: APIUsagePattern[];
  summary: {
    totalCalls: number;
    byType: Record<APICall['type'], number>;
    byEndpoint: Record<string, number>;
    estimatedCosts?: {
      daily: number;
      monthly: number;
      currency: string;
    };
  };
}

export class APIAnalyzer {
  private program: ts.Program;
  private calls: APICall[] = [];
  private patterns: APIUsagePattern[] = [];

  constructor(tsConfigPath: string) {
    const config = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(tsConfigPath)
    );
    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  }

  public analyze(): APIAnalysisReport {
    const sourceFiles = this.program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      if (!sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
        this.analyzeFile(sourceFile);
      }
    }

    this.detectPatterns();

    return {
      calls: this.calls,
      patterns: this.patterns,
      summary: this.generateSummary()
    };
  }

  private analyzeFile(sourceFile: ts.SourceFile): void {
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        this.analyzeCallExpression(node, sourceFile);
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  private analyzeCallExpression(node: ts.CallExpression, sourceFile: ts.SourceFile): void {
    // Analyze OpenAI API calls
    if (this.isOpenAICall(node)) {
      this.analyzeOpenAICall(node, sourceFile);
    }
    // Analyze internal API endpoints
    else if (this.isInternalAPIEndpoint(node)) {
      this.analyzeInternalEndpoint(node, sourceFile);
    }
    // Analyze external API calls
    else if (this.isExternalAPICall(node)) {
      this.analyzeExternalCall(node, sourceFile);
    }
  }

  private isOpenAICall(node: ts.CallExpression): boolean {
    const text = node.expression.getText();
    return /openai|gpt|completion|embedding/i.test(text);
  }

  private isInternalAPIEndpoint(node: ts.CallExpression): boolean {
    const text = node.expression.getText();
    return /router\.(get|post|put|delete|patch)/i.test(text);
  }

  private isExternalAPICall(node: ts.CallExpression): boolean {
    const text = node.expression.getText();
    return /fetch|axios|http|request/i.test(text);
  }

  private analyzeOpenAICall(node: ts.CallExpression, sourceFile: ts.SourceFile): void {
    const endpoint = this.extractEndpoint(node);
    const method = this.extractMethod(node);
    const parameters = this.extractParameters(node);
    const rateLimit = this.extractRateLimit(node);

    this.calls.push({
      type: 'openai',
      endpoint,
      method,
      location: this.getNodeLocation(node, sourceFile),
      parameters,
      rateLimit
    });
  }

  private analyzeInternalEndpoint(node: ts.CallExpression, sourceFile: ts.SourceFile): void {
    this.calls.push({
      type: 'internal',
      endpoint: this.extractEndpoint(node),
      method: this.extractMethod(node),
      location: this.getNodeLocation(node, sourceFile),
      parameters: this.extractParameters(node)
    });
  }

  private analyzeExternalCall(node: ts.CallExpression, sourceFile: ts.SourceFile): void {
    this.calls.push({
      type: 'external',
      endpoint: this.extractEndpoint(node),
      method: this.extractMethod(node),
      location: this.getNodeLocation(node, sourceFile),
      parameters: this.extractParameters(node)
    });
  }

  private extractEndpoint(node: ts.CallExpression): string {
    if (ts.isPropertyAccessExpression(node.expression)) {
      return node.expression.getText();
    }
    return node.expression.getText();
  }

  private extractMethod(node: ts.CallExpression): string {
    if (ts.isPropertyAccessExpression(node.expression)) {
      return node.expression.name.getText();
    }
    return 'unknown';
  }

  private extractParameters(node: ts.CallExpression): APICall['parameters'] {
    return node.arguments.map(arg => ({
      name: arg.getText(),
      type: this.program.getTypeChecker().typeToString(
        this.program.getTypeChecker().getTypeAtLocation(arg)
      )
    }));
  }

  private extractRateLimit(node: ts.CallExpression): APICall['rateLimit'] | undefined {
    // Look for rate limit decorators or configurations
    const parent = node.parent;
    if (ts.isMethodDeclaration(parent)) {
      const rateLimit = parent.decorators?.find(d =>
        d.expression.getText().includes('RateLimit')
      );
      if (rateLimit) {
        return {
          limit: 60, // Default value, should be extracted from decorator
          window: '1m'
        };
      }
    }
    return undefined;
  }

  private getNodeLocation(node: ts.Node, sourceFile: ts.SourceFile): APICall['location'] {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    return {
      file: path.relative(process.cwd(), sourceFile.fileName),
      line: line + 1,
      column: character + 1
    };
  }

  private detectPatterns(): void {
    this.detectOpenAIUsagePatterns();
    this.detectAPIVersioningPatterns();
    this.detectRateLimitingPatterns();
    this.detectErrorHandlingPatterns();
  }

  private detectOpenAIUsagePatterns(): void {
    const openAICalls = this.calls.filter(call => call.type === 'openai');
    const endpoints = new Map<string, number>();

    openAICalls.forEach(call => {
      const count = endpoints.get(call.endpoint) || 0;
      endpoints.set(call.endpoint, count + 1);
    });

    endpoints.forEach((count, endpoint) => {
      this.patterns.push({
        name: `OpenAI ${endpoint} Usage`,
        description: `Frequent usage of OpenAI ${endpoint} endpoint detected`,
        frequency: count,
        locations: openAICalls
          .filter(call => call.endpoint === endpoint)
          .map(call => call.location.file)
      });
    });
  }

  private detectAPIVersioningPatterns(): void {
    const versionedEndpoints = this.calls.filter(call =>
      /v[0-9]+/.test(call.endpoint)
    );

    if (versionedEndpoints.length > 0) {
      this.patterns.push({
        name: 'API Versioning',
        description: 'API endpoints are properly versioned',
        frequency: versionedEndpoints.length,
        locations: [...new Set(versionedEndpoints.map(call => call.location.file))]
      });
    }
  }

  private detectRateLimitingPatterns(): void {
    const rateLimitedCalls = this.calls.filter(call => call.rateLimit);

    if (rateLimitedCalls.length > 0) {
      this.patterns.push({
        name: 'Rate Limiting',
        description: 'API calls implement rate limiting',
        frequency: rateLimitedCalls.length,
        locations: [...new Set(rateLimitedCalls.map(call => call.location.file))]
      });
    }
  }

  private detectErrorHandlingPatterns(): void {
    // Look for try-catch blocks around API calls
    const sourceFiles = this.program.getSourceFiles();
    const errorHandledCalls = new Set<string>();

    sourceFiles.forEach(sourceFile => {
      const visit = (node: ts.Node) => {
        if (ts.isTryStatement(node)) {
          ts.forEachChild(node, child => {
            if (ts.isCallExpression(child) && this.isAnyAPICall(child)) {
              errorHandledCalls.add(this.getNodeLocation(child, sourceFile).file);
            }
          });
        }
        ts.forEachChild(node, visit);
      };
      visit(sourceFile);
    });

    if (errorHandledCalls.size > 0) {
      this.patterns.push({
        name: 'Error Handling',
        description: 'API calls implement proper error handling',
        frequency: errorHandledCalls.size,
        locations: Array.from(errorHandledCalls)
      });
    }
  }

  private isAnyAPICall(node: ts.CallExpression): boolean {
    return this.isOpenAICall(node) ||
           this.isInternalAPIEndpoint(node) ||
           this.isExternalAPICall(node);
  }

  private generateSummary(): APIAnalysisReport['summary'] {
    const summary = {
      totalCalls: this.calls.length,
      byType: {
        openai: 0,
        internal: 0,
        external: 0
      },
      byEndpoint: {},
      estimatedCosts: {
        daily: 0,
        monthly: 0,
        currency: 'USD'
      }
    };

    this.calls.forEach(call => {
      // Count by type
      summary.byType[call.type]++;

      // Count by endpoint
      const endpoint = call.endpoint;
      summary.byEndpoint[endpoint] = (summary.byEndpoint[endpoint] || 0) + 1;

      // Estimate costs for OpenAI calls
      if (call.type === 'openai') {
        const costPerCall = this.estimateOpenAICost(call);
        summary.estimatedCosts.daily += costPerCall * 24; // Assuming hourly average
        summary.estimatedCosts.monthly = summary.estimatedCosts.daily * 30;
      }
    });

    return summary;
  }

  private estimateOpenAICost(call: APICall): number {
    // Rough cost estimation based on endpoint and parameters
    const endpoint = call.endpoint.toLowerCase();
    if (endpoint.includes('completion')) {
      return 0.02; // $0.02 per 1K tokens
    }
    if (endpoint.includes('embedding')) {
      return 0.0004; // $0.0004 per 1K tokens
    }
    return 0.01; // Default estimation
  }
}

// CLI interface
if (require.main === module) {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  const analyzer = new APIAnalyzer(tsConfigPath);

  const report = analyzer.analyze();

  console.log('\nAPI Usage Analysis Report');
  console.log('=======================');

  console.log('\nSummary:');
  console.log(`Total API Calls: ${report.summary.totalCalls}`);
  console.log('\nBy Type:');
  Object.entries(report.summary.byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });

  console.log('\nBy Endpoint:');
  Object.entries(report.summary.byEndpoint).forEach(([endpoint, count]) => {
    console.log(`  ${endpoint}: ${count}`);
  });

  if (report.summary.estimatedCosts) {
    console.log('\nEstimated Costs:');
    console.log(`  Daily: $${report.summary.estimatedCosts.daily.toFixed(2)}`);
    console.log(`  Monthly: $${report.summary.estimatedCosts.monthly.toFixed(2)}`);
  }

  console.log('\nAPI Usage Patterns:');
  report.patterns.forEach(pattern => {
    console.log(`\n${pattern.name} (${pattern.frequency} occurrences)`);
    console.log(`Description: ${pattern.description}`);
    console.log('Locations:');
    pattern.locations.forEach(loc => console.log(`  - ${loc}`));
  });

  console.log('\nDetailed API Calls:');
  report.calls.forEach(call => {
    console.log(`\n${call.type.toUpperCase()} API Call:`);
    console.log(`Endpoint: ${call.endpoint}`);
    console.log(`Method: ${call.method}`);
    console.log(`Location: ${call.location.file}:${call.location.line}:${call.location.column}`);
    if (call.parameters.length > 0) {
      console.log('Parameters:');
      call.parameters.forEach(param => console.log(`  - ${param.name}: ${param.type}`));
    }
    if (call.rateLimit) {
      console.log(`Rate Limit: ${call.rateLimit.limit} requests per ${call.rateLimit.window}`);
    }
  });
}