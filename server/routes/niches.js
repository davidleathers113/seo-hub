const express = require('express');
const router = express.Router();
const NicheService = require('../services/niche');
const { requireUser } = require('./middleware/auth');

// Get all niches for the current user
router.get('/', requireUser, async (req, res) => {
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
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Niche name is required' });
    }
    const niche = await NicheService.create(req.user.id, name);
    res.status(201).json(niche);
  } catch (error) {
    console.error('Error creating niche:', error);
    res.status(500).json({ error: 'Failed to create niche' });
  }
});

module.exports = router;