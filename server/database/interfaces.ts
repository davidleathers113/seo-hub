export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: string;
  password: string;
  name?: string;
  token?: string;
  lastLoginAt?: Date;
  isActive?: boolean;
}

export interface Niche extends BaseEntity {
  name: string;
  userId: string;
  pillars: Array<{
    title: string;
    status: string;
    approved: boolean;
  }>;
  progress: number;
  status: string;
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
  status: 'draft' | 'research' | 'outline' | 'writing' | 'review' | 'complete';
  createdById: string;
  content?: string;
  progress: number;
}

export interface Article extends BaseEntity {
  title: string;
  content: string;
  subpillarId: string;
  authorId: string;
  status: 'draft' | 'review' | 'published';
  seoScore?: number;
  keywords?: string[];
  metaDescription?: string;
}

export interface Research extends BaseEntity {
  subpillarId: string;
  content: string;
  source: string;
  relevance: number;
  notes?: string;
  createdById: string;
}

export interface Outline extends BaseEntity {
  subpillarId: string;
  sections: Array<{
    title: string;
    contentPoints: Array<{
      point: string;
      generated: boolean;
    }>;
    order: number;
  }>;
  status: 'draft' | 'approved' | 'in_progress';
  createdById: string;
}

// Query types for filtering and pagination
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilters {
  email?: string;
  name?: string;
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

export interface ArticleFilters {
  subpillarId?: string;
  authorId?: string;
  status?: string;
}

export interface DatabaseClient {
  // Connection management
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  healthCheck(): Promise<boolean>;

  // User operations
  findUsers(): Promise<User[]>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByToken(token: string): Promise<User | null>;
  createUser(data: Omit<User, keyof BaseEntity>): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | null>;
  deleteUser(id: string): Promise<boolean>;

  // Niche operations
  createNiche(data: Omit<Niche, keyof BaseEntity>): Promise<Niche>;
  findNicheById(id: string): Promise<Niche | null>;
  findNichesByUserId(userId: string): Promise<Niche[]>;
  updateNiche(id: string, data: Partial<Niche>): Promise<Niche | null>;
  deleteNiche(id: string): Promise<boolean>;
  findNiches(filters: NicheFilters, options?: PaginationOptions): Promise<Niche[]>;

  // Pillar operations
  createPillar(data: Omit<Pillar, keyof BaseEntity>): Promise<Pillar>;
  findPillarById(id: string): Promise<Pillar | null>;
  findPillarsByNicheId(nicheId: string): Promise<Pillar[]>;
  updatePillar(id: string, data: Partial<Pillar>): Promise<Pillar | null>;
  deletePillar(id: string): Promise<boolean>;
  findPillars(filters: PillarFilters, options?: PaginationOptions): Promise<Pillar[]>;

  // Subpillar operations
  createSubpillar(data: Omit<Subpillar, keyof BaseEntity>): Promise<Subpillar>;
  findSubpillarById(id: string): Promise<Subpillar | null>;
  findSubpillarsByPillarId(pillarId: string): Promise<Subpillar[]>;
  updateSubpillar(id: string, data: Partial<Subpillar>): Promise<Subpillar | null>;
  deleteSubpillar(id: string): Promise<boolean>;
  findSubpillars(filters: SubpillarFilters, options?: PaginationOptions): Promise<Subpillar[]>;

  // Article operations
  createArticle(data: Omit<Article, keyof BaseEntity>): Promise<Article>;
  findArticleById(id: string): Promise<Article | null>;
  findArticlesBySubpillarId(subpillarId: string): Promise<Article[]>;
  updateArticle(id: string, data: Partial<Article>): Promise<Article | null>;
  deleteArticle(id: string): Promise<boolean>;
  findArticles(filters: ArticleFilters, options?: PaginationOptions): Promise<Article[]>;

  // Research operations
  createResearch(data: Omit<Research, keyof BaseEntity>): Promise<Research>;
  findResearchById(id: string): Promise<Research | null>;
  findResearchBySubpillarId(subpillarId: string): Promise<Research[]>;
  updateResearch(id: string, data: Partial<Research>): Promise<Research | null>;
  deleteResearch(id: string): Promise<boolean>;

  // Outline operations
  createOutline(data: Omit<Outline, keyof BaseEntity>): Promise<Outline>;
  findOutlineById(id: string): Promise<Outline | null>;
  findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null>;
  updateOutline(id: string, data: Partial<Outline>): Promise<Outline | null>;
  deleteOutline(id: string): Promise<boolean>;

  // Session operations
  createSession(userId: string, data: any): Promise<string>;
  getSession(sessionId: string): Promise<any>;
  deleteSession(sessionId: string): Promise<boolean>;
}