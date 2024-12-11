const BaseAnalyzer = require('../core/BaseAnalyzer');
const t = require('@babel/types');

class ComplexityAnalyzer extends BaseAnalyzer {
    constructor(projectRoot) {
        super(projectRoot);
        this.metrics = this.getEmptyMetrics();
    }

    getEmptyMetrics() {
        return {
            cyclomaticComplexity: 0,
            halsteadMetrics: {
                operators: new Set(),
                operands: new Set(),
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
            functionMetrics: [],
            classMetrics: [],
            lineMetrics: {
                total: 0,
                code: 0,
                comment: 0,
                blank: 0,
                commentRatio: 0
            },
            cognitiveComplexity: 0
        };
    }

    async analyze(ast, code) {
        try {
            this.code = code;
            this.resetMetrics();
            this.nestingLevel = 0;

            // Calculate line metrics
            this.calculateLineMetrics(code);

            // Traverse AST for complexity metrics
            this.traverseAST(ast, {
                enter: (path) => {
                    this.updateHalsteadMetrics(path.node);
                    this.updateCognitiveComplexity(path);

                    if (this.isDecisionPoint(path.node)) {
                        this.metrics.cyclomaticComplexity++;
                    }
                },

                FunctionDeclaration: (path) => {
                    const functionMetrics = this.analyzeFunctionComplexity(path);
                    this.metrics.functionMetrics.push(functionMetrics);
                },

                ArrowFunctionExpression: (path) => {
                    const functionMetrics = this.analyzeFunctionComplexity(path);
                    this.metrics.functionMetrics.push(functionMetrics);
                },

                ClassDeclaration: (path) => {
                    const classMetrics = this.analyzeClassComplexity(path);
                    this.metrics.classMetrics.push(classMetrics);
                }
            });

            // Calculate derived metrics
            this.calculateHalsteadMetrics();
            this.calculateMaintainabilityIndex();

            return this.metrics;
        } catch (error) {
            console.error('Error analyzing complexity:', error);
            return null;
        }
    }

    resetMetrics() {
        this.metrics = this.getEmptyMetrics();
    }

    calculateLineMetrics(code) {
        const lines = code.split('\n');
        const metrics = this.metrics.lineMetrics;

        metrics.total = lines.length;
        metrics.blank = lines.filter(line => line.trim() === '').length;

        let inMultilineComment = false;
        lines.forEach(line => {
            const trimmed = line.trim();

            // Handle multiline comments
            if (trimmed.startsWith('/*')) inMultilineComment = true;
            if (trimmed.endsWith('*/')) {
                inMultilineComment = false;
                metrics.comment++;
                return;
            }
            if (inMultilineComment) {
                metrics.comment++;
                return;
            }

            // Handle single line comments
            if (trimmed.startsWith('//')) {
                metrics.comment++;
                return;
            }

            // Code lines
            if (trimmed !== '') {
                metrics.code++;
            }
        });

        metrics.commentRatio = metrics.comment / metrics.total;
    }

    updateCognitiveComplexity(path) {
        const node = path.node;
        let increment = 0;

        // Basic complexity increment
        if (this.isDecisionPoint(node)) {
            increment = 1;
        }

        // Nesting level multiplier
        if (this.isNestingNode(node)) {
            this.nestingLevel++;
            increment *= this.nestingLevel;
        }

        // Structural complexity
        if (t.isSwitchStatement(node)) {
            increment += node.cases.length - 1;
        }

        this.metrics.cognitiveComplexity += increment;

        // Reset nesting level after processing block
        if (this.isNestingNode(node)) {
            this.nestingLevel--;
        }
    }

    isNestingNode(node) {
        return t.isIfStatement(node) ||
               t.isWhileStatement(node) ||
               t.isForStatement(node) ||
               t.isForInStatement(node) ||
               t.isForOfStatement(node) ||
               t.isDoWhileStatement(node);
    }

    analyzeFunctionComplexity(path) {
        const node = path.node;
        const functionMetrics = {
            name: this.getFunctionName(node),
            cyclomaticComplexity: 1,
            parameterCount: node.params.length,
            lineCount: node.loc ? node.loc.end.line - node.loc.start.line + 1 : 0,
            cognitiveComplexity: 0
        };

        // Calculate function-specific cyclomatic complexity
        path.traverse({
            enter: (childPath) => {
                if (this.isDecisionPoint(childPath.node)) {
                    functionMetrics.cyclomaticComplexity++;
                }
                if (this.isNestingNode(childPath.node)) {
                    functionMetrics.cognitiveComplexity++;
                }
            }
        });

        return functionMetrics;
    }

    getFunctionName(node) {
        if (t.isIdentifier(node.id)) {
            return node.id.name;
        }
        if (t.isObjectMethod(node)) {
            return node.key.name;
        }
        return 'anonymous';
    }

    analyzeClassComplexity(path) {
        const node = path.node;
        const metrics = {
            name: node.id ? node.id.name : 'anonymous',
            methodCount: 0,
            propertyCount: 0,
            inheritance: {
                depth: 0,
                superClasses: []
            },
            weightedMethodCount: 0
        };

        // Count methods and properties
        path.traverse({
            ClassMethod: (methodPath) => {
                metrics.methodCount++;
                metrics.weightedMethodCount += this.calculateMethodComplexity(methodPath);
            },
            ClassProperty: () => metrics.propertyCount++
        });

        // Calculate inheritance depth
        let currentClass = node;
        while (currentClass.superClass) {
            metrics.inheritance.depth++;
            if (t.isIdentifier(currentClass.superClass)) {
                metrics.inheritance.superClasses.push(currentClass.superClass.name);
            }
            currentClass = currentClass.superClass;
        }

        return metrics;
    }

    calculateMethodComplexity(path) {
        let complexity = 1;
        path.traverse({
            enter: (childPath) => {
                if (this.isDecisionPoint(childPath.node)) {
                    complexity++;
                }
            }
        });
        return complexity;
    }

    calculateHalsteadMetrics() {
        const h = this.metrics.halsteadMetrics;
        const n1 = h.operators.size;  // unique operators
        const n2 = h.operands.size;   // unique operands
        const N1 = h.totalOperators;  // total operators
        const N2 = h.totalOperands;   // total operands

        h.vocabulary = n1 + n2;
        h.length = N1 + N2;
        h.volume = h.length * Math.log2(h.vocabulary || 1);
        h.difficulty = (n1 / 2) * (N2 / (n2 || 1));
        h.effort = h.difficulty * h.volume;
        h.time = h.effort / 18;  // Halstead's constant for mental discriminations per second
        h.bugs = h.volume / 3000;  // Halstead's bug prediction metric
    }

    isDecisionPoint(node) {
        return t.isIfStatement(node) ||
               t.isConditionalExpression(node) ||
               t.isSwitchCase(node) ||
               t.isForStatement(node) ||
               t.isWhileStatement(node) ||
               t.isDoWhileStatement(node) ||
               t.isCatchClause(node) ||
               t.isLogicalExpression(node, { operator: '&&' }) ||
               t.isLogicalExpression(node, { operator: '||' });
    }

    updateHalsteadMetrics(node) {
        if (t.isBinaryExpression(node) || t.isLogicalExpression(node)) {
            this.metrics.halsteadMetrics.operators.add(node.operator);
            this.metrics.halsteadMetrics.totalOperators++;
        }

        if (t.isIdentifier(node)) {
            this.metrics.halsteadMetrics.operands.add(node.name);
            this.metrics.halsteadMetrics.totalOperands++;
        }

        if (t.isLiteral(node)) {
            this.metrics.halsteadMetrics.operands.add(String(node.value));
            this.metrics.halsteadMetrics.totalOperands++;
        }
    }

    calculateMaintainabilityIndex() {
        const { halsteadMetrics, cyclomaticComplexity, lineMetrics } = this.metrics;

        // Calculate Maintainability Index using the standard formula
        this.metrics.maintainabilityIndex = Math.max(0, Math.min(100, (
            171 -
            5.2 * Math.log(halsteadMetrics.volume || 1) -
            0.23 * cyclomaticComplexity -
            16.2 * Math.log(lineMetrics.code || 1) +
            50 * Math.sin(Math.sqrt(2.4 * lineMetrics.commentRatio))
        )));
    }

    getComplexityLevel(value) {
        if (value <= 10) return 'low';
        if (value <= 20) return 'moderate';
        if (value <= 50) return 'high';
        return 'very-high';
    }

    getMaintainabilityLevel(value) {
        if (value >= 85) return 'excellent';
        if (value >= 65) return 'good';
        if (value >= 40) return 'fair';
        return 'poor';
    }
}

module.exports = ComplexityAnalyzer;