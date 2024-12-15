export interface Pillar {
  id?: string;
  title: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  approved: boolean;
}

export interface Niche {
  id: string;
  name: string;
  userId: string;
  pillars: Pillar[];
  progress: number;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  createdAt: string;
  updatedAt: string;
}

export interface NicheCreateInput {
  name: string;
}

export interface NicheUpdateInput {
  name?: string;
  pillars?: Pillar[];
  progress?: number;
  status?: 'pending' | 'approved' | 'rejected' | 'in_progress';
}
