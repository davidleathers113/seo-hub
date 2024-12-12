import * as ts from 'typescript';

export interface SecurityVulnerability {
  type: string;
  location: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  cwe?: string; // Common Weakness Enumeration ID
  references?: string[];
}

export class SecurityAnalyzer {
  private vulnerabilityChecks = [
    {
      name: 'SQL Injection',
      detector: this.detectSqlInjection.bind(this),
      severity: 'critical' as const,
      cwe: 'CWE-89',
    },
    {
      name: 'Cross-Site Scripting (XSS)',
      detector: this.detectXss.bind(this),
      severity: 'high' as const,
      cwe: 'CWE-79',
    },
    {
      name: 'Insecure Direct Object References',
      detector: this.detectInsecureDirectObjectReferences.bind(this),
      severity: 'high' as const,
      cwe: 'CWE-639',
    },
    {
      name: 'Hardcoded Credentials',
      detector: this.detectHardcodedCredentials.bind(this),
      severity: 'critical' as const,
      cwe: 'CWE-798',
    },
    {
      name: 'Insecure Cryptographic Storage',
      detector: this.detectInsecureCrypto.bind(this),
      severity: 'high' as const,
      cwe: 'CWE-326',
    },
  ];

  analyze(sourceFile: ts.SourceFile): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];

    for (const check of this.vulnerabilityChecks) {
      const detected = check.detector(sourceFile);
      if (detected.length > 0) {
        vulnerabilities.push(...detected.map(v => ({
          ...v,
          severity: check.severity,
          cwe: check.cwe,
        })));
      }
    }

    return vulnerabilities;
  }

  private detectSqlInjection(sourceFile: ts.SourceFile): Partial<SecurityVulnerability>[] {
    const vulnerabilities: Partial<SecurityVulnerability>[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const methodName = node.expression.getText().toLowerCase();

        // Check for raw SQL queries with string concatenation
        if (methodName.includes('query') || methodName.includes('exec')) {
          const args = node.arguments;
          if (args.length > 0 && this.containsStringConcatenation(args[0])) {
            vulnerabilities.push({
              type: 'SQL Injection',
              location: `${sourceFile.fileName}:${node.getStart()}`,
              description: 'Potential SQL injection vulnerability detected due to string concatenation in query',
              recommendation: 'Use parameterized queries or an ORM instead of string concatenation',
              references: [
                'https://owasp.org/www-community/attacks/SQL_Injection',
                'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'
              ]
            });
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return vulnerabilities;
  }

  private detectXss(sourceFile: ts.SourceFile): Partial<SecurityVulnerability>[] {
    const vulnerabilities: Partial<SecurityVulnerability>[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isPropertyAssignment(node)) {
        const propertyName = node.name.getText().toLowerCase();

        // Check for dangerous DOM assignments
        if (propertyName.includes('innerhtml') || propertyName.includes('outerhtml')) {
          vulnerabilities.push({
            type: 'Cross-Site Scripting (XSS)',
            location: `${sourceFile.fileName}:${node.getStart()}`,
            description: 'Potential XSS vulnerability detected in DOM manipulation',
            recommendation: 'Use safe DOM APIs like textContent or sanitize HTML content before insertion',
            references: [
              'https://owasp.org/www-community/attacks/xss/',
              'https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'
            ]
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return vulnerabilities;
  }

  private detectInsecureDirectObjectReferences(sourceFile: ts.SourceFile): Partial<SecurityVulnerability>[] {
    const vulnerabilities: Partial<SecurityVulnerability>[] = [];

    const visit = (node: ts.Node) => {
      if (ts.isPropertyAccessExpression(node)) {
        const propertyName = node.name.getText().toLowerCase();

        // Check for direct access to sensitive properties
        if (propertyName.includes('id') || propertyName.includes('userid')) {
          const parent = node.parent;
          if (parent && ts.isCallExpression(parent)) {
            const methodName = parent.expression.getText().toLowerCase();
            if (methodName.includes('findby') || methodName.includes('getby')) {
              vulnerabilities.push({
                type: 'Insecure Direct Object References',
                location: `${sourceFile.fileName}:${node.getStart()}`,
                description: 'Potential IDOR vulnerability detected in direct object reference',
                recommendation: 'Implement proper authorization checks before accessing objects by ID',
                references: [
                  'https://cheatsheetseries.owasp.org/cheatsheets/Insecure_Direct_Object_Reference_Prevention_Cheat_Sheet.html'
                ]
              });
            }
          }
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return vulnerabilities;
  }

  private detectHardcodedCredentials(sourceFile: ts.SourceFile): Partial<SecurityVulnerability>[] {
    const vulnerabilities: Partial<SecurityVulnerability>[] = [];

    const sensitivePatterns = [
      /password/i,
      /secret/i,
      /api[_-]?key/i,
      /auth[_-]?token/i,
      /credentials/i
    ];

    const visit = (node: ts.Node) => {
      if (ts.isStringLiteral(node) || ts.isPropertyAssignment(node)) {
        const text = node.getText().toLowerCase();

        // Check for potential hardcoded credentials
        if (sensitivePatterns.some(pattern => pattern.test(text))) {
          vulnerabilities.push({
            type: 'Hardcoded Credentials',
            location: `${sourceFile.fileName}:${node.getStart()}`,
            description: 'Potential hardcoded credentials detected',
            recommendation: 'Use environment variables or a secure configuration management system',
            references: [
              'https://owasp.org/www-community/vulnerabilities/Use_of_hard-coded_password'
            ]
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return vulnerabilities;
  }

  private detectInsecureCrypto(sourceFile: ts.SourceFile): Partial<SecurityVulnerability>[] {
    const vulnerabilities: Partial<SecurityVulnerability>[] = [];

    const weakAlgorithms = [
      /md5/i,
      /sha1/i,
      /des/i,
      /rc4/i,
      /blowfish/i
    ];

    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const methodName = node.expression.getText().toLowerCase();

        // Check for weak cryptographic algorithms
        if (weakAlgorithms.some(pattern => pattern.test(methodName))) {
          vulnerabilities.push({
            type: 'Insecure Cryptographic Storage',
            location: `${sourceFile.fileName}:${node.getStart()}`,
            description: 'Use of weak or outdated cryptographic algorithm detected',
            recommendation: 'Use strong, modern cryptographic algorithms (e.g., AES-256, SHA-256, or better)',
            references: [
              'https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html'
            ]
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return vulnerabilities;
  }

  private containsStringConcatenation(node: ts.Node): boolean {
    if (ts.isBinaryExpression(node)) {
      return node.operatorToken.kind === ts.SyntaxKind.PlusToken;
    }

    let hasConcat = false;
    ts.forEachChild(node, child => {
      if (this.containsStringConcatenation(child)) {
        hasConcat = true;
      }
    });

    return hasConcat;
  }
}