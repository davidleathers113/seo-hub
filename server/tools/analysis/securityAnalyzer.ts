import * as ts from 'typescript';
import * as path from 'path';
import { DependencyAnalyzer } from './dependencyAnalyzer';

interface SecurityVulnerability {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  location: {
    file: string;
    line: number;
    column: number;
  };
  recommendation: string;
}

interface SecurityReport {
  vulnerabilities: SecurityVulnerability[];
  summary: {
    total: number;
    bySeverity: Record<SecurityVulnerability['severity'], number>;
  };
  securePatterns: {
    name: string;
    description: string;
    locations: string[];
  }[];
}

export class SecurityAnalyzer {
  private program: ts.Program;
  private vulnerabilities: SecurityVulnerability[] = [];
  private securePatterns: SecurityReport['securePatterns'] = [];
  private dependencyAnalyzer: DependencyAnalyzer;

  constructor(tsConfigPath: string) {
    const config = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(tsConfigPath)
    );
    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    this.dependencyAnalyzer = new DependencyAnalyzer(tsConfigPath);
  }

  public analyze(): SecurityReport {
    const sourceFiles = this.program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      if (!sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
        this.analyzeFile(sourceFile);
      }
    }

    this.detectSecurePatterns();

    return {
      vulnerabilities: this.vulnerabilities,
      summary: this.generateSummary(),
      securePatterns: this.securePatterns
    };
  }

  private analyzeFile(sourceFile: ts.SourceFile): void {
    const filePath = path.relative(process.cwd(), sourceFile.fileName);

    const visit = (node: ts.Node) => {
      // Check for hardcoded secrets
      if (ts.isStringLiteral(node) || ts.isTemplateExpression(node)) {
        this.checkForHardcodedSecrets(node, sourceFile);
      }

      // Check for unsafe SQL queries
      if (ts.isCallExpression(node)) {
        this.checkForSQLInjection(node, sourceFile);
      }

      // Check for unsafe authentication
      if (ts.isMethodDeclaration(node)) {
        this.checkAuthenticationMethods(node, sourceFile);
      }

      // Check for unsafe API endpoints
      if (ts.isCallExpression(node) && this.isExpressRoute(node)) {
        this.checkAPIEndpointSecurity(node, sourceFile);
      }

      // Check for unsafe data validation
      if (ts.isParameter(node) || ts.isPropertyDeclaration(node)) {
        this.checkDataValidation(node, sourceFile);
      }

      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  private checkForHardcodedSecrets(node: ts.Node, sourceFile: ts.SourceFile): void {
    const text = node.getText(sourceFile);
    const secretPatterns = [
      /api[_-]?key/i,
      /auth[_-]?token/i,
      /password/i,
      /secret/i,
      /private[_-]?key/i
    ];

    if (secretPatterns.some(pattern => pattern.test(text))) {
      this.addVulnerability({
        type: 'Hardcoded Secret',
        severity: 'critical',
        description: 'Potential hardcoded secret or credential detected',
        location: this.getNodeLocation(node, sourceFile),
        recommendation: 'Move secrets to environment variables or a secure secret management system'
      });
    }
  }

  private checkForSQLInjection(node: ts.CallExpression, sourceFile: ts.SourceFile): void {
    if (this.isMongoDBQuery(node)) {
      const args = node.arguments;
      if (args.length > 0 && this.containsUnsafeInterpolation(args[0])) {
        this.addVulnerability({
          type: 'SQL Injection',
          severity: 'high',
          description: 'Potential MongoDB injection vulnerability detected',
          location: this.getNodeLocation(node, sourceFile),
          recommendation: 'Use parameterized queries or proper input sanitization'
        });
      }
    }
  }

  private checkAuthenticationMethods(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): void {
    const methodName = node.name.getText(sourceFile);
    if (/auth|login|authenticate/i.test(methodName)) {
      // Check for proper password hashing
      if (!this.usesSecurePasswordHashing(node)) {
        this.addVulnerability({
          type: 'Insecure Authentication',
          severity: 'high',
          description: 'Authentication method may not use secure password hashing',
          location: this.getNodeLocation(node, sourceFile),
          recommendation: 'Use bcrypt or Argon2 for password hashing'
        });
      }

      // Check for proper session management
      if (!this.usesSecureSessionManagement(node)) {
        this.addVulnerability({
          type: 'Session Management',
          severity: 'medium',
          description: 'Potential insecure session management detected',
          location: this.getNodeLocation(node, sourceFile),
          recommendation: 'Use secure session management with proper expiration and rotation'
        });
      }
    }
  }

  private checkAPIEndpointSecurity(node: ts.CallExpression, sourceFile: ts.SourceFile): void {
    // Check for missing authentication middleware
    if (!this.hasAuthenticationMiddleware(node)) {
      this.addVulnerability({
        type: 'Unprotected Endpoint',
        severity: 'high',
        description: 'API endpoint may lack authentication',
        location: this.getNodeLocation(node, sourceFile),
        recommendation: 'Add authentication middleware to protect sensitive endpoints'
      });
    }

    // Check for missing input validation
    if (!this.hasInputValidation(node)) {
      this.addVulnerability({
        type: 'Missing Input Validation',
        severity: 'medium',
        description: 'API endpoint may lack proper input validation',
        location: this.getNodeLocation(node, sourceFile),
        recommendation: 'Add input validation using a validation library like Joi or class-validator'
      });
    }
  }

  private checkDataValidation(node: ts.Node, sourceFile: ts.SourceFile): void {
    if (!this.hasTypeValidation(node)) {
      this.addVulnerability({
        type: 'Missing Type Validation',
        severity: 'low',
        description: 'Data structure lacks proper type validation',
        location: this.getNodeLocation(node, sourceFile),
        recommendation: 'Add runtime type validation using TypeScript decorators or validation library'
      });
    }
  }

  private isMongoDBQuery(node: ts.CallExpression): boolean {
    const text = node.expression.getText();
    return /find|update|delete|insert/i.test(text);
  }

  private containsUnsafeInterpolation(node: ts.Node): boolean {
    if (ts.isTemplateExpression(node)) {
      return true;
    }
    let hasUnsafe = false;
    node.forEachChild(child => {
      if (ts.isTemplateExpression(child) || ts.isStringLiteral(child)) {
        hasUnsafe = true;
      }
    });
    return hasUnsafe;
  }

  private usesSecurePasswordHashing(node: ts.MethodDeclaration): boolean {
    let hasSecureHashing = false;
    node.forEachChild(child => {
      if (ts.isCallExpression(child)) {
        const text = child.expression.getText();
        if (/bcrypt|argon2|pbkdf2/i.test(text)) {
          hasSecureHashing = true;
        }
      }
    });
    return hasSecureHashing;
  }

  private usesSecureSessionManagement(node: ts.MethodDeclaration): boolean {
    let hasSecureSession = false;
    node.forEachChild(child => {
      if (ts.isCallExpression(child)) {
        const text = child.expression.getText();
        if (/session|jwt|token/i.test(text)) {
          hasSecureSession = true;
        }
      }
    });
    return hasSecureSession;
  }

  private isExpressRoute(node: ts.CallExpression): boolean {
    const text = node.expression.getText();
    return /get|post|put|delete|patch/i.test(text);
  }

  private hasAuthenticationMiddleware(node: ts.CallExpression): boolean {
    let hasAuth = false;
    node.forEachChild(child => {
      if (ts.isIdentifier(child)) {
        const text = child.getText();
        if (/auth|authenticate|requireUser/i.test(text)) {
          hasAuth = true;
        }
      }
    });
    return hasAuth;
  }

  private hasInputValidation(node: ts.CallExpression): boolean {
    let hasValidation = false;
    node.forEachChild(child => {
      if (ts.isCallExpression(child)) {
        const text = child.expression.getText();
        if (/validate|check|sanitize/i.test(text)) {
          hasValidation = true;
        }
      }
    });
    return hasValidation;
  }

  private hasTypeValidation(node: ts.Node): boolean {
    return node.decorators?.some(decorator => {
      const text = decorator.expression.getText();
      return /IsString|IsNumber|IsBoolean|ValidateNested/i.test(text);
    }) ?? false;
  }

  private getNodeLocation(node: ts.Node, sourceFile: ts.SourceFile): SecurityVulnerability['location'] {
    const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());
    return {
      file: path.relative(process.cwd(), sourceFile.fileName),
      line: line + 1,
      column: character + 1
    };
  }

  private addVulnerability(vulnerability: SecurityVulnerability): void {
    this.vulnerabilities.push(vulnerability);
  }

  private generateSummary(): SecurityReport['summary'] {
    const summary = {
      total: this.vulnerabilities.length,
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      }
    };

    this.vulnerabilities.forEach(vuln => {
      summary.bySeverity[vuln.severity]++;
    });

    return summary;
  }

  private detectSecurePatterns(): void {
    // Check for proper authentication implementation
    if (this.hasProperAuthImplementation()) {
      this.securePatterns.push({
        name: 'Secure Authentication',
        description: 'Proper authentication implementation with password hashing and session management',
        locations: this.findAuthImplementationLocations()
      });
    }

    // Check for proper input validation
    if (this.hasProperInputValidation()) {
      this.securePatterns.push({
        name: 'Input Validation',
        description: 'Consistent input validation across API endpoints',
        locations: this.findInputValidationLocations()
      });
    }

    // Check for proper error handling
    if (this.hasProperErrorHandling()) {
      this.securePatterns.push({
        name: 'Secure Error Handling',
        description: 'Proper error handling without information leakage',
        locations: this.findErrorHandlingLocations()
      });
    }
  }

  private hasProperAuthImplementation(): boolean {
    return this.program.getSourceFiles().some(sourceFile => {
      if (sourceFile.fileName.includes('auth') || sourceFile.fileName.includes('session')) {
        return this.containsSecureAuthPatterns(sourceFile);
      }
      return false;
    });
  }

  private containsSecureAuthPatterns(sourceFile: ts.SourceFile): boolean {
    let hasSecurePatterns = false;
    sourceFile.forEachChild(node => {
      if (ts.isMethodDeclaration(node)) {
        if (this.usesSecurePasswordHashing(node) && this.usesSecureSessionManagement(node)) {
          hasSecurePatterns = true;
        }
      }
    });
    return hasSecurePatterns;
  }

  private findAuthImplementationLocations(): string[] {
    return this.program.getSourceFiles()
      .filter(sourceFile =>
        sourceFile.fileName.includes('auth') ||
        sourceFile.fileName.includes('session'))
      .map(sourceFile => path.relative(process.cwd(), sourceFile.fileName));
  }

  private hasProperInputValidation(): boolean {
    return this.program.getSourceFiles().some(sourceFile => {
      if (sourceFile.fileName.includes('routes') || sourceFile.fileName.includes('controller')) {
        return this.containsInputValidation(sourceFile);
      }
      return false;
    });
  }

  private containsInputValidation(sourceFile: ts.SourceFile): boolean {
    let hasValidation = false;
    sourceFile.forEachChild(node => {
      if (ts.isCallExpression(node)) {
        if (this.hasInputValidation(node)) {
          hasValidation = true;
        }
      }
    });
    return hasValidation;
  }

  private findInputValidationLocations(): string[] {
    return this.program.getSourceFiles()
      .filter(sourceFile => this.containsInputValidation(sourceFile))
      .map(sourceFile => path.relative(process.cwd(), sourceFile.fileName));
  }

  private hasProperErrorHandling(): boolean {
    return this.program.getSourceFiles().some(sourceFile => {
      if (sourceFile.fileName.includes('error') || sourceFile.fileName.includes('middleware')) {
        return this.containsProperErrorHandling(sourceFile);
      }
      return false;
    });
  }

  private containsProperErrorHandling(sourceFile: ts.SourceFile): boolean {
    let hasProperHandling = false;
    sourceFile.forEachChild(node => {
      if (ts.isClassDeclaration(node) && node.name?.getText().includes('Error')) {
        hasProperHandling = true;
      }
    });
    return hasProperHandling;
  }

  private findErrorHandlingLocations(): string[] {
    return this.program.getSourceFiles()
      .filter(sourceFile => this.containsProperErrorHandling(sourceFile))
      .map(sourceFile => path.relative(process.cwd(), sourceFile.fileName));
  }
}

// CLI interface
if (require.main === module) {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  const analyzer = new SecurityAnalyzer(tsConfigPath);

  const report = analyzer.analyze();

  console.log('\nSecurity Analysis Report');
  console.log('=======================');

  console.log('\nVulnerability Summary:');
  console.log(`Total Vulnerabilities: ${report.summary.total}`);
  console.log('By Severity:');
  Object.entries(report.summary.bySeverity).forEach(([severity, count]) => {
    console.log(`  ${severity}: ${count}`);
  });

  console.log('\nDetailed Vulnerabilities:');
  report.vulnerabilities.forEach(vuln => {
    console.log(`\n${vuln.type} (${vuln.severity})`);
    console.log(`Description: ${vuln.description}`);
    console.log(`Location: ${vuln.location.file}:${vuln.location.line}:${vuln.location.column}`);
    console.log(`Recommendation: ${vuln.recommendation}`);
  });

  console.log('\nSecure Patterns Detected:');
  report.securePatterns.forEach(pattern => {
    console.log(`\n${pattern.name}`);
    console.log(`Description: ${pattern.description}`);
    console.log('Locations:');
    pattern.locations.forEach(loc => console.log(`  - ${loc}`));
  });
}