import * as ts from 'typescript';
import { readFileSync } from 'fs';
import { join, relative, dirname } from 'path';

export interface DependencyNode {
  id: string;
  type: 'file' | 'package' | 'type' | 'class' | 'function';
  name: string;
  path?: string;
  version?: string;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'imports' | 'extends' | 'implements' | 'uses' | 'calls';
  weight: number;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  metrics: {
    totalDependencies: number;
    averageDependenciesPerModule: number;
    maxDependencies: number;
    circularDependencies: Array<string[]>;
    stronglyConnectedComponents: Array<string[]>;
  };
}

export class DependencyAnalyzer {
  private nodes: Map<string, DependencyNode> = new Map();
  private edges: Map<string, DependencyEdge> = new Map();
  private projectRoot: string;

  constructor(projectRoot: string) {
    this.projectRoot = projectRoot;
  }

  analyze(sourceFile: ts.SourceFile): DependencyGraph {
    this.analyzeImports(sourceFile);
    this.analyzeClassDependencies(sourceFile);
    this.analyzeFunctionCalls(sourceFile);
    this.analyzeTypeRelations(sourceFile);

    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values()),
      metrics: this.calculateMetrics()
    };
  }

  private analyzeImports(sourceFile: ts.SourceFile): void {
    ts.forEachChild(sourceFile, node => {
      if (ts.isImportDeclaration(node)) {
        const moduleSpecifier = node.moduleSpecifier.getText().replace(/['"]/g, '');
        const importPath = this.resolveImportPath(moduleSpecifier, sourceFile.fileName);

        // Add source file node
        const sourceId = this.addNode({
          type: 'file',
          name: relative(this.projectRoot, sourceFile.fileName),
          path: sourceFile.fileName
        });

        // Add imported module node
        const targetId = this.addNode({
          type: this.isPackageDependency(moduleSpecifier) ? 'package' : 'file',
          name: moduleSpecifier,
          path: importPath,
          version: this.getPackageVersion(moduleSpecifier)
        });

        // Add edge
        this.addEdge({
          from: sourceId,
          to: targetId,
          type: 'imports',
          weight: 1
        });
      }
    });
  }

  private analyzeClassDependencies(sourceFile: ts.SourceFile): void {
    ts.forEachChild(sourceFile, node => {
      if (ts.isClassDeclaration(node) && node.name) {
        const className = node.name.getText();
        const classId = this.addNode({
          type: 'class',
          name: className,
          path: sourceFile.fileName
        });

        // Analyze inheritance
        if (node.heritageClauses) {
          node.heritageClauses.forEach(clause => {
            clause.types.forEach(type => {
              const baseClassName = type.expression.getText();
              const baseClassId = this.addNode({
                type: 'class',
                name: baseClassName
              });

              this.addEdge({
                from: classId,
                to: baseClassId,
                type: clause.token === ts.SyntaxKind.ExtendsKeyword ? 'extends' : 'implements',
                weight: 1
              });
            });
          });
        }
      }
    });
  }

  private analyzeFunctionCalls(sourceFile: ts.SourceFile): void {
    const visit = (node: ts.Node) => {
      if (ts.isCallExpression(node)) {
        const caller = this.findParentFunction(node);
        if (caller) {
          const callerId = this.addNode({
            type: 'function',
            name: caller.name?.getText() || 'anonymous',
            path: sourceFile.fileName
          });

          const callee = node.expression.getText();
          const calleeId = this.addNode({
            type: 'function',
            name: callee
          });

          this.addEdge({
            from: callerId,
            to: calleeId,
            type: 'calls',
            weight: 1
          });
        }
      }
      ts.forEachChild(node, visit);
    };

    visit(sourceFile);
  }

  private analyzeTypeRelations(sourceFile: ts.SourceFile): void {
    ts.forEachChild(sourceFile, node => {
      if (ts.isTypeAliasDeclaration(node) || ts.isInterfaceDeclaration(node)) {
        const typeId = this.addNode({
          type: 'type',
          name: node.name.getText(),
          path: sourceFile.fileName
        });

        // Analyze type dependencies
        const typeRefs = this.findTypeReferences(node);
        typeRefs.forEach(ref => {
          const refId = this.addNode({
            type: 'type',
            name: ref
          });

          this.addEdge({
            from: typeId,
            to: refId,
            type: 'uses',
            weight: 1
          });
        });
      }
    });
  }

  private calculateMetrics(): DependencyGraph['metrics'] {
    const dependencies = Array.from(this.edges.values());
    const nodeIds = new Set(this.nodes.keys());

    // Calculate basic metrics
    const dependenciesPerNode = new Map<string, number>();
    dependencies.forEach(edge => {
      const count = dependenciesPerNode.get(edge.from) || 0;
      dependenciesPerNode.set(edge.from, count + 1);
    });

    const dependencyCounts = Array.from(dependenciesPerNode.values());

    // Find circular dependencies
    const circularDependencies = this.findCircularDependencies();

    // Find strongly connected components
    const stronglyConnectedComponents = this.findStronglyConnectedComponents();

    return {
      totalDependencies: dependencies.length,
      averageDependenciesPerModule: dependencies.length / nodeIds.size,
      maxDependencies: Math.max(...dependencyCounts, 0),
      circularDependencies,
      stronglyConnectedComponents
    };
  }

  private findCircularDependencies(): Array<string[]> {
    const graph = new Map<string, Set<string>>();

    // Build adjacency list
    this.edges.forEach(edge => {
      if (!graph.has(edge.from)) {
        graph.set(edge.from, new Set());
      }
      graph.get(edge.from)!.add(edge.to);
    });

    const cycles: Array<string[]> = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const dfs = (node: string, path: string[] = []): void => {
      visited.add(node);
      recursionStack.add(node);
      path.push(node);

      const neighbors = graph.get(node) || new Set();
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recursionStack.has(neighbor)) {
          const cycle = path.slice(path.indexOf(neighbor));
          cycles.push(cycle);
        }
      });

      recursionStack.delete(node);
      path.pop();
    };

    Array.from(graph.keys()).forEach(node => {
      if (!visited.has(node)) {
        dfs(node);
      }
    });

    return cycles;
  }

  private findStronglyConnectedComponents(): Array<string[]> {
    // Kosaraju's algorithm for finding strongly connected components
    const graph = new Map<string, Set<string>>();
    const reversedGraph = new Map<string, Set<string>>();

    // Build graphs
    this.edges.forEach(edge => {
      if (!graph.has(edge.from)) graph.set(edge.from, new Set());
      if (!reversedGraph.has(edge.to)) reversedGraph.set(edge.to, new Set());

      graph.get(edge.from)!.add(edge.to);
      reversedGraph.get(edge.to)!.add(edge.from);
    });

    // First DFS - get finishing times
    const visited = new Set<string>();
    const finishingOrder: string[] = [];

    const dfs1 = (node: string): void => {
      visited.add(node);
      const neighbors = graph.get(node) || new Set();
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs1(neighbor);
        }
      });
      finishingOrder.push(node);
    };

    Array.from(graph.keys()).forEach(node => {
      if (!visited.has(node)) {
        dfs1(node);
      }
    });

    // Second DFS - find SCCs
    visited.clear();
    const components: Array<string[]> = [];

    const dfs2 = (node: string, component: string[]): void => {
      visited.add(node);
      component.push(node);
      const neighbors = reversedGraph.get(node) || new Set();
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          dfs2(neighbor, component);
        }
      });
    };

    finishingOrder.reverse().forEach(node => {
      if (!visited.has(node)) {
        const component: string[] = [];
        dfs2(node, component);
        if (component.length > 1) {
          components.push(component);
        }
      }
    });

    return components;
  }

  private addNode(node: Omit<DependencyNode, 'id'>): string {
    const id = this.generateNodeId(node);
    if (!this.nodes.has(id)) {
      this.nodes.set(id, { ...node, id });
    }
    return id;
  }

  private addEdge(edge: Omit<DependencyEdge, 'id'>): void {
    const id = `${edge.from}-${edge.to}-${edge.type}`;
    if (!this.edges.has(id)) {
      this.edges.set(id, edge);
    }
  }

  private generateNodeId(node: Omit<DependencyNode, 'id'>): string {
    return `${node.type}:${node.name}${node.path ? `:${node.path}` : ''}`;
  }

  private findParentFunction(node: ts.Node): ts.FunctionDeclaration | ts.MethodDeclaration | null {
    let current = node;
    while (current) {
      if (ts.isFunctionDeclaration(current) || ts.isMethodDeclaration(current)) {
        return current;
      }
      current = current.parent;
    }
    return null;
  }

  private findTypeReferences(node: ts.Node): string[] {
    const refs = new Set<string>();

    const visit = (node: ts.Node) => {
      if (ts.isTypeReferenceNode(node)) {
        refs.add(node.typeName.getText());
      }
      ts.forEachChild(node, visit);
    };

    visit(node);
    return Array.from(refs);
  }

  private resolveImportPath(moduleSpecifier: string, sourceFilePath: string): string {
    if (this.isPackageDependency(moduleSpecifier)) {
      return moduleSpecifier;
    }
    return join(dirname(sourceFilePath), moduleSpecifier);
  }

  private isPackageDependency(moduleSpecifier: string): boolean {
    return !moduleSpecifier.startsWith('.') && !moduleSpecifier.startsWith('/');
  }

  private getPackageVersion(packageName: string): string | undefined {
    try {
      const packageJsonPath = require.resolve(`${packageName}/package.json`);
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      return packageJson.version;
    } catch {
      return undefined;
    }
  }
}