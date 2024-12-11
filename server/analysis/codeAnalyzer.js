const esprima = require('esprima');
const estraverse = require('estraverse');
const acorn = require('acorn');
const fs = require('fs').promises;
const path = require('path');
const { parse: parseTS } = require('@typescript-eslint/typescript-estree');

class CodeAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.patterns = new Map();
        this.vulnerabilities = new Set();
        this.apiUsage = new Map();
    }

    async analyzeFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        const isTypeScript = /\.(ts|tsx)$/.test(filePath);

        try {
            const ast = this.parseCode(content, isTypeScript);
            return {
                patterns: await this.detectPatterns(ast),
                security: await this.analyzeSecurityVulnerabilities(ast),
                complexity: this.calculateComplexityMetrics(ast, content),
                apiUsage: await this.trackAPIUsage(ast),
                refactoring: await this.suggestRefactoring(ast)
            };
        } catch (error) {
            console.error(`Error analyzing file ${filePath}:`, error.message);
            return {
                patterns: { singletons: [], factories: [], observers: [], antiPatterns: [] },
                security: [],
                complexity: { cyclomaticComplexity: 0, functionCount: 0, lineCount: 0, conditionalCount: 0 },
                apiUsage: { openai: { endpoints: {}, totalCalls: 0 } },
                refactoring: []
            };
        }
    }

    parseCode(code, isTypeScript) {
        try {
            if (isTypeScript) {
                return parseTS(code, {
                    jsx: true,
                    range: true,
                    loc: true,
                    tokens: true,
                    comment: true,
                    useJSXTextNode: true,
                    errorOnUnknownASTType: false
                });
            }
            return esprima.parseScript(code, {
                loc: true,
                range: true,
                comment: true,
                tokens: true,
                jsx: true
            });
        } catch (error) {
            console.error('Parsing error:', error.message);
            // Fallback to a simpler AST if parsing fails
            return {
                type: 'Program',
                body: [],
                sourceType: 'module',
                loc: { start: { line: 1, column: 0 }, end: { line: 1, column: 0 } }
            };
        }
    }

    async detectPatterns(ast) {
        const patterns = {
            singletons: [],
            factories: [],
            observers: [],
            antiPatterns: []
        };

        try {
            estraverse.traverse(ast, {
                enter: (node) => {
                    if (this.isSingleton(node)) {
                        patterns.singletons.push(this.extractPatternInfo(node));
                    }
                    if (this.isFactory(node)) {
                        patterns.factories.push(this.extractPatternInfo(node));
                    }
                    if (this.isObserver(node)) {
                        patterns.observers.push(this.extractPatternInfo(node));
                    }
                    if (this.isAntiPattern(node)) {
                        patterns.antiPatterns.push(this.extractAntiPatternInfo(node));
                    }
                }
            });
        } catch (error) {
            console.error('Error detecting patterns:', error.message);
        }

        return patterns;
    }

    async analyzeSecurityVulnerabilities(ast) {
        const vulnerabilities = [];

        try {
            estraverse.traverse(ast, {
                enter: (node) => {
                    if (this.isEvalUsage(node)) {
                        vulnerabilities.push({
                            type: 'eval-usage',
                            severity: 'high',
                            line: node.loc?.start.line
                        });
                    }

                    if (this.isUnsafeRegExp(node)) {
                        vulnerabilities.push({
                            type: 'unsafe-regexp',
                            severity: 'medium',
                            line: node.loc?.start.line
                        });
                    }

                    if (this.containsHardcodedSecrets(node)) {
                        vulnerabilities.push({
                            type: 'hardcoded-secret',
                            severity: 'critical',
                            line: node.loc?.start.line
                        });
                    }

                    if (this.hasUnsafeAssignment(node)) {
                        vulnerabilities.push({
                            type: 'unsafe-assignment',
                            severity: 'high',
                            line: node.loc?.start.line
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error analyzing security:', error.message);
        }

        return vulnerabilities;
    }

    calculateComplexityMetrics(ast, sourceCode) {
        const complexity = {
            cyclomaticComplexity: 0,
            functionCount: 0,
            lineCount: sourceCode.split('\n').length,
            conditionalCount: 0,
            maxNestingDepth: 0
        };

        try {
            let currentNestingDepth = 0;

            estraverse.traverse(ast, {
                enter: (node) => {
                    // Track function declarations and expressions
                    if (this.isFunction(node)) {
                        complexity.functionCount++;
                    }

                    // Track conditional statements and expressions
                    if (this.isConditional(node)) {
                        complexity.conditionalCount++;
                        complexity.cyclomaticComplexity++;
                    }

                    // Track nesting depth
                    if (this.increasesNestingDepth(node)) {
                        currentNestingDepth++;
                        complexity.maxNestingDepth = Math.max(complexity.maxNestingDepth, currentNestingDepth);
                    }
                },
                leave: (node) => {
                    if (this.increasesNestingDepth(node)) {
                        currentNestingDepth--;
                    }
                }
            });
        } catch (error) {
            console.error('Error calculating complexity:', error.message);
        }

        return complexity;
    }

    async trackAPIUsage(ast) {
        const apiCalls = new Map();

        try {
            estraverse.traverse(ast, {
                enter: (node) => {
                    if (this.isOpenAIAPICall(node)) {
                        const endpoint = this.extractEndpoint(node);
                        apiCalls.set(endpoint, (apiCalls.get(endpoint) || 0) + 1);
                    }
                }
            });
        } catch (error) {
            console.error('Error tracking API usage:', error.message);
        }

        return {
            openai: {
                endpoints: Object.fromEntries(apiCalls),
                totalCalls: Array.from(apiCalls.values()).reduce((a, b) => a + b, 0)
            }
        };
    }

    async suggestRefactoring(ast) {
        const suggestions = [];

        try {
            estraverse.traverse(ast, {
                enter: (node) => {
                    if (this.isFunction(node)) {
                        const complexity = this.calculateFunctionComplexity(node);
                        if (complexity > 10) {
                            suggestions.push({
                                type: 'high-complexity',
                                location: node.loc,
                                message: `Function has high complexity (${complexity}). Consider breaking it down.`
                            });
                        }
                    }

                    if (this.hasCodeDuplication(node)) {
                        suggestions.push({
                            type: 'duplication',
                            location: node.loc,
                            message: 'Potential code duplication detected. Consider extracting common logic.'
                        });
                    }

                    if (this.hasLongParameterList(node)) {
                        suggestions.push({
                            type: 'long-parameter-list',
                            location: node.loc,
                            message: 'Function has too many parameters. Consider using an options object.'
                        });
                    }
                }
            });
        } catch (error) {
            console.error('Error suggesting refactoring:', error.message);
        }

        return suggestions;
    }

    // Helper methods
    isFunction(node) {
        return node.type === 'FunctionDeclaration' ||
               node.type === 'FunctionExpression' ||
               node.type === 'ArrowFunctionExpression' ||
               node.type === 'MethodDefinition';
    }

    isConditional(node) {
        return node.type === 'IfStatement' ||
               node.type === 'ConditionalExpression' ||
               node.type === 'SwitchCase' ||
               node.type === 'LogicalExpression' ||
               node.type === 'WhileStatement' ||
               node.type === 'DoWhileStatement' ||
               node.type === 'ForStatement';
    }

    increasesNestingDepth(node) {
        return node.type === 'BlockStatement' ||
               node.type === 'IfStatement' ||
               node.type === 'WhileStatement' ||
               node.type === 'ForStatement' ||
               node.type === 'ForInStatement' ||
               node.type === 'ForOfStatement' ||
               node.type === 'DoWhileStatement';
    }

    isEvalUsage(node) {
        return node.type === 'CallExpression' &&
               node.callee?.name === 'eval';
    }

    isOpenAIAPICall(node) {
        return node.type === 'CallExpression' &&
               node.callee?.type === 'MemberExpression' &&
               node.callee?.object?.name === 'openai';
    }

    extractEndpoint(node) {
        return node.callee?.property?.name;
    }

    isSingleton(node) {
        if (node.type !== 'ClassDeclaration') return false;

        let hasPrivateConstructor = false;
        let hasStaticInstance = false;

        try {
            estraverse.traverse(node, {
                enter: (child) => {
                    if (child.type === 'MethodDefinition' && child.key.name === 'constructor') {
                        hasPrivateConstructor = child.accessibility === 'private';
                    }
                    if (child.type === 'PropertyDefinition' && child.static && child.key.name === 'instance') {
                        hasStaticInstance = true;
                    }
                }
            });
        } catch (error) {
            console.error('Error checking singleton pattern:', error.message);
        }

        return hasPrivateConstructor && hasStaticInstance;
    }

    isFactory(node) {
        if (node.type !== 'ClassDeclaration') return false;

        try {
            return node.body.body.some(method =>
                method.type === 'MethodDefinition' &&
                method.static &&
                method.key.name.startsWith('create'));
        } catch (error) {
            console.error('Error checking factory pattern:', error.message);
            return false;
        }
    }

    isObserver(node) {
        if (node.type !== 'ClassDeclaration') return false;

        let hasObservers = false;
        let hasNotifyMethod = false;

        try {
            estraverse.traverse(node, {
                enter: (child) => {
                    if (child.type === 'PropertyDefinition' && child.key.name === 'observers') {
                        hasObservers = true;
                    }
                    if (child.type === 'MethodDefinition' &&
                        (child.key.name === 'notify' || child.key.name === 'notifyObservers')) {
                        hasNotifyMethod = true;
                    }
                }
            });
        } catch (error) {
            console.error('Error checking observer pattern:', error.message);
        }

        return hasObservers && hasNotifyMethod;
    }

    isAntiPattern(node) {
        return this.hasGodObject(node) ||
               this.hasGlobalState(node) ||
               this.hasTightCoupling(node);
    }

    hasGodObject(node) {
        if (node.type !== 'ClassDeclaration') return false;
        try {
            const methodCount = node.body.body.filter(m => m.type === 'MethodDefinition').length;
            return methodCount > 15;
        } catch (error) {
            console.error('Error checking god object:', error.message);
            return false;
        }
    }

    hasGlobalState(node) {
        try {
            return node.type === 'VariableDeclaration' &&
                   node.declarations.some(d => d.init?.type === 'ObjectExpression') &&
                   node.parent?.type === 'Program';
        } catch (error) {
            console.error('Error checking global state:', error.message);
            return false;
        }
    }

    hasTightCoupling(node) {
        if (node.type !== 'ClassDeclaration') return false;
        let dependencyCount = 0;

        try {
            estraverse.traverse(node, {
                enter: (child) => {
                    if (child.type === 'NewExpression' ||
                        (child.type === 'MemberExpression' && child.object?.type === 'Identifier')) {
                        dependencyCount++;
                    }
                }
            });
        } catch (error) {
            console.error('Error checking coupling:', error.message);
        }

        return dependencyCount > 10;
    }

    isUnsafeRegExp(node) {
        try {
            return node.type === 'NewExpression' &&
                   node.callee?.name === 'RegExp' &&
                   node.arguments?.some(arg =>
                       arg.type === 'Literal' &&
                       /^.*\*+.*$/.test(arg.value));
        } catch (error) {
            console.error('Error checking unsafe RegExp:', error.message);
            return false;
        }
    }

    containsHardcodedSecrets(node) {
        const secretPatterns = [
            /api[_-]?key/i,
            /auth[_-]?token/i,
            /password/i,
            /secret/i
        ];

        try {
            return node.type === 'VariableDeclarator' &&
                   node.id?.name &&
                   secretPatterns.some(pattern => pattern.test(node.id.name)) &&
                   node.init?.type === 'Literal';
        } catch (error) {
            console.error('Error checking hardcoded secrets:', error.message);
            return false;
        }
    }

    hasUnsafeAssignment(node) {
        try {
            return node.type === 'AssignmentExpression' &&
                   node.operator === '=' &&
                   node.left?.type === 'MemberExpression' &&
                   node.left?.object?.name === 'window';
        } catch (error) {
            console.error('Error checking unsafe assignment:', error.message);
            return false;
        }
    }

    calculateFunctionComplexity(node) {
        let complexity = 1;

        try {
            estraverse.traverse(node, {
                enter: (child) => {
                    if (this.isConditional(child)) {
                        complexity++;
                    }
                }
            });
        } catch (error) {
            console.error('Error calculating function complexity:', error.message);
        }

        return complexity;
    }

    hasCodeDuplication(node) {
        if (node.type !== 'BlockStatement') return false;

        try {
            const subtrees = new Map();
            let hasDuplication = false;

            estraverse.traverse(node, {
                enter: (child) => {
                    if (child.type === 'BlockStatement') {
                        const subtreeHash = JSON.stringify(child);
                        if (subtrees.has(subtreeHash)) {
                            hasDuplication = true;
                        } else {
                            subtrees.set(subtreeHash, true);
                        }
                    }
                }
            });

            return hasDuplication;
        } catch (error) {
            console.error('Error checking code duplication:', error.message);
            return false;
        }
    }

    hasLongParameterList(node) {
        try {
            if (this.isFunction(node)) {
                const params = node.params || [];
                return params.length > 4;
            }
            return false;
        } catch (error) {
            console.error('Error checking parameter list:', error.message);
            return false;
        }
    }

    extractPatternInfo(node) {
        try {
            return {
                type: node.type,
                name: node.id?.name || 'Anonymous',
                location: node.loc,
                details: this.getPatternDetails(node)
            };
        } catch (error) {
            console.error('Error extracting pattern info:', error.message);
            return {
                type: 'unknown',
                name: 'unknown',
                location: null,
                details: {}
            };
        }
    }

    extractAntiPatternInfo(node) {
        try {
            return {
                type: this.getAntiPatternType(node),
                name: node.id?.name || 'Anonymous',
                location: node.loc,
                severity: 'warning',
                suggestion: this.getAntiPatternSuggestion(node)
            };
        } catch (error) {
            console.error('Error extracting anti-pattern info:', error.message);
            return {
                type: 'unknown',
                name: 'unknown',
                location: null,
                severity: 'unknown',
                suggestion: ''
            };
        }
    }

    getPatternDetails(node) {
        const details = {};

        try {
            if (node.type === 'ClassDeclaration') {
                details.methods = node.body.body
                    .filter(m => m.type === 'MethodDefinition')
                    .map(m => ({
                        name: m.key.name,
                        static: m.static,
                        kind: m.kind
                    }));
            }
        } catch (error) {
            console.error('Error getting pattern details:', error.message);
        }

        return details;
    }

    getAntiPatternType(node) {
        try {
            if (this.hasGodObject(node)) return 'god-object';
            if (this.hasGlobalState(node)) return 'global-state';
            if (this.hasTightCoupling(node)) return 'tight-coupling';
            return 'unknown';
        } catch (error) {
            console.error('Error getting anti-pattern type:', error.message);
            return 'unknown';
        }
    }

    getAntiPatternSuggestion(node) {
        try {
            switch (this.getAntiPatternType(node)) {
                case 'god-object':
                    return 'Consider breaking this class into smaller, more focused classes';
                case 'global-state':
                    return 'Consider using dependency injection or a proper state management solution';
                case 'tight-coupling':
                    return 'Consider using dependency injection and interfaces to reduce coupling';
                default:
                    return 'Consider reviewing this code for potential improvements';
            }
        } catch (error) {
            console.error('Error getting anti-pattern suggestion:', error.message);
            return 'Consider reviewing this code';
        }
    }
}

module.exports = CodeAnalyzer;