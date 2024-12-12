import express from 'express';
import { Router } from 'express';
import { authenticateWithToken as auth } from './middleware/auth';
import { createNicheService } from '../services/NicheService';
import { logger } from '../utils/log';
import { isValidId } from '../utils/validation';
import { AuthenticatedRequest } from '../types/express';

const router: Router = express.Router();
const log = logger('routes/niches');
const nicheService = createNicheService();

// Get all niches for the authenticated user
router.get('/', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const niches = await nicheService.list(req.user.id);
    res.status(200).json({ data: niches });
  } catch (error) {
    log.error('Error fetching niches:', error);
    res.status(500).json({ error: 'Failed to fetch niches' });
  }
});

// Create a new niche
router.post('/', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { name } = req.body;
    log.info('Creating niche with name:', name, 'for user:', req.user.id);

    if (!name) {
      log.warn('Niche name is required but was not provided');
      return res.status(400).json({ error: 'Niche name is required' });
    }

    const niche = await nicheService.create(req.user.id, name);
    log.info('Niche created successfully:', niche);
    res.status(201).json(niche);
  } catch (error) {
    log.error('Error creating niche:', error);
    res.status(500).json({ error: 'Failed to create niche' });
  }
});

// Get a specific niche
router.get('/:id', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    const niche = await nicheService.getById(id, req.user.id);
    if (!niche) {
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }

    res.status(200).json({ data: niche });
  } catch (error) {
    log.error('Error fetching niche:', error);
    res.status(500).json({ error: 'Failed to fetch niche' });
  }
});

// Update a niche
router.put('/:id', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Niche name is required' });
    }

    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    const niche = await nicheService.update(id, req.user.id, { name });
    if (!niche) {
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }

    res.status(200).json(niche);
  } catch (error) {
    log.error('Error updating niche:', error);
    res.status(500).json({ error: 'Failed to update niche' });
  }
});

// Delete a niche
router.delete('/:id', auth, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    if (!isValidId(id)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    const result = await nicheService.delete(id, req.user.id);
    if (!result) {
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }

    res.status(200).json({ message: 'Niche deleted successfully' });
  } catch (error) {
    log.error('Error deleting niche:', error);
    res.status(500).json({ error: 'Failed to delete niche' });
  }
});

// Generate pillars using AI
router.post('/:nicheId/pillars/generate', auth, async (req: AuthenticatedRequest, res) => {
  log.info('Received POST request to generate pillars for a niche');
  try {
    const { nicheId } = req.params;

    if (!isValidId(nicheId)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    log.info(`Generating pillars for niche: ${nicheId} and user: ${req.user.id}`);
    const pillars = await nicheService.generatePillars(nicheId, req.user.id);
    log.info('Pillars generated successfully:', pillars);
    res.status(201).json({ data: pillars });
  } catch (error) {
    log.error('Error generating pillars:', error);
    if (error instanceof Error) {
      if (error.message === 'Invalid niche ID format' || error.message === 'No pillars generated') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Niche not found or not owned by the user') {
        return res.status(404).json({ error: error.message });
      }
    }
    res.status(500).json({ error: 'Failed to generate pillars' });
  }
});

export default router;