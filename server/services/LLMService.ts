import OpenRouterService from './openRouter';
import { DatabaseClient, Research, Niche } from '../database/interfaces';
import { getDatabase } from '../database';
import { logger } from '../utils/log';
import { OPENROUTER_MODELS, OpenRouterModel } from '../config/openRouter';
import { ValidationError } from '../database/mongodb/client';

const log = logger('services/LLMService');

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export class LLMService {
  private db: DatabaseClient;
  private openRouter: OpenRouterService;

  constructor(dbClient?: DatabaseClient) {
    this.db = dbClient || getDatabase();
    this.openRouter = new OpenRouterService();
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async sendLLMRequest(message: string, model: OpenRouterModel = OPENROUTER_MODELS.GPT4): Promise<string> {
    for (let i = 0; i < MAX_RETRIES; i++) {
      try {
        log.info(`Sending request to OpenRouter with model: ${model}`);
        const response = await this.openRouter.generateWithRetry(message, {
          model,
          temperature: 0.7,
          max_tokens: 1024
        });
        log.info('Received response from OpenRouter');
        return response;
      } catch (error) {
        log.error(`Error sending request to OpenRouter (attempt ${i + 1}):`, error);
        if (i === MAX_RETRIES - 1) throw error;
        await this.sleep(RETRY_DELAY);
      }
    }
    throw new Error('Failed to get response from OpenRouter after max retries');
  }

  async generatePillars(nicheId: string): Promise<string[]> {
    try {
      const niche = await this.db.findNicheById(nicheId);
      if (!niche) {
        throw new ValidationError('Niche not found');
      }

      const prompt = `Generate 5 main content pillars for the niche: ${niche.name}.
      These pillars should be comprehensive topics that can be expanded into detailed content.
      Each pillar should be unique and cover a different aspect of the niche.
      Format the response as a numbered list (1., 2., etc.).`;

      const response = await this.sendLLMRequest(prompt);

      // Parse the response into individual pillar titles
      const pillars = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\./)) // Only keep numbered lines
        .map(line => line.replace(/^\d+\.\s*/, '')); // Remove numbers

      if (pillars.length === 0) {
        throw new Error('Failed to generate valid pillars');
      }

      return pillars;
    } catch (error) {
      log.error('Error in AI pillar generation:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to generate pillars using AI');
    }
  }

  async generateOutline(subpillarId: string): Promise<Array<{ title: string; contentPoints: any[]; order: number }>> {
    try {
      // Get research related to the subpillar
      const research = await this.db.findResearchBySubpillarId(subpillarId);

      if (!research || research.length === 0) {
        throw new ValidationError('No research found for this subpillar');
      }

      // Combine research content
      const researchContent = research
        .map(r => `Source: ${r.source}\nContent: ${r.content}`)
        .join('\n\n');

      const prompt = `Based on the following research, generate a comprehensive article outline with 4-6 main sections. Each section should have a clear title that reflects its content.

Research:
${researchContent}

Format the response as:
1. [Section Title]
2. [Section Title]
etc.`;

      const response = await this.sendLLMRequest(prompt);

      // Parse the response into sections
      const sections = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\./))
        .map((line, index) => ({
          title: line.replace(/^\d+\.\s*/, ''),
          contentPoints: [],
          order: index
        }));

      if (sections.length === 0) {
        throw new Error('Failed to generate valid outline sections');
      }

      return sections;
    } catch (error) {
      log.error('Error in AI outline generation:', error);
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new Error('Failed to generate outline using AI');
    }
  }

  async generateContentPoints(outlineSection: { title: string }, research: Research[]): Promise<Array<{ point: string; generated: boolean }>> {
    try {
      const prompt = `Based on the following research, generate 3-5 detailed content points for the article section titled "${outlineSection.title}". Each point should be comprehensive and backed by the research provided.

Research:
${research.map(r => `Source: ${r.source}\nContent: ${r.content}`).join('\n\n')}

Format each point as a clear, detailed statement that can be expanded into full paragraphs.`;

      const response = await this.sendLLMRequest(prompt);

      // Parse the response into content points
      const contentPoints = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(point => ({
          point: point.replace(/^[-•]\s*/, ''),
          generated: true
        }));

      if (contentPoints.length === 0) {
        throw new Error('Failed to generate valid content points');
      }

      return contentPoints;
    } catch (error) {
      log.error('Error in AI content point generation:', error);
      throw new Error('Failed to generate content points using AI');
    }
  }
}

// Factory function to create LLMService instance
export function createLLMService(dbClient?: DatabaseClient): LLMService {
  return new LLMService(dbClient);
}
