const fs = require('fs').promises;
const path = require('path');
const { parse } = require('@babel/parser');
const DependencyAnalyzer = require('../analyzers/DependencyAnalyzer');
const ComplexityAnalyzer = require('../analyzers/ComplexityAnalyzer');
const PatternAnalyzer = require('../analyzers/PatternAnalyzer');
const SecurityAnalyzer = require('../analyzers/SecurityAnalyzer');
const APIAnalyzer = require('../analyzers/APIAnalyzer');

async function analyzeNichesRoute() {
    const projectRoot = path.resolve(__dirname, '../../..');
    const filePath = path.join(projectRoot, 'server/routes/niches.js');

    try {
        // Read the file
        const code = await fs.readFile(filePath, 'utf-8');

        // Parse the code
        const ast = parse(code, {
            sourceType: 'module',
            plugins: ['jsx']
        });

        // Initialize analyzers
        const dependencyAnalyzer = new DependencyAnalyzer(projectRoot);
        const complexityAnalyzer = new ComplexityAnalyzer(projectRoot);
        const patternAnalyzer = new PatternAnalyzer(projectRoot);
        const securityAnalyzer = new SecurityAnalyzer(projectRoot);
        const apiAnalyzer = new APIAnalyzer(projectRoot);

        // Run analysis
        const [
            dependencies,
            complexity,
            patterns,
            security,
            apiUsage
        ] = await Promise.all([
            dependencyAnalyzer.analyze(ast, filePath),
            complexityAnalyzer.analyze(ast, code),
            patternAnalyzer.analyze(ast),
            securityAnalyzer.analyze(ast),
            apiAnalyzer.analyze(ast)
        ]);

        // Generate report
        const report = {
            filePath,
            summary: {
                lineCount: complexity.lineMetrics.total,
                codeLines: complexity.lineMetrics.code,
                commentLines: complexity.lineMetrics.comment,
                cyclomaticComplexity: complexity.cyclomaticComplexity,
                cognitiveComplexity: complexity.cognitiveComplexity,
                maintainabilityIndex: complexity.maintainabilityIndex
            },
            dependencies: {
                imports: Array.from(dependencies.imports[filePath] || []),
                circular: dependencies.circular,
                orphaned: dependencies.orphaned
            },
            patterns: {
                detected: patterns,
                antiPatterns: patterns.antiPatterns
            },
            security: {
                issues: security,
                criticalCount: security.filter(i => i.severity === 'critical').length,
                highCount: security.filter(i => i.severity === 'high').length
            },
            apiUsage: {
                openai: apiUsage.openai,
                endpoints: Object.keys(apiUsage.openai.endpoints || {})
            },
            recommendations: []
        };

        // Add recommendations based on analysis
        if (complexity.cyclomaticComplexity > 20) {
            report.recommendations.push({
                type: 'Complexity',
                priority: 'high',
                message: 'Consider breaking down large route handlers into smaller functions'
            });
        }

        if (complexity.maintainabilityIndex < 65) {
            report.recommendations.push({
                type: 'Maintainability',
                priority: 'medium',
                message: 'Improve code maintainability by adding more documentation and reducing complexity'
            });
        }

        if (security.length > 0) {
            report.recommendations.push({
                type: 'Security',
                priority: 'critical',
                message: `Address ${security.length} security issues found in the code`
            });
        }

        if (patterns.antiPatterns.length > 0) {
            report.recommendations.push({
                type: 'Pattern',
                priority: 'medium',
                message: 'Refactor code to address anti-patterns'
            });
        }

        // Print report
        console.log('\nAnalysis Report for niches.js');
        console.log('==========================');

        console.log('\nSummary:');
        console.log('--------');
        console.log(`Total Lines: ${report.summary.lineCount}`);
        console.log(`Code Lines: ${report.summary.codeLines}`);
        console.log(`Comment Lines: ${report.summary.commentLines}`);
        console.log(`Cyclomatic Complexity: ${report.summary.cyclomaticComplexity}`);
        console.log(`Cognitive Complexity: ${report.summary.cognitiveComplexity}`);
        console.log(`Maintainability Index: ${report.summary.maintainabilityIndex.toFixed(2)}`);

        console.log('\nDependencies:');
        console.log('-------------');
        console.log('Imports:', report.dependencies.imports);
        if (report.dependencies.circular.length > 0) {
            console.log('Circular Dependencies:', report.dependencies.circular);
        }

        console.log('\nSecurity Issues:');
        console.log('---------------');
        console.log(`Critical: ${report.security.criticalCount}`);
        console.log(`High: ${report.security.highCount}`);
        security.forEach(issue => {
            console.log(`- [${issue.severity.toUpperCase()}] ${issue.message}`);
        });

        console.log('\nAPI Usage:');
        console.log('----------');
        console.log('OpenAI Endpoints:', report.apiUsage.endpoints);
        console.log('Total API Calls:', apiUsage.openai.totalCalls);

        console.log('\nRecommendations:');
        console.log('---------------');
        report.recommendations.forEach((rec, i) => {
            console.log(`${i + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        });

        return report;
    } catch (error) {
        console.error('Analysis failed:', error);
        throw error;
    }
}

analyzeNichesRoute().catch(console.error);