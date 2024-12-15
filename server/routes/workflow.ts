import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { WorkflowService } from '../services/WorkflowService';
import { authenticateToken } from '../middleware/auth';
import { StepUpdateRequest } from '../types/workflow';
import { AuthUser } from '../types/user';
import { logger } from '../utils/log';

const log = logger('workflow-routes');

interface WorkflowError extends Error {
    message: string;
}

// Define a type for request handlers that include authenticated user
type WorkflowHandler = (
    req: Request & { user?: AuthUser },
    res: Response,
    next?: NextFunction
) => Promise<void | Response> | void | Response;

// Transform snake_case to camelCase
const transformLLM = (llm: any) => ({
    id: llm.id,
    name: llm.name,
    modelId: llm.model_id,
    provider: llm.provider,
    contextLength: llm.context_length
});

const transformStep = (step: any) => ({
    stepName: step.name,
    modelId: step.default_model_id || '',
    temperature: step.default_temperature,
    maxTokens: step.default_max_tokens,
    prompt: step.default_prompt
});

const transformUserSettings = (settings: any) => ({
    stepName: settings.step_name,
    modelId: settings.model_id || '',
    temperature: settings.temperature,
    maxTokens: settings.max_tokens,
    prompt: settings.custom_prompt
});

export function createWorkflowRouter(workflowService: WorkflowService) {
    const router = express.Router();

    // Add logging middleware
    const loggingMiddleware: RequestHandler = (req, res, next) => {
        log.info(`${req.method} ${req.originalUrl}`, {
            auth: req.headers.authorization?.substring(0, 20) + '...',
            user: req.user
        });
        next();
    };

    router.use(loggingMiddleware);

    // Get all available LLMs
    const getLLMs: WorkflowHandler = async (_req, res) => {
        try {
            log.info('Fetching all LLMs');
            const llms = await workflowService.getAllLLMs();
            const transformedLLMs = llms.map(transformLLM);
            log.info(`Successfully fetched ${transformedLLMs?.length || 0} LLMs`);
            res.json(transformedLLMs);
        } catch (error) {
            const err = error as WorkflowError;
            log.error('Error fetching LLMs:', err);
            res.status(500).json({ error: 'Failed to fetch LLMs', details: err.message });
        }
    };

    // Get LLMs by provider
    const getLLMsByProvider: WorkflowHandler = async (req, res) => {
        try {
            const provider = req.params.provider;
            log.info(`Fetching LLMs for provider: ${provider}`);
            const llms = await workflowService.getLLMsByProvider(provider);
            const transformedLLMs = llms.map(transformLLM);
            log.info(`Successfully fetched ${transformedLLMs?.length || 0} LLMs for provider ${provider}`);
            res.json(transformedLLMs);
        } catch (error) {
            const err = error as WorkflowError;
            log.error('Error fetching LLMs by provider:', err);
            res.status(500).json({ error: 'Failed to fetch LLMs', details: err.message });
        }
    };

    // Get all workflow steps with default settings
    const getWorkflowSteps: WorkflowHandler = async (_req, res) => {
        try {
            log.info('Fetching workflow steps');
            const steps = await workflowService.getWorkflowSteps();
            const transformedSteps = steps.map(transformStep);
            log.info(`Successfully fetched ${transformedSteps?.length || 0} workflow steps`);
            res.json(transformedSteps);
        } catch (error) {
            const err = error as WorkflowError;
            log.error('Error fetching workflow steps:', err);
            res.status(500).json({ error: 'Failed to fetch workflow steps', details: err.message });
        }
    };

    // Get user's custom settings for all steps
    const getUserSettings: WorkflowHandler = async (req, res) => {
        try {
            log.info('Fetching user settings');
            if (!req.user?.id) {
                log.warn('No user ID in request');
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const userId = req.user.id;
            log.info(`Fetching settings for user: ${userId}`);
            const defaultSteps = await workflowService.getWorkflowSteps();
            const userSettings = await workflowService.getUserStepSettings(userId);
            
            const response = {
                steps: userSettings.map(transformUserSettings),
                defaultSteps: defaultSteps.map(transformStep)
            };
            
            log.info('Successfully fetched user settings');
            res.json(response);
        } catch (error) {
            const err = error as WorkflowError;
            log.error('Error fetching user settings:', err);
            res.status(500).json({ error: 'Failed to fetch user settings', details: err.message });
        }
    };

    // Update settings for a specific step
    const updateStepSettings: WorkflowHandler = async (req, res) => {
        try {
            log.info('Updating step settings');
            if (!req.user?.id) {
                log.warn('No user ID in request');
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const userId = req.user.id;
            const stepId = parseInt(req.params.stepId);
            const settings: StepUpdateRequest = {
                llm_id: req.body.modelId,
                temperature: req.body.temperature,
                max_tokens: req.body.maxTokens,
                custom_prompt: req.body.prompt
            };
            log.info(`Updating settings for user: ${userId}, step: ${stepId}`, { settings });

            await workflowService.updateUserStepSettings(userId, stepId, settings);
            log.info('Successfully updated settings');
            res.json({ message: 'Settings updated successfully' });
        } catch (error) {
            const err = error as WorkflowError;
            log.error('Error updating step settings:', err);
            res.status(500).json({ error: 'Failed to update step settings', details: err.message });
        }
    };

    // Reset all steps to default settings
    const resetSettings: WorkflowHandler = async (req, res) => {
        try {
            log.info('Resetting settings to default');
            if (!req.user?.id) {
                log.warn('No user ID in request');
                return res.status(401).json({ error: 'User not authenticated' });
            }
            const userId = req.user.id;
            log.info(`Resetting settings for user: ${userId}`);
            await workflowService.resetUserStepSettings(userId);
            log.info('Successfully reset settings');
            res.json({ message: 'Settings reset successfully' });
        } catch (error) {
            const err = error as WorkflowError;
            log.error('Error resetting settings:', err);
            res.status(500).json({ error: 'Failed to reset settings', details: err.message });
        }
    };

    // Apply routes with authentication
    router.get('/llms', authenticateToken as express.RequestHandler, getLLMs as express.RequestHandler);
    router.get('/llms/:provider', authenticateToken as express.RequestHandler, getLLMsByProvider as express.RequestHandler);
    router.get('/steps', authenticateToken as express.RequestHandler, getWorkflowSteps as express.RequestHandler);
    router.get('/settings', authenticateToken as express.RequestHandler, getUserSettings as express.RequestHandler);
    router.put('/steps/:stepId/settings', authenticateToken as express.RequestHandler, updateStepSettings as express.RequestHandler);
    router.post('/settings/reset', authenticateToken as express.RequestHandler, resetSettings as express.RequestHandler);

    return router;
}

export default createWorkflowRouter;
