const express = require('express');
const router = express.Router({ mergeParams: true });
const { sendLLMRequest } = require('../services/llm');
const { logger } = require('../utils/log');
const Pillar = require('../models/Pillar');
const Subpillar = require('../models/Subpillar');
const mongoose = require('mongoose');
const { authenticateWithToken } = require('./middleware/auth');

const log = logger('api/routes/subpillarsRoutes');

// Middleware to load and validate pillar
const loadPillar = async (req, res, next) => {
    const { pillarId } = req.params;
    log.info('Loading pillar:', { pillarId });

    try {
        if (!mongoose.Types.ObjectId.isValid(pillarId)) {
            log.error('Invalid pillar ID format:', { pillarId });
            return res.status(400).json({ error: 'Invalid pillar ID format' });
        }

        const pillar = await Pillar.findById(pillarId);
        if (!pillar) {
            log.error('Pillar not found:', { pillarId });
            return res.status(404).json({ error: 'Pillar not found' });
        }

        if (pillar.createdBy.toString() !== req.user._id.toString()) {
            log.error('Unauthorized pillar access:', {
                pillarId,
                userId: req.user._id,
                pillarOwnerId: pillar.createdBy
            });
            return res.status(403).json({ error: 'Not authorized to access this pillar' });
        }

        req.pillar = pillar;
        log.info('Pillar loaded successfully:', {
            pillarId,
            pillarTitle: pillar.title,
            pillarStatus: pillar.status
        });
        next();
    } catch (error) {
        log.error('Error loading pillar:', {
            pillarId,
            error: error.message,
            stack: error.stack
        });
        next(error);
    }
};

// Raw route handlers
const handlers = {
    async listSubpillars(req, res, next) {
        const { pillarId } = req.params;
        log.info('List subpillars request:', {
            method: 'GET',
            pillarId,
            path: req.path,
            originalUrl: req.originalUrl,
            userId: req.user._id
        });

        try {
            const subpillars = await Subpillar.find({ pillar: req.pillar._id })
                .sort({ createdAt: 1 })
                .lean();

            log.info('Subpillars retrieved successfully:', {
                pillarId,
                count: subpillars.length,
                subpillarIds: subpillars.map(s => s._id)
            });
            res.status(200).json({ data: subpillars });
        } catch (error) {
            log.error('Error listing subpillars:', {
                pillarId,
                error: error.message,
                stack: error.stack,
                userId: req.user._id
            });
            next(error);
        }
    },

    async generateSubpillars(req, res, next) {
        const { pillarId } = req.params;
        log.info('Generate subpillars request:', {
            method: 'POST',
            pillarId,
            path: req.path,
            originalUrl: req.originalUrl,
            userId: req.user._id,
            pillarTitle: req.pillar.title,
            pillarStatus: req.pillar.status
        });

        try {
            const pillar = req.pillar;

            if (pillar.status !== 'approved') {
                log.warn('Attempt to generate subpillars for unapproved pillar:', {
                    pillarId,
                    pillarStatus: pillar.status,
                    userId: req.user._id
                });
                return res.status(400).json({
                    error: 'Can only generate subpillars for approved pillars',
                    currentStatus: pillar.status
                });
            }

            const prompt = `Generate 3 detailed subpillars for the content pillar: "${pillar.title}".
            Each subpillar should be a specific subtopic or aspect that falls under this main pillar.
            The subpillars should be comprehensive enough to form the basis of detailed content pieces.
            Format the response as a numbered list (1., 2., etc.).`;

            log.info('Sending LLM request:', {
                pillarId,
                model: 'gpt-4',
                promptLength: prompt.length
            });

            const response = await sendLLMRequest('openai', 'gpt-4', prompt);
            const subpillarTitles = response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.match(/^\d+\./))
                .map(line => line.replace(/^\d+\.\s*/, ''));

            if (subpillarTitles.length === 0) {
                log.error('No subpillars generated from LLM response:', {
                    pillarId,
                    response,
                    userId: req.user._id
                });
                return res.status(500).json({
                    error: 'Failed to generate subpillars',
                    details: 'LLM response did not contain properly formatted subpillars'
                });
            }

            log.info('Parsed subpillar titles:', {
                pillarId,
                count: subpillarTitles.length,
                titles: subpillarTitles
            });

            // Create subpillars with sequential timestamps to maintain order
            const baseTimestamp = Date.now();
            const createdSubpillars = await Promise.all(
                subpillarTitles.map(async (title, index) => {
                    const subpillar = await Subpillar.create({
                        title,
                        pillar: pillar._id,
                        createdBy: req.user._id,
                        status: 'draft',
                        createdAt: new Date(baseTimestamp + index)
                    });
                    return subpillar.toObject();
                })
            );

            log.info('Subpillars created successfully:', {
                pillarId,
                count: createdSubpillars.length,
                subpillarIds: createdSubpillars.map(s => s._id)
            });

            res.status(201).json({ data: createdSubpillars });
        } catch (error) {
            log.error('Error generating subpillars:', {
                pillarId,
                error: error.message,
                stack: error.stack,
                type: error.type || 'InternalError',
                userId: req.user._id
            });

            if (error.message === 'AI Service Error') {
                return res.status(500).json({
                    error: 'Failed to generate subpillars',
                    details: 'AI service encountered an error'
                });
            }

            next(error);
        }
    },

    async updateSubpillar(req, res, next) {
        const { id } = req.params;
        log.info('Update subpillar request:', {
            method: 'PUT',
            subpillarId: id,
            path: req.path,
            originalUrl: req.originalUrl,
            userId: req.user._id,
            updates: req.body
        });

        try {
            const subpillar = await Subpillar.findById(id);
            if (!subpillar) {
                log.error('Subpillar not found:', { subpillarId: id });
                return res.status(404).json({ error: 'Subpillar not found' });
            }

            if (subpillar.createdBy.toString() !== req.user._id.toString()) {
                log.error('Unauthorized subpillar update:', {
                    subpillarId: id,
                    userId: req.user._id,
                    subpillarOwnerId: subpillar.createdBy
                });
                return res.status(403).json({ error: 'Not authorized to modify this subpillar' });
            }

            const { title, status } = req.body;

            if (status && !['draft', 'active', 'archived'].includes(status)) {
                log.warn('Invalid status value:', { status, subpillarId: id });
                return res.status(400).json({
                    error: 'Invalid status value',
                    allowedValues: ['draft', 'active', 'archived']
                });
            }

            const updates = {
                ...(title && { title }),
                ...(status && { status })
            };

            const updatedSubpillar = await Subpillar.findByIdAndUpdate(
                id,
                updates,
                { new: true, runValidators: true }
            );

            log.info('Subpillar updated successfully:', {
                subpillarId: id,
                updates,
                newStatus: updatedSubpillar.status
            });

            res.status(200).json({ data: updatedSubpillar });
        } catch (error) {
            log.error('Error updating subpillar:', {
                subpillarId: id,
                error: error.message,
                stack: error.stack,
                userId: req.user._id
            });
            next(error);
        }
    },

    async deleteSubpillar(req, res, next) {
        const { id } = req.params;
        log.info('Delete subpillar request:', {
            method: 'DELETE',
            subpillarId: id,
            path: req.path,
            originalUrl: req.originalUrl,
            userId: req.user._id
        });

        try {
            const subpillar = await Subpillar.findById(id);
            if (!subpillar) {
                log.error('Subpillar not found:', { subpillarId: id });
                return res.status(404).json({ error: 'Subpillar not found' });
            }

            if (subpillar.createdBy.toString() !== req.user._id.toString()) {
                log.error('Unauthorized subpillar deletion:', {
                    subpillarId: id,
                    userId: req.user._id,
                    subpillarOwnerId: subpillar.createdBy
                });
                return res.status(403).json({ error: 'Not authorized to delete this subpillar' });
            }

            await subpillar.deleteOne();
            log.info('Subpillar deleted successfully:', { subpillarId: id });
            res.status(200).json({ message: 'Subpillar deleted successfully' });
        } catch (error) {
            log.error('Error deleting subpillar:', {
                subpillarId: id,
                error: error.message,
                stack: error.stack,
                userId: req.user._id
            });
            next(error);
        }
    }
};

// Mount handlers to routes with pillar middleware
router.use(authenticateWithToken, loadPillar);
router.get('/', handlers.listSubpillars);
router.post('/generate', handlers.generateSubpillars);
router.put('/:id', handlers.updateSubpillar);
router.delete('/:id', handlers.deleteSubpillar);

module.exports = router;
