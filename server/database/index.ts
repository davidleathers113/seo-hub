import { Pool, QueryResult, QueryResultRow } from 'pg';
import { DatabaseClient } from './interfaces';
import { logger } from '../utils/log';
import { NicheClient } from './postgres/clients/niche-client';
import { UserClient } from './postgres/clients/user-client';

const log = logger('database');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'content_creation_app',
    password: process.env.DB_PASSWORD || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432'),
});

export const db = {
    query: async <T extends QueryResultRow = any>(
        text: string,
        params?: any[]
    ): Promise<QueryResult<T>> => {
        const result = await pool.query<T>(text, params);
        return result;
    },
    getClient: () => pool.connect(),
};

let dbClient: DatabaseClient | null = null;

export function getDatabase(): DatabaseClient {
    if (!dbClient) {
        log.info('Initializing database client');
        const nicheClient = new NicheClient(pool);
        const userClient = new UserClient(pool);

        dbClient = {
            // Use actual PostgreSQL implementations where available
            connect: async () => {},
            disconnect: async () => {},
            healthCheck: async () => true,
            ping: async () => true,

            // Use the PostgreSQL user client
            findUsers: userClient.findUsers.bind(userClient),
            findUserById: userClient.findUserById.bind(userClient),
            findUserByEmail: userClient.findUserByEmail.bind(userClient),
            findUserByToken: userClient.findUserByToken.bind(userClient),
            createUser: userClient.createUser.bind(userClient),
            updateUser: userClient.updateUser.bind(userClient),
            deleteUser: userClient.deleteUser.bind(userClient),

            // Use the PostgreSQL niche client
            createNiche: nicheClient.createNiche.bind(nicheClient),
            findNicheById: nicheClient.findNicheById.bind(nicheClient),
            findNichesByUserId: nicheClient.findNichesByUserId.bind(nicheClient),
            updateNiche: nicheClient.updateNiche.bind(nicheClient),
            deleteNiche: nicheClient.deleteNiche.bind(nicheClient),
            findNiches: async () => [],

            // Mock implementations for other operations
            createPillar: async () => { throw new Error('Not implemented') },
            findPillarById: async () => null,
            findPillarsByNicheId: async () => [],
            updatePillar: async () => null,
            deletePillar: async () => false,
            findPillars: async () => [],
            createSubpillar: async () => { throw new Error('Not implemented') },
            findSubpillarById: async () => null,
            findSubpillarsByPillarId: async () => [],
            updateSubpillar: async () => null,
            deleteSubpillar: async () => false,
            findSubpillars: async () => [],
            createArticle: async () => { throw new Error('Not implemented') },
            findArticleById: async () => null,
            findArticlesBySubpillarId: async () => [],
            updateArticle: async () => null,
            deleteArticle: async () => false,
            findArticles: async () => [],
            createResearch: async () => { throw new Error('Not implemented') },
            findResearchById: async () => null,
            findResearchBySubpillarId: async () => [],
            updateResearch: async () => null,
            deleteResearch: async () => false,
            createOutline: async () => { throw new Error('Not implemented') },
            findOutlineById: async () => null,
            findOutlineBySubpillarId: async () => null,
            updateOutline: async () => null,
            deleteOutline: async () => false,
            createSession: async () => { throw new Error('Not implemented') },
            findSessionById: async () => null,
            findSessionByToken: async () => null,
            findSessionsByUserId: async () => [],
            updateSession: async () => null,
            deleteSession: async () => false,
            deleteExpiredSessions: async () => 0,
            deleteUserSessions: async () => 0,
            cleanupSessions: async () => {},
        };
    }
    return dbClient;
}
