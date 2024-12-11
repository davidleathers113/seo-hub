const BaseAnalyzer = require('../core/BaseAnalyzer');
const t = require('@babel/types');

class PatternAnalyzer extends BaseAnalyzer {
    constructor(projectRoot) {
        super(projectRoot);
        this.patterns = {
            singletons: [],
            factories: [],
            observers: [],
            antiPatterns: []
        };
    }

    async analyze(ast, isTypeScript) {
        try {
            this.traverseNode(ast, {
                enter: (path) => {
                    if (this.isTypeScriptNode(path.node) && isTypeScript) {
                        this.detectTypeScriptPatterns(path);
                    } else {
                        this.detectJavaScriptPatterns(path);
                    }
                }
            });
        } catch (error) {
            console.error('Error detecting patterns:', error.message);
        }

        return this.patterns;
    }

    detectTypeScriptPatterns(path) {
        const node = path.node;

        if (t.isTSInterfaceDeclaration(node)) {
            this.analyzeInterface(path);
        }
        else if (t.isTSTypeAliasDeclaration(node)) {
            this.analyzeTypeAlias(path);
        }
        else if (t.isDecorator(node)) {
            this.analyzeDecorator(path);
        }
        else if (t.isJSXElement(node)) {
            this.analyzeJSXElement(path);
        }
    }

    detectJavaScriptPatterns(path) {
        const node = path.node;

        if (this.isSingleton(node)) {
            this.patterns.singletons.push(this.extractPatternInfo(node));
        }
        if (this.isFactory(node)) {
            this.patterns.factories.push(this.extractPatternInfo(node));
        }
        if (this.isObserver(node)) {
            this.patterns.observers.push(this.extractPatternInfo(node));
        }
        if (this.isAntiPattern(node)) {
            this.patterns.antiPatterns.push(this.extractAntiPatternInfo(node));
        }
    }

    analyzeInterface(path) {
        const node = path.node;
        if (node.body.body.length > 10) {
            this.patterns.antiPatterns.push({
                type: 'LargeInterface',
                location: node.loc,
                message: 'Interface has too many members. Consider splitting it.'
            });
        }

        if (node.extends && node.extends.length > 2) {
            this.patterns.antiPatterns.push({
                type: 'DeepInheritance',
                location: node.loc,
                message: 'Deep inheritance chain detected. Consider composition.'
            });
        }
    }

    analyzeTypeAlias(path) {
        const node = path.node;
        if (t.isTSUnionType(node.typeAnnotation) &&
            node.typeAnnotation.types.length > 5) {
            this.patterns.antiPatterns.push({
                type: 'ComplexUnion',
                location: node.loc,
                message: 'Complex union type. Consider simplifying.'
            });
        }
    }

    analyzeDecorator(path) {
        const node = path.node;
        if (t.isCallExpression(node.expression)) {
            const decoratorName = node.expression.callee.name;
            if (decoratorName === 'Injectable' || decoratorName === 'Component') {
                this.patterns.singletons.push({
                    type: 'DecoratorSingleton',
                    location: node.loc,
                    name: decoratorName
                });
            }
        }
    }

    analyzeJSXElement(path) {
        const node = path.node;
        if (node.openingElement) {
            const componentName = node.openingElement.name.name;
            if (/^[A-Z]/.test(componentName)) {
                if (componentName.includes('With') || componentName.includes('Provider')) {
                    this.patterns.factories.push({
                        type: 'HOCFactory',
                        location: node.loc,
                        name: componentName
                    });
                }
            }
        }

        const propCount = node.openingElement.attributes.length;
        if (propCount > 7) {
            this.patterns.antiPatterns.push({
                type: 'PropDrilling',
                location: node.loc,
                message: 'Component has too many props. Consider using context or state management.'
            });
        }
    }

    isSingleton(node) {
        return (
            t.isClassDeclaration(node) &&
            node.body.body.some(member =>
                t.isClassMethod(member) &&
                member.static &&
                member.key.name === 'getInstance'
            )
        );
    }

    isFactory(node) {
        return (
            t.isClassDeclaration(node) &&
            node.body.body.some(member =>
                t.isClassMethod(member) &&
                member.key.name === 'create'
            )
        );
    }

    isObserver(node) {
        return (
            t.isClassDeclaration(node) &&
            node.body.body.some(member =>
                t.isClassMethod(member) &&
                ['subscribe', 'unsubscribe', 'notify'].includes(member.key.name)
            )
        );
    }

    isAntiPattern(node) {
        return (
            this.hasGodClass(node) ||
            this.hasLongMethod(node) ||
            this.hasFeatureEnvy(node)
        );
    }

    hasGodClass(node) {
        return (
            t.isClassDeclaration(node) &&
            node.body.body.length > 20
        );
    }

    hasLongMethod(node) {
        return (
            (t.isFunctionDeclaration(node) || t.isClassMethod(node)) &&
            node.body.body.length > 30
        );
    }

    hasFeatureEnvy(node) {
        if (!t.isClassDeclaration(node)) return false;

        const methodCalls = new Map();
        this.traverseNode(node, {
            enter: (path) => {
                if (t.isMemberExpression(path.node)) {
                    const obj = this.getFullMemberExpression(path.node.object);
                    if (obj !== 'this' && obj !== 'super') {
                        methodCalls.set(obj, (methodCalls.get(obj) || 0) + 1);
                    }
                }
            }
        });

        return Array.from(methodCalls.values()).some(count => count > 5);
    }

    extractPatternInfo(node) {
        return {
            type: node.type,
            name: this.getNodeName(node),
            location: node.loc
        };
    }

    extractAntiPatternInfo(node) {
        return {
            type: this.getAntiPatternType(node),
            location: node.loc,
            message: this.getAntiPatternMessage(node)
        };
    }

    getAntiPatternType(node) {
        if (this.hasGodClass(node)) return 'GodClass';
        if (this.hasLongMethod(node)) return 'LongMethod';
        if (this.hasFeatureEnvy(node)) return 'FeatureEnvy';
        return 'Unknown';
    }

    getAntiPatternMessage(node) {
        switch (this.getAntiPatternType(node)) {
            case 'GodClass':
                return 'Class has too many responsibilities. Consider splitting it.';
            case 'LongMethod':
                return 'Method is too long. Consider extracting smaller methods.';
            case 'FeatureEnvy':
                return 'Method uses too many features of another class. Consider moving it.';
            default:
                return 'Unknown anti-pattern detected.';
        }
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

module.exports = PatternAnalyzer;