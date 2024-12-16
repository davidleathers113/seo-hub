import { Database } from '@/types/database';

type Niche = Database['public']['Tables']['niches']['Row'];
type NicheInsert = Database['public']['Tables']['niches']['Insert'];
type NicheUpdate = Database['public']['Tables']['niches']['Update'];

export async function getNiches() {
  const response = await fetch('/api/niches', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch niches: ${response.statusText}`);
  }

  return response.json() as Promise<Niche[]>;
}

export async function getNicheById(id: string) {
  const response = await fetch(`/api/niches/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch niche: ${response.statusText}`);
  }

  return response.json() as Promise<Niche>;
}

export async function createNiche(niche: NicheInsert) {
  const response = await fetch('/api/niches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(niche),
  });

  if (!response.ok) {
    throw new Error(`Failed to create niche: ${response.statusText}`);
  }

  return response.json() as Promise<Niche>;
}

export async function updateNiche(id: string, niche: NicheUpdate) {
  const response = await fetch(`/api/niches/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(niche),
  });

  if (!response.ok) {
    throw new Error(`Failed to update niche: ${response.statusText}`);
  }

  return response.json() as Promise<Niche>;
}

export async function deleteNiche(id: string) {
  const response = await fetch(`/api/niches/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete niche: ${response.statusText}`);
  }

  return response.json();
}