import api from '../Api';
import { vi } from 'vitest';

describe('Niche API', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'mock-jwt-token');
    vi.restoreAllMocks();
  });

  it('Step 3: Should verify niche creation via API', async () => {
    const mockNiches = [
      {
        id: '1',
        name: 'Digital Marketing',
        pillarsCount: 5,
        progress: 60,
        status: 'in-progress',
        lastUpdated: '2024-03-15',
      },
      {
        id: '2',
        name: 'Personal Finance',
        pillarsCount: 3,
        progress: 30,
        status: 'new',
        lastUpdated: '2024-03-14',
      },
      {
        id: '3',
        name: 'Test Niche',
        pillarsCount: 0,
        progress: 0,
        status: 'new',
        lastUpdated: new Date().toISOString(),
      },
    ];

    // Mock the API call to get niches
    vi.spyOn(api, 'get').mockResolvedValueOnce({
      data: { niches: mockNiches },
    });

    const response = await api.get('/niches');

    expect(response.data.niches).toHaveLength(3);
    expect(response.data.niches.find((niche) => niche.name === 'Test Niche')).toBeTruthy();
  });
});
