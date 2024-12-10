const routeConfig = {
    // Base paths
    API_BASE: '/api',
    AUTH_BASE: '/api/auth',
    PILLARS_BASE: '/api/pillars',
    NICHES_BASE: '/api/niches',
    RESEARCH_BASE: '/api/research',
    OUTLINES_BASE: '/api/outlines',
    ARTICLES_BASE: '/api/articles',
    SEO_BASE: '/api/articles',

    // Subpillars routes
    subpillars: {
        list: '/api/pillars/:pillarId/subpillars',
        generate: '/api/pillars/:pillarId/subpillars/generate',
        update: '/api/pillars/subpillar/:id',
        delete: '/api/pillars/subpillar/:id'
    },

    // Helper functions
    getPath: function(category, action) {
        if (!this[category] || !this[category][action]) {
            throw new Error(`Invalid route path: ${category}.${action}`);
        }
        return this[category][action];
    },

    // Path parameter replacement helper
    replaceParams: function(path, params) {
        let result = path;
        for (const [key, value] of Object.entries(params)) {
            result = result.replace(`:${key}`, value);
        }
        return result;
    }
};

module.exports = routeConfig;
