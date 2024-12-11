const fs = require('fs').promises;
const path = require('path');
const BaseAnalyzer = require('./core/BaseAnalyzer');
const PatternAnalyzer = require('./analyzers/PatternAnalyzer');
const SecurityAnalyzer = require('./analyzers/SecurityAnalyzer');
const APIAnalyzer = require('./analyzers/APIAnalyzer');
const DependencyAnalyzer = require('./analyzers/DependencyAnalyzer');
const ComplexityAnalyzer = require('./analyzers/ComplexityAnalyzer');

class CodeAnalyzer extends BaseAnalyzer {
    constructor(projectRoot) {
        super(projectRoot);
        this.patternAnalyzer = new PatternAnalyzer(projectRoot);
        this.securityAnalyzer = new SecurityAnalyzer(projectRoot);
        this.apiAnalyzer = new APIAnalyzer(projectRoot);
        this.dependencyAnalyzer = new DependencyAnalyzer(projectRoot);
        this.complexityAnalyzer = new ComplexityAnalyzer(projectRoot);
    }

    async analyzeFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const isTypeScript = /\.(ts|tsx)$/.test(filePath);

        try {
            const ast = this.parseCode(content, isTypeScript);
            if (!ast) return this.getEmptyAnalysis();

            const [patterns, security, apiUsage, dependencies, complexity] = await Promise.all([
                this.patternAnalyzer.analyze(ast, isTypeScript),
                this.securityAnalyzer.analyze(ast, isTypeScript),
                this.apiAnalyzer.analyze(ast, isTypeScript),
                this.dependencyAnalyzer.analyze(ast, filePath),
                this.complexityAnalyzer.analyze(ast, content)
            ]);

            return {
                filePath,
                patterns,
                security,
                apiUsage,
                dependencies,
                complexity,
                refactoring: this.generateRefactoringSuggestions(patterns, security, complexity)
            };
        } catch (error) {
            console.error(`Error analyzing file ${filePath}:`, error.message);
            return this.getEmptyAnalysis();
        }
    }

    generateRefactoringSuggestions(patterns, security, complexity) {
        const suggestions = [];

        // Add suggestions based on patterns
        if (patterns.antiPatterns.length > 0) {
            suggestions.push(...patterns.antiPatterns.map(ap => ({
                type: 'AntiPattern',
                priority: 'high',
                location: ap.location,
                message: ap.message
            })));
        }

        // Add suggestions based on security issues
        security.forEach(issue => {
            if (issue.severity === 'critical' || issue.severity === 'high') {
                suggestions.push({
                    type: 'Security',
                    priority: issue.severity,
                    location: issue.location,
                    message: issue.message
                });
            }
        });

        // Add suggestions based on complexity metrics
        if (complexity) {
            if (complexity.cyclomaticComplexity > 20) {
                suggestions.push({
                    type: 'Complexity',
                    priority: 'high',
                    message: `High cyclomatic complexity (${complexity.cyclomaticComplexity}). Consider breaking down the code.`
                });
            }

            if (complexity.maintainabilityIndex < 65) {
                suggestions.push({
                    type: 'Maintainability',
                    priority: 'medium',
                    message: `Low maintainability index (${complexity.maintainabilityIndex.toFixed(2)}). Consider improving code structure and documentation.`
                });
            }

            complexity.functionMetrics
                .filter(fn => fn.cyclomaticComplexity > 10)
                .forEach(fn => {
                    suggestions.push({
                        type: 'FunctionComplexity',
                        priority: 'medium',
                        message: `Function "${fn.name}" has high complexity (${fn.cyclomaticComplexity}). Consider refactoring.`
                    });
                });
        }

        return suggestions;
    }

    async generateReport(results) {
        const summary = this.summarizeResults(results);
        const recommendations = this.generateRecommendations(results);
        const dependencyGraph = this.generateDependencyGraph(results);

        return {
            summary,
            recommendations,
            dependencyGraph,
            details: results
        };
    }

    summarizeResults(results) {
        const summary = {
            patterns: {
                singletons: 0,
                factories: 0,
                observers: 0,
                antiPatterns: 0
            },
            security: {
                critical: 0,
                high: 0,
                medium: 0,
                low: 0
            },
            apiUsage: {
                openai: {
                    totalCalls: 0,
                    uniqueEndpoints: 0
                },
                typescript: {
                    totalUsage: 0
                }
            },
            complexity: {
                averageCyclomaticComplexity: 0,
                averageMaintainabilityIndex: 0,
                totalLines: 0,
                totalFunctions: 0
            },
            dependencies: {
                totalFiles: 0,
                circularDependencies: 0,
                orphanedFiles: 0
            }
        };

        results.forEach(result => {
            // Summarize patterns
            Object.keys(summary.patterns).forEach(pattern => {
                summary.patterns[pattern] += result.patterns[pattern]?.length || 0;
            });

            // Summarize security issues
            result.security.forEach(issue => {
                summary.security[issue.severity] =
                    (summary.security[issue.severity] || 0) + 1;
            });

            // Summarize API usage
            summary.apiUsage.openai.totalCalls += result.apiUsage.openai.totalCalls;
            summary.apiUsage.openai.uniqueEndpoints =
                Object.keys(result.apiUsage.openai.endpoints).length;
            summary.apiUsage.typescript.totalUsage +=
                result.apiUsage.typescript.totalUsage;

            // Summarize complexity metrics
            if (result.complexity) {
                summary.complexity.averageCyclomaticComplexity +=
                    result.complexity.cyclomaticComplexity;
                summary.complexity.averageMaintainabilityIndex +=
                    result.complexity.maintainabilityIndex;
                summary.complexity.totalLines += result.complexity.lineCount;
                summary.complexity.totalFunctions +=
                    result.complexity.functionMetrics.length;
            }

            // Summarize dependencies
            if (result.dependencies) {
                summary.dependencies.totalFiles++;
                summary.dependencies.circularDependencies +=
                    result.dependencies.circular.length;
                summary.dependencies.orphanedFiles +=
                    result.dependencies.orphaned.length;
            }
        });

        // Calculate averages
        const fileCount = results.length;
        if (fileCount > 0) {
            summary.complexity.averageCyclomaticComplexity /= fileCount;
            summary.complexity.averageMaintainabilityIndex /= fileCount;
        }

        return summary;
    }

    generateRecommendations(results) {
        const recommendations = [];

        // Analyze pattern distribution
        const totalPatterns = results.reduce((sum, result) =>
            sum + Object.values(result.patterns).flat().length, 0);

        if (totalPatterns > 20) {
            recommendations.push({
                type: 'Architecture',
                priority: 'medium',
                message: 'Consider documenting architectural patterns for better maintainability'
            });
        }

        // Analyze security issues
        const criticalIssues = results.reduce((sum, result) =>
            sum + result.security.filter(i => i.severity === 'critical').length, 0);

        if (criticalIssues > 0) {
            recommendations.push({
                type: 'Security',
                priority: 'critical',
                message: `Found ${criticalIssues} critical security issues that need immediate attention`
            });
        }

        // Analyze API usage
        const totalAPICalls = results.reduce((sum, result) =>
            sum + result.apiUsage.openai.totalCalls, 0);

        if (totalAPICalls > 100) {
            recommendations.push({
                type: 'API Usage',
                priority: 'high',
                message: 'High number of API calls detected. Consider implementing caching or rate limiting'
            });
        }

        // Analyze complexity
        const complexFiles = results.filter(result =>
            result.complexity?.cyclomaticComplexity > 20 ||
            result.complexity?.maintainabilityIndex < 65
        );

        if (complexFiles.length > 0) {
            recommendations.push({
                type: 'Complexity',
                priority: 'high',
                message: `${complexFiles.length} files have high complexity. Consider refactoring.`
            });
        }

        // Analyze dependencies
        const circularDeps = results.reduce((sum, result) =>
            sum + (result.dependencies?.circular.length || 0), 0);

        if (circularDeps > 0) {
            recommendations.push({
                type: 'Dependencies',
                priority: 'high',
                message: `Found ${circularDeps} circular dependencies. Consider restructuring the code.`
            });
        }

        return recommendations;
    }

    generateDependencyGraph(results) {
        const nodes = new Set();
        const edges = [];
        const circular = new Set();
        const orphaned = new Set();

        results.forEach(result => {
            if (result.dependencies) {
                // Add nodes
                nodes.add(result.filePath);
                Object.keys(result.dependencies.imports).forEach(file => nodes.add(file));
                Object.keys(result.dependencies.exports).forEach(file => nodes.add(file));

                // Add edges
                Object.entries(result.dependencies.imports).forEach(([source, targets]) => {
                    targets.forEach(target => {
                        edges.push({ source, target });
                    });
                });

                // Track circular dependencies
                result.dependencies.circular.forEach(([a, b]) => {
                    circular.add(JSON.stringify([a, b].sort()));
                });

                // Track orphaned files
                result.dependencies.orphaned.forEach(file => orphaned.add(file));
            }
        });

        return {
            nodes: Array.from(nodes).map(id => ({
                id,
                orphaned: orphaned.has(id)
            })),
            edges: edges.map(edge => ({
                ...edge,
                circular: circular.has(JSON.stringify([edge.source, edge.target].sort()))
            }))
        };
    }
}

module.exports = CodeAnalyzer;