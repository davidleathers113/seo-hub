#!/usr/bin/env node

const path = require('path');
const fs = require('fs').promises;
const CodeAnalyzer = require('../codeAnalyzer');

async function analyzeProject(projectPath) {
    const analyzer = new CodeAnalyzer(projectPath);
    const results = {
        patterns: [],
        security: [],
        apiUsage: {},
        complexity: {},
        refactoring: []
    };

    try {
        // Analyze all JavaScript/TypeScript files
        console.log('Analyzing source files...');
        const files = await getAllSourceFiles(projectPath);

        for (const file of files) {
            console.log(`Analyzing ${file}...`);
            const analysis = await analyzer.analyzeFile(file);

            // Aggregate results
            if (analysis.patterns) {
                Object.values(analysis.patterns).forEach(patternArray => {
                    results.patterns.push(...(patternArray || []));
                });
            }
            if (analysis.security) {
                results.security.push(...(analysis.security || []));
            }
            results.apiUsage[file] = analysis.apiUsage || {};
            results.complexity[file] = analysis.complexity || {};
            if (analysis.refactoring) {
                results.refactoring.push(...(analysis.refactoring || []));
            }
        }

        // Generate report
        const reportPath = path.join(projectPath, 'analysis-report.json');
        await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
        console.log(`Analysis complete! Report saved to ${reportPath}`);

        // Print summary
        printSummary(results);

    } catch (error) {
        console.error('Analysis failed:', error);
        process.exit(1);
    }
}

async function getAllSourceFiles(dir) {
    const files = [];

    async function walk(directory) {
        const items = await fs.readdir(directory, { withFileTypes: true });

        for (const item of items) {
            const fullPath = path.join(directory, item.name);

            if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
                await walk(fullPath);
            } else if (item.isFile() && /\.(js|ts|jsx|tsx)$/.test(item.name)) {
                files.push(fullPath);
            }
        }
    }

    await walk(dir);
    return files;
}

function printSummary(results) {
    console.log('\nAnalysis Summary:');
    console.log('----------------');

    // Pattern summary
    console.log('\nArchitectural Patterns:');
    console.log(`- Found ${results.patterns.length} pattern instances`);

    // Security summary
    console.log('\nSecurity Vulnerabilities:');
    const criticalVulns = results.security.filter(v => v && v.severity === 'critical').length;
    const highVulns = results.security.filter(v => v && v.severity === 'high').length;
    console.log(`- Critical: ${criticalVulns}`);
    console.log(`- High: ${highVulns}`);

    // API Usage summary
    console.log('\nOpenAI API Usage:');
    const totalCalls = Object.values(results.apiUsage)
        .reduce((sum, file) => sum + ((file.openai && file.openai.totalCalls) || 0), 0);
    console.log(`- Total API Calls: ${totalCalls}`);

    // Complexity summary
    console.log('\nCode Complexity:');
    const complexityValues = Object.values(results.complexity).filter(c => c && typeof c.cyclomaticComplexity === 'number');
    const avgComplexity = complexityValues.length > 0
        ? complexityValues.reduce((sum, file) => sum + file.cyclomaticComplexity, 0) / complexityValues.length
        : 0;
    console.log(`- Average Cyclomatic Complexity: ${avgComplexity.toFixed(2)}`);

    // Refactoring suggestions
    console.log('\nRefactoring Suggestions:');
    console.log(`- Total Suggestions: ${results.refactoring.length}`);
}

// Run analysis if called directly
if (require.main === module) {
    const projectPath = process.argv[2] || process.cwd();
    analyzeProject(projectPath).catch(console.error);
}