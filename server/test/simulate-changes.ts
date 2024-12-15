import { PostgresClient } from '../database/postgres/client';
import { ContentGeneration, GenerationRequest } from '../database/interfaces/workflow';

async function simulateChanges() {
    const client = new PostgresClient();
    
    try {
        // Connect to database
        await client.connect();
        console.log('Connected to database');

        // 1. Create a test user
        const timestamp = new Date().getTime();
        const user = await client.createUser({
            email: `test${timestamp}@example.com`,
            password: 'hashedPassword123',
            name: 'Test User',
            role: 'user'
        });
        console.log('Created user:', user);

        // 2. Create a niche
        const niche = await client.createNiche({
            name: 'Digital Marketing',
            userId: user.id,
            status: 'in_progress',
            progress: 0,
            pillars: []
        });
        console.log('Created niche:', niche);

        // 3. Test content generation for a pillar
        const pillar = await client.createPillar({
            title: 'SEO Fundamentals',
            nicheId: niche.id,
            status: 'in_progress',
            createdById: user.id
        });
        console.log('Created pillar:', pillar);

        // Test initial generation
        const pillarGenRequest: GenerationRequest = {
            llmId: 1,
            temperature: 0.7,
            maxTokens: 1000,
            customPrompt: "Generate a comprehensive pillar about SEO fundamentals"
        };

        const pillarGeneration = await client.generateContent('pillar', pillar.id, pillarGenRequest);
        console.log('Initial generation:', pillarGeneration);

        // 4. Test generation status updates
        await client.updateGenerationStatus(pillarGeneration.id, 'completed');
        console.log('Updated generation status to completed');

        // 5. Test metadata updates
        await client.updateGenerationMetadata(pillarGeneration.id, {
            modelName: 'gpt-4',
            tokensUsed: 850,
            promptTokens: 100,
            completionTokens: 750
        });
        console.log('Updated generation metadata');

        // 6. Test failed generation
        const failedGenRequest: GenerationRequest = {
            llmId: 999, // Non-existent LLM to simulate failure
            temperature: 0.7,
            maxTokens: 1000
        };

        try {
            await client.generateContent('pillar', pillar.id, failedGenRequest);
        } catch (err) {
            const error = err as Error;
            console.log('Expected generation failure:', error.message || 'Unknown error occurred');
        }

        // 7. Test retry functionality
        const retryGeneration = await client.retryGeneration(pillarGeneration.id);
        console.log('Retry generation:', retryGeneration);

        // Update retry status
        await client.updateGenerationStatus(retryGeneration.id, 'completed');
        console.log('Updated retry generation status');

        // 8. Test generation history
        const generationHistory = await client.getGenerationHistory(pillar.id);
        console.log('Generation history:', generationHistory);

        // 9. Test getting specific generation
        const specificGeneration = await client.getGenerationById(pillarGeneration.id);
        console.log('Specific generation:', specificGeneration);

        // 10. Test subpillar generation with different parameters
        const subpillar = await client.createSubpillar({
            title: 'On-Page SEO',
            pillarId: pillar.id,
            createdById: user.id,
            status: 'draft' // Using a valid status value that exists in both TypeScript and DB
        });

        const subpillarGenRequest: GenerationRequest = {
            llmId: 1,
            temperature: 0.8,
            maxTokens: 1500,
            customPrompt: "Generate detailed content about on-page SEO techniques"
        };

        const subpillarGeneration = await client.generateContent('subpillar', subpillar.id, subpillarGenRequest);
        console.log('Subpillar generation:', subpillarGeneration);

        // Update status and add metadata
        await client.updateGenerationStatus(subpillarGeneration.id, 'completed');
        await client.updateGenerationMetadata(subpillarGeneration.id, {
            tokensUsed: 1200,
            completionTokens: 1000,
            promptTokens: 200,
            modelName: 'gpt-4',
            additionalInfo: {
                topics: ['meta tags', 'header optimization', 'content structure'],
                complexity: 'intermediate'
            }
        });

        // Verify subpillar generation history
        const subpillarHistory = await client.getGenerationHistory(subpillar.id);
        console.log('Subpillar generation history:', subpillarHistory);

        // Clean up test data
        await client.deleteSubpillar(subpillar.id);
        await client.deletePillar(pillar.id);
        await client.deleteNiche(niche.id);
        await client.deleteUser(user.id);
        console.log('Cleaned up test data');

        console.log('All operations completed successfully');
    } catch (err) {
        const error = err as Error;
        console.error('Error during simulation:', error.message || 'Unknown error occurred');
    } finally {
        await client.disconnect();
        console.log('Disconnected from database');
    }
}

// Run the simulation
simulateChanges();
