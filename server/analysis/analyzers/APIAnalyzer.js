const BaseAnalyzer = require('../core/BaseAnalyzer');
const estraverse = require('estraverse');

class APIAnalyzer extends BaseAnalyzer {
    constructor(projectRoot) {
        super(projectRoot);
        this.apiUsage = {
            openai: {
                endpoints: {},
                totalCalls: 0
            },
            typescript: {
                features: {},
                totalUsage: 0
            }
        };
    }

    async analyze(ast, isTypeScript) {
        try {
            estraverse.traverse(ast, {
                enter: (node) => {
                    if (this.isTypeScriptNode(node) && isTypeScript) {
                        this.trackTypeScriptFeatures(node);
                    } else {
                        this.trackJavaScriptAPIs(node);
                    }
                }
            });
        } catch (error) {
            console.error('Error tracking API usage:', error.message);
        }

        return this.apiUsage;
    }

    trackTypeScriptFeatures(node) {
        switch (node.type) {
            case 'TSDecorator':
                const feature = node.expression.callee?.name || 'unknown';
                this.apiUsage.typescript.features[feature] =
                    (this.apiUsage.typescript.features[feature] || 0) + 1;
                this.apiUsage.typescript.totalUsage++;
                break;

            case 'TSTypeReference':
                const typeName = node.typeName.name;
                this.apiUsage.typescript.features[typeName] =
                    (this.apiUsage.typescript.features[typeName] || 0) + 1;
                this.apiUsage.typescript.totalUsage++;
                break;

            case 'TSInterfaceDeclaration':
                this.apiUsage.typescript.features['interface'] =
                    (this.apiUsage.typescript.features['interface'] || 0) + 1;
                this.apiUsage.typescript.totalUsage++;
                break;

            case 'TSTypeAliasDeclaration':
                this.apiUsage.typescript.features['typeAlias'] =
                    (this.apiUsage.typescript.features['typeAlias'] || 0) + 1;
                this.apiUsage.typescript.totalUsage++;
                break;

            case 'TSEnumDeclaration':
                this.apiUsage.typescript.features['enum'] =
                    (this.apiUsage.typescript.features['enum'] || 0) + 1;
                this.apiUsage.typescript.totalUsage++;
                break;
        }
    }

    trackJavaScriptAPIs(node) {
        if (this.isOpenAICall(node)) {
            this.trackOpenAIUsage(node);
        }
    }

    isOpenAICall(node) {
        if (node.type !== 'CallExpression') return false;

        // Check for OpenAI client instantiation
        if (node.callee.type === 'NewExpression' &&
            node.callee.callee.name === 'OpenAI') {
            return true;
        }

        // Check for OpenAI API calls
        if (node.callee.type === 'MemberExpression') {
            const obj = this.getFullMemberExpression(node.callee.object);
            return obj.includes('openai') || obj.includes('OpenAI');
        }

        return false;
    }

    trackOpenAIUsage(node) {
        const endpoint = this.getOpenAIEndpoint(node);
        if (endpoint) {
            this.apiUsage.openai.endpoints[endpoint] =
                (this.apiUsage.openai.endpoints[endpoint] || 0) + 1;
            this.apiUsage.openai.totalCalls++;
        }
    }

    getOpenAIEndpoint(node) {
        if (node.callee.type === 'MemberExpression') {
            const methodName = node.callee.property.name;
            switch (methodName) {
                case 'createCompletion':
                    return 'completions';
                case 'createChatCompletion':
                    return 'chat/completions';
                case 'createEdit':
                    return 'edits';
                case 'createImage':
                    return 'images/generations';
                case 'createEmbedding':
                    return 'embeddings';
                case 'createModeration':
                    return 'moderations';
                case 'createFineTune':
                    return 'fine-tunes';
                case 'listModels':
                    return 'models';
                default:
                    return methodName;
            }
        }
        return null;
    }

    getFullMemberExpression(node) {
        const parts = [];
        let current = node;

        while (current.type === 'MemberExpression') {
            parts.unshift(current.property.name);
            current = current.object;
        }

        if (current.type === 'Identifier') {
            parts.unshift(current.name);
        }

        return parts.join('.');
    }
}

module.exports = APIAnalyzer;