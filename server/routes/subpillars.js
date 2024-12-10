const express = require('express');
const router = express.Router({ mergeParams: true });
const { sendLLMRequest } = require('../services/llm');
const { logger } = require('../utils/log');
const Pillar = require('../models/Pillar');
const Subpillar = require('../models/Subpillar');
const mongoose = require('mongoose');
const { authenticateWithToken } = require('./middleware/auth');

const log = logger('api/routes/subpillarsRoutes');

// Raw route handlers
const handlers = {
    async listSubpillars(req, res, next) {
        log.info('List handler:', {
            method: 'GET',
            pillarId: req.params.pillarId,
            path: req.path,
            originalUrl: req.originalUrl
        });

        try {
            // Pillar is validated and loaded by middleware
            const subpillars = await Subpillar.find({ pillar: req.pillar._id })
                .sort({ createdAt: 1 })
                .lean();

            log.info(`Found ${subpillars.length} subpillars`);
            res.status(200).json(subpillars);
        } catch (error) {
            next(error);
        }
    },

    async generateSubpillars(req, res, next) {
        log.info('Generate handler:', {
            method: 'POST',
            pillarId: req.params.pillarId,
            path: req.path,
            originalUrl: req.originalUrl
        });

        try {
            // Pillar is validated and authorized by middleware
            const pillar = req.pillar;

            // Status check
            if (pillar.status !== 'approved') {
                const error = new Error('Can only generate subpillars for approved pillars');
                error.type = 'ValidationError';
                throw error;
            }

            const prompt = `Generate 3 detailed subpillars for the content pillar: "${pillar.title}".
            Each subpillar should be a specific subtopic or aspect that falls under this main pillar.
            The subpillars should be comprehensive enough to form the basis of detailed content pieces.
            Format the response as a numbered list (1., 2., etc.).`;

            const response = await sendLLMRequest('openai', 'gpt-4', prompt);
            const subpillarTitles = response
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.match(/^\d+\./))
                .map(line => line.replace(/^\d+\.\s*/, ''));

            if (subpillarTitles.length === 0) {
                const error = new Error('Failed to generate subpillars');
                error.type = 'InternalError';
                throw error;
            }

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

            log.info(`Created ${createdSubpillars.length} subpillars`);
            res.status(201).json(createdSubpillars);
        } catch (error) {
            if (error.message === 'AI Service Error') {
                error.message = 'Failed to generate subpillars';
            }
            if (!error.type) {
                error.type = 'InternalError';
            }
            next(error);
        }
    },

    async updateSubpillar(req, res, next) {
        log.info('Update handler:', {
            method: 'PUT',
            id: req.params.id,
            path: req.path,
            originalUrl: req.originalUrl
        });

        try {
            // Subpillar is validated and authorized by middleware
            const subpillar = req.subpillar;
            const { title, status } = req.body;

            if (status && !['draft', 'active', 'archived'].includes(status)) {
                const error = new Error('Invalid status value');
                error.type = 'ValidationError';
                throw error;
            }

            subpillar.title = title || subpillar.title;
            subpillar.status = status || subpillar.status;
            await subpillar.save();

            log.info('Update successful');
            res.status(200).json(subpillar);
        } catch (error) {
            if (!error.type) {
                error.type = 'InternalError';
            }
            next(error);
        }
    },

    async deleteSubpillar(req, res, next) {
        log.info('Delete handler:', {
            method: 'DELETE',
            id: req.params.id,
            path: req.path,
            originalUrl: req.originalUrl
        });

        try {
            // Subpillar is validated and authorized by middleware
            const subpillar = req.subpillar;
            await subpillar.deleteOne();

            log.info('Delete successful');
            res.status(200).json({ message: 'Subpillar deleted successfully' });
        } catch (error) {
            if (!error.type) {
                error.type = 'InternalError';
            }
            next(error);
        }
    }
};

// Export handlers only, routes are mounted in testServer.js
module.exports = {
    handlers
};
