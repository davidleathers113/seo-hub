import { Database } from '@/types/database';

type Pillar = Database['public']['Tables']['pillars']['Row'];
type PillarInsert = Database['public']['Tables']['pillars']['Insert'];
type PillarUpdate = Database['public']['Tables']['pillars']['Update'];
type Subpillar = Database['public']['Tables']['subpillars']['Row'];
type SubpillarInsert = Database['public']['Tables']['subpillars']['Insert'];
type SubpillarUpdate = Database['public']['Tables']['subpillars']['Update'];

// Pillar functions
export async function getPillars() {
  const response = await fetch('/api/pillars', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pillars: ${response.statusText}`);
  }

  return response.json() as Promise<Pillar[]>;
}

export async function getPillarById(id: string) {
  const response = await fetch(`/api/pillars/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch pillar: ${response.statusText}`);
  }

  return response.json() as Promise<Pillar>;
}

export async function createPillar(pillar: PillarInsert) {
  const response = await fetch('/api/pillars', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pillar),
  });

  if (!response.ok) {
    throw new Error(`Failed to create pillar: ${response.statusText}`);
  }

  return response.json() as Promise<Pillar>;
}

export async function updatePillar(id: string, pillar: PillarUpdate) {
  const response = await fetch(`/api/pillars/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(pillar),
  });

  if (!response.ok) {
    throw new Error(`Failed to update pillar: ${response.statusText}`);
  }

  return response.json() as Promise<Pillar>;
}

export async function deletePillar(id: string) {
  const response = await fetch(`/api/pillars/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete pillar: ${response.statusText}`);
  }

  return response.json();
}

// Subpillar functions
export async function getSubpillars(pillarId: string) {
  const response = await fetch(`/api/pillars/${pillarId}/subpillars`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subpillars: ${response.statusText}`);
  }

  return response.json() as Promise<Subpillar[]>;
}

export async function getSubpillarById(id: string) {
  const response = await fetch(`/api/subpillars/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch subpillar: ${response.statusText}`);
  }

  return response.json() as Promise<Subpillar>;
}

export async function createSubpillar(pillarId: string, subpillar: SubpillarInsert) {
  const response = await fetch(`/api/pillars/${pillarId}/subpillars`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subpillar),
  });

  if (!response.ok) {
    throw new Error(`Failed to create subpillar: ${response.statusText}`);
  }

  return response.json() as Promise<Subpillar>;
}

export async function updateSubpillar(id: string, subpillar: SubpillarUpdate) {
  const response = await fetch(`/api/subpillars/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(subpillar),
  });

  if (!response.ok) {
    throw new Error(`Failed to update subpillar: ${response.statusText}`);
  }

  return response.json() as Promise<Subpillar>;
}

export async function deleteSubpillar(id: string) {
  const response = await fetch(`/api/subpillars/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete subpillar: ${response.statusText}`);
  }

  return response.json();
}

export async function generateSubpillars(pillarId: string) {
  const response = await fetch(`/api/pillars/${pillarId}/subpillars/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to generate subpillars: ${response.statusText}`);
  }

  return response.json() as Promise<Subpillar[]>;
}