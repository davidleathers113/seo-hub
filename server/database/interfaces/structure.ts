import { BaseEntity, PaginationOptions } from './base';

export interface NichePillar {
    title: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    approved: boolean;
}

export interface Niche extends BaseEntity {
    name: string;
    userId: string;
    pillars: NichePillar[];
    progress: number;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
}

export interface Pillar extends BaseEntity {
    title: string;
    nicheId: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    createdById: string;
}

export interface Subpillar extends BaseEntity {
    title: string;
    pillarId: string;
    createdById: string;
    status: 'research' | 'outline' | 'draft' | 'complete';
}

export interface NicheFilters {
    userId?: string;
    status?: string;
}

export interface PillarFilters {
    nicheId?: string;
    status?: string;
    createdById?: string;
}

export interface SubpillarFilters {
    pillarId?: string;
    status?: string;
    createdById?: string;
}

export interface NicheCreateInput extends Omit<Niche, keyof BaseEntity> {}
export interface NicheUpdateInput extends Partial<Omit<Niche, keyof BaseEntity>> {}

export interface PillarCreateInput extends Omit<Pillar, keyof BaseEntity> {}
export interface PillarUpdateInput extends Partial<Omit<Pillar, keyof BaseEntity>> {}

export interface SubpillarCreateInput extends Omit<Subpillar, keyof BaseEntity> {}
export interface SubpillarUpdateInput extends Partial<Omit<Subpillar, keyof BaseEntity>> {}

export interface StructureClient {
    // Niche operations
    createNiche(data: NicheCreateInput): Promise<Niche>;
    findNicheById(id: string): Promise<Niche | null>;
    findNichesByUserId(userId: string): Promise<Niche[]>;
    updateNiche(id: string, data: Partial<Niche>): Promise<Niche | null>;
    deleteNiche(id: string): Promise<boolean>;
    findNiches(filters: NicheFilters, options?: PaginationOptions): Promise<Niche[]>;

    // Pillar operations
    createPillar(data: PillarCreateInput): Promise<Pillar>;
    findPillarById(id: string): Promise<Pillar | null>;
    findPillarsByNicheId(nicheId: string): Promise<Pillar[]>;
    updatePillar(id: string, data: Partial<Pillar>): Promise<Pillar | null>;
    deletePillar(id: string): Promise<boolean>;
    findPillars(filters: PillarFilters, options?: PaginationOptions): Promise<Pillar[]>;

    // Subpillar operations
    createSubpillar(data: SubpillarCreateInput): Promise<Subpillar>;
    findSubpillarById(id: string): Promise<Subpillar | null>;
    findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]>;
    updateSubpillar(id: string, data: Partial<Subpillar>): Promise<Subpillar | null>;
    deleteSubpillar(id: string): Promise<boolean>;
    findSubpillars(filters: SubpillarFilters, options?: PaginationOptions): Promise<Subpillar[]>;
}
