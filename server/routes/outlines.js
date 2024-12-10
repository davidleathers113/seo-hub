const express = require('express');
const router = express.Router();
const { authenticateWithToken: auth } = require('./middleware/auth');
const { logger } = require('../utils/log');
const Outline = require('../models/Outline');
const Research = require('../models/Research');
const { generateOutline, generateContentPoints, mergeContentIntoArticle } = require('../services/llm');

const log = logger('api/routes/outlinesRoutes');

// POST /subpillars/:subpillarId/outline - Generate outline from research
router.post('/subpillars/:subpillarId/outline', auth, async (req, res) => {
  try {
    const subpillarId = req.params.subpillarId;

    // Check if research exists for this subpillar
    const research = await Research.find({ subpillar: subpillarId });
    if (!research || research.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No research found for this subpillar'
      });
    }

    // Generate outline sections using AI
    const sections = await generateOutline(subpillarId);

    // Create new outline document
    const outline = new Outline({
      subpillar: subpillarId,
      sections: sections,
      createdBy: req.user._id
    });

    await outline.save();

    res.status(201).json({
      success: true,
      data: outline
    });
  } catch (error) {
    log.error('Error generating outline:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate outline'
    });
  }
});

// POST /outline/:outlineId/content - Generate content points for outline sections
router.post('/outline/:outlineId/content', auth, async (req, res) => {
  try {
    const outline = await Outline.findById(req.params.outlineId);
    if (!outline) {
      return res.status(404).json({
        success: false,
        error: 'Outline not found'
      });
    }

    // Get research for the subpillar
    const research = await Research.find({ subpillar: outline.subpillar })
      .select('content source');

    if (!research || research.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No research found for this outline'
      });
    }

    // Generate content points for each section
    for (let section of outline.sections) {
      const contentPoints = await generateContentPoints(section, research);
      section.contentPoints = contentPoints;
    }

    outline.status = 'in_progress';
    await outline.save();

    res.json({
      success: true,
      data: outline
    });
  } catch (error) {
    log.error('Error generating content points:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate content points'
    });
  }
});

// POST /articles/merge - Merge content points into draft article
router.post('/articles/merge', auth, async (req, res) => {
  try {
    const { outlineId } = req.body;
    if (!outlineId) {
      return res.status(400).json({
        success: false,
        error: 'Outline ID is required'
      });
    }

    const outline = await Outline.findById(outlineId);
    if (!outline) {
      return res.status(404).json({
        success: false,
        error: 'Outline not found'
      });
    }

    // Check if outline has content points
    const hasContentPoints = outline.sections.every(
      section => section.contentPoints && section.contentPoints.length > 0
    );

    if (!hasContentPoints) {
      return res.status(400).json({
        success: false,
        error: 'Outline sections must have content points before merging'
      });
    }

    // Generate article from outline
    const articleContent = await mergeContentIntoArticle(outline);

    outline.status = 'completed';
    await outline.save();

    res.json({
      success: true,
      data: {
        content: articleContent,
        outline: outline
      }
    });
  } catch (error) {
    log.error('Error merging content into article:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to merge content into article'
    });
  }
});

module.exports = router;
