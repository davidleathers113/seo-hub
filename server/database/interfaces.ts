import { Document } from '@supabase/supabase-js';

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface BaseDocument extends Document {
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
    role?: 'user' | 'admin';
}

export interface UserDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<User, 'id'> {
    generateAuthToken(): string;
    regenerateToken(): Promise<UserDocument>;
}

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

export interface NicheDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Niche, 'id'> {}

export interface Pillar extends BaseEntity {
    title: string;
    nicheId: string;
    status: 'pending' | 'approved' | 'rejected' | 'in_progress';
    createdById: string;
}

export interface PillarDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Pillar, 'id'> {}

export interface Subpillar extends BaseEntity {
    title: string;
    pillarId: string;
    createdById: string;
    status: 'draft' | 'active' | 'archived';
}

export interface SubpillarDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Subpillar, 'id'> {}

export interface Article extends BaseEntity {
    title: string;
    content: string;
    subpillarId: string;
    authorId: string;
    status: 'draft' | 'review' | 'published';
    seoScore?: number;
    readabilityScore?: number;
    plagiarismScore?: number;
    keywordDensity?: number;
    keywords?: string[];
    metaDescription?: string;
}

export interface ArticleDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Article, 'id'> {}

export interface Research extends BaseEntity {
    subpillarId: string;
    content: string;
    source: string;
    relevance: number;
    notes?: string;
    createdById: string;
    articleId?: string;
}

export interface ResearchDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Research, 'id'> {}

export interface OutlineSection {
    title: string;
    contentPoints: Array<{
        point: string;
        generated: boolean;
    }>;
    order: number;
    content?: string;
}

export interface Outline extends BaseEntity {
    subpillarId: string;
    sections: OutlineSection[];
    status: 'draft' | 'approved' | 'in_progress';
    createdById: string;
}

export interface OutlineDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Outline, 'id'> {}

// Input interfaces
export interface UserCreateInput extends Omit<User, keyof BaseEntity> {}
export interface UserUpdateInput extends Partial<Omit<User, keyof BaseEntity>> {}

export interface NicheCreateInput extends Omit<Niche, keyof BaseEntity> {}
export interface NicheUpdateInput extends Partial<Omit<Niche, keyof BaseEntity>> {}

export interface PillarCreateInput extends Omit<Pillar, keyof BaseEntity> {}
export interface PillarUpdateInput extends Partial<Omit<Pillar, keyof BaseEntity>> {}

export interface SubpillarCreateInput extends Omit<Subpillar, keyof BaseEntity> {}
export interface SubpillarUpdateInput extends Partial<Omit<Subpillar, keyof BaseEntity>> {}

export interface ResearchCreateInput extends Omit<Research, keyof BaseEntity> {}
export interface ResearchUpdateInput extends Partial<Omit<Research, keyof BaseEntity>> {}

export interface ArticleCreateInput extends Omit<Article, keyof BaseEntity> {}
export interface ArticleUpdateInput extends Partial<Omit<Article, keyof BaseEntity>> {}

export interface OutlineCreateInput extends Omit<Outline, keyof BaseEntity> {}
export interface OutlineUpdateInput extends Partial<Omit<Outline, keyof BaseEntity>> {}

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

export interface Session extends BaseEntity {
    userId: string;
    token: string;
    expiresAt: Date;
    lastActivityAt: Date;
    isActive: boolean;
    userAgent?: string;
    ipAddress?: string;
}

export interface SessionDocument extends BaseDatabase["public"]["Tables"][TableName]["Row"], Omit<Session, 'id'> {}

export interface SessionCreateInput extends Omit<Session, keyof BaseEntity> {}
export interface SessionUpdateInput extends Partial<Omit<Session, keyof BaseEntity>> {}

export interface DatabaseConfig {
    uri: string;
    dbName?: string;
}

export interface DatabaseClient {
    // Connection management
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    healthCheck(): Promise<boolean>;
    ping?(): Promise<boolean>;

    // User operations
    findUsers(): Promise<User[]>;
    findUserById(id: string): Promise<User | null>;
    findUserByEmail(email: string): Promise<User | null>;
    findUserByToken(token: string): Promise<User | null>;
    createUser(data: Omit<User, keyof BaseEntity>): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User | null>;
    deleteUser(id: string): Promise<boolean>;

    // Niche operations
    createNiche(data: NicheCreateInput): Promise<Niche>;
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
    createSession(data: SessionCreateInput): Promise<Session>;
    findSessionById(id: string): Promise<Session | null>;
    findSessionByToken(token: string): Promise<Session | null>;
    findSessionsByUserId(userId: string): Promise<Session[]>;
    updateSession(id: string, data: SessionUpdateInput): Promise<Session | null>;
    deleteSession(id: string): Promise<boolean>;
    deleteExpiredSessions(): Promise<number>;
    deleteUserSessions(userId: string): Promise<number>;
    cleanupSessions(): Promise<void>;

    // Fixture operations (for testing)
    createFixture?(data: any): Promise<any>;
    findFixture?(query: any): Promise<any>;
    updateFixture?(data: any): Promise<any>;
    clearFixtures?(): Promise<void>;
}
