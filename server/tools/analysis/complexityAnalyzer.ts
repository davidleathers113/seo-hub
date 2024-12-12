import * as ts from 'typescript';
import * as path from 'path';

interface ComplexityMetrics {
  cyclomatic: number;
  cognitive: number;
  halstead: {
    operators: Set<string>;
    operands: Set<string>;
    totalOperators: number;
    totalOperands: number;
    vocabulary: number;
    length: number;
    volume: number;
    difficulty: number;
    effort: number;
    time: number;
    bugs: number;
  };
  maintainability: number;
  lines: {
    total: number;
    code: number;
    comment: number;
    blank: number;
  };
  dependencies: {
    fanIn: number;
    fanOut: number;
    instability: number;
  };
}

interface FileComplexity {
  file: string;
  metrics: ComplexityMetrics;
  functions: {
    name: string;
    metrics: ComplexityMetrics;
    location: {
      line: number;
      column: number;
    };
  }[];
}

interface ComplexityReport {
  files: FileComplexity[];
  summary: {
    totalFiles: number;
    averageComplexity: {
      cyclomatic: number;
      cognitive: number;
      maintainability: number;
    };
    hotspots: {
      file: string;
      reason: string;
      severity: 'low' | 'medium' | 'high';
      metrics: Partial<ComplexityMetrics>;
    }[];
  };
}

export class ComplexityAnalyzer {
  private program: ts.Program;
  private typeChecker: ts.TypeChecker;
  private fileComplexities: FileComplexity[] = [];

  constructor(tsConfigPath: string) {
    const config = ts.readConfigFile(tsConfigPath, ts.sys.readFile);
    const parsedConfig = ts.parseJsonConfigFileContent(
      config.config,
      ts.sys,
      path.dirname(tsConfigPath)
    );
    this.program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options);
    this.typeChecker = this.program.getTypeChecker();
  }

  public analyze(): ComplexityReport {
    const sourceFiles = this.program.getSourceFiles();
    for (const sourceFile of sourceFiles) {
      if (!sourceFile.isDeclarationFile && !sourceFile.fileName.includes('node_modules')) {
        this.analyzeFile(sourceFile);
      }
    }

    return {
      files: this.fileComplexities,
      summary: this.generateSummary()
    };
  }

  private analyzeFile(sourceFile: ts.SourceFile): void {
    const fileComplexity: FileComplexity = {
      file: path.relative(process.cwd(), sourceFile.fileName),
      metrics: this.initializeMetrics(),
      functions: []
    };

    // Analyze file-level metrics
    fileComplexity.metrics = this.calculateMetrics(sourceFile);

    // Analyze function-level metrics
    ts.forEachChild(sourceFile, node => {
      if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
        const functionName = node.name?.getText() || '<anonymous>';
        const metrics = this.calculateMetrics(node);
        const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.getStart());

        fileComplexity.functions.push({
          name: functionName,
          metrics,
          location: {
            line: line + 1,
            column: character + 1
          }
        });
      }
    });

    this.fileComplexities.push(fileComplexity);
  }

  private initializeMetrics(): ComplexityMetrics {
    return {
      cyclomatic: 1,
      cognitive: 0,
      halstead: {
        operators: new Set<string>(),
        operands: new Set<string>(),
        totalOperators: 0,
        totalOperands: 0,
        vocabulary: 0,
        length: 0,
        volume: 0,
        difficulty: 0,
        effort: 0,
        time: 0,
        bugs: 0
      },
      maintainability: 100,
      lines: {
        total: 0,
        code: 0,
        comment: 0,
        blank: 0
      },
      dependencies: {
        fanIn: 0,
        fanOut: 0,
        instability: 0
      }
    };
  }

  private calculateMetrics(node: ts.Node): ComplexityMetrics {
    const metrics = this.initializeMetrics();

    // Calculate cyclomatic complexity
    metrics.cyclomatic = this.calculateCyclomaticComplexity(node);

    // Calculate cognitive complexity
    metrics.cognitive = this.calculateCognitiveComplexity(node);

    // Calculate Halstead metrics
    this.calculateHalsteadMetrics(node, metrics.halstead);

    // Calculate maintainability index
    metrics.maintainability = this.calculateMaintainabilityIndex(
      metrics.cyclomatic,
      metrics.halstead.volume,
      metrics.lines.code
    );

    // Calculate line metrics
    metrics.lines = this.calculateLineMetrics(node);

    // Calculate dependencies
    metrics.dependencies = this.calculateDependencyMetrics(node);

    return metrics;
  }

  private calculateCyclomaticComplexity(node: ts.Node): number {
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

    visit(node);
    return complexity;
  }

  private calculateCognitiveComplexity(node: ts.Node): number {
    let complexity = 0;
    let nesting = 0;

    const visit = (node: ts.Node, nestingLevel: number) => {
      switch (node.kind) {
        case ts.SyntaxKind.IfStatement:
        case ts.SyntaxKind.ForStatement:
        case ts.SyntaxKind.ForInStatement:
        case ts.SyntaxKind.ForOfStatement:
        case ts.SyntaxKind.WhileStatement:
        case ts.SyntaxKind.DoStatement:
          complexity += 1 + nestingLevel;
          nesting = nestingLevel + 1;
          break;
        case ts.SyntaxKind.CatchClause:
          complexity += nestingLevel;
          break;
        case ts.SyntaxKind.ConditionalExpression:
          complexity += 1 + nestingLevel;
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
      ts.forEachChild(node, child => visit(child, nesting));
    };

    visit(node, 0);
    return complexity;
  }

  private calculateHalsteadMetrics(node: ts.Node, metrics: ComplexityMetrics['halstead']): void {
    const visit = (node: ts.Node) => {
      if (ts.isIdentifier(node)) {
        metrics.operands.add(node.text);
        metrics.totalOperands++;
      } else if (ts.isBinaryExpression(node) || ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
        metrics.operators.add(node.getFirstToken()?.getText() || '');
        metrics.totalOperators++;
      }
      ts.forEachChild(node, visit);
    };

    visit(node);

    // Calculate Halstead metrics
    metrics.vocabulary = metrics.operators.size + metrics.operands.size;
    metrics.length = metrics.totalOperators + metrics.totalOperands;
    metrics.volume = metrics.length * Math.log2(metrics.vocabulary);
    metrics.difficulty = (metrics.operators.size / 2) * (metrics.totalOperands / metrics.operands.size);
    metrics.effort = metrics.difficulty * metrics.volume;
    metrics.time = metrics.effort / 18;
    metrics.bugs = metrics.volume / 3000;
  }

  private calculateMaintainabilityIndex(
    cyclomaticComplexity: number,
    halsteadVolume: number,
    linesOfCode: number
  ): number {
    const HV = halsteadVolume;
    const CC = cyclomaticComplexity;
    const LOC = Math.log(linesOfCode);

    // Original maintainability index formula
    const MI = Math.max(
      0,
      171 - 5.2 * Math.log(HV) - 0.23 * CC - 16.2 * LOC
    );

    // Normalized to 0-100 scale
    return Math.min(100, MI * 100 / 171);
  }

  private calculateLineMetrics(node: ts.Node): ComplexityMetrics['lines'] {
    const sourceFile = node.getSourceFile();
    const text = node.getFullText();
    const lines = text.split('\n');

    const metrics = {
      total: lines.length,
      code: 0,
      comment: 0,
      blank: 0
    };

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        metrics.blank++;
      } else if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
        metrics.comment++;
      } else {
        metrics.code++;
      }
    });

    return metrics;
  }

  private calculateDependencyMetrics(node: ts.Node): ComplexityMetrics['dependencies'] {
    const metrics = {
      fanIn: 0,
      fanOut: 0,
      instability: 0
    };

    // Calculate fan-out (number of dependencies)
    ts.forEachChild(node, child => {
      if (ts.isImportDeclaration(child)) {
        metrics.fanOut++;
      }
    });

    // Calculate fan-in (number of dependents)
    const symbol = this.typeChecker.getSymbolAtLocation(node);
    if (symbol) {
      metrics.fanIn = symbol.declarations?.length || 0;
    }

    // Calculate instability
    const totalDependencies = metrics.fanIn + metrics.fanOut;
    metrics.instability = totalDependencies > 0 ? metrics.fanOut / totalDependencies : 0;

    return metrics;
  }

  private generateSummary(): ComplexityReport['summary'] {
    const summary = {
      totalFiles: this.fileComplexities.length,
      averageComplexity: {
        cyclomatic: 0,
        cognitive: 0,
        maintainability: 0
      },
      hotspots: [] as ComplexityReport['summary']['hotspots']
    };

    // Calculate averages
    this.fileComplexities.forEach(file => {
      summary.averageComplexity.cyclomatic += file.metrics.cyclomatic;
      summary.averageComplexity.cognitive += file.metrics.cognitive;
      summary.averageComplexity.maintainability += file.metrics.maintainability;

      // Detect hotspots
      this.detectHotspots(file, summary.hotspots);
    });

    summary.averageComplexity.cyclomatic /= summary.totalFiles;
    summary.averageComplexity.cognitive /= summary.totalFiles;
    summary.averageComplexity.maintainability /= summary.totalFiles;

    return summary;
  }

  private detectHotspots(
    file: FileComplexity,
    hotspots: ComplexityReport['summary']['hotspots']
  ): void {
    // Check cyclomatic complexity
    if (file.metrics.cyclomatic > 20) {
      hotspots.push({
        file: file.file,
        reason: 'High cyclomatic complexity',
        severity: 'high',
        metrics: {
          cyclomatic: file.metrics.cyclomatic
        }
      });
    }

    // Check cognitive complexity
    if (file.metrics.cognitive > 15) {
      hotspots.push({
        file: file.file,
        reason: 'High cognitive complexity',
        severity: 'high',
        metrics: {
          cognitive: file.metrics.cognitive
        }
      });
    }

    // Check maintainability index
    if (file.metrics.maintainability < 65) {
      hotspots.push({
        file: file.file,
        reason: 'Low maintainability index',
        severity: 'high',
        metrics: {
          maintainability: file.metrics.maintainability
        }
      });
    }

    // Check function-level metrics
    file.functions.forEach(func => {
      if (func.metrics.cyclomatic > 10) {
        hotspots.push({
          file: `${file.file}:${func.name}`,
          reason: 'Function has high cyclomatic complexity',
          severity: 'medium',
          metrics: {
            cyclomatic: func.metrics.cyclomatic
          }
        });
      }

      if (func.metrics.cognitive > 8) {
        hotspots.push({
          file: `${file.file}:${func.name}`,
          reason: 'Function has high cognitive complexity',
          severity: 'medium',
          metrics: {
            cognitive: func.metrics.cognitive
          }
        });
      }

      if (func.metrics.lines.code > 50) {
        hotspots.push({
          file: `${file.file}:${func.name}`,
          reason: 'Function is too long',
          severity: 'medium',
          metrics: {
            lines: func.metrics.lines
          }
        });
      }
    });
  }
}

// CLI interface
if (require.main === module) {
  const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
  const analyzer = new ComplexityAnalyzer(tsConfigPath);

  const report = analyzer.analyze();

  console.log('\nCode Complexity Analysis Report');
  console.log('==============================');

  console.log('\nSummary:');
  console.log(`Total Files: ${report.summary.totalFiles}`);
  console.log('\nAverage Complexity:');
  Object.entries(report.summary.averageComplexity).forEach(([metric, value]) => {
    console.log(`  ${metric}: ${value.toFixed(2)}`);
  });

  console.log('\nHotspots:');
  report.summary.hotspots.forEach(hotspot => {
    console.log(`\n${hotspot.file} (${hotspot.severity})`);
    console.log(`Reason: ${hotspot.reason}`);
    console.log('Metrics:', hotspot.metrics);
  });

  console.log('\nDetailed File Analysis:');
  report.files.forEach(file => {
    console.log(`\nFile: ${file.file}`);
    console.log('Metrics:');
    console.log('  Cyclomatic Complexity:', file.metrics.cyclomatic);
    console.log('  Cognitive Complexity:', file.metrics.cognitive);
    console.log('  Maintainability Index:', file.metrics.maintainability.toFixed(2));
    console.log('  Lines:', file.metrics.lines);
    console.log('  Dependencies:', file.metrics.dependencies);

    if (file.functions.length > 0) {
      console.log('\n  Functions:');
      file.functions.forEach(func => {
        console.log(`\n    ${func.name} (line ${func.location.line})`);
        console.log('    Metrics:');
        console.log('      Cyclomatic Complexity:', func.metrics.cyclomatic);
        console.log('      Cognitive Complexity:', func.metrics.cognitive);
        console.log('      Lines:', func.metrics.lines);
      });
    }
  });
}