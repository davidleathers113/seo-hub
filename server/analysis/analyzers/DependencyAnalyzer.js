const BaseAnalyzer = require('../core/BaseAnalyzer');
const t = require('@babel/types');
const path = require('path');
const fs = require('fs').promises;

class DependencyAnalyzer extends BaseAnalyzer {
    constructor(projectRoot) {
        super(projectRoot);
        this.dependencies = {
            imports: {},
            exports: {},
            circular: [],
            orphaned: [],
            dynamic: {},
            devDependencies: new Set(),
            aliases: {}
        };
        this.projectRoot = projectRoot;
    }

    async initialize() {
        try {
            // Load tsconfig.json for path aliases if it exists
            const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
            const packagePath = path.join(this.projectRoot, 'package.json');

            if (await this.fileExists(tsconfigPath)) {
                const tsconfig = JSON.parse(await fs.readFile(tsconfigPath, 'utf-8'));
                this.dependencies.aliases = tsconfig.compilerOptions?.paths || {};
            }

            if (await this.fileExists(packagePath)) {
                const pkg = JSON.parse(await fs.readFile(packagePath, 'utf-8'));
                this.dependencies.devDependencies = new Set(Object.keys(pkg.devDependencies || {}));
            }
        } catch (error) {
            console.error('Error initializing dependency analyzer:', error);
        }
    }

    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    async analyze(ast, filePath) {
        try {
            await this.initialize();
            this.currentFile = filePath;
            this.dependencies.imports[filePath] = new Set();
            this.dependencies.exports[filePath] = new Set();
            this.dependencies.dynamic[filePath] = new Set();

            this.traverseAST(ast, {
                ImportDeclaration: (path) => {
                    const importPath = this.resolveImportPath(path.node.source.value, filePath);
                    this.dependencies.imports[filePath].add(importPath);
                },
                ExportNamedDeclaration: (path) => {
                    if (path.node.source) {
                        const exportPath = this.resolveImportPath(path.node.source.value, filePath);
                        this.dependencies.exports[filePath].add(exportPath);
                    }
                },
                ExportDefaultDeclaration: (path) => {
                    this.dependencies.exports[filePath].add('default');
                },
                CallExpression: (path) => {
                    if (this.isDynamicImport(path.node)) {
                        const dynamicPath = this.extractDynamicImportPath(path.node);
                        if (dynamicPath) {
                            this.dependencies.dynamic[filePath].add(dynamicPath);
                        }
                    }
                }
            });

            this.detectCircularDependencies();
            this.detectOrphanedFiles();
            await this.classifyDependencies(filePath);

            return this.dependencies;
        } catch (error) {
            console.error('Error analyzing dependencies:', error);
            return null;
        }
    }

    isDynamicImport(node) {
        return (
            t.isImport(node.callee) ||
            (t.isIdentifier(node.callee) && node.callee.name === 'require')
        );
    }

    extractDynamicImportPath(node) {
        const arg = node.arguments[0];
        if (t.isStringLiteral(arg)) {
            return this.resolveImportPath(arg.value, this.currentFile);
        }
        return null;
    }

    resolveImportPath(importPath, fromFile) {
        // Handle absolute imports with aliases
        for (const [alias, paths] of Object.entries(this.dependencies.aliases)) {
            const aliasPattern = alias.replace('/*', '');
            if (importPath.startsWith(aliasPattern)) {
                const resolvedPaths = paths.map(p =>
                    importPath.replace(aliasPattern, p.replace('/*', ''))
                );
                // Return first resolvable path
                return resolvedPaths[0];
            }
        }

        // Handle relative imports
        if (importPath.startsWith('.')) {
            return path.normalize(
                path.join(path.dirname(fromFile), importPath)
            );
        }

        return importPath;
    }

    async classifyDependencies(filePath) {
        const allDeps = new Set([
            ...this.dependencies.imports[filePath],
            ...this.dependencies.dynamic[filePath]
        ]);

        for (const dep of allDeps) {
            // Check if it's a dev dependency
            if (this.dependencies.devDependencies.has(this.getPackageName(dep))) {
                this.dependencies.imports[filePath].delete(dep);
                this.dependencies.devDependencies.add(dep);
            }
        }
    }

    getPackageName(importPath) {
        // Extract package name from import path (e.g., '@babel/core/lib/parse' -> '@babel/core')
        const parts = importPath.split('/');
        if (importPath.startsWith('@')) {
            return `${parts[0]}/${parts[1]}`;
        }
        return parts[0];
    }

    detectCircularDependencies() {
        const visited = new Set();
        const recursionStack = new Set();

        const dfs = (file) => {
            if (!this.dependencies.imports[file]) return;

            visited.add(file);
            recursionStack.add(file);

            const allDeps = new Set([
                ...this.dependencies.imports[file],
                ...this.dependencies.dynamic[file]
            ]);

            for (const dep of allDeps) {
                if (!visited.has(dep)) {
                    if (dfs(dep)) return true;
                } else if (recursionStack.has(dep)) {
                    this.dependencies.circular.push([file, dep]);
                    return true;
                }
            }

            recursionStack.delete(file);
            return false;
        };

        Object.keys(this.dependencies.imports).forEach(file => {
            if (!visited.has(file)) {
                dfs(file);
            }
        });
    }

    detectOrphanedFiles() {
        const allFiles = new Set([
            ...Object.keys(this.dependencies.imports),
            ...Object.keys(this.dependencies.exports),
            ...Object.keys(this.dependencies.dynamic)
        ]);

        const referenced = new Set();
        allFiles.forEach(file => {
            if (this.dependencies.imports[file]) {
                this.dependencies.imports[file].forEach(dep => referenced.add(dep));
            }
            if (this.dependencies.exports[file]) {
                this.dependencies.exports[file].forEach(exp => referenced.add(exp));
            }
            if (this.dependencies.dynamic[file]) {
                this.dependencies.dynamic[file].forEach(dep => referenced.add(dep));
            }
        });

        this.dependencies.orphaned = Array.from(allFiles)
            .filter(file => !referenced.has(file));
    }

    generateDependencyGraph() {
        return {
            nodes: Object.keys(this.dependencies.imports).map(file => ({
                id: file,
                type: 'file',
                orphaned: this.dependencies.orphaned.includes(file),
                isDev: this.dependencies.devDependencies.has(file)
            })),
            edges: [
                // Static imports
                ...Object.entries(this.dependencies.imports)
                    .flatMap(([file, deps]) =>
                        Array.from(deps).map(dep => ({
                            source: file,
                            target: dep,
                            type: 'static',
                            circular: this.dependencies.circular.some(
                                ([a, b]) => (a === file && b === dep) || (a === dep && b === file)
                            )
                        }))
                    ),
                // Dynamic imports
                ...Object.entries(this.dependencies.dynamic)
                    .flatMap(([file, deps]) =>
                        Array.from(deps).map(dep => ({
                            source: file,
                            target: dep,
                            type: 'dynamic',
                            circular: false
                        }))
                    )
            ]
        };
    }
}

module.exports = DependencyAnalyzer;