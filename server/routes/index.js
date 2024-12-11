const express = require('express');
const router = express.Router();
const authRouter = require('./auth').router;
const nichesRoutes = require('./niches');
const pillarsRoutes = require('./pillars');
const subpillarsRoutes = require('./subpillars');
const researchRoutes = require('./research');
const outlinesRoutes = require('./outlines');
const seoRoutes = require('./seo');
const articlesRoutes = require('./articles');

// Mount all routes
router.use('/auth', authRouter);
router.use('/niches', nichesRoutes);
router.use('/pillars', pillarsRoutes);
router.use('/pillars/:pillarId/subpillars', subpillarsRoutes);
router.use('/research', researchRoutes);
router.use('/outlines', outlinesRoutes);
router.use('/articles/seo', seoRoutes);
router.use('/articles', articlesRoutes);

module.exports = router;
