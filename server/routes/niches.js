const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Niche = require('../models/Niche');
const { authenticateWithToken: auth } = require('./middleware/auth');
const NicheService = require('../services/niche');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Generate pillars using AI
router.post('/niches/:nicheId/pillars/generate', auth, async (req, res) => {
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