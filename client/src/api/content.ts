import { Pillar, Subpillar } from '../types/pillar';

interface GeneratePillarsResponse {
  data: Pillar[];
}

// Mock data
const mockPillars: Pillar[] = [
  {
    id: "1",
    title: "Transitioning from Lead Vendors to In-House Teams",
    status: "approved",
    updatedAt: new Date().toISOString(),
    subpillars: [
      {
        id: "1-1",
        title: "How to Evaluate Your Current Lead Vendor Dependency",
        status: "research",
        progress: 20,
      },
      {
        id: "1-2",
        title: "Risks of Over-Reliance on Lead Vendors",
        status: "outline",
        progress: 40,
      },
      {
        id: "1-3",
        title: "Steps to Transition from Lead Vendors to In-House Teams",
        status: "draft",
        progress: 60,
      },
    ],
  },
  {
    id: "2",
    title: "Technical SEO",
    status: "pending",
    updatedAt: new Date().toISOString(),
    subpillars: [
      {
        id: "2-1",
        title: "Site Speed Optimization",
        status: "research",
        progress: 20,
      },
      {
        id: "2-2",
        title: "Mobile Optimization",
        status: "outline",
        progress: 40,
      },
    ],
  },
];

// Generate Pillars
// POST /niches/:nicheId/pillars/generate
export const generatePillars = async (nicheId: string): Promise<GeneratePillarsResponse> => {
  console.log('generatePillars: Starting with nicheId:', nicheId);
  try {
    // Return mock data directly without making API call
    console.log('generatePillars: Returning mock data:', mockPillars);
    return Promise.resolve({ data: mockPillars });
  } catch (error) {
    console.error('generatePillars: Error occurred:', error);
    throw error;
  }
};

// Update Pillar
// PUT /content/pillars/:id
// Request: { approved: boolean, title?: string }
// Response: { success: boolean }
export const updatePillar = async (id: string, data: { approved: boolean, title?: string }) => {
  console.log('updatePillar: Starting with id:', id, 'data:', data);
  try {
    // Mock response
    const response = {
      data: {
        success: true
      }
    };
    console.log('updatePillar: Returning mock response:', response);
    return Promise.resolve(response);
  } catch (error) {
    console.error('updatePillar: Error occurred:', error);
    throw error;
  }
};

// Generate Subpillars
// POST /content/subpillars
// Request: { pillarId: string }
// Response: { subpillars: Array<{ id: string, title: string, status: 'pending' | 'in_progress' | 'completed' }> }
export const generateSubpillars = async (pillarId: string) => {
  console.log('generateSubpillars: Starting with pillarId:', pillarId);
  try {
    const mockSubpillars: Subpillar[] = [
      { id: "1", title: "Content Calendar", status: "research", progress: 0 },
      { id: "2", title: "Content Types", status: "research", progress: 0 },
      { id: "3", title: "Content Distribution", status: "research", progress: 0 },
      { id: "4", title: "Content Analytics", status: "research", progress: 0 },
    ];

    const response = {
      data: {
        subpillars: mockSubpillars
      }
    };
    console.log('generateSubpillars: Returning mock response:', response);
    return Promise.resolve(response);
  } catch (error) {
    console.error('generateSubpillars: Error occurred:', error);
    throw error;
  }
};

// Get Article
// GET /content/articles/:id
// Response: { article: { id: string, title: string, content: string, seoScore: number } }
export const getArticle = async (id: string) => {
  console.log('getArticle: Starting with id:', id);
  try {
    const response = {
      data: {
        article: {
          id,
          title: "Sample Article",
          content: "This is a sample article content...",
          seoScore: 85
        }
      }
    };
    console.log('getArticle: Returning mock response:', response);
    return Promise.resolve(response);
  } catch (error) {
    console.error('getArticle: Error occurred:', error);
    throw error;
  }
};
