const express = require('express');
const router = express.Router();
const { router: authRouter } = require('./auth');
const nichesRoutes = require('./niches');
const pillarsRoutes = require('./pillars');
const subpillarsRoutes = require('./subpillars');
const researchRoutes = require('./research');
const outlinesRoutes = require('./outlines');
const seoRoutes = require('./seo');
const articlesRoutes = require('./articles');

// Root path response
router.get("/", (req, res) => {
  res.status(200).send("Welcome to Your Website!");
});

router.get("/ping", (req, res) => {
  res.status(200).send("pong");
});

// Register route modules
router.use('/auth', authRouter);
router.use('/api/niches', nichesRoutes);
router.use('/api/pillars', pillarsRoutes);
router.use('/api/pillars', subpillarsRoutes); // Mount subpillars routes under /api/pillars
router.use('/api', researchRoutes); // Mount research routes under /api
router.use('/api', outlinesRoutes); // Mount outline routes under /api
router.use('/api/articles', seoRoutes); // Mount SEO routes under /api/articles
router.use('/api/articles', articlesRoutes); // Mount articles routes under /api/articles

module.exports = router;
