import { Response } from 'express';
import { AuthenticatedRequest, BaseHandler } from '../../shared/types';
import { SubpillarService } from '../../../services/SubpillarService';
import { SubpillarRequest, CreateSubpillarRequest } from '../types';
import { logger } from '../../../utils/log';
import { sendLLMRequest, AIModel } from '../../../services/llm';

const log = logger('routes/subpillars/handlers/generate');

type SubpillarAuthenticatedRequest = AuthenticatedRequest & SubpillarRequest;

export function createGenerateSubpillarsHandler(subpillarService: SubpillarService): BaseHandler {
  return async (req: SubpillarAuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const pillar = req.pillar!;

      if (pillar.status !== 'approved') {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Can only generate subpillars for approved pillars'
        });
        return;
      }

      const prompt = `Generate 3 detailed subpillars for the content pillar: "${pillar.title}".
        Each subpillar should be a specific subtopic or aspect that falls under this main pillar.
        The subpillars should be comprehensive enough to form the basis of detailed content pieces.
        Format the response as a numbered list (1., 2., etc.).`;

      const response = await sendLLMRequest(prompt, AIModel.GPT_4);
      
      const subpillarTitles: string[] = response
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.match(/^\d+\./))
        .map(line => line.replace(/^\d+\.\s*/, ''));

      if (subpillarTitles.length === 0) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Failed to generate valid subpillars from AI response'
        });
        return;
      }

      const createdSubpillars = await Promise.all(
        subpillarTitles.map(async (title: string) => {
          const createRequest: CreateSubpillarRequest = {
            title,
            pillarId: pillar.id,
            createdById: req.user.id,
            status: 'draft'
          };
          return await subpillarService.create(createRequest);
        })
      );

      log.info(`Generated ${createdSubpillars.length} subpillars for pillar ${pillar.id}`);
      res.status(201).json({ data: createdSubpillars });
    } catch (error) {
      log.error('Error generating subpillars:', error);
      if (error instanceof Error && error.message === 'AI Service Error') {
        res.status(500).json({
          error: 'Failed to generate subpillars',
          details: 'AI service encountered an error'
        });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
