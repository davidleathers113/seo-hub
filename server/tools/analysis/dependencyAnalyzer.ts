import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';

interface DependencyNode {
  id: string;
  type: 'service' | 'route' | 'model' | 'middleware' | 'utility' | 'interface' | 'other';
  dependencies: string[];
  metrics: {
    complexity: number;
    lines: number;
    imports: number;
    exports: number;
  };
}

interface ArchitecturalPattern {
  name: string;
  confidence: number;
  description: string;
  locations: string[];
}

export class DependencyAnalyzer {
  private nodes: Map<string, DependencyNode> = new Map();
  private patterns: ArchitecturalPattern[] = [];
  private program: ts.Program;

  constructor(tsConfigPath: string) {
    const config = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(tsConfigPath)
    );
    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
  }

  public analyze(): void {
    const sourceFiles = this.program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      if (!sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
        this.analyzeFile(sourceFile);
      }
    }
    this.detectPatterns();
  }

  private analyzeFile(sourceFile: ts.SourceFile): void {
    const filePath = path.relative(process.cwd(), sourceFile.fileName);
    const node: DependencyNode = {
      id: filePath,
      type: this.determineFileType(filePath),
      dependencies: [],
      metrics: {
        complexity: this.calculateComplexity(sourceFile),
        lines: sourceFile.getFullText().split('\n').length,
        imports: 0,
        exports: 0
      }
    };

    ts.forEachChild(sourceFile, (child) => {
      if (ts.isImportDeclaration(child)) {
        node.metrics.imports++;
        const importPath = this.resolveImportPath(child, sourceFile.fileName);
        if (importPath) {
          node.dependencies.push(importPath);
        }
      }
      if (ts.isExportDeclaration(child) || ts.isExportAssignment(child)) {
        node.metrics.exports++;
      }
    });

    this.nodes.set(filePath, node);
  }

  private determineFileType(filePath: string): DependencyNode['type'] {
    if (filePath.includes('/services/')) return 'service';
    if (filePath.includes('/routes/')) return 'route';
    if (filePath.includes('/models/')) return 'model';
    if (filePath.includes('/middleware/')) return 'middleware';
    if (filePath.includes('/utils/')) return 'utility';
    if (filePath.includes('/interfaces')) return 'interface';
    return 'other';
  }

  private calculateComplexity(sourceFile: ts.SourceFile): number {
    let complexity = 1;

    const visit = (node: ts.Node) => {
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.ConditionalExpression:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
        case ts.SyntaxKind.CatchClause:
        case ts.SyntaxKind.SwitchCase:
          complexity++;
          break;
        case ts.SyntaxKind.BinaryExpression:
          const binaryExpr = node as ts.BinaryExpression;
          if (
            binaryExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
            binaryExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken
          ) {
            complexity++;
          }
          break;
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return complexity;
  }

  private resolveImportPath(importDecl: ts.ImportDeclaration, currentFile: string): string | null {
    const importPath = (importDecl.moduleSpecifier as ts.StringLiteral).text;
    if (importPath.startsWith('.')) {
      const resolvedPath = path.resolve(path.dirname(currentFile), importPath);
      return path.relative(process.cwd(), resolvedPath);
    }
    return null;
  }

  private detectPatterns(): void {
    this.detectLayeredArchitecture();
    this.detectMVC();
    this.detectCircularDependencies();
  }

  private detectLayeredArchitecture(): void {
    const layers = {
      routes: [] as string[],
      services: [] as string[],
      models: [] as string[],
    };

    this.nodes.forEach((node, id) => {
      if (node.type === 'route') layers.routes.push(id);
      if (node.type === 'service') layers.services.push(id);
      if (node.type === 'model') layers.models.push(id);
    });

    const isLayeredCorrectly = layers.routes.every(route => {
      const node = this.nodes.get(route)!;
      return node.dependencies.every(dep =>
        !layers.models.includes(dep) || layers.services.some(svc => node.dependencies.includes(svc))
      );
    });

    if (isLayeredCorrectly) {
      this.patterns.push({
        name: 'Layered Architecture',
        confidence: 0.9,
        description: 'The application follows a layered architecture pattern with proper separation of concerns.',
        locations: [...layers.routes, ...layers.services, ...layers.models]
      });
    }
  }

  private detectMVC(): void {
    const hasControllers = Array.from(this.nodes.values()).some(node =>
      node.type === 'route' && node.dependencies.some(dep => this.nodes.get(dep)?.type === 'service')
    );

    const hasViews = Array.from(this.nodes.values()).some(node =>
      node.type === 'route' && node.metrics.exports > 0
    );

    const hasModels = Array.from(this.nodes.values()).some(node => node.type === 'model');

    if (hasControllers && hasViews && hasModels) {
      this.patterns.push({
        name: 'MVC Pattern',
        confidence: 0.8,
        description: 'The application follows the Model-View-Controller pattern.',
        locations: Array.from(this.nodes.keys())
      });
    }
  }

  private detectCircularDependencies(): void {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const findCycle = (nodeId: string, path: string[] = []): string[] | null => {
      if (recursionStack.has(nodeId)) {
        const cycleStart = path.indexOf(nodeId);
        return path.slice(cycleStart);
      }

      if (visited.has(nodeId)) return null;

      visited.add(nodeId);
      recursionStack.add(nodeId);

      const node = this.nodes.get(nodeId);
      if (node) {
        for (const dep of node.dependencies) {
          const cycle = findCycle(dep, [...path, nodeId]);
          if (cycle) return cycle;
        }
      }

      recursionStack.delete(nodeId);
      return null;
    };

    for (const nodeId of this.nodes.keys()) {
      const cycle = findCycle(nodeId);
      if (cycle) {
        this.patterns.push({
          name: 'Circular Dependency',
          confidence: 1.0,
          description: `Detected circular dependency: ${cycle.join(' -> ')}`,
          locations: cycle
        });
      }
    }
  }

  public generateDependencyGraph(): { nodes: DependencyNode[]; patterns: ArchitecturalPattern[] } {
    return {
      nodes: Array.from(this.nodes.values()),
      patterns: this.patterns
    };
  }

  public getMetrics(): { [key: string]: number } {
    const metrics = {
      totalFiles: this.nodes.size,
      totalDependencies: 0,
      averageComplexity: 0,
      maxComplexity: 0,
      totalLines: 0
    };

    this.nodes.forEach(node => {
      metrics.totalDependencies += node.dependencies.length;
      metrics.averageComplexity += node.metrics.complexity;
      metrics.maxComplexity = Math.max(metrics.maxComplexity, node.metrics.complexity);
      metrics.totalLines += node.metrics.lines;
    });

    metrics.averageComplexity /= this.nodes.size;

    return metrics;
  }
}

// CLI interface
if (require.main === module) {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  const analyzer = new DependencyAnalyzer(tsConfigPath);

  analyzer.analyze();

  const { nodes, patterns } = analyzer.generateDependencyGraph();
  const metrics = analyzer.getMetrics();

  console.log('\nArchitectural Analysis Results:');
  console.log('==============================');

  console.log('\nDetected Patterns:');
  patterns.forEach(pattern => {
    console.log(`\n${pattern.name} (${(pattern.confidence * 100).toFixed(1)}% confidence)`);
    console.log(`Description: ${pattern.description}`);
    console.log('Locations:');
    pattern.locations.forEach(loc => console.log(`  - ${loc}`));
  });

  console.log('\nCode Metrics:');
  Object.entries(metrics).forEach(([key, value]) => {
    console.log(`${key}: ${typeof value === 'number' ? value.toFixed(2) : value}`);
  });

  console.log('\nDependency Graph:');
  nodes.forEach(node => {
    console.log(`\n${node.id} (${node.type}):`);
    console.log('Dependencies:');
    node.dependencies.forEach(dep => console.log(`  - ${dep}`));
    console.log('Metrics:', node.metrics);
  });
}