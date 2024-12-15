import api from './api';
import { Niche } from '../types/niche';

// Get all niches for the current user
// GET /api/niches
export const getNiches = () => {
  return api.get<Niche[]>('/api/niches');
};

// Create a new niche
// POST /api/niches
export const createNiche = (name: string) => {
  return api.post<Niche>('/api/niches', { name });
};

// Get a specific niche
// GET /api/niches/:id
export const getNiche = (id: string) => {
  return api.get<Niche>(`/api/niches/${id}`);
};

// Update a niche
// PUT /api/niches/:id
export const updateNiche = (id: string, data: Partial<Niche>) => {
  return api.put<Niche>(`/api/niches/${id}`, data);
};

// Delete a niche
// DELETE /api/niches/:id
export const deleteNiche = (id: string) => {
  return api.delete(`/api/niches/${id}`);
};

// Generate pillars for a niche
// POST /api/niches/:nicheId/pillars/generate
export const generatePillars = (nicheId: string) => {
  return api.post(`/api/niches/${nicheId}/pillars/generate`);
};
