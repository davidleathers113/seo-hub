const BaseAnalyzer = require('../core/BaseAnalyzer');
const t = require('@babel/types');

class SecurityAnalyzer extends BaseAnalyzer {
    constructor(projectRoot) {
        super(projectRoot);
        this.vulnerabilities = [];
    }

    async analyze(ast, isTypeScript) {
        try {
            this.traverseNode(ast, {
                enter: (path) => {
                    if (this.isTypeScriptNode(path.node) && isTypeScript) {
                        this.checkTypeScriptSecurity(path);
                    } else {
                        this.checkJavaScriptSecurity(path);
                    }
                }
            });
        } catch (error) {
            console.error('Error analyzing security:', error.message);
        }

        return this.vulnerabilities;
    }

    checkTypeScriptSecurity(path) {
        const node = path.node;

        if (t.isTSAnyKeyword(node)) {
            this.vulnerabilities.push({
                severity: 'high',
                type: 'TypeSafety',
                location: node.loc,
                message: 'Usage of "any" type reduces type safety'
            });
        }
        else if (t.isTSAsExpression(node)) {
            this.vulnerabilities.push({
                severity: 'medium',
                type: 'TypeAssertion',
                location: node.loc,
                message: 'Type assertion may bypass type checking'
            });
        }
    }

    checkJavaScriptSecurity(path) {
        const node = path.node;

        if (this.isEvalUsage(node)) {
            this.vulnerabilities.push({
                type: 'eval-usage',
                severity: 'critical',
                location: node.loc,
                message: 'Dangerous use of eval detected'
            });
        }

        if (this.isUnsafeRegExp(node)) {
            this.vulnerabilities.push({
                type: 'unsafe-regexp',
                severity: 'high',
                location: node.loc,
                message: 'Potentially unsafe regular expression'
            });
        }

        if (this.containsHardcodedSecrets(node)) {
            this.vulnerabilities.push({
                type: 'hardcoded-secret',
                severity: 'critical',
                location: node.loc,
                message: 'Hardcoded secret or credential detected'
            });
        }

        if (this.hasUnsafeAssignment(node)) {
            this.vulnerabilities.push({
                type: 'unsafe-assignment',
                severity: 'high',
                location: node.loc,
                message: 'Unsafe assignment could lead to prototype pollution'
            });
        }

        if (this.isSQLInjectionRisk(node)) {
            this.vulnerabilities.push({
                type: 'sql-injection',
                severity: 'critical',
                location: node.loc,
                message: 'Potential SQL injection risk detected'
            });
        }

        if (this.isXSSRisk(node)) {
            this.vulnerabilities.push({
                type: 'xss-risk',
                severity: 'high',
                location: node.loc,
                message: 'Potential XSS vulnerability detected'
            });
        }
    }

    isEvalUsage(node) {
        return (
            t.isCallExpression(node) &&
            t.isIdentifier(node.callee) &&
            node.callee.name === 'eval'
        );
    }

    isUnsafeRegExp(node) {
        return (
            t.isNewExpression(node) &&
            t.isIdentifier(node.callee) &&
            node.callee.name === 'RegExp' &&
            node.arguments.length > 0 &&
            t.isIdentifier(node.arguments[0])
        );
    }

    containsHardcodedSecrets(node) {
        const secretPatterns = [
            /password/i,
            /secret/i,
            /api[_-]?key/i,
            /auth[_-]?token/i,
            /credentials/i
        ];

        return (
            t.isVariableDeclarator(node) &&
            t.isIdentifier(node.id) &&
            secretPatterns.some(pattern => pattern.test(node.id.name)) &&
            t.isLiteral(node.init)
        );
    }

    hasUnsafeAssignment(node) {
        return (
            t.isAssignmentExpression(node) &&
            t.isMemberExpression(node.left) &&
            t.isIdentifier(node.left.object) &&
            node.left.object.name === 'Object' &&
            t.isIdentifier(node.left.property) &&
            node.left.property.name === 'prototype'
        );
    }

    isSQLInjectionRisk(node) {
        return (
            t.isCallExpression(node) &&
            t.isMemberExpression(node.callee) &&
            t.isIdentifier(node.callee.property) &&
            ['query', 'execute'].includes(node.callee.property.name) &&
            node.arguments.length > 0 &&
            this.containsUserInput(node.arguments[0])
        );
    }

    isXSSRisk(node) {
        const dangerousProps = ['innerHTML', 'dangerouslySetInnerHTML'];
        return (
            t.isAssignmentExpression(node) &&
            t.isMemberExpression(node.left) &&
            t.isIdentifier(node.left.property) &&
            dangerousProps.includes(node.left.property.name)
        );
    }

    containsUserInput(node) {
        // Check if the expression contains user input (e.g., request parameters)
        const userInputSources = [
            'req.body',
            'req.query',
            'req.params',
            'request.body',
            'request.query',
            'request.params'
        ];

        let containsUserInput = false;
        this.traverseNode(node, {
            enter: (path) => {
                if (t.isMemberExpression(path.node)) {
                    const source = this.getFullMemberExpression(path.node);
                    if (userInputSources.includes(source)) {
                        containsUserInput = true;
                    }
                }
            }
        });

        return containsUserInput;
    }

    getFullMemberExpression(node) {
        const parts = [];
        let current = node;

        while (t.isMemberExpression(current)) {
            if (t.isIdentifier(current.property)) {
                parts.unshift(current.property.name);
            }
            current = current.object;
        }

        if (t.isIdentifier(current)) {
            parts.unshift(current.name);
        }

        return parts.join('.');
    }
}

module.exports = SecurityAnalyzer;