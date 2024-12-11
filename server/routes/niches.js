const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Niche = require('../models/Niche');
const { authenticateWithToken: auth } = require('./middleware/auth');
const NicheService = require('../services/niche');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get all niches for the authenticated user
router.get('/', auth, async (req, res) => {
  try {
    const niches = await NicheService.list(req.user._id);
    res.status(200).json({ data: niches });
  } catch (error) {
    console.error('Error fetching niches:', error);
    res.status(500).json({ error: 'Failed to fetch niches' });
  }
});

// Create a new niche
router.post('/', auth, async (req, res) => {
  try {
    const { name } = req.body;
    console.log('Creating niche with name:', name, 'for user:', req.user._id);
    if (!name) {
      console.log('Niche name is required but was not provided');
      return res.status(400).json({ error: 'Niche name is required' });
    }
    const niche = await NicheService.create(req.user._id, name);
    console.log('Niche created successfully:', JSON.stringify(niche, null, 2));
    res.status(201).json(niche);
  } catch (error) {
    console.error('Error creating niche:', error);
    res.status(500).json({ error: 'Failed to create niche' });
  }
});

// Get a specific niche
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }
    const niche = await NicheService.getById(id, req.user._id);
    if (!niche) {
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }
    res.status(200).json({ data: niche });
  } catch (error) {
    console.error('Error fetching niche:', error);
    res.status(500).json({ error: 'Failed to fetch niche' });
  }
});

// Update a niche
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Niche name is required' });
    }
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }
    const niche = await NicheService.update(id, req.user._id, { name });
    if (!niche) {
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }
    res.status(200).json(niche);
  } catch (error) {
    console.error('Error updating niche:', error);
    res.status(500).json({ error: 'Failed to update niche' });
  }
});

// Delete a niche
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }
    const result = await NicheService.delete(id, req.user._id);
    if (!result) {
      return res.status(404).json({ error: 'Niche not found or not owned by the user' });
    }
    res.status(200).json({ message: 'Niche deleted successfully' });
  } catch (error) {
    console.error('Error deleting niche:', error);
    res.status(500).json({ error: 'Failed to delete niche' });
  }
});

// Generate pillars using AI
router.post('/:nicheId/pillars/generate', auth, async (req, res) => {
  console.log('Received POST request to generate pillars for a niche');
  try {
    const { nicheId } = req.params;

    if (!isValidObjectId(nicheId)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    console.log(`Generating pillars for niche: ${nicheId} and user: ${req.user._id}`);
    const pillars = await NicheService.generatePillars(nicheId, req.user._id);
    console.log('Pillars generated successfully:', JSON.stringify(pillars));
    res.status(201).json({ data: pillars });
  } catch (error) {
    console.error('Error generating pillars:', error);
    if (error.message === 'Invalid niche ID format' || error.message === 'No pillars generated') {
      return res.status(400).json({ error: error.message });
    }
    if (error.message === 'Niche not found or not owned by the user') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to generate pillars' });
  }
});

module.exports = router;