const express = require('express');
const router = express.Router();
const NicheService = require('../services/niche');
const { requireUser } = require('./middleware/auth');

// Get all niches for the current user
router.get('/', requireUser, async (req, res) => {
  console.log('Received GET request for all niches');
  try {
    console.log(`Fetching niches for user: ${req.user.id}`);
    const niches = await NicheService.list(req.user.id);
    console.log(`Sending niches response:`, JSON.stringify(niches, null, 2));
    res.json({ data: niches });
  } catch (error) {
    console.error('Error fetching niches:', error);
    res.status(500).json({ error: 'Failed to fetch niches' });
  }
});

// Create a new niche
router.post('/', requireUser, async (req, res) => {
  console.log('Received POST request to create a new niche');
  try {
    const { name } = req.body;
    if (!name) {
      console.log('Niche name is required but not provided');
      return res.status(400).json({ error: 'Niche name is required' });
    }
    console.log(`Creating niche with name: ${name} for user: ${req.user.id}`);
    const niche = await NicheService.create(req.user.id, name);
    console.log(`Niche created successfully: ${JSON.stringify(niche)}`);
    res.status(201).json(niche);
  } catch (error) {
    console.error('Error creating niche:', error);
    res.status(500).json({ error: 'Failed to create niche' });
  }
});

// Get a specific niche by ID
router.get('/:id', requireUser, async (req, res) => {
  console.log('Niche route hit for ID:', req.params.id);
  try {
    const nicheId = req.params.id;
    const userId = req.user.id;
    console.log('Fetching niche for user:', userId);
    const niche = await NicheService.getById(nicheId, userId);

    if (!niche) {
      console.log('Niche not found or not owned by user');
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }

    console.log('Niche found:', niche);
    res.json({ data: niche });
  } catch (error) {
    console.error('Error fetching niche:', error);
    res.status(500).json({ error: 'Failed to fetch niche' });
  }
});

// Update a niche
router.put('/:id', requireUser, async (req, res) => {
  console.log('Received PUT request to update a niche');
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      console.log('Niche name is required but not provided');
      return res.status(400).json({ error: 'Niche name is required' });
    }

    console.log(`Updating niche with ID: ${id} for user: ${req.user.id}`);
    const updatedNiche = await NicheService.update(id, req.user.id, { name });

    if (!updatedNiche) {
      console.log('Niche not found or not owned by user');
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }

    console.log(`Niche updated successfully: ${JSON.stringify(updatedNiche)}`);
    res.json(updatedNiche);
  } catch (error) {
    console.error('Error updating niche:', error);
    res.status(500).json({ error: 'Failed to update niche' });
  }
});

module.exports = router;