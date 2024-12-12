import * as ts from 'typescript';
import { BaseAnalyzer } from '../core/BaseAnalyzer';

interface ComplexityMetrics {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  halsteadMetrics: {
    operators: Map<string, number>;
    operands: Map<string, number>;
    uniqueOperators: number;
    uniqueOperands: number;
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
  maintainabilityIndex: number;
  sourceLines: {
    total: number;
    logical: number;
    physical: number;
    comment: number;
    empty: number;
    documentation: number;
  };
  functionMetrics: {
    name: string;
    cyclomaticComplexity: number;
    cognitiveComplexity: number;
    parameters: number;
    length: number;
    nesting: number;
  }[];
  classMetrics: {
    name: string;
    methods: number;
    properties: number;
    inheritance: number;
    weightedMethods: number;
    lackOfCohesion: number;
  }[];
}

interface RefactoringOpportunity {
  type: string;
  location: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  severity: 'high' | 'medium' | 'low';
  description: string;
  suggestion: string;
}

export class ComplexityAnalyzer extends BaseAnalyzer {
  private metrics: ComplexityMetrics;
  private refactorings: RefactoringOpportunity[];
  private currentFunction: string | undefined;
  private nestingLevel: number;

  constructor(projectRoot: string) {
    super(projectRoot);
    this.initializeMetrics();
    this.refactorings = [];
    this.nestingLevel = 0;
  }

  private initializeMetrics(): void {
    this.metrics = {
      cyclomaticComplexity: 0,
      cognitiveComplexity: 0,
      halsteadMetrics: {
        operators: new Map(),
        operands: new Map(),
        uniqueOperators: 0,
        uniqueOperands: 0,
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
      maintainabilityIndex: 0,
      sourceLines: {
        total: 0,
        logical: 0,
        physical: 0,
        comment: 0,
        empty: 0,
        documentation: 0
      },
      functionMetrics: [],
      classMetrics: []
    };
  }

  public async analyze(sourceFile: ts.SourceFile): Promise<{
    metrics: ComplexityMetrics;
    refactorings: RefactoringOpportunity[];
  }> {
    this.initializeMetrics();
    this.refactorings = [];

    this.analyzeSourceLines(sourceFile);
    this.visitNode(sourceFile);
    this.calculateHalsteadMetrics();
    this.calculateMaintainabilityIndex();
    this.identifyRefactoringOpportunities();

    return {
      metrics: this.metrics,
      refactorings: this.refactorings
    };
  }

  private visitNode(node: ts.Node): void {
    // Track nesting level
    if (this.isNestingNode(node)) {
      this.nestingLevel++;
    }

    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node)) {
      this.analyzeFunctionComplexity(node);
    } else if (ts.isClassDeclaration(node)) {
      this.analyzeClassComplexity(node);
    } else {
      this.updateComplexityMetrics(node);
      this.updateHalsteadMetrics(node);
    }

    ts.forEachChild(node, child => this.visitNode(child));

    // Reset nesting level
    if (this.isNestingNode(node)) {
      this.nestingLevel--;
    }
  }

  private isNestingNode(node: ts.Node): boolean {
    return ts.isIfStatement(node) ||
           ts.isWhileStatement(node) ||
           ts.isForStatement(node) ||
           ts.isForInStatement(node) ||
           ts.isForOfStatement(node) ||
           ts.isDoStatement(node) ||
           ts.isCaseClause(node) ||
           ts.isTryStatement(node);
  }

  private analyzeFunctionComplexity(node: ts.FunctionDeclaration | ts.MethodDeclaration): void {
    const oldFunction = this.currentFunction;
    this.currentFunction = node.name?.getText() || 'anonymous';

    const startingCC = this.metrics.cyclomaticComplexity;
    const startingCogC = this.metrics.cognitiveComplexity;

    // Analyze function body
    if (node.body) {
      this.visitNode(node.body);
    }

    const functionCC = this.metrics.cyclomaticComplexity - startingCC;
    const functionCogC = this.metrics.cognitiveComplexity - startingCogC;

    this.metrics.functionMetrics.push({
      name: this.currentFunction,
      cyclomaticComplexity: functionCC,
      cognitiveComplexity: functionCogC,
      parameters: node.parameters.length,
      length: node.body ? node.body.getFullText().length : 0,
      nesting: this.calculateMaxNesting(node)
    });

    this.currentFunction = oldFunction;
  }

  private analyzeClassComplexity(node: ts.ClassDeclaration): void {
    if (!node.name) return;

    const className = node.name.getText();
    const methods = node.members.filter(m =>
      ts.isMethodDeclaration(m) || ts.isConstructorDeclaration(m)
    ).length;

    const properties = node.members.filter(m =>
      ts.isPropertyDeclaration(m) || ts.isGetAccessor(m) || ts.isSetAccessor(m)
    ).length;

    const inheritance = (node.heritageClauses?.length || 0);

    const weightedMethods = this.calculateWeightedMethods(node);
    const lackOfCohesion = this.calculateLackOfCohesion(node);

    this.metrics.classMetrics.push({
      name: className,
      methods,
      properties,
      inheritance,
      weightedMethods,
      lackOfCohesion
    });
  }

  private calculateWeightedMethods(node: ts.ClassDeclaration): number {
    let sum = 0;
    node.members.forEach(member => {
      if (ts.isMethodDeclaration(member)) {
        const complexity = this.calculateMethodComplexity(member);
        sum += complexity;
      }
    });
    return sum;
  }

  private calculateLackOfCohesion(node: ts.ClassDeclaration): number {
    // Calculate LCOM (Lack of Cohesion of Methods)
    const methodFields = new Map<string, Set<string>>();

    node.members.forEach(member => {
      if (ts.isMethodDeclaration(member)) {
        const methodName = member.name.getText();
        methodFields.set(methodName, new Set());

        // Collect field accesses
        this.collectFieldAccesses(member, methodFields.get(methodName)!);
      }
    });

    // Calculate LCOM using Henderson-Sellers method
    const methods = methodFields.size;
    if (methods <= 1) return 0;

    let totalSharedFields = 0;
    methodFields.forEach((fields, method) => {
      methodFields.forEach((otherFields, otherMethod) => {
        if (method !== otherMethod) {
          const intersection = new Set(
            [...fields].filter(x => otherFields.has(x))
          );
          totalSharedFields += intersection.size;
        }
      });
    });

    const avgSharedFields = totalSharedFields / (methods * (methods - 1));
    return (1 - avgSharedFields);
  }

  private collectFieldAccesses(node: ts.Node, fields: Set<string>): void {
    if (ts.isPropertyAccessExpression(node)) {
      const field = node.name.getText();
      fields.add(field);
    }

    ts.forEachChild(node, child => this.collectFieldAccesses(child, fields));
  }

  private calculateMethodComplexity(node: ts.MethodDeclaration): number {
    let complexity = 1;

    const incrementComplexity = (node: ts.Node) => {
      if (
        ts.isIfStatement(node) ||
        ts.isWhileStatement(node) ||
        ts.isForStatement(node) ||
        ts.isForInStatement(node) ||
        ts.isForOfStatement(node) ||
        ts.isDoStatement(node) ||
        ts.isCaseClause(node) ||
        ts.isConditionalExpression(node) ||
        ts.isBinaryExpression(node) && (
          node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
          node.operatorToken.kind === ts.SyntaxKind.BarBarToken
        )
      ) {
        complexity++;
      }
    };

    const visit = (node: ts.Node) => {
      incrementComplexity(node);
      ts.forEachChild(node, visit);
    };

    if (node.body) {
      visit(node.body);
    }

    return complexity;
  }

  private calculateMaxNesting(node: ts.Node): number {
    let maxNesting = 0;
    let currentNesting = 0;

    const visit = (node: ts.Node) => {
      if (this.isNestingNode(node)) {
        currentNesting++;
        maxNesting = Math.max(maxNesting, currentNesting);
      }

      ts.forEachChild(node, visit);

      if (this.isNestingNode(node)) {
        currentNesting--;
      }
    };

    visit(node);
    return maxNesting;
  }

  private updateComplexityMetrics(node: ts.Node): void {
    // Update cyclomatic complexity
    if (
      ts.isIfStatement(node) ||
      ts.isWhileStatement(node) ||
      ts.isForStatement(node) ||
      ts.isForInStatement(node) ||
      ts.isForOfStatement(node) ||
      ts.isDoStatement(node) ||
      ts.isCaseClause(node) ||
      ts.isConditionalExpression(node) ||
      ts.isBinaryExpression(node) && (
        node.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
        node.operatorToken.kind === ts.SyntaxKind.BarBarToken
      )
    ) {
      this.metrics.cyclomaticComplexity++;
    }

    // Update cognitive complexity
    if (this.isNestingNode(node)) {
      this.metrics.cognitiveComplexity += (1 + this.nestingLevel);
    }
  }

  private updateHalsteadMetrics(node: ts.Node): void {
    if (ts.isIdentifier(node)) {
      this.updateOperand(node.getText());
    } else if (ts.isBinaryExpression(node) || ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
      this.updateOperator(node.getFirstToken()?.getText() || '');
    }
  }

  private updateOperator(operator: string): void {
    const current = this.metrics.halsteadMetrics.operators.get(operator) || 0;
    this.metrics.halsteadMetrics.operators.set(operator, current + 1);
    this.metrics.halsteadMetrics.totalOperators++;
  }

  private updateOperand(operand: string): void {
    const current = this.metrics.halsteadMetrics.operands.get(operand) || 0;
    this.metrics.halsteadMetrics.operands.set(operand, current + 1);
    this.metrics.halsteadMetrics.totalOperands++;
  }

  private calculateHalsteadMetrics(): void {
    const metrics = this.metrics.halsteadMetrics;

    metrics.uniqueOperators = metrics.operators.size;
    metrics.uniqueOperands = metrics.operands.size;
    metrics.vocabulary = metrics.uniqueOperators + metrics.uniqueOperands;
    metrics.length = metrics.totalOperators + metrics.totalOperands;

    // Calculate volume
    metrics.volume = metrics.length * Math.log2(metrics.vocabulary);

    // Calculate difficulty
    metrics.difficulty = (metrics.uniqueOperators / 2) *
                        (metrics.totalOperands / metrics.uniqueOperands);

    // Calculate effort
    metrics.effort = metrics.difficulty * metrics.volume;

    // Calculate time (in seconds)
    metrics.time = metrics.effort / 18;

    // Estimate number of delivered bugs
    metrics.bugs = Math.ceil(metrics.volume / 3000);
  }

  private calculateMaintainabilityIndex(): void {
    // Maintainability Index = 171 - 5.2 * ln(HV) - 0.23 * CC - 16.2 * ln(LOC)
    const HV = this.metrics.halsteadMetrics.volume;
    const CC = this.metrics.cyclomaticComplexity;
    const LOC = this.metrics.sourceLines.logical;

    this.metrics.maintainabilityIndex = Math.max(0, Math.min(100,
      171 -
      5.2 * Math.log(HV) -
      0.23 * CC -
      16.2 * Math.log(LOC)
    ));
  }

  private analyzeSourceLines(sourceFile: ts.SourceFile): void {
    const text = sourceFile.getFullText();
    const lines = text.split('\n');

    this.metrics.sourceLines.total = lines.length;
    this.metrics.sourceLines.physical = lines.filter(line => line.trim().length > 0).length;
    this.metrics.sourceLines.empty = lines.filter(line => line.trim().length === 0).length;

    let inComment = false;
    lines.forEach(line => {
      const trimmed = line.trim();

      // Count comments
      if (trimmed.startsWith('/*')) inComment = true;
      if (trimmed.endsWith('*/')) {
        inComment = false;
        this.metrics.sourceLines.comment++;
      }
      if (inComment || trimmed.startsWith('//')) {
        this.metrics.sourceLines.comment++;
      }

      // Count JSDoc comments as documentation
      if (trimmed.startsWith('/**') || (inComment && trimmed.startsWith('*'))) {
        this.metrics.sourceLines.documentation++;
      }
    });

    // Count logical lines (statements, declarations, etc.)
    let logicalLines = 0;
    const incrementLogical = (node: ts.Node) => {
      if (
        ts.isStatement(node) ||
        ts.isDeclaration(node) ||
        ts.isExpression(node)
      ) {
        logicalLines++;
      }
    };

    const visit = (node: ts.Node) => {
      incrementLogical(node);
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    this.metrics.sourceLines.logical = logicalLines;
  }

  private identifyRefactoringOpportunities(): void {
    // Check function complexity
    this.metrics.functionMetrics.forEach(fn => {
      if (fn.cyclomaticComplexity > 10) {
        this.addRefactoringOpportunity({
          type: 'High Cyclomatic Complexity',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          severity: 'high',
          description: `Function ${fn.name} has high cyclomatic complexity (${fn.cyclomaticComplexity})`,
          suggestion: 'Consider breaking down the function into smaller, more focused functions'
        });
      }

      if (fn.parameters > 4) {
        this.addRefactoringOpportunity({
          type: 'Too Many Parameters',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          severity: 'medium',
          description: `Function ${fn.name} has too many parameters (${fn.parameters})`,
          suggestion: 'Consider using parameter objects or breaking down the function'
        });
      }

      if (fn.nesting > 3) {
        this.addRefactoringOpportunity({
          type: 'Deep Nesting',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          severity: 'medium',
          description: `Function ${fn.name} has deep nesting (level ${fn.nesting})`,
          suggestion: 'Consider extracting nested logic into separate functions'
        });
      }
    });

    // Check class complexity
    this.metrics.classMetrics.forEach(cls => {
      if (cls.methods > 20) {
        this.addRefactoringOpportunity({
          type: 'Large Class',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          severity: 'high',
          description: `Class ${cls.name} has too many methods (${cls.methods})`,
          suggestion: 'Consider breaking down the class into smaller, more focused classes'
        });
      }

      if (cls.lackOfCohesion > 0.7) {
        this.addRefactoringOpportunity({
          type: 'Low Cohesion',
          location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
          severity: 'medium',
          description: `Class ${cls.name} has low cohesion (LCOM = ${cls.lackOfCohesion.toFixed(2)})`,
          suggestion: 'Consider splitting the class into more cohesive classes'
        });
      }
    });

    // Check overall complexity
    if (this.metrics.maintainabilityIndex < 65) {
      this.addRefactoringOpportunity({
        type: 'Low Maintainability',
        location: { start: { line: 0, column: 0 }, end: { line: 0, column: 0 } },
        severity: 'high',
        description: `Code has low maintainability index (${this.metrics.maintainabilityIndex.toFixed(2)})`,
        suggestion: 'Consider major refactoring to improve code maintainability'
      });
    }
  }

  private addRefactoringOpportunity(opportunity: RefactoringOpportunity): void {
    this.refactorings.push(opportunity);
  }
}