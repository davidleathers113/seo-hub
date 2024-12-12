import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { join } from 'path';

export interface PatternAnalysisResult {
  patterns: {
    name: string;
    location: string;
    confidence: number;
    description: string;
  }[];
  antiPatterns: {
    name: string;
    location: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestion: string;
  }[];
}

export class PatternAnalyzer {
  private patterns = [
    {
      name: 'Repository Pattern',
      detector: this.detectRepositoryPattern.bind(this),
    },
    {
      name: 'Service Layer',
      detector: this.detectServiceLayer.bind(this),
    },
    {
      name: 'Dependency Injection',
      detector: this.detectDependencyInjection.bind(this),
    },
  ];

  private antiPatterns = [
    {
      name: 'God Object',
      detector: this.detectGodObject.bind(this),
    },
    {
      name: 'Tight Coupling',
      detector: this.detectTightCoupling.bind(this),
    },
    {
      name: 'Circular Dependencies',
      detector: this.detectCircularDependencies.bind(this),
    },
  ];

  analyze(sourceFile: ts.SourceFile): PatternAnalysisResult {
    const result: PatternAnalysisResult = {
      patterns: [],
      antiPatterns: [],
    };

    // Detect patterns
    for (const pattern of this.patterns) {
      const detected = pattern.detector(sourceFile);
      if (detected) {
        result.patterns.push(detected);
      }
    }

    // Detect anti-patterns
    for (const antiPattern of this.antiPatterns) {
      const detected = antiPattern.detector(sourceFile);
      if (detected) {
        result.antiPatterns.push(detected);
      }
    }

    return result;
  }

  private detectRepositoryPattern(sourceFile: ts.SourceFile) {
    let isRepository = false;
    let hasDbOperations = false;

    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        isRepository = node.name?.text.includes('Repository') || false;

        node.members.forEach(member => {
          if (ts.isMethodDeclaration(member)) {
            const methodName = member.name.getText();
            hasDbOperations = hasDbOperations ||
              ['find', 'create', 'update', 'delete', 'save'].some(op =>
                methodName.toLowerCase().includes(op));
          }
        });
      }
    });

    if (isRepository && hasDbOperations) {
      return {
        name: 'Repository Pattern',
        location: sourceFile.fileName,
        confidence: 0.9,
        description: 'Implements data access through a repository abstraction',
      };
    }
    return null;
  }

  private detectServiceLayer(sourceFile: ts.SourceFile) {
    let isService = false;
    let hasDependencyInjection = false;

    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        isService = node.name?.text.includes('Service') || false;

        // Check constructor for dependency injection
        const constructor = node.members.find(member =>
          ts.isConstructorDeclaration(member));
        if (constructor && ts.isConstructorDeclaration(constructor)) {
          hasDependencyInjection = constructor.parameters.length > 0;
        }
      }
    });

    if (isService) {
      return {
        name: 'Service Layer',
        location: sourceFile.fileName,
        confidence: hasDependencyInjection ? 0.9 : 0.7,
        description: 'Implements business logic in a service layer',
      };
    }
    return null;
  }

  private detectDependencyInjection(sourceFile: ts.SourceFile) {
    let hasDI = false;
    let constructorParams = 0;

    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        const constructor = node.members.find(member =>
          ts.isConstructorDeclaration(member));
        if (constructor && ts.isConstructorDeclaration(constructor)) {
          constructorParams = constructor.parameters.length;
          hasDI = constructorParams > 0;
        }
      }
    });

    if (hasDI) {
      return {
        name: 'Dependency Injection',
        location: sourceFile.fileName,
        confidence: 0.8,
        description: `Uses constructor injection with ${constructorParams} dependencies`,
      };
    }
    return null;
  }

  private detectGodObject(sourceFile: ts.SourceFile) {
    const methodThreshold = 15;
    const propertyThreshold = 10;

    let methods = 0;
    let properties = 0;

    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node)) {
        node.members.forEach(member => {
          if (ts.isMethodDeclaration(member)) methods++;
          if (ts.isPropertyDeclaration(member)) properties++;
        });
      }
    });

    if (methods > methodThreshold || properties > propertyThreshold) {
      return {
        name: 'God Object',
        location: sourceFile.fileName,
        severity: 'high',
        description: `Class has too many responsibilities (${methods} methods, ${properties} properties)`,
        suggestion: 'Consider splitting this class into smaller, more focused classes',
      };
    }
    return null;
  }

  private detectTightCoupling(sourceFile: ts.SourceFile) {
    let concreteClassImports = 0;
    let interfaceImports = 0;

    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        const importClause = node.importClause;
        if (importClause && importClause.namedBindings) {
          if (ts.isNamedImports(importClause.namedBindings)) {
            importClause.namedBindings.elements.forEach(element => {
              const name = element.name.text;
              if (name.startsWith('I')) {
                interfaceImports++;
              } else {
                concreteClassImports++;
              }
            });
          }
        }
      }
    });

    if (concreteClassImports > interfaceImports * 2) {
      return {
        name: 'Tight Coupling',
        location: sourceFile.fileName,
        severity: 'medium',
        description: 'Module depends more on concrete implementations than abstractions',
        suggestion: 'Consider depending on interfaces instead of concrete classes',
      };
    }
    return null;
  }

  private detectCircularDependencies(sourceFile: ts.SourceFile) {
    // This is a simplified check - a full implementation would need to traverse the dependency graph
    const imports = new Set<string>();
    let hasCircular = false;

    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText();
        const cleaned = moduleSpecifier.replace(/['"]/g, '');

        if (imports.has(cleaned)) {
          hasCircular = true;
        }
        imports.add(cleaned);
      }
    });

    if (hasCircular) {
      return {
        name: 'Circular Dependencies',
        location: sourceFile.fileName,
        severity: 'high',
        description: 'Detected potential circular dependencies between modules',
        suggestion: 'Restructure dependencies to form a directed acyclic graph',
      };
    }
    return null;
  }
}