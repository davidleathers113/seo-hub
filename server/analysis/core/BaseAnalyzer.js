const { parse } = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const t = require('@babel/types');
const fs = require('fs').promises;

class BaseAnalyzer {
    constructor(projectRoot) {
        this.projectRoot = projectRoot;
        this.options = {
            typescript: true,
            jsx: true
        };
    }

    async parseFile(filePath) {
        try {
            const code = await fs.readFile(filePath, 'utf-8');
            return this.parseCode(code);
        } catch (error) {
            console.error(`Error parsing file ${filePath}:`, error);
            return null;
        }
    }

    parseCode(code) {
        try {
            return parse(code, {
                sourceType: 'module',
                plugins: [
                    this.options.typescript && 'typescript',
                    this.options.jsx && 'jsx',
                    'decorators-legacy',
                    'classProperties'
                ].filter(Boolean)
            });
        } catch (error) {
            console.error('Error parsing code:', error);
            return null;
        }
    }

    async analyze(ast) {
        throw new Error('analyze() method must be implemented by subclasses');
    }

    traverseAST(ast, visitors) {
        try {
            traverse(ast, visitors);
        } catch (error) {
            console.error('Error traversing AST:', error);
        }
    }

    traverseNode(node, visitors) {
        try {
            if (!node) return;

            // If the node is already a Program or File, use it directly
            if (t.isProgram(node) || t.isFile(node)) {
                traverse(node, visitors);
                return;
            }

            // Create a minimal program containing the node
            let program;
            if (t.isStatement(node)) {
                program = t.program([node]);
            } else if (t.isExpression(node)) {
                program = t.program([t.expressionStatement(node)]);
            } else {
                console.warn('Unsupported node type for traversal:', node.type);
                return;
            }

            traverse(t.file(program), visitors);
        } catch (error) {
            console.error('Error traversing node:', error);
        }
    }

    isTypeScriptNode(node) {
        if (!node) return false;
        return t.isTSType(node) ||
               t.isTSTypeAnnotation(node) ||
               t.isTSTypeElement(node) ||
               t.isTSInterfaceDeclaration(node) ||
               t.isTSTypeAliasDeclaration(node) ||
               t.isTSEnumDeclaration(node) ||
               t.isTSModuleDeclaration(node);
    }

    getNodeLocation(node) {
        return node?.loc ? {
            start: {
                line: node.loc.start.line,
                column: node.loc.start.column
            },
            end: {
                line: node.loc.end.line,
                column: node.loc.end.column
            }
        } : null;
    }

    getNodeType(node) {
        return node?.type;
    }

    getNodeName(node) {
        if (!node) return 'anonymous';
        if (t.isIdentifier(node)) {
            return node.name;
        }
        if (t.isIdentifier(node.id)) {
            return node.id.name;
        }
        if (t.isIdentifier(node.key)) {
            return node.key.name;
        }
        return 'anonymous';
    }

    getNodeValue(node) {
        if (!node) return null;
        if (t.isLiteral(node)) {
            return node.value;
        }
        if (t.isStringLiteral(node) || t.isNumericLiteral(node) || t.isBooleanLiteral(node)) {
            return node.value;
        }
        return null;
    }

    isNodeOfType(node, type) {
        return node?.type === type;
    }

    isNodeIdentifier(node) {
        return t.isIdentifier(node);
    }

    isNodeLiteral(node) {
        return t.isLiteral(node) ||
               t.isStringLiteral(node) ||
               t.isNumericLiteral(node) ||
               t.isBooleanLiteral(node) ||
               t.isNullLiteral(node);
    }

    isNodeFunction(node) {
        return t.isFunction(node) ||
               t.isFunctionDeclaration(node) ||
               t.isFunctionExpression(node) ||
               t.isArrowFunctionExpression(node);
    }

    isNodeClass(node) {
        return t.isClass(node) ||
               t.isClassDeclaration(node) ||
               t.isClassExpression(node);
    }

    isNodeInterface(node) {
        return t.isTSInterfaceDeclaration(node);
    }

    isNodeType(node) {
        return t.isTSTypeAliasDeclaration(node);
    }

    isNodeEnum(node) {
        return t.isTSEnumDeclaration(node);
    }

    isNodeDecorator(node) {
        return t.isDecorator(node);
    }

    isNodeJSX(node) {
        return t.isJSXElement(node) ||
               t.isJSXFragment(node);
    }

    isNodeImport(node) {
        return t.isImportDeclaration(node);
    }

    isNodeExport(node) {
        return t.isExportDeclaration(node) ||
               t.isExportDefaultDeclaration(node) ||
               t.isExportNamedDeclaration(node) ||
               t.isExportAllDeclaration(node);
    }

    getMetrics() {
        return {
            timestamp: new Date().toISOString(),
            analyzer: this.constructor.name,
            results: {}
        };
    }
}

module.exports = BaseAnalyzer;