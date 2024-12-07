import api from './api';

// Generate Pillars
// POST /content/pillars
// Request: { niche: string }
// Response: { pillars: Array<{ id: string, title: string, approved: boolean }> }
export const generatePillars = (niche: string) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          pillars: [
            { id: "1", title: "Content Strategy", approved: false },
            { id: "2", title: "SEO Optimization", approved: false },
            { id: "3", title: "Keyword Research", approved: false },
            { id: "4", title: "Link Building", approved: false },
            { id: "5", title: "Technical SEO", approved: false },
          ]
        }
      });
    }, 1000);
  });
};

// Update Pillar
// PUT /content/pillars/:id
// Request: { approved: boolean, title?: string }
// Response: { success: boolean }
export const updatePillar = (id: string, data: { approved: boolean, title?: string }) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true
        }
      });
    }, 500);
  });
};

// Generate Subpillars
// POST /content/subpillars
// Request: { pillarId: string }
// Response: { subpillars: Array<{ id: string, title: string, status: 'pending' | 'in_progress' | 'completed' }> }
export const generateSubpillars = (pillarId: string) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          subpillars: [
            { id: "1", title: "Content Calendar", status: "pending" },
            { id: "2", title: "Content Types", status: "pending" },
            { id: "3", title: "Content Distribution", status: "pending" },
            { id: "4", title: "Content Analytics", status: "pending" },
          ]
        }
      });
    }, 1000);
  });
};

// Get Article
// GET /content/articles/:id
// Response: { article: { id: string, title: string, content: string, seoScore: number } }
export const getArticle = (id: string) => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          article: {
            id,
            title: "Sample Article",
            content: "This is a sample article content...",
            seoScore: 85
          }
        }
      });
    }, 500);
  });
};