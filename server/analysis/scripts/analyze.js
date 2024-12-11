const path = require('path');
const glob = require('glob');
const CodeAnalyzer = require('../codeAnalyzer');

async function analyzeProject(projectRoot) {
    const analyzer = new CodeAnalyzer(projectRoot);
    const patterns = '{**/*.js,**/*.jsx,**/*.ts,**/*.tsx}';
    const ignorePatterns = [
        '**/node_modules/**',
        '**/dist/**',
        '**/build/**',
        '**/coverage/**',
        '**/.git/**'
    ];

    try {
        // Find all files to analyze
        const files = await new Promise((resolve, reject) => {
            glob(patterns, {
                cwd: projectRoot,
                ignore: ignorePatterns,
                absolute: true,
                nodir: true
            }, (err, matches) => {
                if (err) reject(err);
                else resolve(matches);
            });
        });

        console.log(`Found ${files.length} files to analyze...`);

        // Analyze each file
        const results = [];
        for (const file of files) {
            const relativePath = path.relative(projectRoot, file);
            console.log(`Analyzing ${relativePath}...`);

            const result = await analyzer.analyzeFile(file);
            if (result) {
                results.push(result);
            }
        }

        // Generate report
        const report = await analyzer.generateReport(results);

        // Print summary
        console.log('\nAnalysis Summary:');
        console.log('----------------');

        console.log('\nPatterns Detected:');
        console.log(`- Singletons: ${report.summary.patterns.singletons}`);
        console.log(`- Factories: ${report.summary.patterns.factories}`);
        console.log(`- Observers: ${report.summary.patterns.observers}`);
        console.log(`- Anti-patterns: ${report.summary.patterns.antiPatterns}`);

        console.log('\nSecurity Issues:');
        console.log(`- Critical: ${report.summary.security.critical}`);
        console.log(`- High: ${report.summary.security.high}`);
        console.log(`- Medium: ${report.summary.security.medium}`);
        console.log(`- Low: ${report.summary.security.low}`);

        console.log('\nAPI Usage:');
        console.log(`- OpenAI API Calls: ${report.summary.apiUsage.openai.totalCalls}`);
        console.log(`- Unique OpenAI Endpoints: ${report.summary.apiUsage.openai.uniqueEndpoints}`);
        console.log(`- TypeScript Features: ${report.summary.apiUsage.typescript.totalUsage}`);

        console.log('\nRecommendations:');
        report.recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. [${rec.priority.toUpperCase()}] ${rec.message}`);
        });

        // Save detailed report
        const reportPath = path.join(projectRoot, 'analysis-report.json');
        await require('fs').promises.writeFile(
            reportPath,
            JSON.stringify(report, null, 2)
        );
        console.log(`\nDetailed report saved to: ${reportPath}`);

    } catch (error) {
        console.error('Analysis failed:', error.message);
        process.exit(1);
    }
}

// Get project root from command line or use current directory
const projectRoot = process.argv[2] || process.cwd();
analyzeProject(projectRoot);