const express = require('express');
const router = express.Router();
const auth = require('./middleware/auth');
const Article = require('../models/Article');
const { logger } = require('../utils/log');
const log = logger('articles');
const fs = require('fs').promises;
const path = require('path');
const officegen = require('officegen');

// GET /articles - List all articles owned by the authenticated user
router.get('/', auth.authenticateWithToken, async (req, res) => {
  try {
    const articles = await Article.find({ author: req.user._id })
      .select('title metaDescription createdAt updatedAt seoScore')
      .sort({ updatedAt: -1 });
    
    log.info(`Retrieved ${articles.length} articles for user ${req.user._id}`);
    res.json(articles);
  } catch (error) {
    log.error(`Error retrieving articles: ${error.message}`);
    res.status(500).json({ error: 'Error retrieving articles' });
  }
});

// GET /articles/:id - Retrieve a single article
router.get('/:id', auth.authenticateWithToken, async (req, res) => {
  try {
    const article = await Article.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    log.info(`Retrieved article ${req.params.id} for user ${req.user._id}`);
    res.json(article);
  } catch (error) {
    log.error(`Error retrieving article ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: 'Error retrieving article' });
  }
});

// POST /articles/:id/export - Export article in different formats
router.post('/:id/export', auth.authenticateWithToken, async (req, res) => {
  try {
    const { format } = req.body;
    if (!['txt', 'docx', 'html'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format specified' });
    }

    const article = await Article.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    const exportDir = path.join(__dirname, '../exports');
    await fs.mkdir(exportDir, { recursive: true });

    const fileName = `${article._id}-${Date.now()}.${format}`;
    const filePath = path.join(exportDir, fileName);

    switch (format) {
      case 'txt':
        const txtContent = `${article.title}\n\n${article.content}`;
        await fs.writeFile(filePath, txtContent);
        res.download(filePath, `${article.title}.${format}`, async (err) => {
          if (err) {
            log.error(`Error sending exported file: ${err.message}`);
          }
          await fs.unlink(filePath).catch(err => 
            log.error(`Error cleaning up exported file: ${err.message}`)
          );
        });
        break;

      case 'docx':
        const docx = officegen('docx');
        
        docx.on('error', (err) => {
          log.error(`Error generating docx: ${err}`);
          res.status(500).json({ error: 'Error generating document' });
        });

        // Add content to the document
        const pObj = docx.createP();
        pObj.addText(article.title, { bold: true, font_size: 16 });
        docx.createP().addText(article.content);

        // Set response headers
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        res.setHeader('Content-Disposition', `attachment; filename="${article.title}.docx"`);

        // Pipe the document directly to the response
        docx.generate(res);
        break;

      case 'html':
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>${article.title}</title>
              <meta name="description" content="${article.metaDescription}">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
                h1 { color: #333; }
              </style>
            </head>
            <body>
              <h1>${article.title}</h1>
              <div>${article.content}</div>
            </body>
          </html>
        `;
        await fs.writeFile(filePath, htmlContent);
        res.download(filePath, `${article.title}.${format}`, async (err) => {
          if (err) {
            log.error(`Error sending exported file: ${err.message}`);
          }
          await fs.unlink(filePath).catch(err => 
            log.error(`Error cleaning up exported file: ${err.message}`)
          );
        });
        break;
    }

    log.info(`Exported article ${req.params.id} as ${format} for user ${req.user._id}`);
  } catch (error) {
    log.error(`Error exporting article ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: 'Error exporting article' });
  }
});

// DELETE /articles/:id - Delete an article
router.delete('/:id', auth.authenticateWithToken, async (req, res) => {
  try {
    const article = await Article.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    log.info(`Deleted article ${req.params.id} for user ${req.user._id}`);
    res.json({ message: 'Article deleted successfully' });
  } catch (error) {
    log.error(`Error deleting article ${req.params.id}: ${error.message}`);
    res.status(500).json({ error: 'Error deleting article' });
  }
});

module.exports = router;
