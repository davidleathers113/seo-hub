import { BaseEntity, PaginationOptions } from './base';

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
    relevance: number;  // Changed to decimal in DB, but TypeScript uses number
    notes?: string;
    createdById: string;
    articleId?: string;
}

export interface KeyPoint extends BaseEntity {
    sectionId: string;
    content: string;
    orderIndex: number;
}

export interface OutlineSection {
    title: string;
    contentPoints: Array<{
        point: string;
        generated: boolean;
    }>;
    orderIndex: number;  // Renamed from order to match DB
    content?: string;
    keyPoints?: KeyPoint[];  // Added to support the new key_points table
}

export interface Outline extends BaseEntity {
    subpillarId: string;
    sections: OutlineSection[];
    status: 'draft' | 'approved' | 'in_progress';
    createdById: string;
}

export interface ArticleFilters {
    subpillarId?: string;
    authorId?: string;
    status?: string;
}

export interface ResearchFilters {
    subpillarId?: string;
    createdById?: string;
    minRelevance?: number;
    maxRelevance?: number;
}

export interface ArticleCreateInput extends Omit<Article, keyof BaseEntity> {}
export interface ArticleUpdateInput extends Partial<Omit<Article, keyof BaseEntity>> {}

export interface ResearchCreateInput extends Omit<Research, keyof BaseEntity> {}
export interface ResearchUpdateInput extends Partial<Omit<Research, keyof BaseEntity>> {}

export interface KeyPointCreateInput extends Omit<KeyPoint, keyof BaseEntity> {}
export interface KeyPointUpdateInput extends Partial<Omit<KeyPoint, keyof BaseEntity>> {}

export interface OutlineCreateInput extends Omit<Outline, keyof BaseEntity> {}
export interface OutlineUpdateInput extends Partial<Omit<Outline, keyof BaseEntity>> {}

export interface ContentClient {
    // Article operations
    createArticle(data: ArticleCreateInput): Promise<Article>;
    findArticleById(id: string): Promise<Article | null>;
    findArticlesBySubpillarId(subpillarId: string): Promise<Article[]>;
    updateArticle(id: string, data: Partial<Article>): Promise<Article | null>;
    deleteArticle(id: string): Promise<boolean>;
    findArticles(filters: ArticleFilters, options?: PaginationOptions): Promise<Article[]>;

    // Research operations
    createResearch(data: ResearchCreateInput): Promise<Research>;
    findResearchById(id: string): Promise<Research | null>;
    findResearchBySubpillarId(subpillarId: string): Promise<Research[]>;
    updateResearch(id: string, data: Partial<Research>): Promise<Research | null>;
    deleteResearch(id: string): Promise<boolean>;
    findResearch(filters: ResearchFilters, options?: PaginationOptions): Promise<Research[]>;

    // Key Point operations
    createKeyPoint(data: KeyPointCreateInput): Promise<KeyPoint>;
    findKeyPointById(id: string): Promise<KeyPoint | null>;
    findKeyPointsBySectionId(sectionId: string): Promise<KeyPoint[]>;
    updateKeyPoint(id: string, data: Partial<KeyPoint>): Promise<KeyPoint | null>;
    deleteKeyPoint(id: string): Promise<boolean>;

    // Outline operations
    createOutline(data: OutlineCreateInput): Promise<Outline>;
    findOutlineById(id: string): Promise<Outline | null>;
    findOutlineBySubpillarId(subpillarId: string): Promise<Outline | null>;
    updateOutline(id: string, data: Partial<Outline>): Promise<Outline | null>;
    deleteOutline(id: string): Promise<boolean>;
}
