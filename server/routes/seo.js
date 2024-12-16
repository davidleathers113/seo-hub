const express = require('express');
const router = express.Router();
const log = require('../utils/log');
const @supabase/supabase-js = require('@supabase/supabase-js');
const Article = require('../models/Article');

// SEO scoring criteria and weights
const SEO_CRITERIA = {
  titleLength: { weight: 0.2, ideal: { min: 50, max: 60 } },
  keywordDensity: { weight: 0.15, ideal: { min: 1, max: 2.5 } },
  headingStructure: { weight: 0.15 },
  metaDescription: { weight: 0.2, ideal: { min: 150, max: 160 } },
  contentLength: { weight: 0.3, ideal: { min: 1500 } }
};

// Cache for storing SEO results
const seoCache = new Map();
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Calculate SEO score and provide suggestions
router.post('/:articleId/seo-grade', async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Check cache first
    const cachedResult = seoCache.get(articleId);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      log.info(`Serving cached SEO grade for article ${articleId}`);
      return res.json(cachedResult.data);
    }

    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Calculate scores for each criterion
    const scores = {
      titleLength: calculateTitleScore(article.title),
      keywordDensity: calculateKeywordDensity(article.content, article.keywords),
      headingStructure: analyzeHeadingStructure(article.content),
      metaDescription: calculateMetaScore(article.metaDescription),
      contentLength: calculateContentLengthScore(article.content)
    };

    // Calculate overall score
    const overallScore = calculateOverallScore(scores);

    // Generate improvement suggestions
    const suggestions = generateSuggestions(scores, article);

    const result = {
      score: overallScore,
      detailedScores: scores,
      suggestions
    };

    // Cache the result
    seoCache.set(articleId, {
      timestamp: Date.now(),
      data: result
    });

    log.info(`SEO grade calculated for article ${articleId}`, { score: overallScore });

    res.json(result);
  } catch (error) {
    log.error('Error calculating SEO grade:', error);
    res.status(500).json({ error: 'Error calculating SEO grade' });
  }
});

// Apply SEO improvements
router.post('/:articleId/seo-improve', async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Get current SEO score
    const originalScores = {
      titleLength: calculateTitleScore(article.title),
      keywordDensity: calculateKeywordDensity(article.content, article.keywords),
      headingStructure: analyzeHeadingStructure(article.content),
      metaDescription: calculateMetaScore(article.metaDescription),
      contentLength: calculateContentLengthScore(article.content)
    };

    // Apply improvements
    const improvements = await improveContent(article);
    
    // Calculate new scores
    const newScores = {
      titleLength: calculateTitleScore(improvements.title),
      keywordDensity: calculateKeywordDensity(improvements.content, article.keywords),
      headingStructure: analyzeHeadingStructure(improvements.content),
      metaDescription: calculateMetaScore(improvements.metaDescription),
      contentLength: calculateContentLengthScore(improvements.content)
    };

    // Update article with improvements
    article.title = improvements.title;
    article.content = improvements.content;
    article.metaDescription = improvements.metaDescription;
    await article.save();

    // Clear cache for this article
    seoCache.delete(articleId);

    log.info(`SEO improvements applied to article ${articleId}`, {
      originalScore: calculateOverallScore(originalScores),
      newScore: calculateOverallScore(newScores)
    });

    res.json({
      message: 'SEO improvements applied successfully',
      originalScore: calculateOverallScore(originalScores),
      newScore: calculateOverallScore(newScores),
      improvements: {
        title: improvements.title,
        metaDescription: improvements.metaDescription,
        contentChanges: improvements.contentChanges
      }
    });
  } catch (error) {
    log.error('Error applying SEO improvements:', error);
    res.status(500).json({ error: 'Error applying SEO improvements' });
  }
});

// Helper functions
function calculateTitleScore(title) {
  const length = title.length;
  const { min, max } = SEO_CRITERIA.titleLength.ideal;
  if (length >= min && length <= max) return 1;
  return length < min ? length / min : max / length;
}

function calculateKeywordDensity(content, keywords) {
  const words = content.toLowerCase().split(/\s+/);
  const keywordCount = keywords.reduce((count, keyword) => {
    const keywordRegex = new RegExp(keyword.toLowerCase(), 'g');
    return count + (content.toLowerCase().match(keywordRegex) || []).length;
  }, 0);
  
  const density = (keywordCount / words.length) * 100;
  const { min, max } = SEO_CRITERIA.keywordDensity.ideal;
  
  if (density >= min && density <= max) return 1;
  return density < min ? density / min : max / density;
}

function analyzeHeadingStructure(content) {
  const h1Count = (content.match(/<h1/g) || []).length;
  const hasProperHierarchy = /h1.*h2|h2.*h3/i.test(content);
  
  if (h1Count === 1 && hasProperHierarchy) return 1;
  if (h1Count === 1) return 0.7;
  if (hasProperHierarchy) return 0.5;
  return 0.3;
}

function calculateMetaScore(metaDescription) {
  const length = metaDescription.length;
  const { min, max } = SEO_CRITERIA.metaDescription.ideal;
  
  if (length >= min && length <= max) return 1;
  return length < min ? length / min : max / length;
}

function calculateContentLengthScore(content) {
  const words = content.split(/\s+/).length;
  const { min } = SEO_CRITERIA.contentLength.ideal;
  
  return words >= min ? 1 : words / min;
}

function calculateOverallScore(scores) {
  return Object.entries(scores).reduce((total, [criterion, score]) => {
    return total + (score * SEO_CRITERIA[criterion].weight);
  }, 0) * 100;
}

function generateSuggestions(scores, article) {
  const suggestions = [];

  if (scores.titleLength < 0.8) {
    suggestions.push({
      category: 'Title',
      issue: 'Title length is not optimal',
      suggestion: `Adjust title length to be between ${SEO_CRITERIA.titleLength.ideal.min} and ${SEO_CRITERIA.titleLength.ideal.max} characters`
    });
  }

  if (scores.keywordDensity < 0.8) {
    suggestions.push({
      category: 'Keywords',
      issue: 'Keyword density is not optimal',
      suggestion: 'Adjust keyword usage to achieve 1-2.5% density'
    });
  }

  if (scores.headingStructure < 0.8) {
    suggestions.push({
      category: 'Structure',
      issue: 'Heading structure needs improvement',
      suggestion: 'Ensure proper heading hierarchy (H1 -> H2 -> H3) and single H1 usage'
    });
  }

  if (scores.metaDescription < 0.8) {
    suggestions.push({
      category: 'Meta Description',
      issue: 'Meta description length is not optimal',
      suggestion: `Adjust meta description length to be between ${SEO_CRITERIA.metaDescription.ideal.min} and ${SEO_CRITERIA.metaDescription.ideal.max} characters`
    });
  }

  if (scores.contentLength < 0.8) {
    suggestions.push({
      category: 'Content Length',
      issue: 'Content length is below recommended minimum',
      suggestion: `Increase content length to at least ${SEO_CRITERIA.contentLength.ideal.min} words`
    });
  }

  return suggestions;
}

async function improveContent(article) {
  const improvements = {
    title: article.title,
    content: article.content,
    metaDescription: article.metaDescription,
    contentChanges: []
  };

  // Improve title if needed
  if (calculateTitleScore(article.title) < 0.8) {
    improvements.title = await optimizeTitle(article.title, article.keywords);
    improvements.contentChanges.push('Title optimized for length and keyword usage');
  }

  // Improve meta description if needed
  if (calculateMetaScore(article.metaDescription) < 0.8) {
    improvements.metaDescription = await optimizeMetaDescription(article.metaDescription, article.keywords);
    improvements.contentChanges.push('Meta description optimized for length and keyword usage');
  }

  // Improve content if needed
  if (calculateContentLengthScore(article.content) < 0.8 || 
      calculateKeywordDensity(article.content, article.keywords) < 0.8) {
    improvements.content = await optimizeContent(article.content, article.keywords);
    improvements.contentChanges.push('Content optimized for length and keyword density');
  }

  // Improve heading structure if needed
  if (analyzeHeadingStructure(article.content) < 0.8) {
    improvements.content = await optimizeHeadingStructure(improvements.content);
    improvements.contentChanges.push('Heading structure optimized');
  }

  return improvements;
}

async function optimizeTitle(title, keywords) {
  // Simple optimization: Add a keyword if not present and ensure proper length
  const targetLength = Math.floor((SEO_CRITERIA.titleLength.ideal.min + SEO_CRITERIA.titleLength.ideal.max) / 2);
  let optimizedTitle = title;
  
  // Add a keyword if not present
  const hasKeyword = keywords.some(keyword => title.toLowerCase().includes(keyword.toLowerCase()));
  if (!hasKeyword && keywords.length > 0) {
    optimizedTitle = `${keywords[0]}: ${title}`;
  }

  // Adjust length if needed
  if (optimizedTitle.length < targetLength) {
    optimizedTitle += ' - Comprehensive Guide';
  } else if (optimizedTitle.length > SEO_CRITERIA.titleLength.ideal.max) {
    optimizedTitle = optimizedTitle.substring(0, SEO_CRITERIA.titleLength.ideal.max - 3) + '...';
  }

  return optimizedTitle;
}

async function optimizeMetaDescription(description, keywords) {
  // Simple optimization: Add keywords and ensure proper length
  const targetLength = Math.floor((SEO_CRITERIA.metaDescription.ideal.min + SEO_CRITERIA.metaDescription.ideal.max) / 2);
  let optimizedDesc = description;

  // Add keywords if not present
  keywords.forEach(keyword => {
    if (!description.toLowerCase().includes(keyword.toLowerCase())) {
      optimizedDesc = `${keyword} - ${optimizedDesc}`;
    }
  });

  // Adjust length if needed
  if (optimizedDesc.length < targetLength) {
    optimizedDesc += ' Learn more about this comprehensive guide.';
  } else if (optimizedDesc.length > SEO_CRITERIA.metaDescription.ideal.max) {
    optimizedDesc = optimizedDesc.substring(0, SEO_CRITERIA.metaDescription.ideal.max - 3) + '...';
  }

  return optimizedDesc;
}

async function optimizeContent(content, keywords) {
  // Simple optimization: Improve keyword density and content length
  let optimizedContent = content;

  // Add keyword-rich sections if content is too short
  if (optimizedContent.split(/\s+/).length < SEO_CRITERIA.contentLength.ideal.min) {
    keywords.forEach(keyword => {
      optimizedContent += `\n\n<h2>More About ${keyword}</h2>\n`;
      optimizedContent += `<p>This section provides additional information about ${keyword}. `;
      optimizedContent += `Understanding ${keyword} is crucial for success in this area. `;
      optimizedContent += `Let's explore the key aspects of ${keyword} in detail.</p>`;
    });
  }

  // Improve keyword density if too low
  const words = optimizedContent.split(/\s+/);
  const keywordCount = keywords.reduce((count, keyword) => {
    return count + (optimizedContent.toLowerCase().match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
  }, 0);
  
  const density = (keywordCount / words.length) * 100;
  if (density < SEO_CRITERIA.keywordDensity.ideal.min) {
    // Add a keyword-focused conclusion
    optimizedContent += '\n\n<h2>Conclusion</h2>\n';
    optimizedContent += '<p>' + keywords.map(keyword => 
      `This guide has covered essential aspects of ${keyword}.`
    ).join(' ') + '</p>';
  }

  return optimizedContent;
}

async function optimizeHeadingStructure(content) {
  // Simple optimization: Ensure proper heading hierarchy
  let optimizedContent = content;

  // Check if H1 is missing
  if (!content.includes('<h1>')) {
    optimizedContent = '<h1>Main Title</h1>\n' + optimizedContent;
  }

  // Check if H2 is missing
  if (!content.includes('<h2>')) {
    optimizedContent += '\n<h2>Additional Information</h2>\n';
    optimizedContent += '<p>This section provides more context and details.</p>';
  }

  return optimizedContent;
}

module.exports = router;
