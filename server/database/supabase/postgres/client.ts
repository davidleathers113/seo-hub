import { DatabaseClient } from '../interfaces';
import { BasePostgresClient } from './base-client';
import { UserClient } from './clients/user-client';
import { StructureClient } from './clients/structure-client';
import { ContentClient } from './clients/content-client';
import { WorkflowClient } from './clients/workflow-client';
import { WorkflowClient as IWorkflowClient, ContentGeneration, GenerationRequest } from '../interfaces/workflow';

export class PostgresClient extends BasePostgresClient implements DatabaseClient, IWorkflowClient {
    private userClient: UserClient;
    private structureClient: StructureClient;
    private contentClient: ContentClient;
    private workflowClient: WorkflowClient;

    // User operations
    findUsers: DatabaseClient['findUsers'];
    findUserById: DatabaseClient['findUserById'];
    findUserByEmail: DatabaseClient['findUserByEmail'];
    findUserByToken: DatabaseClient['findUserByToken'];
    createUser: DatabaseClient['createUser'];
    updateUser: DatabaseClient['updateUser'];
    deleteUser: DatabaseClient['deleteUser'];

    // Session operations
    createSession: DatabaseClient['createSession'];
    findSessionById: DatabaseClient['findSessionById'];
    findSessionByToken: DatabaseClient['findSessionByToken'];
    findSessionsByUserId: DatabaseClient['findSessionsByUserId'];
    updateSession: DatabaseClient['updateSession'];
    deleteSession: DatabaseClient['deleteSession'];
    deleteExpiredSessions: DatabaseClient['deleteExpiredSessions'];
    deleteUserSessions: DatabaseClient['deleteUserSessions'];
    cleanupSessions: DatabaseClient['cleanupSessions'];

    // Niche operations
    createNiche: DatabaseClient['createNiche'];
    findNicheById: DatabaseClient['findNicheById'];
    findNichesByUserId: DatabaseClient['findNichesByUserId'];
    updateNiche: DatabaseClient['updateNiche'];
    deleteNiche: DatabaseClient['deleteNiche'];
    findNiches: DatabaseClient['findNiches'];

    // Pillar operations
    createPillar: DatabaseClient['createPillar'];
    findPillarById: DatabaseClient['findPillarById'];
    findPillarsByNicheId: DatabaseClient['findPillarsByNicheId'];
    updatePillar: DatabaseClient['updatePillar'];
    deletePillar: DatabaseClient['deletePillar'];
    findPillars: DatabaseClient['findPillars'];

    // Subpillar operations
    createSubpillar: DatabaseClient['createSubpillar'];
    findSubpillarById: DatabaseClient['findSubpillarById'];
    findSubpillarsByPillarId: DatabaseClient['findSubpillarsByPillarId'];
    updateSubpillar: DatabaseClient['updateSubpillar'];
    deleteSubpillar: DatabaseClient['deleteSubpillar'];
    findSubpillars: DatabaseClient['findSubpillars'];

    // Article operations
    createArticle: DatabaseClient['createArticle'];
    findArticleById: DatabaseClient['findArticleById'];
    findArticlesBySubpillarId: DatabaseClient['findArticlesBySubpillarId'];
    updateArticle: DatabaseClient['updateArticle'];
    deleteArticle: DatabaseClient['deleteArticle'];
    findArticles: DatabaseClient['findArticles'];

    // Research operations
    createResearch: DatabaseClient['createResearch'];
    findResearchById: DatabaseClient['findResearchById'];
    findResearchBySubpillarId: DatabaseClient['findResearchBySubpillarId'];
    updateResearch: DatabaseClient['updateResearch'];
    deleteResearch: DatabaseClient['deleteResearch'];

    // Outline operations
    createOutline: DatabaseClient['createOutline'];
    findOutlineById: DatabaseClient['findOutlineById'];
    findOutlineBySubpillarId: DatabaseClient['findOutlineBySubpillarId'];
    updateOutline: DatabaseClient['updateOutline'];
    deleteOutline: DatabaseClient['deleteOutline'];

    // Workflow operations
    getAllLLMs: IWorkflowClient['getAllLLMs'];
    getLLMsByProvider: IWorkflowClient['getLLMsByProvider'];
    getWorkflowSteps: IWorkflowClient['getWorkflowSteps'];
    getUserStepSettings: IWorkflowClient['getUserStepSettings'];
    updateUserStepSettings: IWorkflowClient['updateUserStepSettings'];
    resetUserStepSettings: IWorkflowClient['resetUserStepSettings'];
    generateContent: IWorkflowClient['generateContent'];
    getGenerationHistory: IWorkflowClient['getGenerationHistory'];
    getGenerationById: IWorkflowClient['getGenerationById'];
    retryGeneration: IWorkflowClient['retryGeneration'];
    updateGenerationStatus: (id: string, status: ContentGeneration['status'], error?: string) => Promise<ContentGeneration>;
    updateGenerationMetadata: (id: string, metadata: Record<string, any>) => Promise<ContentGeneration>;

    constructor(config: { uri?: string } = {}) {
        super(config);
        this.userClient = new UserClient(config);
        this.structureClient = new StructureClient(config);
        this.contentClient = new ContentClient(config);
        this.workflowClient = new WorkflowClient(config);

        // Bind all methods in constructor
        // User operations
        this.findUsers = this.userClient.findUsers.bind(this.userClient);
        this.findUserById = this.userClient.findUserById.bind(this.userClient);
        this.findUserByEmail = this.userClient.findUserByEmail.bind(this.userClient);
        this.findUserByToken = this.userClient.findUserByToken.bind(this.userClient);
        this.createUser = this.userClient.createUser.bind(this.userClient);
        this.updateUser = this.userClient.updateUser.bind(this.userClient);
        this.deleteUser = this.userClient.deleteUser.bind(this.userClient);

        // Session operations
        this.createSession = this.userClient.createSession.bind(this.userClient);
        this.findSessionById = this.userClient.findSessionById.bind(this.userClient);
        this.findSessionByToken = this.userClient.findSessionByToken.bind(this.userClient);
        this.findSessionsByUserId = this.userClient.findSessionsByUserId.bind(this.userClient);
        this.updateSession = this.userClient.updateSession.bind(this.userClient);
        this.deleteSession = this.userClient.deleteSession.bind(this.userClient);
        this.deleteExpiredSessions = this.userClient.deleteExpiredSessions.bind(this.userClient);
        this.deleteUserSessions = this.userClient.deleteUserSessions.bind(this.userClient);
        this.cleanupSessions = this.userClient.cleanupSessions.bind(this.userClient);

        // Niche operations
        this.createNiche = this.structureClient.createNiche.bind(this.structureClient);
        this.findNicheById = this.structureClient.findNicheById.bind(this.structureClient);
        this.findNichesByUserId = this.structureClient.findNichesByUserId.bind(this.structureClient);
        this.updateNiche = this.structureClient.updateNiche.bind(this.structureClient);
        this.deleteNiche = this.structureClient.deleteNiche.bind(this.structureClient);
        this.findNiches = this.structureClient.findNiches.bind(this.structureClient);

        // Pillar operations
        this.createPillar = this.structureClient.createPillar.bind(this.structureClient);
        this.findPillarById = this.structureClient.findPillarById.bind(this.structureClient);
        this.findPillarsByNicheId = this.structureClient.findPillarsByNicheId.bind(this.structureClient);
        this.updatePillar = this.structureClient.updatePillar.bind(this.structureClient);
        this.deletePillar = this.structureClient.deletePillar.bind(this.structureClient);
        this.findPillars = this.structureClient.findPillars.bind(this.structureClient);

        // Subpillar operations
        this.createSubpillar = this.structureClient.createSubpillar.bind(this.structureClient);
        this.findSubpillarById = this.structureClient.findSubpillarById.bind(this.structureClient);
        this.findSubpillarsByPillarId = this.structureClient.findSubpillarsByPillarId.bind(this.structureClient);
        this.updateSubpillar = this.structureClient.updateSubpillar.bind(this.structureClient);
        this.deleteSubpillar = this.structureClient.deleteSubpillar.bind(this.structureClient);
        this.findSubpillars = this.structureClient.findSubpillars.bind(this.structureClient);

        // Article operations
        this.createArticle = this.contentClient.createArticle.bind(this.contentClient);
        this.findArticleById = this.contentClient.findArticleById.bind(this.contentClient);
        this.findArticlesBySubpillarId = this.contentClient.findArticlesBySubpillarId.bind(this.contentClient);
        this.updateArticle = this.contentClient.updateArticle.bind(this.contentClient);
        this.deleteArticle = this.contentClient.deleteArticle.bind(this.contentClient);
        this.findArticles = this.contentClient.findArticles.bind(this.contentClient);

        // Research operations
        this.createResearch = this.contentClient.createResearch.bind(this.contentClient);
        this.findResearchById = this.contentClient.findResearchById.bind(this.contentClient);
        this.findResearchBySubpillarId = this.contentClient.findResearchBySubpillarId.bind(this.contentClient);
        this.updateResearch = this.contentClient.updateResearch.bind(this.contentClient);
        this.deleteResearch = this.contentClient.deleteResearch.bind(this.contentClient);

        // Outline operations
        this.createOutline = this.contentClient.createOutline.bind(this.contentClient);
        this.findOutlineById = this.contentClient.findOutlineById.bind(this.contentClient);
        this.findOutlineBySubpillarId = this.contentClient.findOutlineBySubpillarId.bind(this.contentClient);
        this.updateOutline = this.contentClient.updateOutline.bind(this.contentClient);
        this.deleteOutline = this.contentClient.deleteOutline.bind(this.contentClient);

        // Workflow operations
        this.getAllLLMs = this.workflowClient.getAllLLMs.bind(this.workflowClient);
        this.getLLMsByProvider = this.workflowClient.getLLMsByProvider.bind(this.workflowClient);
        this.getWorkflowSteps = this.workflowClient.getWorkflowSteps.bind(this.workflowClient);
        this.getUserStepSettings = this.workflowClient.getUserStepSettings.bind(this.workflowClient);
        this.updateUserStepSettings = this.workflowClient.updateUserStepSettings.bind(this.workflowClient);
        this.resetUserStepSettings = this.workflowClient.resetUserStepSettings.bind(this.workflowClient);
        this.generateContent = this.workflowClient.generateContent.bind(this.workflowClient);
        this.getGenerationHistory = this.workflowClient.getGenerationHistory.bind(this.workflowClient);
        this.getGenerationById = this.workflowClient.getGenerationById.bind(this.workflowClient);
        this.retryGeneration = this.workflowClient.retryGeneration.bind(this.workflowClient);
        this.updateGenerationStatus = this.workflowClient.updateGenerationStatus.bind(this.workflowClient);
        this.updateGenerationMetadata = this.workflowClient.updateGenerationMetadata.bind(this.workflowClient);
    }
}
