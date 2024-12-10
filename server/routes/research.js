const express = require('express');
const router = express.Router();
const Research = require('../models/Research');
const Subpillar = require('../models/Subpillar');
const { authenticateWithToken: auth } = require('./middleware/auth');

// POST /subpillars/:subpillarId/research
router.post('/subpillars/:subpillarId/research', auth, async (req, res) => {
  try {
    const { content, source, notes } = req.body;
    const subpillarId = req.params.subpillarId;

    // Verify subpillar exists
    const subpillar = await Subpillar.findById(subpillarId);
    if (!subpillar) {
      return res.status(404).json({ message: 'Subpillar not found' });
    }

    const research = new Research({
      subpillarId,
      content,
      source,
      notes
    });

    await research.save();
    res.status(201).json(research);
  } catch (error) {
    res.status(500).json({ message: 'Error creating research item', error: error.message });
  }
});

// GET /subpillars/:subpillarId/research
router.get('/subpillars/:subpillarId/research', auth, async (req, res) => {
  try {
    const subpillarId = req.params.subpillarId;

    // Verify subpillar exists
    const subpillar = await Subpillar.findById(subpillarId);
    if (!subpillar) {
      return res.status(404).json({ message: 'Subpillar not found' });
    }

    const researchItems = await Research.find({ subpillarId });
    res.json(researchItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving research items', error: error.message });
  }
});

// PUT /research/:id
router.put('/research/:id', auth, async (req, res) => {
  try {
    const { content, source, notes } = req.body;
    const researchId = req.params.id;

    const research = await Research.findById(researchId);
    if (!research) {
      return res.status(404).json({ message: 'Research item not found' });
    }

    research.content = content || research.content;
    research.source = source || research.source;
    research.notes = notes || research.notes;

    await research.save();
    res.json(research);
  } catch (error) {
    res.status(500).json({ message: 'Error updating research item', error: error.message });
  }
});

// DELETE /research/:id
router.delete('/research/:id', auth, async (req, res) => {
  try {
    const researchId = req.params.id;
    const research = await Research.findById(researchId);
    
    if (!research) {
      return res.status(404).json({ message: 'Research item not found' });
    }

    await Research.findByIdAndDelete(researchId);
    res.json({ message: 'Research item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting research item', error: error.message });
  }
});

module.exports = router;
