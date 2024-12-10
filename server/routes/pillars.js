const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Pillar = require('../models/Pillar');
const NicheService = require('../services/niche');
const { authenticateWithToken: auth } = require('./middleware/auth');

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a pillar manually
router.post('/niches/:nicheId/pillars', auth, async (req, res) => {
  try {
    const { nicheId } = req.params;
    const { title, status } = req.body;

    if (!isValidObjectId(nicheId)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }
    
    const pillar = await Pillar.create({
      title,
      status,
      niche: nicheId,
      createdBy: req.user._id
    });

    res.status(201).json(pillar);
  } catch (error) {
    console.error('Error creating pillar:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to create pillar' });
  }
});

// Generate pillars using AI
router.post('/niches/:nicheId/pillars/generate', auth, async (req, res) => {
  try {
    const { nicheId } = req.params;

    if (!isValidObjectId(nicheId)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    const generatedPillars = await NicheService.generatePillars(nicheId, req.user._id);
    
    // Create pillar documents
    const pillars = await Promise.all(
      generatedPillars.map(pillar => 
        Pillar.create({
          title: pillar.title,
          status: pillar.status,
          niche: nicheId,
          createdBy: req.user._id
        })
      )
    );

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

// Get all pillars for a niche
router.get('/niches/:nicheId/pillars', auth, async (req, res) => {
  try {
    const { nicheId } = req.params;

    if (!isValidObjectId(nicheId)) {
      return res.status(400).json({ error: 'Invalid niche ID format' });
    }

    const pillars = await Pillar.find({ niche: nicheId })
      .sort({ createdAt: -1 });
    res.json(pillars);
  } catch (error) {
    console.error('Error fetching pillars:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to fetch pillars' });
  }
});

// Approve a pillar
router.put('/pillars/:id/approve', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid pillar ID format' });
    }

    const pillar = await Pillar.findById(req.params.id);
    
    if (!pillar) {
      return res.status(404).json({ error: 'Pillar not found' });
    }
    
    if (pillar.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to approve this pillar' });
    }

    if (pillar.status === 'approved') {
      return res.status(400).json({ error: 'Pillar is already approved' });
    }
    
    pillar.status = 'approved';
    await pillar.save();
    
    res.json(pillar);
  } catch (error) {
    console.error('Error approving pillar:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to approve pillar' });
  }
});

// Update a pillar
router.put('/pillars/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid pillar ID format' });
    }

    const { title, status } = req.body;
    const pillar = await Pillar.findById(req.params.id);
    
    if (!pillar) {
      return res.status(404).json({ error: 'Pillar not found' });
    }
    
    if (pillar.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to modify this pillar' });
    }

    // Validate update fields
    const allowedFields = ['title', 'status'];
    const updateFields = Object.keys(req.body);
    const hasInvalidFields = updateFields.some(field => !allowedFields.includes(field));

    if (hasInvalidFields) {
      return res.status(400).json({ error: 'Invalid fields in request' });
    }
    
    if (title) pillar.title = title;
    if (status) pillar.status = status;
    
    await pillar.save();
    res.json(pillar);
  } catch (error) {
    console.error('Error updating pillar:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to update pillar' });
  }
});

// Delete a pillar
router.delete('/pillars/:id', auth, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid pillar ID format' });
    }

    const pillar = await Pillar.findById(req.params.id);
    
    if (!pillar) {
      return res.status(404).json({ error: 'Pillar not found' });
    }
    
    if (pillar.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized to delete this pillar' });
    }
    
    await pillar.deleteOne();
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting pillar:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to delete pillar' });
  }
});

module.exports = router;
