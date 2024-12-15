import { DatabaseClient, User, Niche, Pillar, Subpillar, Article, Research, Outline, OutlineSection } from '../../database/interfaces';

export class DatabaseHelper {
    constructor(private db: DatabaseClient) {}

    async createUser(data: Partial<User> = {}): Promise<User> {
        const defaultUser = {
            email: `test-${Date.now()}@example.com`,
            password: 'password123',
            name: 'Test User',
            isActive: true,
            role: 'user' as const
        };

        return this.db.createUser({
            ...defaultUser,
            ...data,
            email: data.email || defaultUser.email,
            password: data.password || defaultUser.password
        });
    }

    async createNiche(userId: string, data: Partial<Niche> = {}): Promise<Niche> {
        const defaultNiche = {
            name: `Test Niche ${Date.now()}`,
            userId,
            pillars: [],
            progress: 0,
            status: 'pending' as const
        };

        return this.db.createNiche({
            ...defaultNiche,
            ...data,
            userId: data.userId || userId
        });
    }

    async createPillar(nicheId: string, userId: string, data: Partial<Pillar> = {}): Promise<Pillar> {
        const defaultPillar = {
            title: `Test Pillar ${Date.now()}`,
            nicheId,
            status: 'pending' as const,
            createdById: userId
        };

        return this.db.createPillar({
            ...defaultPillar,
            ...data,
            nicheId: data.nicheId || nicheId,
            createdById: data.createdById || userId
        });
    }

    async createSubpillar(pillarId: string, userId: string, data: Partial<Subpillar> = {}): Promise<Subpillar> {
        const defaultSubpillar = {
            title: 'Test Subpillar',
            pillarId,
            createdById: userId,
            status: 'draft' as const
        };

        return this.db.createSubpillar({
            ...defaultSubpillar,
            ...data,
            pillarId: data.pillarId || pillarId,
            createdById: data.createdById || userId
        });
    }

    async createArticle(subpillarId: string, userId: string, data: Partial<Article> = {}): Promise<Article> {
        const defaultArticle = {
            title: `Test Article ${Date.now()}`,
            content: 'Test content',
            subpillarId,
            authorId: userId,
            status: 'draft' as const
        };

        return this.db.createArticle({
            ...defaultArticle,
            ...data,
            subpillarId: data.subpillarId || subpillarId,
            authorId: data.authorId || userId
        });
    }

    async createResearch(subpillarId: string, userId: string, data: Partial<Research> = {}): Promise<Research> {
        const defaultResearch = {
            subpillarId,
            content: 'Test research content',
            source: 'Test source',
            relevance: 5,
            createdById: userId
        };

        return this.db.createResearch({
            ...defaultResearch,
            ...data,
            subpillarId: data.subpillarId || subpillarId,
            createdById: data.createdById || userId
        });
    }

    async createOutline(subpillarId: string, userId: string, data: Partial<Outline> = {}): Promise<Outline> {
        const defaultSections: OutlineSection[] = [
            {
                title: 'Introduction',
                contentPoints: [{ point: 'Test introduction point', generated: false }],
                order: 0
            },
            {
                title: 'Main Section',
                contentPoints: [{ point: 'Test main point', generated: false }],
                order: 1
            },
            {
                title: 'Conclusion',
                contentPoints: [{ point: 'Test conclusion point', generated: false }],
                order: 2
            }
        ];

        const defaultOutline = {
            subpillarId,
            sections: defaultSections,
            status: 'draft' as const,
            createdById: userId
        };

        return this.db.createOutline({
            ...defaultOutline,
            ...data,
            subpillarId: data.subpillarId || subpillarId,
            createdById: data.createdById || userId
        });
    }
}