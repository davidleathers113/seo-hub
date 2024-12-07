import api from './api';

// Get Dashboard Stats
// GET /dashboard/stats
// Response: { 
//   niches: { total: number, new: number, inProgress: number, completed: number },
//   pillars: { total: number, approved: number, pending: number },
//   subpillars: { total: number, completed: number },
//   seo: { averageScore: number, above80Percent: number, trend: Array<{ date: string, score: number }> },
//   quality: { readabilityScore: number, plagiarismScore: number, keywordDensity: number },
//   resources: { apiUsage: number, apiLimit: number }
// }
export const getDashboardStats = () => {
  // Mock response
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          niches: {
            total: 5,
            new: 1,
            inProgress: 3,
            completed: 1
          },
          pillars: {
            total: 25,
            approved: 15,
            pending: 10
          },
          subpillars: {
            total: 75,
            completed: 45
          },
          seo: {
            averageScore: 85,
            above80Percent: 75,
            trend: [
              { date: '2024-01', score: 82 },
              { date: '2024-02', score: 84 },
              { date: '2024-03', score: 85 }
            ]
          },
          quality: {
            readabilityScore: 92,
            plagiarismScore: 98,
            keywordDensity: 95
          },
          resources: {
            apiUsage: 7500,
            apiLimit: 10000
          }
        }
      });
    }, 1000);
  });
};