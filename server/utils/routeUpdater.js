const fs = require('fs').promises;
const path = require('path');
const routeConfig = require('./routeConfig');

async function updateRouteFiles() {
    const serverDir = path.join(__dirname, '..');
    const routesDir = path.join(serverDir, 'routes');
    const testsDir = path.join(routesDir, '__tests__');

    try {
        // Update subpillars routes
        const subpillarsContent = `const express = require('express');
const router = express.Router({ mergeParams: true });
const { sendLLMRequest } = require('../services/llm');
const { logger } = require('../utils/log');
const Pillar = require('../models/Pillar');
const Subpillar = require('../models/Subpillar');
const mongoose = require('mongoose');
const routeConfig = require('../utils/routeConfig');

const log = logger('api/routes/subpillarsRoutes');

const handlers = {
    async listSubpillars(req, res) {
        try {
            const pillar = await Pillar.findById(req.params.pillarId);
            if (!pillar) {
                return res.status(404).json({ error: 'Pillar not found' });
            }
            const subpillars = await Subpillar.find({ pillar: req.params.pillarId });
            res.status(200).json(subpillars);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch subpillars' });
        }
    },

    async generateSubpillars(req, res) {
        try {
            const pillar = await Pillar.findById(req.params.pillarId);
            if (!pillar) {
                return res.status(404).json({ error: 'Pillar not found' });
            }

            if (pillar.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to modify this pillar' });
            }

            if (pillar.status !== 'approved') {
                return res.status(400).json({ error: 'Can only generate subpillars for approved pillars' });
            }

            const prompt = \`Generate 3 detailed subpillars for the content pillar: "\${pillar.title}".\`;
            const response = await sendLLMRequest('openai', 'gpt-4', prompt);
            const subpillarTitles = response.split('\\n')
                .map(line => line.trim())
                .filter(line => line.match(/^\\d+\\./))
                .map(line => line.replace(/^\\d+\\.\\s*/, ''));

            const createdSubpillars = await Promise.all(
                subpillarTitles.map(title => 
                    Subpillar.create({
                        title,
                        pillar: pillar._id,
                        createdBy: req.user._id,
                        status: 'draft'
                    })
                )
            );

            res.status(201).json(createdSubpillars);
        } catch (error) {
            res.status(500).json({ error: 'Failed to generate subpillars' });
        }
    },

    async updateSubpillar(req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(404).json({ error: 'Subpillar not found' });
            }

            const subpillar = await Subpillar.findById(req.params.id);
            if (!subpillar) {
                return res.status(404).json({ error: 'Subpillar not found' });
            }

            if (subpillar.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to modify this subpillar' });
            }

            const { title, status } = req.body;
            if (status && !['draft', 'active', 'archived'].includes(status)) {
                return res.status(400).json({ error: 'Invalid status value' });
            }

            subpillar.title = title || subpillar.title;
            subpillar.status = status || subpillar.status;
            await subpillar.save();

            res.status(200).json(subpillar);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update subpillar' });
        }
    },

    async deleteSubpillar(req, res) {
        try {
            if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
                return res.status(404).json({ error: 'Subpillar not found' });
            }

            const subpillar = await Subpillar.findById(req.params.id);
            if (!subpillar) {
                return res.status(404).json({ error: 'Subpillar not found' });
            }

            if (subpillar.createdBy.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'Not authorized to delete this subpillar' });
            }

            await subpillar.deleteOne();
            res.status(200).json({ message: 'Subpillar deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete subpillar' });
        }
    }
};

// Mount routes using paths from routeConfig
router.get(routeConfig.subpillars.list.replace(routeConfig.API_BASE, ''), handlers.listSubpillars);
router.post(routeConfig.subpillars.generate.replace(routeConfig.API_BASE, ''), handlers.generateSubpillars);
router.put(routeConfig.subpillars.update.replace(routeConfig.API_BASE, ''), handlers.updateSubpillar);
router.delete(routeConfig.subpillars.delete.replace(routeConfig.API_BASE, ''), handlers.deleteSubpillar);

module.exports = router;`;

        await fs.writeFile(path.join(routesDir, 'subpillars.js'), subpillarsContent);

        // Create a script to run the updates
        const updateScript = `
#!/usr/bin/env node

const { updateRouteFiles } = require('./utils/routeUpdater');

async function main() {
    try {
        await updateRouteFiles();
        console.log('Successfully updated route files');
    } catch (error) {
        console.error('Failed to update route files:', error);
        process.exit(1);
    }
}

main();`;

        await fs.writeFile(path.join(serverDir, 'updateRoutes.js'), updateScript);
        await fs.chmod(path.join(serverDir, 'updateRoutes.js'), 0o755);

        console.log('Successfully created route updater utility');
    } catch (error) {
        console.error('Failed to update route files:', error);
        throw error;
    }
}

module.exports = { updateRouteFiles };
