import { Database } from '@/types/database'

export type Research = Database['public']['Tables']['research']['Row']

export async function getResearchById(id: string) {
  // ... existing code ...
}

interface CompetitorAnalysisParams {
  topic: string;
  niche: string;
  competitors?: string[];
  target_audience?: string;
  content_type?: string;
}

interface ContentSuggestionParams {
  topic: string;
  niche: string;
  target_audience?: string;
  content_type?: string;
  existing_content?: string[];
  goals?: string[];
}

export async function getResearchHistory(type: ResearchType, params: Record<string, string> = {}) {
  const searchParams = new URLSearchParams(params);
  const response = await fetch(`/api/research/${type}?${searchParams.toString()}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch research history: ${response.statusText}`);
  }

  return response.json();
}

export async function generateKeywordResearch(params: KeywordResearchParams) {
  const response = await fetch('/api/research/keywords', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate keyword research: ${response.statusText}`);
  }

  return response.json();
}

export async function generateCompetitorAnalysis(params: CompetitorAnalysisParams) {
  const response = await fetch('/api/research/competitors', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate competitor analysis: ${response.statusText}`);
  }

  return response.json();
}

export async function generateContentSuggestions(params: ContentSuggestionParams) {
  const response = await fetch('/api/research/suggestions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error(`Failed to generate content suggestions: ${response.statusText}`);
  }

  return response.json();
}